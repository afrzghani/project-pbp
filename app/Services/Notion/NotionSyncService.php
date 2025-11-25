<?php

namespace App\Services\Notion;

use App\Models\Note;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class NotionSyncService
{
    public function sync(Note $note): void
    {
        $connection = $note->user?->notionConnection;

        if (! $connection) {
            throw new RuntimeException('Notion belum terhubung untuk pengguna ini.');
        }

        if (! $note->notion_page_url) {
            throw new RuntimeException('URL halaman Notion belum diisikan.');
        }

        $pageId = $this->extractPageId($note->notion_page_url);

        if (! $pageId) {
            throw new RuntimeException('URL halaman Notion tidak valid.');
        }

        $blocks = $this->fetchBlocks($pageId, $connection->access_token);
        $html = $this->renderBlocksToHtml($blocks);

        $note->content_html = $html;
        $note->content_text = trim(strip_tags($html));
    }

    private function fetchBlocks(string $blockId, string $token): array
    {
        $results = [];
        $cursor = null;

        do {
            $response = Http::withHeaders($this->headers($token))
                ->get("https://api.notion.com/v1/blocks/{$blockId}/children", array_filter([
                    'page_size' => 100,
                    'start_cursor' => $cursor,
                ]));

            if ($response->failed()) {
                throw new RuntimeException('Gagal mengambil blok dari Notion: '.$response->body());
            }

            $payload = $response->json();
            $results = array_merge($results, $payload['results'] ?? []);
            $cursor = $payload['next_cursor'] ?? null;
        } while ($payload['has_more'] ?? false);

        return $results;
    }

    private function headers(string $token): array
    {
        return [
            'Authorization' => 'Bearer '.$token,
            'Notion-Version' => '2022-06-28',
            'Content-Type' => 'application/json',
        ];
    }

    private function extractPageId(string $url): ?string
    {
        if (preg_match('/([0-9a-f]{32})/i', $url, $matches) !== 1) {
            return null;
        }

        $id = strtolower($matches[1]);

        return substr($id, 0, 8)
            .'-'.substr($id, 8, 4)
            .'-'.substr($id, 12, 4)
            .'-'.substr($id, 16, 4)
            .'-'.substr($id, 20);
    }

    private function renderBlocksToHtml(array $blocks): string
    {
        return collect($blocks)
            ->map(fn ($block) => $this->renderBlock($block))
            ->filter()
            ->implode("\n");
    }

    private function renderBlock(array $block): ?string
    {
        $type = $block['type'] ?? null;

        if (! $type || ! isset($block[$type])) {
            return null;
        }

        $rich = $block[$type]['rich_text'] ?? [];
        $text = $this->richTextToHtml($rich);

        return match ($type) {
            'heading_1' => "<h1>{$text}</h1>",
            'heading_2' => "<h2>{$text}</h2>",
            'heading_3' => "<h3>{$text}</h3>",
            'paragraph' => "<p>{$text}</p>",
            'quote' => "<blockquote>{$text}</blockquote>",
            'bulleted_list_item' => "<p>• {$text}</p>",
            'numbered_list_item' => "<p>1. {$text}</p>",
            'to_do' => sprintf(
                '<p>%s %s</p>',
                ($block['to_do']['checked'] ?? false) ? '☑️' : '⬜',
                $text
            ),
            'code' => '<pre><code>'.e($block['code']['rich_text'][0]['plain_text'] ?? '').'</code></pre>',
            default => "<p>{$text}</p>",
        };
    }

    private function richTextToHtml(array $richText): string
    {
        return collect($richText)
            ->map(function ($segment) {
                $plain = e($segment['plain_text'] ?? '');
                $annotations = $segment['annotations'] ?? [];

                if (($annotations['bold'] ?? false) === true) {
                    $plain = "<strong>{$plain}</strong>";
                }

                if (($annotations['italic'] ?? false) === true) {
                    $plain = "<em>{$plain}</em>";
                }

                if (($annotations['code'] ?? false) === true) {
                    $plain = "<code>{$plain}</code>";
                }

                if (($annotations['underline'] ?? false) === true) {
                    $plain = "<u>{$plain}</u>";
                }

                if (($annotations['strikethrough'] ?? false) === true) {
                    $plain = "<s>{$plain}</s>";
                }

                $href = $segment['href'] ?? null;

                if ($href) {
                    $plain = '<a href="'.e($href).'" target="_blank" rel="noreferrer">'.$plain.'</a>';
                }

                return $plain;
            })
            ->implode('');
    }
}
