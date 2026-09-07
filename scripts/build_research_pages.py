#!/usr/bin/env python3
"""Render the seven project pages and research index as plain crawlable HTML.

Edit research/projects.json, then run python3 scripts/build_research_pages.py.
MQUD retains its existing bespoke page and gallery. No network is used.
"""
from pathlib import Path
import argparse
import html
import json
import re
from research_usage import USAGE, render_usage

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://yatingwu.info'
E = html.escape
WORKS = json.loads((ROOT / 'research/projects.json').read_text())
EXAMPLES = json.loads((ROOT / 'research/examples.json').read_text())
BY_ID = {w['id']: w for w in WORKS}


def bib_records():
    text = (ROOT / 'publications.bib').read_text()
    records = {}
    for match in re.finditer(r'(?m)^@\w+\{([^,]+),', text):
        depth = 0
        for i in range(text.index('{', match.start()), len(text)):
            depth += (text[i] == '{') - (text[i] == '}')
            if depth == 0:
                records[match[1]] = text[match.start():i + 1]
                break
    return records


BIBS = bib_records()


def a(label, url, cls=''):
    return f'<a href="{E(url, quote=True)}"' + (f' class="{cls}"' if cls else '') + f'>{E(label)}</a>'


def jsonld(value):
    return '<script type="application/ld+json">\n' + json.dumps(value, ensure_ascii=False, indent=2).replace('</', '<\\/') + '\n</script>'


def metadata(title, description, url, work=None):
    tags = [f'<title>{E(title)}</title>', f'<link rel="canonical" href="{url}">']
    for kind, name, value in [('name','description',description),('property','og:title',title),('property','og:description',description),('property','og:url',url),('property','og:type','article' if work else 'website'),('name','twitter:card','summary'),('name','twitter:title',title),('name','twitter:description',description)]:
        tags.append(f'<meta {kind}="{name}" content="{E(value, quote=True)}">')
    if work:
        fields = [('citation_title',work['title']),('citation_publication_date',str(work['year']))]
        fields += [('citation_author',x) for x in work['authors']]
        if work.get('booktitle'): fields.append(('citation_conference_title',work['booktitle']))
        if work.get('doi'): fields.append(('citation_doi',work['doi']))
        if work.get('arxiv'): fields.append(('citation_arxiv_id',work['arxiv']))
        if work.get('pages'):
            first,last=work['pages'].split('--');fields += [('citation_firstpage',first),('citation_lastpage',last)]
        tags += [f'<meta name="{name}" content="{E(value, quote=True)}">' for name,value in fields]
        article = {'@type':'ScholarlyArticle','@id':url+'#paper','name':work['title'],'url':url,'sameAs':work['url'],'description':description,'datePublished':str(work['year']),'inLanguage':'en','author':[{'@type':'Person','name':name,**({'@id':ORIGIN+'/#yating-wu','url':ORIGIN+'/'} if name=='Yating Wu' else {})} for name in work['authors']]}
        if work.get('doi'): article['identifier']={'@type':'PropertyValue','propertyID':'DOI','value':work['doi']}
        elif work.get('arxiv'): article['identifier']='arXiv:'+work['arxiv']
        if work['venue']=='Preprint': article['creativeWorkStatus']='Preprint'
        elif work.get('booktitle'): article['isPartOf']={'@type':'CreativeWork','name':work['booktitle']}
        if work.get('award'): article['award']='EMNLP 2024 Outstanding Paper Award'
        crumbs={'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Yating Wu','item':ORIGIN+'/'},{'@type':'ListItem','position':2,'name':'Research projects','item':ORIGIN+'/research/'},{'@type':'ListItem','position':3,'name':work['short'],'item':url}]}
        tags.append(jsonld({'@context':'https://schema.org','@graph':[article,crumbs]}))
    return '\n'.join(tags)


def nav(library='../research/'):
    return '<a class="skip-link" href="#main">Skip to content</a><nav class="site-nav" aria-label="Main"><div class="shell nav-inner">'+a('Yating Wu','../','wordmark')+'<div class="nav-links">'+a('Research projects',library)+a('Publications','../#publications')+'</div></div></nav>'


