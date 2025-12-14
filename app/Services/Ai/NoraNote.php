<?php

namespace App\Services\Ai;

use App\Models\Note;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class NoraNote
{
    public function process(Note $note): void
    {
        $content = trim($note->content_text ?? strip_tags($note->content_html ?? ''));

        if ($content === '') {
            Log::info('Catatan tidak memiliki konten untuk diproses AI.', ['note_id' => $note->id]);

            $this->applyResult($note, null, []);

            return;
        }

        $result = $this->requestGroq($note, $content) ?? $this->fallbackResult($content);

        $this->applyResult($note, $result['summary'] ?? null, $result['flashcards'] ?? []);
    }

    private function requestGroq(Note $note, string $content): ?array
    {
        $apiKey = (string) config('services.groq.api_key', '');

        if ($apiKey === '') {
            Log::warning('Menggunakan fallback AI lokal.', ['note_id' => $note->id]);

            return null;
        }

        try {
            $endpoint = rtrim(config('services.groq.endpoint', 'https://api.groq.com/openai/v1/chat/completions'), '/');
            $prompt = $this->buildPrompt(Str::limit($content, 6000));

            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->timeout(30)
                ->post($endpoint, [
                    'model' => config('services.groq.model', 'llama-3.3-70b-versatile'),
                    'temperature' => 0.2,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You summarize Indonesian lecture notes and create five to eight concise flashcards. Always respond with valid JSON.',
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Groq API gagal memproses catatan.', [
                    'note_id' => $note->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $raw = data_get($response->json(), 'choices.0.message.content');

            if (! $raw) {
                Log::warning('Nora tidak mengembalikan konten.', ['note_id' => $note->id]);

                return null;
            }

            $parsed = $this->decodeResponse($raw, $note->id);

            return [
                'summary' => $parsed['summary'] ?? null,
                'flashcards' => $this->normalizeFlashcards($parsed['flashcards'] ?? []),
            ];
        } catch (\Throwable $exception) {
            Log::error('Nora error.', [
                'note_id' => $note->id,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function fallbackResult(string $content): array
    {
        $sentences = collect(preg_split('/(?<=[.!?])\s+/u', $content, -1, PREG_SPLIT_NO_EMPTY))
            ->map(fn ($sentence) => trim($sentence))
            ->filter(fn ($sentence) => Str::length($sentence) > 20)
            ->values();

        $summary = Str::limit($sentences->take(3)->implode(' '), 400);

        if ($summary === '') {
            $summary = Str::limit($content, 200);
        }

        $flashcards = $sentences
            ->take(5)
            ->map(function ($sentence, $index) {
                $sentence = trim($sentence);
                

                $cleanSentence = rtrim($sentence, '.!?');
                

                $words = explode(' ', $cleanSentence);
                

                if (count($words) >= 3) {

                    $meaningfulWords = array_filter($words, function($word) {
                        $lower = strtolower($word);
                        $stopWords = ['adalah', 'yang', 'dari', 'untuk', 'dengan', 'pada', 'di', 'ke', 'oleh', 'atau', 'dan', 'sebagai'];
                        return !in_array($lower, $stopWords) && strlen($word) > 3;
                    });
                    
                    if (count($meaningfulWords) > 0) {

                        $keyWords = array_slice(array_values($meaningfulWords), 0, min(4, count($meaningfulWords)));
                        if (count($keyWords) > 0) {
                            $question = 'Apa itu ' . implode(' ', $keyWords) . '?';
                        } else {

                            $question = implode(' ', array_slice($words, 0, 5)) . '?';
                        }
                    } else {
                        $question = implode(' ', array_slice($words, 0, 5)) . '?';
                    }
                } else {

                    $question = $cleanSentence . '?';
                }
                
                return [
                    'question' => $question,
                    'answer' => Str::limit($sentence, 400),
                    'index' => $index + 1,
                ];
            })
            ->values()
            ->all();

        if (empty($flashcards)) {

            $firstSentence = Str::limit(trim(explode('.', $content)[0]), 100);
            $question = $firstSentence ? rtrim($firstSentence, '.!?') . '?' : 'Apa isi dari catatan ini?';
            
            $flashcards[] = [
                'question' => $question,
                'answer' => Str::limit($content, 400),
                'index' => 1,
            ];
        }

        return [
            'summary' => $summary,
            'flashcards' => $flashcards,
        ];
    }

    private function normalizeFlashcards(array $flashcards): array
    {
        return collect($flashcards)
            ->map(function ($card, $index) {
                $question = trim($card['question'] ?? '');
                $answer = trim($card['answer'] ?? '');

                if ($question === '' || $answer === '') {
                    return null;
                }

                return [
                    'question' => Str::limit($question, 200),
                    'answer' => Str::limit($answer, 400),
                    'index' => $card['index'] ?? $index + 1,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function applyResult(Note $note, ?string $summary, array $flashcards): void
    {
        $note->ai_summary = $summary;
        $note->ai_flashcards = $flashcards;
        $note->ai_status = 'completed';
        $note->ai_completed_at = now();
        $note->save();
    }

    private function decodeResponse(string $raw, int $noteId): array
    {
        try {
            $parsed = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable $exception) {
            Log::warning('Response bukan JSON valid', [
                'note_id' => $noteId,
                'raw' => $raw,
            ]);

            throw new RuntimeException('Nora mengembalikan JSON yang tidak valid.');
        }

        return is_array($parsed) ? $parsed : [];
    }

    private function buildPrompt(string $content): string
    {
        return <<<PROMPT
Buat ringkasan Bahasa Indonesia maksimal 5 kalimat dan 5-8 flashcard (tergantung kompleksitas  materi) anya-jawab dari catatan berikut.

PENTING untuk Flashcard:
- Buat PERTANYAAN yang SPESIFIK dan LANGSUNG berdasarkan isi catatan
- JANGAN gunakan pertanyaan meta seperti "Apa poin utama dari bagian...", atau "Jelaskan bagian..."
- Buat pertanyaan yang bisa langsung dijawab dengan fakta/konsep dari catatan
- Contoh PERTANYAAN BAIK: "Apa fungsi dari enzim amilase?", "Siapa yang menulis novel Laskar Pelangi?", "Berapa jumlah atom dalam molekul H2O?"
- Contoh PERTANYAAN BURUK: "Apa poin utama dari bagian #1?"
- Jawaban harus ringkas, jelas, dan langsung menjawab pertanyaan

Jawab dengan JSON:
{
  "summary": "...",
  "flashcards": [
    {"question": "...?", "answer": "..."}
  ]
}

Catatan:
{$content}
PROMPT;
    }
}
