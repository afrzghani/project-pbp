<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Jobs\ProcessNoteAiJob;
use App\Jobs\SyncNotionNoteJob;
use Illuminate\Support\Facades\Config;
use App\Models\ActivityLog;
use App\Models\Note;
use App\Models\NoteTag;
use App\Models\NoteView;
use App\Models\User;
use App\Services\Pdf\PdfTextExtractor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function index(Request $request): Response
    {
        $notes = $request->user()
            ->notes()
            ->with('tags')
            ->latest()
            ->paginate(10)
            ->through(function (Note $note) {
                return [
                    'id' => $note->id,
                    'slug' => $note->slug,
                    'title' => $note->title,
                    'status' => $note->status,
                    'visibility' => $note->visibility,
                    'updated_at' => $note->updated_at?->toDateTimeString(),
                    'tags' => $note->tags->map(fn (NoteTag $tag) => [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                        'color' => $tag->color,
                    ]),
                ];
            });

        return Inertia::render('notes/index', [
            'notes' => $notes,
        ]);
    }

    public function show(Request $request, Note $note): Response
    {
        try {
            $user = $request->user();

            Log::info('Showing note', [
                'note_id' => $note->id,
                'user_id' => $user->id,
                'note_user_id' => $note->user_id,
                'note_visibility' => $note->visibility,
                'note_status' => $note->status,
            ]);


            if ($note->user_id === $user->id) {
                $note->load(['tags', 'user.programStudy']);
                $note->loadCount(['likes', 'comments', 'bookmarks']);
                $note->loadExists([
                    'likes as liked_by_user' => fn ($query) => $query->where('user_id', $user->id),
                    'bookmarks as bookmarked_by_user' => fn ($query) => $query->where('user_id', $user->id),
                ]);
                

                $this->recordNoteView($user->id, $note->id);
                
                Log::info('Rendering note for owner', ['note_id' => $note->id]);
                
                return Inertia::render('notes/show', [
                    'note' => $this->transformNote($note),
                    'isOwner' => true,
                ]);
            }


            if ($note->visibility === 'public' && $note->status === 'published') {
                $note->load(['tags', 'user.programStudy']);
                $note->loadCount(['likes', 'comments', 'bookmarks']);
                $note->loadExists([
                    'likes as liked_by_user' => fn ($query) => $query->where('user_id', $user->id),
                    'bookmarks as bookmarked_by_user' => fn ($query) => $query->where('user_id', $user->id),
                ]);
                

                $this->recordNoteView($user->id, $note->id);
                
                Log::info('Rendering public note', ['note_id' => $note->id]);
                
                return Inertia::render('notes/show', [
                    'note' => $this->transformNote($note),
                    'isOwner' => false,
                ]);
            }


            Log::warning('Access denied to note', [
                'note_id' => $note->id,
                'user_id' => $user->id,
                'note_user_id' => $note->user_id,
                'note_visibility' => $note->visibility,
                'note_status' => $note->status,
            ]);
            
            abort(403, 'Anda tidak memiliki akses untuk melihat catatan ini.');
        } catch (\Throwable $e) {
            Log::error('Error showing note', [
                'note_id' => $note->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }

    public function read(Request $request, Note $note): Response
    {
        $user = $request->user();

        if ($note->visibility !== 'public' || $note->status !== 'published') {
            abort(404, 'Catatan tidak ditemukan.');
        }

        $note->load(['tags', 'user.programStudy']);
        $note->loadCount(['likes', 'comments', 'bookmarks']);
        $note->loadExists([
            'likes as liked_by_user' => fn ($query) => $query->where('user_id', $user->id),
            'bookmarks as bookmarked_by_user' => fn ($query) => $query->where('user_id', $user->id),
        ]);

        $this->recordNoteView($user->id, $note->id);

        return Inertia::render('notes/show', [
            'note' => $this->transformNote($note),
            'isOwner' => $note->user_id === $user->id,
            'isReadRoute' => true,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('notes/editor', [
            'note' => null,
            'availableTags' => $this->availableTags(),
        ]);
    }

    public function store(StoreNoteRequest $request): RedirectResponse
    {
        try {
            $user = $request->user();
            $data = $this->prepareContent($request->validated());

            $note = new Note();
            $note->user()->associate($user);
            $note->university_id = $user->university_id;
            $note->program_study_id = $user->program_study_id;
            $note->title = $data['title'];
            $note->slug = $this->generateSlug($data['title']);
            $note->status = $data['status'] ?? 'draft';
            $note->visibility = $data['visibility'] ?? 'private';
            $note->excerpt = $data['excerpt'] ?? null;
            $note->content_html = $data['content_html'] ?? null;
            $note->content_text = $data['content_text'] ?? null;
            $note->source_type = $data['source_type'] ?? 'manual';
            $note->notion_page_url = $data['notion_page_url'] ?? null;
            $note->published_at = ($data['status'] ?? 'draft') === 'published' ? now() : null;
            $note->save();

            $this->handleFileUpload($request, $note);
            $shouldDispatchAi = $this->handleAiFlags($request, $note);
            $shouldSyncNotion = $this->handleNotionSync($request, $note);


            if ($note->isDirty()) {
                $note->save();
            }

            if ($shouldDispatchAi) {
                $this->dispatchAiJob($note->id);
            }

            if ($shouldSyncNotion) {
                SyncNotionNoteJob::dispatch($note->id);
            }

            $this->syncTags($note, $data['tags'] ?? []);
            $this->logActivity($user, 'note_created', $note);


            $badgeService = app(\App\Services\BadgeService::class);
            $badgeService->checkAndAward($user, 'note_created');

            return redirect()
                ->route('notes.edit', $note)
                ->with('flash.banner', 'Catatan berhasil dibuat.');
        } catch (\Throwable $e) {
            Log::error('Error creating note', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menyimpan catatan: '.$e->getMessage()])
                ->withInput();
        }
    }

    public function edit(Request $request, Note $note): Response
    {
        $this->authorizeNote($request->user(), $note);

        return Inertia::render('notes/editor', [
            'note' => $this->transformNote($note->load('tags')),
            'availableTags' => $this->availableTags(),
        ]);
    }

    public function update(UpdateNoteRequest $request, Note $note): RedirectResponse
    {
        $this->authorizeNote($request->user(), $note);

        try {
            $validated = $request->validated();
            $data = $this->prepareContent($validated);

            if (isset($data['title']) && $data['title'] !== $note->title) {
                $note->title = $data['title'];
                $note->slug = $this->generateSlug($data['title'], $note->id);
            }


            $allInput = $request->all();
            $requestStatus = $request->input('status');
            $requestVisibility = $request->input('visibility');
            

            Log::info('Updating note status/visibility', [
                'note_id' => $note->id,
                'request_status' => $requestStatus,
                'request_visibility' => $requestVisibility,
                'all_input_status' => $allInput['status'] ?? null,
                'all_input_visibility' => $allInput['visibility'] ?? null,
                'validated_has_status' => array_key_exists('status', $validated),
                'validated_has_visibility' => array_key_exists('visibility', $validated),
                'current_note_status' => $note->status,
                'current_note_visibility' => $note->visibility,
            ]);
            

            if ($requestStatus === null && isset($allInput['status'])) {
                $requestStatus = $allInput['status'];
            }
            if ($requestVisibility === null && isset($allInput['visibility'])) {
                $requestVisibility = $allInput['visibility'];
            }
            

            if ($requestStatus !== null && $requestStatus !== '') {
                $note->status = $requestStatus;
                Log::info('Updated status from request', ['status' => $requestStatus]);
            } elseif (array_key_exists('status', $validated) && isset($data['status'])) {
                $note->status = $data['status'];
                Log::info('Updated status from validated', ['status' => $data['status']]);
            }
            

            if ($requestVisibility !== null && $requestVisibility !== '') {
                $note->visibility = $requestVisibility;
                Log::info('Updated visibility from request', ['visibility' => $requestVisibility]);
            } elseif (array_key_exists('visibility', $validated) && isset($data['visibility'])) {
                $note->visibility = $data['visibility'];
                Log::info('Updated visibility from validated', ['visibility' => $data['visibility']]);
            }
            if (array_key_exists('excerpt', $validated)) {
                $note->excerpt = $data['excerpt'];
            }
            if (array_key_exists('content_html', $validated)) {
                $note->content_html = $data['content_html'];

                if (array_key_exists('content_text', $data)) {
                    $note->content_text = $data['content_text'];
                }
            } elseif (array_key_exists('content_text', $validated)) {

                $note->content_text = $data['content_text'];
            }
            if (array_key_exists('source_type', $validated)) {
                $note->source_type = $data['source_type'];
            }
            if (array_key_exists('notion_page_url', $validated)) {
                $note->notion_page_url = $data['notion_page_url'];
            }
            

            if ($note->status === 'published') {

                if (!$note->published_at) {
                    $note->published_at = now();
                }
            } else {

                $note->published_at = null;
            }

            $this->handleFileUpload($request, $note);
            $shouldDispatchAi = $this->handleAiFlags($request, $note);
            $shouldSyncNotion = $this->handleNotionSync($request, $note);

            $note->save();

            if ($shouldDispatchAi) {
                $this->dispatchAiJob($note->id);
            }

            if ($shouldSyncNotion) {
                SyncNotionNoteJob::dispatch($note->id);
            }

            $this->syncTags($note, $data['tags'] ?? []);
            $this->logActivity($request->user(), 'note_updated', $note);

            return redirect()
                ->back()
                ->with('flash.banner', 'Catatan diperbarui.');
        } catch (\Throwable $e) {
            Log::error('Error updating note', [
                'note_id' => $note->id,
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal memperbarui catatan: '.$e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(Request $request, Note $note): RedirectResponse
    {
        $this->authorizeNote($request->user(), $note);

        try {

            if ($note->file_path) {
                Storage::disk(config('filesystems.default'))->delete($note->file_path);
            }


            \App\Models\Notification::where('note_id', $note->id)->delete();
            NoteView::where('note_id', $note->id)->delete();
            $note->likes()->delete();
            $note->comments()->delete();
            $note->bookmarks()->delete();
            $note->attachments()->delete();
            $note->tags()->detach();
            
            $note->delete();

            $this->logActivity($request->user(), 'note_deleted', $note);

            return redirect()
                ->route('notes.index')
                ->with('flash.banner', 'Catatan dihapus.');
        } catch (\Throwable $e) {
            Log::error('Error deleting note', [
                'note_id' => $note->id,
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menghapus catatan: '.$e->getMessage()]);
        }
    }

    private function authorizeNote(User $user, Note $note): void
    {
        abort_if($note->user_id !== $user->id, 403);
    }

    private function generateSlug(string $title, ?int $ignoreId = null): string
    {
        $slug = Str::slug($title) ?: Str::random(8);
        $baseSlug = $slug;
        $counter = 1;

        while (
            Note::where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter++;
        }

        return $slug;
    }

    private function handleFileUpload(Request $request, Note $note): void
    {

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('notes/'.$request->user()->id, config('filesystems.default'));
                
                $note->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientOriginalExtension(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
            

            if ($note->attachments()->exists()) {
                $note->source_type = 'upload';
            }
        }


        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('notes/'.$request->user()->id, config('filesystems.default'));


            $note->attachments()->create([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);


            $note->file_path = $path;
            $note->file_original_name = $file->getClientOriginalName();
            $note->source_type = 'upload';
            $note->source_metadata = array_merge($note->source_metadata ?? [], [
                'mime' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }
    }

    private function handleAiFlags(Request $request, Note $note): bool
    {
        if ($request->boolean('process_ai')) {
            $note->ai_status = 'queued';
            $note->ai_requested_at = now();

            return true;
        }

        return false;
    }

    private function handleNotionSync(Request $request, Note $note): bool
    {
        if (! $request->boolean('sync_with_notion')) {
            return false;
        }

        if (! $request->user()?->notionConnection) {
            session()->flash('flash.banner', 'Hubungkan Notion terlebih dahulu di pengaturan profil.');
            session()->flash('flash.bannerStyle', 'warning');

            return false;
        }

        if (! $note->notion_page_url) {
            session()->flash('flash.banner', 'Masukkan URL halaman Notion sebelum sinkronisasi.');
            session()->flash('flash.bannerStyle', 'warning');

            return false;
        }

        $note->sync_status = 'pending';
        $note->source_type = 'notion';
        $note->synced_at = null;

        return true;
    }

    private function syncTags(Note $note, array $tags): void
    {
        if (empty($tags)) {
            $note->tags()->detach();

            return;
        }

        $tagIds = collect($tags)
            ->map(function (string $tagName) {
                $name = trim($tagName);
                $slug = Str::slug($name);

                return NoteTag::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => $name]
                );
            })
            ->pluck('id')
            ->all();

        $note->tags()->sync($tagIds);
    }

    private function availableTags(): array
    {
        return NoteTag::orderBy('name')
            ->get()
            ->map(fn (NoteTag $tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'color' => $tag->color,
            ])
            ->all();
    }

    private function transformNote(Note $note): array
    {
        return [
            'id' => $note->id,
            'slug' => $note->slug,
            'user_id' => $note->user_id,
            'user' => $note->user ? [
                'id' => $note->user->id,
                'name' => $note->user->name,
                'avatar_url' => $note->user->avatar_url,
                'program_study' => $note->user->programStudy?->nama,
            ] : null,
            'title' => $note->title,
            'excerpt' => $note->excerpt,
            'content_html' => $note->content_html,
            'content_text' => $note->content_text,
            'status' => $note->status,
            'visibility' => $note->visibility,
            'source_type' => $note->source_type,
            'file_original_name' => $note->file_original_name,
            'file_url' => $note->file_path ? Storage::url($note->file_path) : null,
            'notion_page_url' => $note->notion_page_url,
            'sync_status' => $note->sync_status,
            'ai_summary' => $note->ai_summary,
            'likes_count' => $note->likes_count ?? 0,
            'comments_count' => $note->comments_count ?? 0,
            'bookmarks_count' => $note->bookmarks_count ?? 0,
            'liked_by_user' => $note->liked_by_user ?? false,
            'bookmarked_by_user' => $note->bookmarked_by_user ?? false,
            'ai_flashcards' => $note->ai_flashcards,
            'ai_status' => $note->ai_status,
            'ai_completed_at' => $note->ai_completed_at?->toDateTimeString(),
            'created_at' => $note->created_at?->toDateTimeString(),
            'updated_at' => $note->updated_at?->toDateTimeString(),
            'tags' => $note->tags->map(fn (NoteTag $tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'color' => $tag->color,
            ]),
            'attachments' => $note->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_type' => $attachment->file_type,
                'url' => $attachment->url,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
            ]),
        ];
    }

    private function logActivity(User $user, string $activityType, Note $note): void
    {
        $activityDate = now()->startOfDay();

        ActivityLog::updateOrCreate(
            [
                'user_id' => $user->id,
                'activity_type' => $activityType,
                'activity_date' => $activityDate,
            ],
            [
                'metadata' => [
                    'note_id' => $note->id,
                    'note_title' => $note->title,
                ],
            ]
        );
    }

    private function prepareContent(array $data): array
    {
        $contentHtml = trim($data['content_html'] ?? '');
        $contentText = trim($data['content_text'] ?? '');

        if ($contentHtml !== '' && $contentText === '') {
            $contentText = trim(strip_tags($contentHtml));
        }

        $data['content_html'] = $contentHtml !== '' ? $contentHtml : null;
        $data['content_text'] = $contentText !== '' ? $contentText : null;

        if (($data['excerpt'] ?? '') === '' && $data['content_text']) {
            $data['excerpt'] = Str::limit($data['content_text'], 200);
        }

        return $data;
    }

    private function dispatchAiJob(int $noteId): void
    {
        ProcessNoteAiJob::dispatch($noteId);
    }

    private function recordNoteView(int $userId, int $noteId): void
    {
        NoteView::updateOrCreate(
            [
                'user_id' => $userId,
                'note_id' => $noteId,
            ],
            [
                'viewed_at' => now(),
            ]
        );
    }
}