def footer():
    return '<footer class="site-footer"><div class="shell">'+a('Yating Wu','../')+' · '+a('All research projects','../research/')+' · '+a('Bibliography','../publications.bib')+'</div></footer>'


def example_section(id):
    ex = EXAMPLES[id]
    blocks = []
    for block in ex['blocks']:
        value = E(block['text'])
        if block.get('mark'):
            assert block['mark'] in block['text']
            value = value.replace(E(block['mark']), '<mark>'+E(block['mark'])+'</mark>', 1)
        if block.get('quote'):
            value = '<blockquote cite="'+E(ex['source_url'], quote=True)+'">'+value+'</blockquote>'
        else:
            value = '<p class="example-text">'+value+'</p>'
        score = ('<span class="rating" aria-label="Human salience rating '+str(block['score'])+' out of 5"><strong>'+str(block['score'])+'</strong><span>/ 5</span></span>') if 'score' in block else ''
        note = '<p class="example-note">'+E(block['note'])+'</p>' if block.get('note') else ''
        outcome = '<p class="case-outcome">'+E(block['outcome'])+'</p>' if block.get('outcome') else ''
        blocks.append('<article class="example-item role-'+E(block.get('role','passage'))+'"><div class="item-label"><h3>'+E(block['label'])+'</h3>'+score+'</div>'+value+note+outcome+'</article>')
    ending = '<p class="example-reading">'+E(ex['conclusion'])+'</p>' if ex.get('conclusion') else ''
    return ('<section id="example" class="example-section"><div class="section-heading"><h2>'+E(ex['title'])+'</h2></div><p class="example-intro">'+E(ex['intro'])+'</p>'
            '<div class="example-layout layout-'+E(ex.get('layout','stack'))+'">'+''.join(blocks)+'</div>'+ending+'<div class="source-note"><span>Source</span><p>'
            +a(ex['source_label'],ex['source_url'])+'. '+E(ex['provenance'])+'</p></div></section>')


