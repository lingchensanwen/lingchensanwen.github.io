(async function () {
  const gallery = document.getElementById('gallery');
  const countEl = document.getElementById('count');
  const metaEl = document.getElementById('meta');

  let data;
  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    gallery.innerHTML = '<p style="color:#a33">Failed to load data.json — serve this page over HTTP (e.g. <code>python -m http.server</code>) rather than opening it as a local file.</p>';
    return;
  }

  countEl.textContent = data.length;
  const withCap = data.filter(d => (d.caption || '').trim()).length;
  metaEl.textContent = `Showing ${data.length} examples — ${withCap} with figure captions, ${data.length - withCap} caption-free.`;

  const escape = (s) => (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const arxivLink = (p) => {
    const m = /^(\d{4}\.\d{4,5})v?\d*$/.exec(p || '');
    return m ? `https://arxiv.org/abs/${m[1]}` : null;
  };

  const STOP_WORDS = new Set([
    'the','and','for','with','that','this','from','have','were','their','been','which','will','would',
    'could','there','these','those','into','about','because','while','than','such','should','among',
    'across','between','during','where','when','what','your','after','before','also','only','each',
    'over','more','most','many','some','very','just','like','using','based','shown','figure','show',
    'shows','panel','panels','compared','indicate','indicates','suggest','suggests','reflect','reflects'
  ]);

  const extractAnswerElements = (answer) => {
    if (!answer) return { words: new Set(), phrases: [] };
    const tokens = (answer.toLowerCase().match(/\b[a-z0-9'-]+\b/g) || []);
    const words = new Set();
    const phrases = new Set();
    let buf = [];
    tokens.forEach(tok => {
      if (STOP_WORDS.has(tok) || tok.length <= 3) {
        if (buf.length >= 2) phrases.add(buf.join(' '));
        buf = [];
        return;
      }
      words.add(tok);
      buf.push(tok);
    });
    if (buf.length >= 2) phrases.add(buf.join(' '));
    for (let i = 0; i < tokens.length - 1 && phrases.size < 15; i++) {
      const a = tokens[i], b = tokens[i + 1], c = tokens[i + 2];
      if (a && b && !STOP_WORDS.has(a) && !STOP_WORDS.has(b) && a.length > 3 && b.length > 3) {
        phrases.add(`${a} ${b}`);
      }
      if (a && b && c && !STOP_WORDS.has(c) && c.length > 3 && phrases.size < 15) {
        phrases.add(`${a} ${b} ${c}`);
      }
    }
    return { words, phrases: Array.from(phrases).slice(0, 15) };
  };

  const scoreSentence = (sentence, el) => {
    const norm = sentence.toLowerCase();
    let score = 0, hits = 0;
    el.words.forEach(w => {
      const r = new RegExp(`\\b${escapeRegExp(w)}\\b`, 'gi');
      const m = norm.match(r);
      if (m) { hits += m.length; score += m.length * 2; }
    });
    el.phrases.forEach(ph => {
      const r = new RegExp(escapeRegExp(ph), 'gi');
      const m = norm.match(r);
      if (m) { hits += m.length; score += m.length * 6; }
    });
    if (hits >= 2) score += 2;
    return score;
  };

  // Wrap whole sentences whose content-word overlap with the answer is high
  // enough to count as direct support (single level — no word-level noise).
  const highlightPassage = (passageText, el) => {
    const rawSentences = passageText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length);
    if (!rawSentences.length) return escape(passageText);
    const scores = rawSentences.map(s => scoreSentence(s, el));
    const maxScore = Math.max(...scores, 0);
    if (maxScore < 3) return escape(passageText);
    const threshold = Math.max(3, maxScore * 0.6);
    return rawSentences.map((s, i) => {
      const safe = escape(s);
      return scores[i] >= threshold
        ? `<span class="evidence-sentence">${safe}</span>`
        : safe;
    }).join(' ');
  };

  data.forEach((ex, i) => {
    const card = document.createElement('details');
    card.className = 'card';

    const link = arxivLink(ex.paper);
    const paperLink = link
      ? `<a href="${link}" target="_blank" rel="noopener">${escape(ex.paper)}</a>`
      : escape(ex.paper);

    const tags = [];
    if (ex.type) tags.push(`<span class="tag">${escape(ex.type)}</span>`);
    if (!ex.caption || !ex.caption.trim()) tags.push(`<span class="tag pill-warn">no caption</span>`);
    if (typeof ex.figure === 'number') tags.push(`<span class="tag">figure ${ex.figure}</span>`);

    const captionHtml = (ex.caption || '').trim()
      ? `<p class="caption"><strong>Caption.</strong> ${escape(ex.caption)}</p>`
      : `<p class="caption empty">[no caption provided with this figure]</p>`;

    const sourceParas = Array.isArray(ex.source_paragraphs) && ex.source_paragraphs.length
      ? ex.source_paragraphs
      : (ex.source ? [ex.source] : []);

    const figureOnly = ex.evaluation && ex.evaluation['answered-by-figure'] === 'yes';
    const groundingBadge = figureOnly
      ? `<span class="grounding grounding-figure">answer grounded in figure</span>`
      : `<span class="grounding grounding-text">answer grounded in paper text</span>`;

    const answerElements = extractAnswerElements(ex.answer);
    const passageHtml = sourceParas.length
      ? `
        <div class="subsection">
          <div class="sub-label">
            Supporting passage${sourceParas.length > 1 ? 's' : ''} from paper
            <span class="hl-note">highlighted sentences overlap most with the answer</span>
          </div>
          ${sourceParas.map(p => `<blockquote class="passage">${highlightPassage(p, answerElements)}</blockquote>`).join('')}
        </div>`
      : '';

    card.innerHTML = `
      <summary class="card-summary">
        <div class="summary-meta">
          <span class="example-num">Example ${i + 1}</span>
          <span class="paper-id">${paperLink}</span>
        </div>
        <h2 class="summary-title">${escape(ex.title)}</h2>
        <p class="summary-q">${escape(ex.question)}</p>
        <div class="tags">${tags.join(' ')}</div>
        <span class="expand-hint">click to expand details ▾</span>
      </summary>

      <div class="card-body">

        <section class="panel panel-trigger">
          <h3 class="panel-title">Trigger Context</h3>
          <p class="panel-sub">What the reader sees before asking a question</p>

          <div class="subsection">
            <div class="sub-label">Paper title</div>
            <p class="paper-title-full">${escape(ex.title)}${link ? ` &nbsp;·&nbsp; <a href="${link}" target="_blank" rel="noopener">${escape(ex.paper)}</a>` : ''}</p>
          </div>

          <div class="subsection">
            <div class="sub-label">Abstract</div>
            <p class="abstract-text">${escape(ex.abstract)}</p>
          </div>

          <div class="subsection">
            <div class="sub-label">Figure${typeof ex.figure === 'number' ? ` ${ex.figure}` : ''}</div>
            <div class="figure">
              <img src="${escape(ex.image)}" alt="Figure ${ex.figure || ''} from ${escape(ex.title)}" loading="lazy">
              ${captionHtml}
            </div>
          </div>
        </section>

        <section class="panel panel-question">
          <h3 class="panel-title">Question Generation</h3>
          <p class="panel-sub">The inquisitive question prompted by the trigger context</p>
          <blockquote class="question-box">${escape(ex.question)}</blockquote>
        </section>

        <section class="panel panel-answer">
          <h3 class="panel-title">Answering the Question</h3>
          <p class="panel-sub">${groundingBadge}</p>
          <div class="subsection">
            <div class="sub-label">Answer</div>
            <div class="answer-box">${escape(ex.answer)}</div>
          </div>
          ${passageHtml}
        </section>

      </div>
    `;

    gallery.appendChild(card);
  });
})();
