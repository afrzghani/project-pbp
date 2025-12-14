<?php

namespace App\Services\Ai;

use App\Models\Note;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NoraChat
{
    public function chat(Note $note, string $message, array $history = []): string
    {
        $content = trim($note->content_text ?? strip_tags($note->content_html ?? ''));

        if ($content === '') {
            return 'Catatan ini tidak memiliki konten yang bisa saya analisis.';
        }

        $apiKey = (string) config('services.groq.api_key', '');

        if ($apiKey === '') {
            Log::warning('GROQ_API_KEY kosong untuk chat.', ['note_id' => $note->id]);
            return 'Maaf, layanan AI sedang tidak tersedia.';
        }

        try {
            $endpoint = rtrim(config('services.groq.endpoint', 'https://api.groq.com/openai/v1/chat/completions'), '/');


            $messages = [
                [
                    'role' => 'system',
                    'content' => $this->buildSystemPrompt($note, $content),
                ],
            ];


            foreach (array_slice($history, -10) as $msg) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content'],
                ];
            }


            $messages[] = [
                'role' => 'user',
                'content' => $message,
            ];

            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->timeout(30)
                ->post($endpoint, [
                    'model' => config('services.groq.model', 'llama-3.3-70b-versatile'),
                    'temperature' => 0.7,
                    'max_tokens' => 1000,
                    'messages' => $messages,
                ]);

            if ($response->failed()) {
                Log::warning('Nora error.', [
                    'note_id' => $note->id,
                    'status' => $response->status(),
                ]);
                return 'Maaf, terjadi kesalahan saat memproses permintaan Anda.';
            }

            $reply = data_get($response->json(), 'choices.0.message.content');

            if (!$reply) {
                return 'Maaf, saya tidak bisa memberikan jawaban saat ini.';
            }

            return trim($reply);
        } catch (\Throwable $exception) {
            Log::error('Nora error.', [
                'note_id' => $note->id,
                'message' => $exception->getMessage(),
            ]);

            return 'Maaf, terjadi kesalahan teknis. Silakan coba lagi.';
        }
    }

    private function buildSystemPrompt(Note $note, string $content): string
    {
        $truncatedContent = Str::limit($content, 4000);

        return <<<PROMPT
Kamu adalah NORA AI, asisten AI yang membantu memahami catatan. Kamu HANYA boleh menjawab berdasarkan konten catatan yang diberikan.

ATURAN PENTING:
1. Jawab dalam Bahasa Indonesia
2. Berikan jawaban yang singkat, jelas, dan informatif
3. Jika pertanyaan tidak bisa dijawab dari konten catatan, katakan dengan jujur
4. Kamu bisa membantu: menjelaskan konsep, membuat ringkasan, menjawab pertanyaan, membuat contoh soal
5. Jangan mengarang informasi yang tidak ada di catatan

JUDUL CATATAN: {$note->title}

ISI CATATAN:
{$truncatedContent}

---
Jawab pertanyaan pengguna berdasarkan catatan di atas.
PROMPT;
    }
}
