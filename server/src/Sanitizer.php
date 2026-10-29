<?php
declare(strict_types=1);
namespace App;

/** Allow-list HTML sanitizer for admin rich text. Pure PHP: tags/attributes outside the lists are dropped, text is always escaped. */
final class Sanitizer {
    private const TAGS = ['p', 'br', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote'];
    private const VOID = ['br', 'img'];

    public static function clean(string $html): string {
        $parts = preg_split('/(<[^>]*>)/', $html, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
        $out = ''; $stack = [];
        foreach ($parts as $p) {
            if ($p[0] !== '<') { $out .= self::text($p); continue; }
            if (!preg_match('#^<\s*(/?)\s*([a-zA-Z0-9]+)([^>]*)>$#s', $p, $m)) continue; // comments, doctype, junk
            [$closing, $tag, $rest] = [$m[1] === '/', strtolower($m[2]), $m[3]];
            if (!in_array($tag, self::TAGS, true)) continue;
            if ($closing) {
                if (in_array($tag, self::VOID, true)) continue;
                $i = array_search($tag, array_reverse($stack, true), true);
                if ($i === false) continue;
                while (($t = array_pop($stack)) !== null) { $out .= "</$t>"; if ($t === $tag) break; }
                continue;
            }
            $attrs = self::attrs($tag, $rest);
            if ($tag === 'img' && !str_contains($attrs, ' src=')) continue;
            if ($tag === 'li' && end($stack) === 'li') { $out .= '</li>'; array_pop($stack); }
            $out .= "<$tag$attrs>";
            if (!in_array($tag, self::VOID, true)) $stack[] = $tag;
        }
        while (($t = array_pop($stack)) !== null) $out .= "</$t>";
        return $out;
    }
    private static function text(string $t): string {
        $t = preg_replace('/&(?!(#\d{1,6}|#x[0-9a-fA-F]{1,6}|[a-zA-Z]{2,8});)/', '&amp;', $t);
        return str_replace(['<', '>', '"'], ['&lt;', '&gt;', '&quot;'], $t);
    }
    private static function attrs(string $tag, string $rest): string {
        $allowed = ['a' => ['href', 'title'], 'img' => ['src', 'alt']][$tag] ?? [];
        if (!$allowed) return '';
        preg_match_all('/([a-zA-Z\-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\')/', $rest, $mm, PREG_SET_ORDER);
        $res = '';
        foreach ($mm as $a) {
            $name = strtolower($a[1]); $val = html_entity_decode($a[2] !== '' ? $a[2] : ($a[3] ?? ''), ENT_QUOTES);
            if (!in_array($name, $allowed, true)) continue;
            if ($name === 'href' && !preg_match('#^(https?://|mailto:|/|\#)#i', $val)) continue;
            if ($name === 'src' && !preg_match('#^(https?://|/uploads/)#i', $val)) continue;
            if (preg_match('/[\x00-\x1f]/', $val)) continue;
            $res .= ' ' . $name . '="' . htmlspecialchars($val, ENT_QUOTES) . '"';
        }
        if ($tag === 'a') $res .= ' rel="noopener noreferrer"';
        return $res;
    }
}
