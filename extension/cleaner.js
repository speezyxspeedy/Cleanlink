/**
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

  // Common tracking and analytics parameter blacklist with category descriptions
  const PARAM_DESCRIPTIONS = {
    // UTM parameters (Google Analytics, newsletters, etc.)
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

    // Social Network Click IDs & Fingerprints
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

    // Affiliate & Referral Noise
    ref: 'Referral source parameter',
    ref_: 'Internal referral tracker',
    _ref: 'Referral origin tag',
    ref_src: 'X / Twitter embed referral source',
    ref_url: 'Referral URL history',
    source_ref: 'Source tracking identifier',
    referrer: 'HTTP referrer token',

    // Email Marketing
    mc_cid: 'Mailchimp Campaign ID',
    mc_eid: 'Mailchimp Email Subscriber ID',
    _hsenc: 'HubSpot email security tracking',
    _hsmi: 'HubSpot email marketing index',
    hsCtaTracking: 'HubSpot Call-To-Action tracking',
    vero_id: 'Vero marketing user identifier',
    vero_conv: 'Vero conversion tag',
    ml_subscriber: 'MailerLite subscriber ID',
    ml_subscriber_hash: 'MailerLite tracking hash',

    // E-commerce & Retail tracking
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

    // Twitter / X / Social context
    cxt: 'Twitter context identifier',
    rdt: 'Reddit redirect tracker'
  };

  // Exact-match blacklist set
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

  // Prefix blacklist patterns
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

  function isTrackingParam(key, domain) {
    const lowerKey = key.toLowerCase();

    // Special cases based on domain
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      if (lowerKey === 'v' || lowerKey === 't' || lowerKey === 'list' || lowerKey === 'index') {
        return false;
      }
      if (['si', 'feature', 'pp', 'embeds_referring_euri', 'ab_channel', 'sub_confirmation', 'app'].includes(lowerKey)) {
        return true;
      }
    }

    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      // In Twitter links, s and t query params are tracking share tokens
      if (lowerKey === 's' || lowerKey === 't' || lowerKey === 'cxt' || lowerKey === 'ref_src' || lowerKey === 'ref_url') {
        return true;
      }
    }

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

  /**
   * Amazon-specific cleaner: extracts ASIN and simplifies path
   */
  function cleanAmazonUrl(parsedUrl) {
    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname;
    
    // Look for 10-char alphanumeric ASIN in path: /dp/B08N5WRWNW, /gp/product/B08N5WRWNW, etc.
    const asinMatch = pathname.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|(?:\/.*)?\/dp\/)([A-Z0-9]{10})(?:[/?]|$)/i);
    
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1].toUpperCase();
      const cleanUrl = `${parsedUrl.protocol}//${hostname}/dp/${asin}`;
      const shortUrl = `${parsedUrl.protocol}//${hostname.replace(/^www\./, '')}/dp/${asin}`;
      return {
        isSpecialized: true,
        cleanUrl,
        shortUrl,
        asin
      };
    }
    return null;
  }

  /**
   * YouTube-specific cleaner: retains v & t params, creates youtu.be short link
   */
  function cleanYouTubeUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname === 'youtu.be') {
      let videoId = null;
      let timestamp = null;

      if (hostname === 'youtu.be') {
        videoId = parsedUrl.pathname.replace(/^\//, '').split('/')[0];
        timestamp = parsedUrl.searchParams.get('t');
      } else if (parsedUrl.pathname.includes('/watch')) {
        videoId = parsedUrl.searchParams.get('v');
        timestamp = parsedUrl.searchParams.get('t') || parsedUrl.searchParams.get('time_continue');
      } else if (parsedUrl.pathname.includes('/shorts/')) {
        const parts = parsedUrl.pathname.split('/shorts/');
        if (parts[1]) {
          videoId = parts[1].split('/')[0];
        }
      }

      if (videoId) {
        let cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
        let shortUrl = `https://youtu.be/${videoId}`;

        if (timestamp) {
          cleanUrl += `&t=${encodeURIComponent(timestamp)}`;
          shortUrl += `?t=${encodeURIComponent(timestamp)}`;
        }

        return {
          isSpecialized: true,
          cleanUrl,
          shortUrl,
          videoId
        };
      }
    }
    return null;
  }

  /**
   * Twitter / X cleaner
   */
  function cleanTwitterUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      // Retain canonical pathname, clear all tracking query parameters
      const statusMatch = parsedUrl.pathname.match(/\/([^/]+)\/status\/(\d+)/i);
      if (statusMatch) {
        const username = statusMatch[1];
        const statusId = statusMatch[2];
        const cleanUrl = `https://x.com/${username}/status/${statusId}`;
        const shortUrl = `https://x.com/i/status/${statusId}`;
        return {
          isSpecialized: true,
          cleanUrl,
          shortUrl
        };
      }
    }
    return null;
  }

  /**
   * Flipkart cleaner
   */
  function cleanFlipkartUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname.includes('flipkart.com')) {
      const match = parsedUrl.pathname.match(/(.*\/p\/[a-zA-Z0-9]+)/i);
      if (match && match[1]) {
        const cleanUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${match[1]}`;
        return {
          isSpecialized: true,
          cleanUrl,
          shortUrl: cleanUrl
        };
      }
    }
    return null;
  }

  /**
   * Reddit cleaner
   */
  function cleanRedditUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname.includes('reddit.com')) {
      const commentMatch = parsedUrl.pathname.match(/\/r\/([^/]+)\/comments\/([a-zA-Z0-9]+)/i);
      if (commentMatch) {
        const sub = commentMatch[1];
        const postId = commentMatch[2];
        // Strip trailing slug or comments clutter
        const cleanUrl = `https://www.reddit.com/r/${sub}/comments/${postId}/`;
        const shortUrl = `https://redd.it/${postId}`;
        return {
          isSpecialized: true,
          cleanUrl,
          shortUrl
        };
      }
    }
    return null;
  }

  /**
   * Main Cleaning function
   * @param {string} rawUrl - The input URL to clean
   * @param {string} [pageTitle] - Optional page title for markdown links
   * @returns {Object} Clean result with details
   */
  function cleanUrl(rawUrl, pageTitle = '') {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return {
        isValid: false,
        error: 'Invalid or empty URL provided',
        originalUrl: rawUrl || '',
        cleanUrl: '',
        shortUrl: '',
        markdownLink: '',
        removedParams: [],
        savedCharacters: 0,
        savedPercent: 0
      };
    }

    const trimmed = rawUrl.trim();
    let urlObj;
    try {
      urlObj = new URL(trimmed);
    } catch {
      // Try adding https:// if missing
      try {
        urlObj = new URL('https://' + trimmed);
      } catch (e) {
        return {
          isValid: false,
          error: 'Could not parse URL',
          originalUrl: trimmed,
          cleanUrl: trimmed,
          shortUrl: trimmed,
          markdownLink: `[${pageTitle || trimmed}](${trimmed})`,
          removedParams: [],
          savedCharacters: 0,
          savedPercent: 0
        };
      }
    }

    const domain = urlObj.hostname.toLowerCase();
    const removedParams = [];

    // Collect all query params and check for tracking
    const searchParams = new URLSearchParams(urlObj.search);
    const retainedParams = new URLSearchParams();

    for (const [key, value] of searchParams.entries()) {
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

    // Check domain-specific specialized clean rules first
    let specialized = null;
    if (domain.includes('amazon.')) {
      specialized = cleanAmazonUrl(urlObj);
    } else if (domain.includes('youtube.com') || domain === 'youtu.be') {
      specialized = cleanYouTubeUrl(urlObj);
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      specialized = cleanTwitterUrl(urlObj);
    } else if (domain.includes('flipkart.com')) {
      specialized = cleanFlipkartUrl(urlObj);
    } else if (domain.includes('reddit.com')) {
      specialized = cleanRedditUrl(urlObj);
    }

    let finalCleanUrl = '';
    let finalShortUrl = '';

    if (specialized) {
      finalCleanUrl = specialized.cleanUrl;
      finalShortUrl = specialized.shortUrl || specialized.cleanUrl;
    } else {
      // Generic clean: strip blacklisted params
      const cleanUrlObj = new URL(urlObj.toString());
      cleanUrlObj.search = retainedParams.toString();
      
      // Clean unnecessary trailing hash if it's empty
      if (cleanUrlObj.hash === '#') {
        cleanUrlObj.hash = '';
      }

      finalCleanUrl = cleanUrlObj.toString();
      
      // Generate a short link candidate (removes www, trailing slashes, redundant index.html)
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

    // Title formatting for Markdown
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
      domain
    };
  }

  return {
    cleanUrl,
    isTrackingParam,
    PARAM_DESCRIPTIONS
  };
});
