<?php

namespace App\Http\Controllers;

use App\Models\NotionConnection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NotionOAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $this->ensureConfig();

        $state = Str::random(40);
        $request->session()->put('notion_oauth_state', $state);

        $query = http_build_query([
            'client_id' => config('services.notion.client_id'),
            'redirect_uri' => $this->redirectUri(),
            'response_type' => 'code',
            'owner' => 'user',
            'state' => $state,
        ]);

        return redirect()->away("https://api.notion.com/v1/oauth/authorize?{$query}");
    }

    public function callback(Request $request): RedirectResponse
    {
        $this->ensureConfig();

        if ($request->input('state') !== $request->session()->pull('notion_oauth_state')) {
            abort(403, 'State token mismatch.');
        }

        if ($request->filled('error')) {
            return $this->backWithBanner('Notion akses dibatalkan.', 'warning');
        }

        $code = $request->string('code');

        if ($code->isEmpty()) {
            return $this->backWithBanner('Kode OAuth Notion tidak ditemukan.', 'danger');
        }

        try {
            $response = Http::asForm()
                ->withBasicAuth(config('services.notion.client_id'), config('services.notion.client_secret'))
                ->post('https://api.notion.com/v1/oauth/token', [
                    'grant_type' => 'authorization_code',
                    'code' => $code->toString(),
                    'redirect_uri' => $this->redirectUri(),
                ]);
        } catch (\Throwable $exception) {
            Log::error('Notion token request error', ['message' => $exception->getMessage()]);

            return $this->backWithBanner('Tidak dapat menghubungi Notion. Coba lagi.', 'danger');
        }

        if ($response->failed()) {
            Log::warning('Failed exchanging Notion code', ['body' => $response->body()]);

            return $this->backWithBanner('Gagal menghubungkan Notion. Coba lagi.', 'danger');
        }

        $payload = $response->json();

        /** @var \App\Models\User $user */
        $user = $request->user();

        NotionConnection::updateOrCreate(
            ['user_id' => $user->id],
            [
                'access_token' => $payload['access_token'],
                'bot_id' => data_get($payload, 'bot_id'),
                'workspace_id' => data_get($payload, 'workspace_id'),
                'workspace_name' => data_get($payload, 'workspace_name'),
                'workspace_icon' => data_get($payload, 'workspace_icon'),
                'owner_type' => data_get($payload, 'owner.type'),
                'metadata' => $payload,
            ]
        );

        return $this->backWithBanner('Notion berhasil terhubung.', 'success');
    }

    public function disconnect(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->notionConnection()?->delete();

        return $this->backWithBanner('Notion terputus.', 'success');
    }

    protected function ensureConfig(): void
    {
        if (! config('services.notion.client_id') || ! config('services.notion.client_secret')) {
            abort(500, 'Notion OAuth belum dikonfigurasi.');
        }
    }

    protected function redirectUri(): string
    {
        return config('services.notion.redirect_uri') ?: route('notion.callback', [], true);
    }

    protected function backWithBanner(string $message, string $style = 'success'): RedirectResponse
    {
        return redirect()
            ->route('profile.edit')
            ->with('flash.banner', $message)
            ->with('flash.bannerStyle', $style);
    }
}

