/**
 * CleanLink & Instant Share - Popup Controller
 * Manages DOM interaction, URL cleaning, clipboard copying, and hotkeys
 */

document.addEventListener('DOMContentLoaded', async () => {
  const savingsBanner = document.getElementById('savingsBanner');
  const savingsText = document.getElementById('savingsText');
  const savingsMetric = document.getElementById('savingsMetric');
  const cleanUrlText = document.getElementById('cleanUrlText');
  const origUrlText = document.getElementById('origUrlText');
  const cleanLen = document.getElementById('cleanLen');
  const origLen = document.getElementById('origLen');
  const paramsContainer = document.getElementById('paramsContainer');
  const paramsList = document.getElementById('paramsList');
  const paramCount = document.getElementById('paramCount');
  const originalBlock = document.getElementById('originalBlock');

  const btnCopyClean = document.getElementById('btnCopyClean');
  const btnCopyMarkdown = document.getElementById('btnCopyMarkdown');
  const btnCopyShort = document.getElementById('btnCopyShort');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  let currentResult = null;
  let activeTabTitle = '';

  function showToast(message = 'Copied to clipboard!') {
    toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 1800);
  }

  async function copyToClipboard(text, successMsg) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
    } catch (err) {
      // Fallback using textarea execCommand
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = text;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      showToast(successMsg);
    }
  }

  // Fetch the active tab URL and process it
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
      cleanUrlText.textContent = tab?.url || 'No active web page detected';
      origUrlText.textContent = 'Only HTTP & HTTPS URLs can be cleaned';
      savingsText.textContent = 'Cannot clean internal browser page';
      savingsMetric.textContent = '0 chars';
      btnCopyClean.disabled = true;
      btnCopyMarkdown.disabled = true;
      btnCopyShort.disabled = true;
      return;
    }

    activeTabTitle = tab.title || '';
    currentResult = CleanLinkEngine.cleanUrl(tab.url, activeTabTitle);

    // Update URL views
    cleanUrlText.textContent = currentResult.cleanUrl;
    origUrlText.textContent = currentResult.originalUrl;
    cleanLen.textContent = `${currentResult.cleanUrl.length}c`;
    origLen.textContent = `${currentResult.originalUrl.length}c`;

    // Update savings text and counter
    if (currentResult.savedCharacters > 0) {
      savingsText.textContent = `Saved ${currentResult.savedCharacters} characters of tracking junk!`;
      savingsMetric.textContent = `-${currentResult.savedCharacters}c (${currentResult.savedPercent}%)`;
      savingsMetric.style.color = '#10b981';
      originalBlock.style.display = 'block';
    } else {
      savingsText.textContent = 'URL is already clean & private!';
      savingsMetric.textContent = '0 junk';
      savingsMetric.style.color = '#94a3b8';
      // If no savings and identical, dim original
      origUrlText.style.textDecoration = 'none';
      origUrlText.style.color = '#94a3b8';
    }

    // Render removed parameters
    if (currentResult.removedParams && currentResult.removedParams.length > 0) {
      paramsContainer.style.display = 'block';
      paramCount.textContent = `(${currentResult.removedParams.length})`;
      paramsList.innerHTML = '';

      currentResult.removedParams.forEach(param => {
        const chip = document.createElement('span');
        chip.className = 'param-chip';
        chip.title = `${param.key}: ${param.description}`;
        chip.innerHTML = `<span class="trash-icon">✕</span> ${escapeHtml(param.key)}`;
        paramsList.appendChild(chip);
      });
    } else {
      paramsContainer.style.display = 'none';
    }

  } catch (err) {
    console.error('CleanLink popup initialization error:', err);
    savingsText.textContent = 'Error inspecting active tab';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Button Click Handlers
  btnCopyClean.addEventListener('click', () => {
    if (currentResult?.cleanUrl) {
      copyToClipboard(currentResult.cleanUrl, 'Clean URL copied!');
    }
  });

  btnCopyMarkdown.addEventListener('click', () => {
    if (currentResult) {
      const title = activeTabTitle || currentResult.domain || 'Link';
      const markdown = `[${title}](${currentResult.cleanUrl})`;
      copyToClipboard(markdown, 'Markdown link copied!');
    }
  });

  btnCopyShort.addEventListener('click', () => {
    if (currentResult?.shortUrl) {
      copyToClipboard(currentResult.shortUrl, 'Short link copied!');
    }
  });

  // Hotkey navigation inside popup
  document.addEventListener('keydown', (e) => {
    // Prevent overriding if user is somehow selecting text
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Enter') {
      e.preventDefault();
      btnCopyClean.click();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      btnCopyMarkdown.click();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      btnCopyShort.click();
    }
  });
});
