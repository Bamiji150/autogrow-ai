# AutoGrow Affiliate Business MVP

A free, mobile-friendly Progressive Web App (PWA) for tracking affiliate offers, confirmed commissions, costs, profit, reinvestment allowance, and safe scale/stop decisions.

## What works now
- Add/remove affiliate offers with your own approved affiliate URLs.
- Record confirmed commissions and business costs in Nigerian naira.
- Calculates revenue, costs, net profit, and a suggested reinvestment allowance.
- User-configured daily cap, reinvestment percentage (maximum 50%), minimum profit threshold, and cumulative-loss stop threshold.
- Kill switch immediately disables tracking decisions.
- JSON backup export/import.
- Installable PWA; offline shell and local browser storage.

## Important limitations
This is an MVP, not an autonomous source of income. It does **not** automatically discover profitable offers, publish content, verify sales, withdraw money, run ads, or spend/reinvest funds. Affiliate networks typically require account approval and have their own rules. A human must create accounts, choose compliant products, publish useful content, and record verified earnings. Never fake clicks, purchases, or commission entries.

The current version stores data in the browser's local storage. It is not synced across devices and can be lost if browser data is cleared. Export backups regularly. For multi-device or background automation, add a backend, authentication, database, scheduled jobs, and a secure affiliate network/API integration later.

## Run locally
The service worker requires localhost or HTTPS. If you have Python installed:
1. Extract this ZIP.
2. Open a terminal in the extracted `autogrow_ai_mvp` folder.
3. Run `python -m http.server 8080`
4. Open `http://localhost:8080` in your browser.

Or upload the folder to a free static host that supports HTTPS (for example, GitHub Pages or Cloudflare Pages; check current free-plan limits).

## Install on Android
1. Publish to an HTTPS static host.
2. Open the deployed URL in Chrome on Android.
3. Tap the browser menu (⋮), then **Install app** or **Add to Home screen**.
4. It will launch like an app. This PWA approach avoids Play Store fees; it is not a native APK.

## Suggested safe first setup
- Daily spend cap: ₦0 while validating the idea.
- Reinvestment: 20% of positive net profit.
- Loss limit: choose a threshold you can tolerate; with a zero threshold, a negative net profit immediately triggers the loss-limit decision.
- Minimum profit to scale: e.g. ₦1,000, adjusted to your situation.
- Start with organic traffic and no paid advertising.
- Keep the kill switch active until you understand the figures.
- Only count cleared/confirmed commission as revenue; record fees and other costs.

## Next production steps
1. Choose an affiliate program available to your country and check its payout, traffic, disclosure, and prohibited-promotion rules.
2. Add a privacy notice and affiliate disclosure to any public site.
3. Use server-side authentication and a database before storing sensitive business data.
4. Integrate official reporting APIs/webhooks only where the network permits them.
5. Run scheduled jobs with a hard spending cap, idempotency, audit logs, alerts, and a manual kill switch. Never store affiliate passwords or API secrets in frontend JavaScript.
