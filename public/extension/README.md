# CleanLink & Instant Share ⚡

A zero-friction, privacy-first Google Chrome Extension (Manifest V3) that removes tracking tokens, referral clutter, and surveillance identifiers from any link before you share it.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-success)
![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-blue)
![Shortcut](https://img.shields.io/badge/Shortcut-Alt%2BShift%2BC-indigo)

---

## 🚀 Features

- **Global 1-Tap Shortcut (`Alt+Shift+C` / `Option+Shift+C`)**: Instantly strips tracking junk from your active tab URL and copies the clean link directly to your clipboard, accompanied by a subtle native badge indicator.
- **Sleek Raycast/Linear Dark Mode Popup**:
  - Live character savings counter (e.g., *"Saved 184 characters of tracking junk!"*).
  - Clean URL vs. Original URL comparison with strikethrough diff.
  - Granular breakdown of identified and removed surveillance parameters (`fbclid`, `utm_*`, `si`, `ref`, etc.).
- **3 Quick-Action Copy Buttons**:
  1. `Copy Clean URL` (`Enter`) — Pure sanitized destination link.
  2. `Copy Markdown Link` (`M`) — Formatted as `[Page Title](Clean URL)`.
  3. `Copy Short Link` (`S`) — Cleanest canonical form (e.g. `youtu.be/ID`, `amazon.com/dp/ASIN`, `redd.it/ID`).
- **Zero External Dependencies**: Pure native browser JavaScript and CSS. Runs offline without telemetry or network leaks.

---

## 🛠️ Supported Clean Rules & Parameter Blacklist

| Platform / Category | Stripped Parameters / Rules |
| :--- | :--- |
| **Google Analytics / Campaigns** | `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `utm_cid`, `utm_reader`, `utm_place`, `utm_userid` |
| **Meta / Facebook / Instagram** | `fbclid`, `igshid`, `fb_action_ids`, `fb_action_types`, `fb_source` |
| **Google Ads & Shopping** | `gclid`, `gclsrc`, `dclid`, `wbraid`, `gbraid`, `srsltid` |
| **YouTube** | Strips `si`, `feature`, `pp`, `embeds_referring_euri`. **Retains `v` (video ID) and `t` (timestamp)**. Generates `youtu.be` short links. |
| **Amazon** | Strips referral codes (`tag=`, `linkCode=`, `ref=`, `keywords=`, `qid=`, `sr=`, `sprefix=`, `dib=`). Normalizes directly to canonical `/dp/ASIN`. |
| **Twitter / X** | Strips `?s=`, `?t=`, `ref_src`, `ref_url`, `cxt`. Formats canonical `x.com/user/status/ID`. |
| **Flipkart** | Strips `pid`, `lid`, `marketplace`, `store`, `spotlightTag`, `otracker`, `fm`, `iid`. Retains base clean product path. |
| **Mailchimp / HubSpot** | `mc_cid`, `mc_eid`, `_hsenc`, `_hsmi`, `hsCtaTracking`, `ml_subscriber` |
| **AliExpress / Bilibili** | `spm`, `spm_id_from`, `scm` |
| **Reddit** | Strips `utm_source=share`, `utm_medium=web3x`, `rdt`. Normalizes to `redd.it/ID`. |
| **Microsoft / TikTok / LinkedIn**| `msclkid`, `ttclid`, `trackingId`, `refId`, `miniProfileUrn` |

---

## 📦 How to Install in Google Chrome (Developer Mode)

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
2. In the top right corner, toggle **Developer mode** to **ON**.
3. Click the **Load unpacked** button in the top left.
4. Select the `extension/` folder from this directory.
5. CleanLink is now active! Pin it to your Chrome toolbar for instant access.

---

## ⌨️ Customizing the Keyboard Shortcut

1. Navigate to:
   ```text
   chrome://extensions/shortcuts
   ```
2. Find **CleanLink & Instant Share**.
3. Under *"Clean current tab URL and copy to clipboard"*, click the pen icon and press your desired shortcut (default: `Alt+Shift+C` on Windows/Linux or `Option+Shift+C` on macOS).
4. (Optional) Set the dropdown to **Global** if you want the shortcut to work even when Chrome isn't the focused foreground window.

---

## 📂 Extension Files

```
extension/
├── manifest.json       # Chrome Manifest V3 configuration & permissions
├── popup.html          # Sleek Raycast-style dark popup interface
├── popup.js            # Tab listener, DOM controller & copy actions
├── background.js       # Service worker for Alt+Shift+C keyboard command
├── cleaner.js          # Shared zero-dependency URL sanitization engine
├── icons/
│   ├── icon.svg        # Scalable source vector icon
│   ├── icon16.png      # 16x16 toolbar icon
│   ├── icon48.png      # 48x48 extensions management icon
│   └── icon128.png     # 128x128 Chrome Web Store icon
└── README.md           # Documentation & installation guide
```

---

## 🔒 Privacy Guarantee

CleanLink runs **100% locally** on your machine. It makes zero network requests, stores zero cookies or browsing history, and contains no analytics or tracking scripts.
