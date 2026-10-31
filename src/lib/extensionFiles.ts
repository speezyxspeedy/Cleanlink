/**
 * Pre-bundled raw source representations of extension files for
 * the in-app code inspector and 1-click ZIP packager.
 */

export interface ExtensionFileDefinition {
  name: string;
  path: string;
  language: 'json' | 'html' | 'javascript' | 'markdown' | 'svg';
  description: string;
  content: string;
  isBinary?: boolean;
}

export const EXTENSION_FILES: ExtensionFileDefinition[] = [
  {
    name: 'manifest.json',
    path: 'manifest.json',
    language: 'json',
    description: 'Manifest V3 configuration, permissions, background service worker, and keyboard shortcuts.',
    content: `{
  "manifest_version": 3,
  "name": "CleanLink & Instant Share",
  "version": "1.0.0",
  "description": "Zero-friction link cleaner: strips tracking tokens (UTMs, fbclid, ref, si) and copies clean links with 1-click or Alt+Shift+C.",
  "permissions": [
    "activeTab",
    "clipboardWrite",
    "scripting"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "CleanLink: Clean & Share Current URL",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "commands": {
    "clean-and-copy": {
      "suggested_key": {
        "default": "Alt+Shift+C",
        "mac": "Alt+Shift+C"
      },
      "description": "Clean current tab URL and copy to clipboard"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`
  },
  {
    name: 'popup.html',
    path: 'popup.html',
    language: 'html',
    description: 'Raycast/Linear dark mode popup UI with live character savings, URL diffing, and 3 quick-action copy buttons.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CleanLink</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 380px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
      background-color: #090d16;
      color: #f1f5f9;
      font-size: 13px;
      line-height: 1.45;
      padding: 14px;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1e293b;
    }
    .brand { display: flex; align-items: center; gap: 7px; font-weight: 600; font-size: 13px; color: #f8fafc; }
    .brand-icon { width: 16px; height: 16px; color: #6366f1; }
    .shortcut-badge {
      font-family: ui-monospace, monospace; font-size: 10px; color: #94a3b8;
      background: #1e293b; padding: 2px 6px; border-radius: 4px; border: 1px solid #334155;
    }
    .savings-banner {
      background: #0f172a; border: 1px solid #1e293b; border-radius: 8px;
      padding: 9px 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
    }
    .savings-text { font-size: 12px; color: #94a3b8; }
    .savings-metric {
      font-weight: 600; color: #10b981; font-variant-numeric: tabular-nums; font-family: ui-monospace, monospace;
    }
    .url-section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .url-block { background: #0d1322; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px; }
    .url-block.clean { border-color: #312e81; background: #0f172e; }
    .url-meta { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
    .url-meta .clean-tag { color: #818cf8; }
    .url-text { font-family: ui-monospace, monospace; font-size: 11px; color: #cbd5e1; word-break: break-all; max-height: 48px; overflow-y: auto; line-height: 1.4; user-select: text; }
    .url-text.original { color: #64748b; text-decoration: line-through 1px rgba(239, 68, 68, 0.4); }
    .params-container { margin-bottom: 12px; }
    .params-header { font-size: 11px; color: #64748b; margin-bottom: 6px; }
    .params-list { display: flex; flex-wrap: wrap; gap: 4px; max-height: 52px; overflow-y: auto; }
    .param-chip {
      background: #1e1b4b; border: 1px solid #3730a3; color: #c7d2fe;
      font-size: 10.5px; font-family: ui-monospace, monospace; padding: 2px 6px; border-radius: 4px;
    }
    .actions { display: flex; flex-direction: column; gap: 6px; }
    .btn {
      appearance: none; border: 1px solid #1e293b; background: #0f172a; color: #f1f5f9;
      padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; justify-content: space-between; transition: all 0.15s ease; width: 100%;
    }
    .btn:hover { background: #1e293b; border-color: #334155; }
    .btn-primary { background: #4f46e5; border-color: #6366f1; color: #ffffff; font-weight: 600; }
    .btn-primary:hover { background: #4338ca; border-color: #818cf8; }
    .btn-left { display: flex; align-items: center; gap: 7px; }
    .btn-key { font-family: ui-monospace, monospace; font-size: 10px; opacity: 0.7; background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 3px; }
    .toast {
      position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #10b981; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4); opacity: 0; pointer-events: none; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .footer { margin-top: 10px; text-align: center; font-size: 10.5px; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M10 7H7a4 4 0 0 0 0 8h3"/>
        <path d="M14 17h3a4 4 0 0 0 0-8h-3" stroke="#38bdf8"/>
        <line x1="8" y1="11" x2="16" y2="11"/>
        <circle cx="17" cy="7" r="1.2" fill="#38bdf8"/>
      </svg>
      <span>CleanLink</span>
    </div>
    <span class="shortcut-badge">Alt+Shift+C</span>
  </div>
  <div class="savings-banner" id="savingsBanner">
    <span class="savings-text" id="savingsText">Analyzing active page...</span>
    <span class="savings-metric" id="savingsMetric">0 chars</span>
  </div>
  <div class="url-section">
    <div class="url-block clean">
      <div class="url-meta"><span class="clean-tag">Clean URL</span><span id="cleanLen" class="savings-metric">0c</span></div>
      <div class="url-text" id="cleanUrlText">Loading...</div>
    </div>
    <div class="url-block" id="originalBlock">
      <div class="url-meta"><span>Original URL</span><span id="origLen" class="savings-metric">0c</span></div>
      <div class="url-text original" id="origUrlText">Loading...</div>
    </div>
  </div>
  <div class="params-container" id="paramsContainer" style="display: none;">
    <div class="params-header">Stripped Tracking Parameters <span id="paramCount" style="color: #cbd5e1;">(0)</span></div>
    <div class="params-list" id="paramsList"></div>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="btnCopyClean">
      <div class="btn-left"><span>Copy Clean URL</span></div><span class="btn-key">↵ Enter</span>
    </button>
    <button class="btn" id="btnCopyMarkdown">
      <div class="btn-left"><span>Copy Markdown Link</span></div><span class="btn-key">M</span>
    </button>
    <button class="btn" id="btnCopyShort">
      <div class="btn-left"><span>Copy Short Link</span></div><span class="btn-key">S</span>
    </button>
  </div>
  <div class="toast" id="toast"><span id="toastText">Copied to clipboard!</span></div>
  <div class="footer">Press Alt+Shift+C anytime to clean and copy without opening popup</div>
  <script src="cleaner.js"></script>
  <script src="popup.js"></script>
</body>
</html>`
  },
  {
    name: 'popup.js',
    path: 'popup.js',
    language: 'javascript',
    description: 'Active tab communicator, parameter chip renderer, clipboard writer, and hotkey listeners.',
    content: `document.addEventListener('DOMContentLoaded', async () => {
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
    window.__toastTimeout = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  async function copyToClipboard(text, successMsg) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(successMsg);
    }
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
      cleanUrlText.textContent = tab?.url || 'No active web page detected';
      origUrlText.textContent = 'Only HTTP & HTTPS URLs can be cleaned';
      savingsText.textContent = 'Cannot clean internal browser page';
      btnCopyClean.disabled = true;
      btnCopyMarkdown.disabled = true;
      btnCopyShort.disabled = true;
      return;
    }

    activeTabTitle = tab.title || '';
    currentResult = CleanLinkEngine.cleanUrl(tab.url, activeTabTitle);

    cleanUrlText.textContent = currentResult.cleanUrl;
    origUrlText.textContent = currentResult.originalUrl;
    cleanLen.textContent = \`\${currentResult.cleanUrl.length}c\`;
    origLen.textContent = \`\${currentResult.originalUrl.length}c\`;

    if (currentResult.savedCharacters > 0) {
      savingsText.textContent = \`Saved \${currentResult.savedCharacters} characters of tracking junk!\`;
      savingsMetric.textContent = \`-\${currentResult.savedCharacters}c (\${currentResult.savedPercent}%)\`;
      originalBlock.style.display = 'block';
    } else {
      savingsText.textContent = 'URL is already clean & private!';
      savingsMetric.textContent = '0 junk';
      origUrlText.style.textDecoration = 'none';
      origUrlText.style.color = '#94a3b8';
    }

    if (currentResult.removedParams && currentResult.removedParams.length > 0) {
      paramsContainer.style.display = 'block';
      paramCount.textContent = \`(\${currentResult.removedParams.length})\`;
      paramsList.innerHTML = '';
      currentResult.removedParams.forEach(param => {
        const chip = document.createElement('span');
        chip.className = 'param-chip';
        chip.title = \`\${param.key}: \${param.description}\`;
        chip.textContent = \`✕ \${param.key}\`;
        paramsList.appendChild(chip);
      });
    }
  } catch (err) {
    savingsText.textContent = 'Error inspecting active tab';
  }

  btnCopyClean.addEventListener('click', () => {
    if (currentResult?.cleanUrl) copyToClipboard(currentResult.cleanUrl, 'Clean URL copied!');
  });
  btnCopyMarkdown.addEventListener('click', () => {
    if (currentResult) {
      const title = activeTabTitle || currentResult.domain || 'Link';
      copyToClipboard(\`[\${title}](\${currentResult.cleanUrl})\`, 'Markdown link copied!');
    }
  });
  btnCopyShort.addEventListener('click', () => {
    if (currentResult?.shortUrl) copyToClipboard(currentResult.shortUrl, 'Short link copied!');
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Enter') { e.preventDefault(); btnCopyClean.click(); }
    else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); btnCopyMarkdown.click(); }
    else if (e.key === 's' || e.key === 'S') { e.preventDefault(); btnCopyShort.click(); }
  });
});`
  },
  {
    name: 'background.js',
    path: 'background.js',
    language: 'javascript',
    description: 'Service worker listening to the Alt+Shift+C global command, tab scripting, and badge feedback.',
    content: `importScripts('cleaner.js');

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'clean-and-copy') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) return;

      const result = CleanLinkEngine.cleanUrl(tab.url, tab.title || '');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (cleanUrl, savedChars) => {
          navigator.clipboard.writeText(cleanUrl).then(() => {
            const toast = document.createElement('div');
            toast.textContent = savedChars > 0 ? \`CleanLink: Copied! (-\${savedChars} junk chars)\` : 'CleanLink: Copied clean link!';
            toast.style.cssText = \`position: fixed; top: 24px; right: 24px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; padding: 10px 18px; border-radius: 8px; font-family: sans-serif; font-size: 13px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 2147483647; transition: opacity 0.2s ease;\`;
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 250); }, 1600);
          });
        },
        args: [result.cleanUrl, result.savedCharacters]
      });

      if (tab.id) {
        chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId: tab.id });
        setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 1500);
      }
    } catch (err) {
      console.error('CleanLink background shortcut execution failed:', err);
    }
  }
});`
  },
  {
    name: 'cleaner.js',
    path: 'cleaner.js',
    language: 'javascript',
    description: 'Pure ES6 URL parser, tracking token stripper, and platform normalizer (Amazon, YouTube, X, Reddit, Flipkart).',
    content: `/**
 * CleanLink & Instant Share - Core Cleaning Engine
 * Zero dependencies, pure JavaScript (ES6+ compatible in browsers & service workers)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CleanLinkEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PARAM_DESCRIPTIONS = {
    utm_source: 'Traffic source (e.g., newsletter, google, twitter)',
    utm_medium: 'Marketing medium (e.g., cpc, email, banner)',
    utm_campaign: 'Campaign identifier',
    utm_term: 'Paid search keywords',
    utm_content: 'A/B test or ad creative variant',
    utm_id: 'Master campaign ID',
    utm_cid: 'Campaign client ID',
    utm_reader: 'Feed reader tracking',
    utm_place: 'Location targeting identifier',
    utm_userid: 'User identification token',
    utm_swu: 'Salesforce Marketing Cloud identifier',
    fbclid: 'Meta / Facebook Click ID (cross-site tracking)',
    gclid: 'Google Ads Click ID',
    gclsrc: 'Google Ads Source tracker',
    dclid: 'DoubleClick click ID',
    wbraid: 'Google iOS app-to-web conversion ID',
    gbraid: 'Google Web-to-App measurement ID',
    msclkid: 'Microsoft / Bing Ads Click ID',
    twclid: 'Twitter / X Click ID',
    ttclid: 'TikTok Click ID',
    igshid: 'Instagram Share ID',
    si: 'Social / Video tracking token (YouTube, Spotify)',
    ref: 'Referral source parameter',
    ref_: 'Internal referral tracker',
    _ref: 'Referral origin tag',
    ref_src: 'X / Twitter embed referral source',
    ref_url: 'Referral URL history',
    source_ref: 'Source tracking identifier',
    referrer: 'HTTP referrer token',
    mc_cid: 'Mailchimp Campaign ID',
    mc_eid: 'Mailchimp Email Subscriber ID',
    _hsenc: 'HubSpot email security tracking',
    _hsmi: 'HubSpot email marketing index',
    hsCtaTracking: 'HubSpot Call-To-Action tracking',
    vero_id: 'Vero marketing user identifier',
    vero_conv: 'Vero conversion tag',
    ml_subscriber: 'MailerLite subscriber ID',
    ml_subscriber_hash: 'MailerLite tracking hash',
    spm: 'AliExpress / Taobao Super Position Model',
    spm_id_from: 'Bilibili / E-commerce position tracking',
    scm: 'Supply chain & ad tracker',
    srsltid: 'Google Merchant Center / Shopping tracking token',
    qid: 'Search query ID (Amazon / Flipkart)',
    sr: 'Search result rank tracker',
    crid: 'Customer review request identifier',
    sprefix: 'Search prefix recommendation token',
    dib: 'Amazon dynamic image beacon',
    dib_tag: 'Amazon dynamic ad beacon tag',
    cxt: 'Twitter context identifier',
    rdt: 'Reddit redirect tracker'
  };

  const BLACKLIST_EXACT = new Set([
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'utm_name', 'utm_cid', 'utm_reader', 'utm_place', 'utm_userid', 'utm_swu',
    'fbclid', 'gclid', 'gclsrc', 'dclid', 'wbraid', 'gbraid', 'msclkid', 'twclid', 'ttclid', 'igshid',
    'mc_cid', 'mc_eid',
    'ref', 'ref_', '_ref', 'ref_src', 'ref_url', 'source_ref', 'referrer',
    'si', 'feature', 'pp', 'embeds_referring_euri', 'embeds_referring_title', 'embed_source',
    'spm', 'spm_id_from', 'scm',
    '_hsenc', '_hsmi', 'hsCtaTracking',
    'srsltid', 'sc_campaign', 'sc_channel', 'sc_content', 'sc_medium', 'sc_source', 'sc_country',
    'zarsrc', 'vero_id', 'vero_conv', 'bmc_content', 'bmc_tracker', 'wickedid', 'wicked_source',
    'oly_enc_id', 'oly_anon_id', 'rb_clickid', 'ya_click_id', 'yclid', 'ndid', 'n_click', 'n_source',
    'cxt', 'rdt', 'trackingid', 'refid', 'miniprofileurn'
  ]);

  const BLACKLIST_PREFIXES = ['utm_', 'ref_', 'fb_', 'ga_', 'hsa_', 'sc_', '_hs', 'ml_', 'cmpid'];

  function isTrackingParam(key, domain) {
    const lowerKey = key.toLowerCase();
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      if (lowerKey === 'v' || lowerKey === 't' || lowerKey === 'list' || lowerKey === 'index') return false;
      if (['si', 'feature', 'pp', 'embeds_referring_euri', 'ab_channel', 'sub_confirmation', 'app'].includes(lowerKey)) return true;
    }
    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      if (lowerKey === 's' || lowerKey === 't' || lowerKey === 'cxt' || lowerKey === 'ref_src' || lowerKey === 'ref_url') return true;
    }
    if (domain.includes('reddit.com')) {
      if (lowerKey === 'utm_source' || lowerKey === 'utm_medium' || lowerKey === 'utm_name' || lowerKey === 'rdt') return true;
    }
    if (BLACKLIST_EXACT.has(lowerKey)) return true;
    for (const prefix of BLACKLIST_PREFIXES) {
      if (lowerKey.startsWith(prefix)) return true;
    }
    return false;
  }

  function cleanAmazonUrl(parsedUrl) {
    const hostname = parsedUrl.hostname;
    const asinMatch = parsedUrl.pathname.match(/(?:\\/dp\\/|\\/gp\\/product\\/|\\/gp\\/aw\\/d\\/|(?:\\/.*)?\\/dp\\/)([A-Z0-9]{10})(?:[\\/?]|$)/i);
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1].toUpperCase();
      return {
        isSpecialized: true,
        cleanUrl: \`\${parsedUrl.protocol}//\${hostname}/dp/\${asin}\`,
        shortUrl: \`\${parsedUrl.protocol}//\${hostname.replace(/^www\\./, '')}/dp/\${asin}\`
      };
    }
    return null;
  }

  function cleanYouTubeUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname.includes('youtube.com') || hostname === 'youtu.be') {
      let videoId = null;
      let timestamp = null;
      if (hostname === 'youtu.be') {
        videoId = parsedUrl.pathname.replace(/^\\//, '').split('/')[0];
        timestamp = parsedUrl.searchParams.get('t');
      } else if (parsedUrl.pathname.includes('/watch')) {
        videoId = parsedUrl.searchParams.get('v');
        timestamp = parsedUrl.searchParams.get('t') || parsedUrl.searchParams.get('time_continue');
      } else if (parsedUrl.pathname.includes('/shorts/')) {
        const parts = parsedUrl.pathname.split('/shorts/');
        if (parts[1]) videoId = parts[1].split('/')[0];
      }
      if (videoId) {
        let cleanUrl = \`https://www.youtube.com/watch?v=\${videoId}\`;
        let shortUrl = \`https://youtu.be/\${videoId}\`;
        if (timestamp) {
          cleanUrl += \`&t=\${encodeURIComponent(timestamp)}\`;
          shortUrl += \`?t=\${encodeURIComponent(timestamp)}\`;
        }
        return { isSpecialized: true, cleanUrl, shortUrl };
      }
    }
    return null;
  }

  function cleanTwitterUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      const statusMatch = parsedUrl.pathname.match(/\\/([^/]+)\\/status\\/(\\d+)/i);
      if (statusMatch) {
        const username = statusMatch[1];
        const statusId = statusMatch[2];
        return {
          isSpecialized: true,
          cleanUrl: \`https://x.com/\${username}/status/\${statusId}\`,
          shortUrl: \`https://x.com/i/status/\${statusId}\`
        };
      }
    }
    return null;
  }

  function cleanFlipkartUrl(parsedUrl) {
    if (parsedUrl.hostname.includes('flipkart.com')) {
      const match = parsedUrl.pathname.match(/(.*\\/p\\/[a-zA-Z0-9]+)/i);
      if (match && match[1]) {
        const cleanUrl = \`\${parsedUrl.protocol}//\${parsedUrl.hostname}\${match[1]}\`;
        return { isSpecialized: true, cleanUrl, shortUrl: cleanUrl };
      }
    }
    return null;
  }

  function cleanRedditUrl(parsedUrl) {
    if (parsedUrl.hostname.includes('reddit.com')) {
      const commentMatch = parsedUrl.pathname.match(/\\/r\\/([^/]+)\\/comments\\/([a-zA-Z0-9]+)/i);
      if (commentMatch) {
        return {
          isSpecialized: true,
          cleanUrl: \`https://www.reddit.com/r/\${commentMatch[1]}/comments/\${commentMatch[2]}/\`,
          shortUrl: \`https://redd.it/\${commentMatch[2]}\`
        };
      }
    }
    return null;
  }

  function cleanUrl(rawUrl, pageTitle = '') {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { isValid: false, cleanUrl: '', shortUrl: '', markdownLink: '', removedParams: [], savedCharacters: 0, savedPercent: 0 };
    }
    let urlObj;
    try { urlObj = new URL(rawUrl.trim()); }
    catch {
      try { urlObj = new URL('https://' + rawUrl.trim()); }
      catch {
        return { isValid: false, originalUrl: rawUrl, cleanUrl: rawUrl, shortUrl: rawUrl, markdownLink: \`[\${pageTitle || rawUrl}](\${rawUrl})\`, removedParams: [], savedCharacters: 0, savedPercent: 0 };
      }
    }

    const domain = urlObj.hostname.toLowerCase();
    const removedParams = [];
    const retainedParams = new URLSearchParams();

    for (const [key, value] of urlObj.searchParams.entries()) {
      if (isTrackingParam(key, domain)) {
        removedParams.push({ key, value, description: PARAM_DESCRIPTIONS[key.toLowerCase()] || 'Tracking parameter' });
      } else {
        retainedParams.append(key, value);
      }
    }

    let specialized = null;
    if (domain.includes('amazon.')) specialized = cleanAmazonUrl(urlObj);
    else if (domain.includes('youtube.com') || domain === 'youtu.be') specialized = cleanYouTubeUrl(urlObj);
    else if (domain.includes('twitter.com') || domain.includes('x.com')) specialized = cleanTwitterUrl(urlObj);
    else if (domain.includes('flipkart.com')) specialized = cleanFlipkartUrl(urlObj);
    else if (domain.includes('reddit.com')) specialized = cleanRedditUrl(urlObj);

    let finalCleanUrl = specialized ? specialized.cleanUrl : '';
    let finalShortUrl = specialized ? specialized.shortUrl : '';

    if (!finalCleanUrl) {
      const cleanUrlObj = new URL(urlObj.toString());
      cleanUrlObj.search = retainedParams.toString();
      if (cleanUrlObj.hash === '#') cleanUrlObj.hash = '';
      finalCleanUrl = cleanUrlObj.toString();
      const shortCandidate = new URL(cleanUrlObj.toString());
      shortCandidate.hostname = shortCandidate.hostname.replace(/^www\\./, '');
      finalShortUrl = shortCandidate.toString();
    }

    const savedCharacters = Math.max(0, rawUrl.trim().length - finalCleanUrl.length);
    const savedPercent = rawUrl.trim().length > 0 ? Math.round((savedCharacters / rawUrl.trim().length) * 100) : 0;
    const title = pageTitle ? pageTitle.trim() : (urlObj.hostname || 'Link');

    return {
      isValid: true,
      originalUrl: rawUrl.trim(),
      cleanUrl: finalCleanUrl,
      shortUrl: finalShortUrl,
      markdownLink: \`[\${title}](\${finalCleanUrl})\`,
      removedParams,
      savedCharacters,
      savedPercent,
      domain
    };
  }

  return { cleanUrl, isTrackingParam, PARAM_DESCRIPTIONS };
});`
  },
  {
    name: 'icons/icon.svg',
    path: 'icons/icon.svg',
    language: 'svg',
    description: 'Authentic precision CleanLink brand emblem: interlocking links with surgical severance cut.',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="#0f172a" />
  <rect x="1" y="1" width="126" height="126" rx="27" fill="none" stroke="#334155" stroke-width="2" />
  <g transform="translate(24, 24)">
    <path d="M34 24H24C15.1634 24 8 31.1634 8 40V40C8 48.8366 15.1634 56 24 56H34" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M46 56H56C64.8366 56 72 48.8366 72 40V40C72 31.1634 64.8366 24 56 24H46" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="28" y1="40" x2="52" y2="40" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
    <circle cx="56" cy="24" r="4.5" fill="#38bdf8" />
  </g>
</svg>`
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Quickstart manual, Chrome developer mode setup guide, and shortcut customization instructions.',
    content: `# CleanLink & Instant Share ⚡
Chrome Extension (Manifest V3) to strip tracking tokens and copy clean URLs.

## How to Install in Google Chrome
1. Open chrome://extensions/
2. Toggle 'Developer mode' to ON (top right)
3. Click 'Load unpacked' (top left)
4. Select the 'extension' folder
5. Pin to toolbar and use Alt+Shift+C!`
  }
];
