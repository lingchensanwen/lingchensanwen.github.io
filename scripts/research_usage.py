"""Render source-backed usage notes shared by the static project pages."""
import html
import json
import io
import keyword
import re
import tokenize
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
USAGE = json.loads((ROOT / 'research/usage.json').read_text())


def inline(text):
    return ''.join('<code>' + html.escape(part[1:-1]) + '</code>'
                   if part.startswith('`') and part.endswith('`') else html.escape(part)
                   for part in re.split(r'(`[^`]+`)', text))


def code_html(text, language):
    if language != 'python':
        return html.escape(text)
    offsets = [0]
    for line in text.splitlines(keepends=True):
        offsets.append(offsets[-1] + len(line))
    pieces, previous = [], 0
    for token in tokenize.generate_tokens(io.StringIO(text).readline):
        style = {tokenize.STRING: 'string', tokenize.COMMENT: 'comment', tokenize.NUMBER: 'number'}.get(token.type)
        if token.type == tokenize.NAME and keyword.iskeyword(token.string):
            style = 'keyword'
        if not style:
            continue
        start = offsets[token.start[0] - 1] + token.start[1]
        end = offsets[token.end[0] - 1] + token.end[1]
        pieces.extend([html.escape(text[previous:start]), '<span class="syntax-' + style + '">' + html.escape(text[start:end]) + '</span>'])
        previous = end
    return ''.join(pieces) + html.escape(text[previous:])


def render_usage(project_id):
    entry = USAGE[project_id]
    esc = html.escape
    layout = entry.get('layout', 'reference')
    parts = ['<div class="usage-notes usage-' + esc(layout) + (' has-code' if entry.get('code') else '') + '">']
    for paragraph in entry.get('intro', []):
        parts.append('<p class="usage-intro">' + inline(paragraph) + '</p>')
    parts.append('<div class="usage-layout"><div class="usage-copy">')
    if entry.get('facts'):
        if layout == 'process':
            parts.append('<ol class="usage-steps">')
            for label, value in entry['facts']:
                parts.append('<li><h3>' + inline(label) + '</h3><p>' + inline(value) + '</p></li>')
            parts.append('</ol>')
        else:
            parts.append('<dl class="usage-facts">')
            for label, value in entry['facts']:
                parts.append('<div><dt>' + inline(label) + '</dt><dd>' + inline(value) + '</dd></div>')
            parts.append('</dl>')
    if not entry.get('notes_label'):
        for paragraph in entry.get('notes', []):
            parts.append('<p class="usage-note">' + inline(paragraph) + '</p>')
    parts.append('</div>')
    if entry.get('code'):
        parts.append('<div class="usage-examples">')
    for example in entry.get('code', []):
        language = 'Python' if example['language'] == 'python' else 'Terminal'
        parts.append('<details class="usage-code" open><summary><span>' + esc(example['label']) + '</span><span class="code-language">' + language + '</span></summary>')
        if example.get('before'):
            parts.append('<p class="usage-code-note">' + inline(example['before']) + '</p>')
        parts.append('<pre><code class="language-' + esc(example['language'], quote=True) + '">' + code_html(example['text'], example['language']) + '</code></pre>')
        if example.get('after'):
            parts.append('<p class="usage-code-note code-after">' + inline(example['after']) + '</p>')
        parts.append('</details>')
    if entry.get('code'):
        parts.append('</div>')
    parts.append('</div>')
    if entry.get('notes_label'):
        parts.append('<details class="usage-caveat"><summary>' + esc(entry['notes_label']) + '</summary>')
        for paragraph in entry.get('notes', []):
            parts.append('<p>' + inline(paragraph) + '</p>')
        parts.append('</details>')
    sources = ['<a href="' + esc(url, quote=True) + '">' + esc(label) + '</a>' for label, url in entry['sources']]
    parts.append('<div class="usage-sources"><span>Source</span><p>' + ' · '.join(sources) + '</p></div></div>')
    return '\n'.join(parts)
