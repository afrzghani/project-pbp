<?php

namespace App\Services\Pdf;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\PdfToText\Pdf;

class PdfTextExtractor
{
    public function extract(string $absolutePath): ?string
    {
        if (! is_file($absolutePath)) {
            Log::warning('PDF file tidak ditemukan', [
                'path' => $absolutePath,
                'exists' => file_exists($absolutePath),
                'is_file' => is_file($absolutePath),
            ]);
            return null;
        }

        try {
            Log::info('Mulai ekstrak PDF', [
                'path' => $absolutePath,
                'file_size' => filesize($absolutePath),
                'file_exists' => file_exists($absolutePath),
            ]);


            $pdftotextPath = config('services.pdftotext.path');
            

            if (! $pdftotextPath && PHP_OS_FAMILY === 'Windows') {
                $commonPaths = [
                    'C:\\laragon\\poppler\\Library\\bin\\pdftotext.exe',
                    'C:\\poppler\\Library\\bin\\pdftotext.exe',
                    'C:\\laragon\\bin\\poppler\\pdftotext.exe',
                    'C:\\Program Files\\poppler\\bin\\pdftotext.exe',
                ];
                
                foreach ($commonPaths as $path) {
                    if (file_exists($path)) {
                        $pdftotextPath = $path;
                        Log::info('Auto-detected pdftotext path', ['path' => $pdftotextPath]);
                        break;
                    }
                }
            }
            

            $text = $pdftotextPath 
                ? Pdf::getText($absolutePath, $pdftotextPath)
                : Pdf::getText($absolutePath);
            
            if (empty($text) || trim($text) === '') {
                Log::warning('PDF diekstrak tetapi hasil kosong', [
                    'path' => $absolutePath,
                    'file_size' => filesize($absolutePath),
                    'file_exists' => file_exists($absolutePath),
                ]);
                return null;
            }

            Log::info('PDF berhasil diekstrak', [
                'path' => $absolutePath,
                'text_length' => strlen($text),
                'preview' => Str::limit($text, 100),
            ]);
        } catch (\Throwable $exception) {
            $errorMessage = $exception->getMessage();
            $errorLower = strtolower($errorMessage);

            Log::error('Gagal mengekstrak teks PDF', [
                'path' => $absolutePath,
                'message' => $errorMessage,
                'exception_class' => get_class($exception),
                'file_exists' => file_exists($absolutePath),
                'file_size' => file_exists($absolutePath) ? filesize($absolutePath) : 0,
                'trace' => $exception->getTraceAsString(),
            ]);


            $isMissingBinary = str_contains($errorLower, 'pdftotext') || 
                str_contains($errorLower, 'not found') ||
                str_contains($errorLower, 'command not found') ||
                str_contains($errorLower, 'is not recognized') ||
                str_contains($errorLower, 'could not find') ||
                str_contains($errorLower, 'no such file') ||
                str_contains($errorLower, 'binary') ||
                str_contains($errorLower, 'not executable');

            if ($isMissingBinary) {
                $message = 'Tool pdftotext tidak ditemukan. ' .
                    'Untuk menggunakan ekstraksi PDF, silakan install poppler-utils: ';
                
                if (PHP_OS_FAMILY === 'Windows') {
                    $message .= '1. Download dari https://github.com/oschwartz10612/poppler-windows/releases ' .
                        '2. Extract ke folder (misalnya C:\\laragon\\poppler) ' .
                        '3. Set PDFTOTEXT_PATH di .env dengan path lengkap ke pdftotext.exe ' .
                        '(contoh: PDFTOTEXT_PATH=C:\\laragon\\poppler\\Library\\bin\\pdftotext.exe)';
                } else {
                    $message .= 'Install dengan: sudo apt-get install poppler-utils (Ubuntu/Debian) ' .
                        'atau sudo yum install poppler-utils (CentOS/RHEL). ' .
                        'Atau set PDFTOTEXT_PATH di .env dengan path ke pdftotext binary.';
                }
                
                throw new \RuntimeException($message);
            }


            throw new \RuntimeException(
                'Gagal mengekstrak PDF: ' . $errorMessage . 
                '. Periksa log untuk detail lengkap.'
            );
        }

        $normalized = trim(preg_replace('/\s+/u', ' ', $text));

        return $normalized !== '' ? $normalized : null;
    }
}

