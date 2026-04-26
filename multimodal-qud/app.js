(async function () {
  const gallery = document.getElementById('gallery');
  const countEl = document.getElementById('count');
  const metaEl = document.getElementById('meta');
  const filtersEl = document.getElementById('filters');

  let data;
  try {
    const res = await fetch('data.json');
    data = await res.json();
  } catch (e) {
    gallery.innerHTML = '<p style="color:#a33">Failed to load data.json — serve this page over HTTP (e.g. <code>python -m http.server</code>) rather than opening it as a local file.</p>';
    return;
  }

  countEl.textContent = data.length;
  const types = Array.from(new Set(data.map(d => d.type).filter(Boolean))).sort();
  metaEl.innerHTML = `
    <strong>Figure-text interaction</strong>
    <span>scientific-paper context</span>
    <span>tracked answer evidence</span>
  `;

  const cleanText = (s) => {
    let out = String(s || '')
      .replace(/\\renewcommand\s*\{\\thefootnote\}\s*\{\\fnsymbol\{footnote\}\}/g, ' ')
      .replace(/covariance\s+\$?\\begin\{psmallmatrix\}\s*x\s*&\s*0\s*0\s*&\s*1\s*\\end\{psmallmatrix\}\$?/gi, 'covariance diag(x, 1)');
    for (let i = 0; i < 3; i++) {
      out = out
        .replace(/\\(?:textbf|textit|textsc|texttt|emph)\{([^{}]*)\}/g, '$1')
        .replace(/\\(?:begin|end)\{[^{}]*\}/g, ' ')
        .replace(/\\renewcommand\{[^{}]*\}\{[^{}]*\}/g, ' ');
    }
    return out
      .replace(/(Figures?)~fig:[A-Za-z0-9:_-]+/g, '$1')
      .replace(/\s+and~fig:[A-Za-z0-9:_-]+/g, '')
      .replace(/~fig:[A-Za-z0-9:_-]+/g, '')
      .replace(/Figures?~(?:Figures?~)?(?:fig:)?[A-Za-z0-9:_-]+/g, 'Figure')
      .replace(/Figure~Figure\s*/g, 'Figure ')
      .replace(/In Section[, ]+/g, 'In the paper, ')
      .replace(/\\tau/g, 'τ')
      .replace(/\\approx/g, '≈')
      .replace(/\\sim/g, '~')
      .replace(/\\texttimes/g, 'x')
      .replace(/\\texttt\{([^{}]*)\}/g, '$1')
      .replace(/\\%/g, '%')
      .replace(/\\_/g, '_')
      .replace(/\\&/g, '&')
      .replace(/\\#/g, '#')
      .replace(/\\\$/g, '$')
      .replace(/\\\s+/g, ' ')
      .replace(/\\,/g, ' ')
      .replace(/~+/g, ' ')
      .replace(/\$+/g, '')
      .replace(/\\[a-zA-Z]+[*]?/g, ' ')
      .replace(/\\\s*/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([.!?])(?=[A-Z])/g, '$1 ')
      .replace(/\.\.\./g, '...')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  const escape = (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const renderText = (s) => escape(cleanText(s))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const text = renderText;
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
    const tokens = (cleanText(answer).toLowerCase().match(/\b[a-z0-9'-]+\b/g) || []);
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
    const norm = cleanText(sentence).toLowerCase();
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
    const rawSentences = cleanText(passageText).split(/(?<=[.!?])\s+/).filter(s => s.trim().length);
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

  const filterButtons = ['all', ...types];
  filtersEl.innerHTML = filterButtons.map((type, i) => `
    <button class="filter ${i === 0 ? 'active' : ''}" type="button" data-type="${escape(type)}">
      ${escape(type)}
    </button>
  `).join('');

  filtersEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-type]');
    if (!button) return;
    const type = button.dataset.type;
    filtersEl.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button));
    gallery.querySelectorAll('.card').forEach(card => {
      card.hidden = type !== 'all' && card.dataset.type !== type;
    });
  });

  data.forEach((ex, i) => {
    const card = document.createElement('details');
    card.className = 'card';
    card.dataset.type = ex.type || '';

    const link = arxivLink(ex.paper);
    const paperLink = link
      ? `<a href="${link}" target="_blank" rel="noopener">${escape(ex.paper)}</a>`
      : escape(ex.paper);

    const tags = [];
    if (ex.type) tags.push(`<span class="tag">${escape(ex.type)}</span>`);
    if (!ex.caption || !ex.caption.trim()) tags.push(`<span class="tag pill-warn">no caption</span>`);
    if (typeof ex.figure === 'number') tags.push(`<span class="tag">figure ${ex.figure}</span>`);

    const captionHtml = (ex.caption || '').trim()
      ? `<p class="caption"><strong>Caption.</strong> ${text(ex.caption)}</p>`
      : `<p class="caption empty">[no caption provided with this figure]</p>`;

    const sourceParas = Array.isArray(ex.source_paragraphs) && ex.source_paragraphs.length
      ? ex.source_paragraphs
      : (ex.source ? [ex.source] : []);

    const answerElements = extractAnswerElements(ex.answer);
    const sourceCount = sourceParas.length;
    const passageHtml = sourceParas.length
      ? `
        <div class="subsection">
          <div class="sub-label">
            Evidence passage${sourceParas.length > 1 ? 's' : ''} from paper
            <span class="hl-note">highlight marks closest supporting sentence${sourceParas.length > 1 ? 's' : ''}</span>
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
        <h2 class="summary-title">${text(ex.title)}</h2>
        <p class="summary-q">${text(ex.question)}</p>
        <div class="summary-metrics">
          <span class="metric">${sourceCount} evidence passage${sourceCount === 1 ? '' : 's'}</span>
        </div>
        <div class="tags">${tags.join(' ')}</div>
        <span class="expand-hint" aria-hidden="true">⌄</span>
      </summary>

      <div class="card-body">

        <section class="panel panel-trigger">
          <h3 class="panel-title">Trigger Context</h3>
          <p class="panel-sub">Figure and paper context that trigger the question</p>

          <div class="subsection">
            <div class="sub-label">Paper title</div>
            <p class="paper-title-full">${text(ex.title)}${link ? ` &nbsp;·&nbsp; <a href="${link}" target="_blank" rel="noopener">${escape(ex.paper)}</a>` : ''}</p>
          </div>

          <div class="subsection">
            <div class="sub-label">Abstract</div>
            <p class="abstract-text">${text(ex.abstract)}</p>
          </div>

          <div class="subsection">
            <div class="sub-label">Figure${typeof ex.figure === 'number' ? ` ${ex.figure}` : ''}</div>
            <div class="figure">
              <img src="${escape(ex.image)}" alt="Figure ${ex.figure || ''} from ${text(ex.title)}" loading="lazy">
              ${captionHtml}
            </div>
          </div>
        </section>

        <section class="panel panel-question">
          <h3 class="panel-title">Inquisitive Question</h3>
          <p class="panel-sub">A research-oriented question raised by the figure-text context</p>
          <blockquote class="question-box">${text(ex.question)}</blockquote>
        </section>

        <section class="panel panel-answer">
          <h3 class="panel-title">Answer and Evidence</h3>
          <p class="panel-sub">Answer with evidence from the surrounding paper context</p>
          <div class="subsection">
            <div class="sub-label">Answer</div>
            <div class="answer-box">${text(ex.answer)}</div>
          </div>
          ${passageHtml}
        </section>

      </div>
    `;

    gallery.appendChild(card);
  });
})();
