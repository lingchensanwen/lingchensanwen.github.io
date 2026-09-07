#!/usr/bin/env python3
"""Compare public-site crawl prerequisites with the local research pages.

This measures HTTP/content availability, not indexing, rank, or citation probability.
Use --live for public HTTP reads, or --snapshot for a saved fetch manifest.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://yatingwu.info/'
WORKS = json.loads((ROOT / 'research/projects.json').read_text())
PATHS = ['', 'index_jp.html', 'research/'] + [w['path'] + '/' for w in WORKS] + ['robots.txt', 'sitemap.xml', 'publications.bib']


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.title = ''
        self.in_title = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag == 'title':
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, text):
        if self.in_title:
            self.title += text

    def select(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]


def fetch(path):
    url = ORIGIN + path
    try:
        with urlopen(Request(url, headers={'User-Agent': 'ResearchWebsiteAudit/1.0'}), timeout=25) as response:
            return path, {'status': response.status, 'effective_url': response.url, 'body': response.read().decode('utf-8', errors='replace')}
    except HTTPError as error:
        return path, {'status': error.code, 'effective_url': error.url, 'body': error.read().decode('utf-8', errors='replace')}
    except (URLError, TimeoutError, OSError) as error:
        return path, {'status': None, 'body': '', 'error': str(error)}


def normalized(value):
    return re.sub(r'[^a-z0-9]', '', value.lower())


def analyze(records, public=False):
    projects = []
    homepage = Page(records['']['body'])
    home_links = {urljoin(ORIGIN, a.get('href', '')) for a in homepage.select('a')}
    for work in WORKS:
        path = work['path'] + '/'
        record = records[path]
        page = Page(record['body'])
        available = record.get('status') == 200 if public else record['exists']
        expected_content = available and normalized(work['title']) in normalized(page.title)
        citations = {a.get('name'): a.get('content') for a in page.select('meta') if a.get('name', '').startswith('citation_')}
        projects.append({
            'id': work['id'], 'url': ORIGIN + path,
            'http_status': record.get('status'), 'content_available': bool(expected_content),
            'title': page.title,
            'canonical': [a.get('href') for a in page.select('link', rel='canonical')],
            'has_description': bool(page.select('meta', name='description')) if expected_content else False,
            'has_bibliographic_metadata': expected_content and all(citations.get(k) for k in ['citation_title', 'citation_author', 'citation_publication_date']),
            'has_scholarly_article_jsonld': expected_content and bool(re.search(r'"@type"\s*:\s*"ScholarlyArticle"', record['body'])),
            'linked_from_homepage': ORIGIN + path in home_links,
            'static_gallery_examples': len(page.select('details', **{'class': 'card'})),
        })
    try:
        sitemap_urls = [x.text for x in ET.fromstring(records['sitemap.xml']['body']).findall('{*}url/{*}loc')]
    except ET.ParseError:
        sitemap_urls = []
    return {
        'projects': projects,
        'project_pages_available': sum(p['content_available'] for p in projects),
        'project_pages_with_bibliographic_metadata': sum(p['has_bibliographic_metadata'] for p in projects),
        'project_pages_with_scholarly_article_jsonld': sum(p['has_scholarly_article_jsonld'] for p in projects),
        'project_pages_linked_from_homepage': sum(p['linked_from_homepage'] for p in projects),
        'project_urls_in_sitemap': sum(w['page_url'] in sitemap_urls for w in WORKS),
        'sitemap_urls': sitemap_urls,
        'robots_content': records['robots.txt']['body'],
        'robots_advertises_current_sitemap': 'Sitemap: ' + ORIGIN + 'sitemap.xml' in records['robots.txt']['body'],
        'public_http_statuses': {p: records[p].get('status') for p in PATHS} if public else None,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group()
    source.add_argument('--live', action='store_true', help='Read the public site; no publishing or indexing submission.')
    source.add_argument('--snapshot', type=Path, help='Read a saved manifest.json with body_path fields.')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    local = {}
    for path in PATHS:
        file = ROOT / (path + 'index.html' if not path or path.endswith('/') else path)
        local[path] = {'exists': file.exists(), 'body': file.read_text() if file.exists() else ''}
    report = {'recorded_at_utc': datetime.now(timezone.utc).isoformat(), 'scope': 'HTTP and static HTML prerequisites; not search ranking, indexing, AI citations, or uplift.', 'local': analyze(local)}
    public = None
    if args.live:
        with ThreadPoolExecutor(max_workers=4) as pool:
            public = dict(pool.map(fetch, PATHS))
        report['public_source'] = 'fresh HTTP fetch'
    elif args.snapshot:
        manifest = json.loads((args.snapshot / 'manifest.json').read_text())
        public = {r['path']: {'status': int(r['status']) if r.get('status') else None, 'body': Path(r['body_path']).read_text()} for r in manifest}
        report['public_source'] = 'saved HTTP fetch snapshot from ' + str(args.snapshot)
    if public is not None:
        report['public'] = analyze(public, public=True)
    output = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.write_text(output)
    else:
        print(output, end='')


if __name__ == '__main__':
    main()
