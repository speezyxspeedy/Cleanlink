/**
 * CleanLink & Instant Share - Background Service Worker
 * Handles global keyboard shortcut: Alt+Shift+C (or Option+Shift+C)
 */

importScripts('cleaner.js');

// Listen for global keyboard shortcuts registered in manifest.json
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'clean-and-copy') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) return;

      // Ignore internal browser pages (chrome://, edge://, about:)
      if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
        return;
      }

      const result = CleanLinkEngine.cleanUrl(tab.url, tab.title || '');
      const urlToCopy = result.cleanUrl;

      // Execute clipboard copy directly in the context of the active tab
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (cleanUrl, savedChars) => {
          navigator.clipboard.writeText(cleanUrl).then(() => {
            // Visual floating micro-indicator in the tab
            const toast = document.createElement('div');
            toast.textContent = savedChars > 0 
              ? `CleanLink: Copied! (-${savedChars} junk chars)` 
              : 'CleanLink: Copied clean link!';
            toast.style.cssText = `
              position: fixed;
              top: 24px;
              right: 24px;
              background: #0f172a;
              color: #f8fafc;
              border: 1px solid #334155;
              padding: 10px 18px;
              border-radius: 8px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 13px;
              font-weight: 500;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
              z-index: 2147483647;
              transition: opacity 0.2s ease, transform 0.2s ease;
              pointer-events: none;
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
              toast.style.opacity = '0';
              toast.style.transform = 'translateY(-6px)';
              setTimeout(() => toast.remove(), 250);
            }, 1600);
          }).catch(err => {
            console.error('CleanLink clipboard write failed:', err);
          });
        },
        args: [urlToCopy, result.savedCharacters]
      });

      // Show temporary badge checkmark on extension icon
      if (tab.id) {
        chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId: tab.id });
        setTimeout(() => {
          chrome.action.setBadgeText({ text: '', tabId: tab.id });
        }, 1500);
      }
    } catch (err) {
      console.error('CleanLink background shortcut execution failed:', err);
    }
  }
});

// Set badge style on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('CleanLink & Instant Share extension installed successfully.');
});