def page(w, initial=False):
    authors=[]
    for i,name in enumerate(w['authors']):
        authors.append((a(name,'../') if name=='Yating Wu' else E(name))+('<sup>†</sup>' if i in w.get('equal',[]) else ''))
    venue=E(w['venue'])+' · '+str(w['year'])
    if w.get('oral'): venue+=' · Oral presentation'
    if w.get('award'): venue+=' <span class="badge">Outstanding Paper Award</span>'
    links=a('paper',w['url'],'action primary')
    for label,url in w['resources']:
        if url.startswith('https:'): links+=a(label.capitalize(),url,'action')
    links+=a('BibTeX','#citation','action')
    overview=''.join('<p>'+E(p)+'</p>' for p in w['overview'])
    resources=''.join('<div class="resource-row"><dt>'+a(t,u)+'</dt><dd>'+E(p)+'</dd></div>' for t,u,p in w['resources_detail'])
    related=''.join('<article><h3>'+a(BY_ID[x]['short'],'../'+BY_ID[x]['path']+'/')+'</h3><p>'+E(BY_ID[x]['summary'])+'</p></article>' for x in w['related'])
    bib=BIBS[w['id'].replace('-','')+str(w['year'])]
    sections=[('overview','Overview'),('example','Example'),('resources',USAGE[w['id']]['nav'])]
    if related: sections.append(('related','Related projects'))
    sections.append(('citation','Citation'))
    toc=''.join('<a href="#'+id+'">'+E(label)+'</a>' for id,label in sections)
    source=a('Paper',w['overview_source'])
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
{metadata(w['title']+' | Yating Wu',w['description'],w['page_url'],w)}
<link rel="stylesheet" href="../research/project.css?v=20260906c"><link rel="stylesheet" href="../research/usage.css?v=20260906c"><script src="../research/project.js" defer></script>
</head><body class="project-page" style="--accent:{w['accent']};--tint:{w['tint']}">
{nav('../#publications' if initial else '../research/')}
<main id="main" class="shell">
<header class="hero"><div class="paper-heading"><p class="eyebrow">{E(w.get('venue_short',w['venue']))}</p><p class="paper-year">{w['year']}</p></div><h1>{E(w['short'])}</h1>
<p class="paper-title">{E(w['title'])}</p>
<div class="paper-details"><p class="authors">{', '.join(authors)}</p><p class="venue">{venue}</p>
{('<p class="note">† Equal contribution.</p>' if w.get('equal') else '')}
</div><div class="actions">{links}</div></header>
<div class="page-grid"><aside class="toc" aria-label="On this page">{toc}</aside><div class="content">
<section id="overview"><div class="section-heading"><h2>Overview</h2></div><div class="study-copy">{overview}</div><p class="source">{source}</p></section>
{example_section(w['id'])}
<section id="resources"><div class="section-heading"><h2>{E(USAGE[w['id']]['title'])}</h2></div>{render_usage(w['id'])}<dl class="resource-list">{resources}</dl></section>
{('<section id="related"><div class="section-heading"><h2>Related projects</h2></div><div class="related">'+related+'</div></section>' if related else '')}
<section id="citation"><div class="section-heading"><h2>Citation</h2></div><div class="citation-actions"><a class="action" href="citation.bib" download>Download BibTeX</a><button class="action" type="button" data-copy-citation="bibtex" aria-describedby="copy-status" hidden>Copy BibTeX</button><span id="copy-status" class="copy-status" role="status" aria-live="polite"></span></div><details class="bibtex-disclosure"><summary>View BibTeX</summary><pre><code id="bibtex">{E(bib)}</code></pre></details></section>
</div></div></main>{footer()}</body></html>
'''


def hub():
    topics=[('figures','Scientific figures and multimodal reasoning'),('agents','Memory for LLM agents'),('discourse','Discourse and reader questions'),('generation','Evaluation of generated text'),('speech','Speech and language processing')]
    sections=[]
    for id,title in topics:
        rows=[]
        for w in WORKS:
            if w['topic']!=title:continue
            rows.append('<article class="project-row"><div class="project-meta">'+str(w['year'])+'<br>'+('Preprint' if w['venue']=='Preprint' else ('Workshop' if w['id']=='bilingual-disfluencies' else 'Conference paper'))+'</div><div><h3>'+a(w['short'],'../'+w['path']+'/')+'</h3><p>'+E(w['summary'])+'</p><p class="project-meta">'+E(w['title'])+'</p><div class="actions">'+a('Project page','../'+w['path']+'/','action primary')+a('Paper',w['url'],'action')+'</div></div></article>')
        sections.append('<section id="'+id+'" class="topic-section"><h2>'+title+'</h2>'+''.join(rows)+'</section>')
    data={'@context':'https://schema.org','@type':'CollectionPage','name':'Research projects by Yating Wu and collaborators','url':ORIGIN+'/research/','mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':w['title'],'url':w['page_url']} for i,w in enumerate(WORKS)]}}
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n'+metadata('Research projects | Yating Wu','Explore research on scientific figures, LLM agent memory, Questions Under Discussion, text generation evaluation, and bilingual speech. Papers, resources, and citations.',ORIGIN+'/research/')+'\n'+jsonld(data)+'\n<link rel="stylesheet" href="project.css?v=20260906c"></head><body>'+nav('./')+'<main id="main" class="shell"><header class="hero hub-intro"><p class="eyebrow">Yating Wu &amp; collaborators</p><h1>Research projects</h1><nav class="topic-nav" aria-label="Research topics">'+''.join(a(t,'#'+id) for id,t in topics)+'</nav></header>'+''.join(sections)+'</main>'+footer()+'</body></html>\n'


def outputs(only=None):
    result={}
    for w in WORKS:
        if w['id']=='mqud' or (only and w['id']!=only):continue
        result[Path(w['path'])/'index.html']=page(w)
        result[Path(w['path'])/'citation.bib']=BIBS[w['id'].replace('-','')+str(w['year'])]+'\n'
    if not only:result[Path('research/index.html')]=hub()
    return result


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--only',choices=[w['id'] for w in WORKS if w['id']!='mqud']);parser.add_argument('--check',action='store_true');args=parser.parse_args()
    rendered=outputs(args.only);stale=[]
    for path,text in rendered.items():
        target=ROOT/path
        if args.check:
            if not target.exists() or target.read_text()!=text:stale.append(str(path))
        else:
            target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
    if stale:raise SystemExit('Outdated generated files: '+', '.join(stale))
    print(('Verified ' if args.check else 'Rendered ')+str(len(rendered))+' files.')
