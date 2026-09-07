// Progressive enhancement: citations remain readable and downloadable without JavaScript.
for (const button of document.querySelectorAll('[data-copy-citation]')) {
  if (!navigator.clipboard || !window.isSecureContext) continue;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const citation = document.getElementById(button.dataset.copyCitation);
    const status = document.getElementById(button.getAttribute('aria-describedby'));
    try {
      await navigator.clipboard.writeText(citation.textContent);
      status.textContent = 'BibTeX copied.';
    } catch {
      status.textContent = 'Please select the BibTeX below or use Download.';
    }
  });
}
