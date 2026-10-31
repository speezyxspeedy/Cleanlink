/**
 * CleanLink TypeScript Core Engine
 * Strips tracking parameters, referral tokens, and creates formatted share links.
 */

export interface RemovedParam {
  key: string;
  value: string;
  description: string;
}

export interface CleanResult {
  isValid: boolean;
  error?: string;
  originalUrl: string;
  cleanUrl: string;
  shortUrl: string;
  markdownLink: string;
  removedParams: RemovedParam[];
  savedCharacters: number;
  savedPercent: number;
  domain: string;
  platformBadge?: string;
}

export const PARAM_DESCRIPTIONS: Record<string, string> = {
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

const BLACKLIST_PREFIXES = [
  'utm_',
  'ref_',
  'fb_',
  'ga_',
  'hsa_',
  'sc_',
  '_hs',
  'ml_',
  'cmpid'
];

export function isTrackingParam(key: string, domain: string): boolean {
  const lowerKey = key.toLowerCase();

  // YouTube rules
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    if (lowerKey === 'v' || lowerKey === 't' || lowerKey === 'list' || lowerKey === 'index') {
      return false;
    }
    if (['si', 'feature', 'pp', 'embeds_referring_euri', 'ab_channel', 'sub_confirmation', 'app'].includes(lowerKey)) {
      return true;
    }
  }

  // Twitter rules
  if (domain.includes('twitter.com') || domain.includes('x.com')) {
    if (lowerKey === 's' || lowerKey === 't' || lowerKey === 'cxt' || lowerKey === 'ref_src' || lowerKey === 'ref_url') {
      return true;
    }
  }

  // Reddit rules
  if (domain.includes('reddit.com')) {
    if (lowerKey === 'utm_source' || lowerKey === 'utm_medium' || lowerKey === 'utm_name' || lowerKey === 'rdt') {
      return true;
    }
  }

  if (BLACKLIST_EXACT.has(lowerKey)) {
    return true;
  }

  for (const prefix of BLACKLIST_PREFIXES) {
    if (lowerKey.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

export function cleanUrl(rawUrl: string, pageTitle: string = ''): CleanResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a URL',
      originalUrl: rawUrl || '',
      cleanUrl: '',
      shortUrl: '',
      markdownLink: '',
      removedParams: [],
      savedCharacters: 0,
      savedPercent: 0,
      domain: ''
    };
  }

  const trimmed = rawUrl.trim();
  let urlObj: URL;
  try {
    urlObj = new URL(trimmed);
  } catch {
    try {
      urlObj = new URL('https://' + trimmed);
    } catch {
      return {
        isValid: false,
        error: 'Unable to parse URL structure',
        originalUrl: trimmed,
        cleanUrl: trimmed,
        shortUrl: trimmed,
        markdownLink: `[${pageTitle || trimmed}](${trimmed})`,
        removedParams: [],
        savedCharacters: 0,
        savedPercent: 0,
        domain: ''
      };
    }
  }

  const domain = urlObj.hostname.toLowerCase();
  const removedParams: RemovedParam[] = [];
  const retainedParams = new URLSearchParams();

  for (const [key, value] of urlObj.searchParams.entries()) {
    if (isTrackingParam(key, domain)) {
      removedParams.push({
        key,
        value,
        description: PARAM_DESCRIPTIONS[key.toLowerCase()] || 'Tracking or marketing analytics parameter'
      });
    } else {
      retainedParams.append(key, value);
    }
  }

  let finalCleanUrl = '';
  let finalShortUrl = '';
  let platformBadge = '';

  // 1. Amazon
  if (domain.includes('amazon.')) {
    platformBadge = 'Amazon';
    const asinMatch = urlObj.pathname.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|(?:\/.*)?\/dp\/)([A-Z0-9]{10})(?:[/?]|$)/i);
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1].toUpperCase();
      finalCleanUrl = `${urlObj.protocol}//${urlObj.hostname}/dp/${asin}`;
      finalShortUrl = `${urlObj.protocol}//${urlObj.hostname.replace(/^www\./, '')}/dp/${asin}`;
    }
  }
  // 2. YouTube
  else if (domain.includes('youtube.com') || domain === 'youtu.be') {
    platformBadge = 'YouTube';
    let videoId: string | null = null;
    let timestamp: string | null = null;

    if (domain === 'youtu.be') {
      videoId = urlObj.pathname.replace(/^\//, '').split('/')[0];
      timestamp = urlObj.searchParams.get('t');
    } else if (urlObj.pathname.includes('/watch')) {
      videoId = urlObj.searchParams.get('v');
      timestamp = urlObj.searchParams.get('t') || urlObj.searchParams.get('time_continue');
    } else if (urlObj.pathname.includes('/shorts/')) {
      const parts = urlObj.pathname.split('/shorts/');
      if (parts[1]) videoId = parts[1].split('/')[0];
    }

    if (videoId) {
      finalCleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      finalShortUrl = `https://youtu.be/${videoId}`;
      if (timestamp) {
        finalCleanUrl += `&t=${encodeURIComponent(timestamp)}`;
        finalShortUrl += `?t=${encodeURIComponent(timestamp)}`;
      }
    }
  }
  // 3. Twitter / X
  else if (domain.includes('twitter.com') || domain.includes('x.com')) {
    platformBadge = 'X (Twitter)';
    const statusMatch = urlObj.pathname.match(/\/([^/]+)\/status\/(\d+)/i);
    if (statusMatch) {
      const username = statusMatch[1];
      const statusId = statusMatch[2];
      finalCleanUrl = `https://x.com/${username}/status/${statusId}`;
      finalShortUrl = `https://x.com/i/status/${statusId}`;
    }
  }
  // 4. Flipkart
  else if (domain.includes('flipkart.com')) {
    platformBadge = 'Flipkart';
    const match = urlObj.pathname.match(/(.*\/p\/[a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      finalCleanUrl = `${urlObj.protocol}//${urlObj.hostname}${match[1]}`;
      finalShortUrl = finalCleanUrl;
    }
  }
  // 5. Reddit
  else if (domain.includes('reddit.com')) {
    platformBadge = 'Reddit';
    const commentMatch = urlObj.pathname.match(/\/r\/([^/]+)\/comments\/([a-zA-Z0-9]+)/i);
    if (commentMatch) {
      const sub = commentMatch[1];
      const postId = commentMatch[2];
      finalCleanUrl = `https://www.reddit.com/r/${sub}/comments/${postId}/`;
      finalShortUrl = `https://redd.it/${postId}`;
    }
  }

  // Generic fallback if not handled by specialized engine
  if (!finalCleanUrl) {
    const cleanUrlObj = new URL(urlObj.toString());
    cleanUrlObj.search = retainedParams.toString();
    if (cleanUrlObj.hash === '#') cleanUrlObj.hash = '';
    finalCleanUrl = cleanUrlObj.toString();

    const shortCandidate = new URL(cleanUrlObj.toString());
    shortCandidate.hostname = shortCandidate.hostname.replace(/^www\./, '');
    if (shortCandidate.pathname.endsWith('/index.html') || shortCandidate.pathname.endsWith('/index.php')) {
      shortCandidate.pathname = shortCandidate.pathname.replace(/\/index\.(html|php)$/, '/');
    }
    finalShortUrl = shortCandidate.toString();
  }

  const originalLength = trimmed.length;
  const cleanLength = finalCleanUrl.length;
  const savedCharacters = Math.max(0, originalLength - cleanLength);
  const savedPercent = originalLength > 0 ? Math.round((savedCharacters / originalLength) * 100) : 0;
  const displayTitle = pageTitle ? pageTitle.trim() : (urlObj.hostname || 'Link');
  const markdownLink = `[${displayTitle}](${finalCleanUrl})`;

  return {
    isValid: true,
    originalUrl: trimmed,
    cleanUrl: finalCleanUrl,
    shortUrl: finalShortUrl,
    markdownLink,
    removedParams,
    savedCharacters,
    savedPercent,
    domain,
    platformBadge
  };
}
