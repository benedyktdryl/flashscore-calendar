# Chrome Web Store release (automated)

This repo can **build**, **zip**, and **upload + publish** the extension via [GitHub Actions](https://github.com/benedyktdryl/flashscore-calendar/actions) using the official [Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api).

Publishing still goes through **Google review**; the workflow only submits a new package and triggers publish — it does not bypass review.

---

## One-time: developer account and first listing

1. Pay the [Chrome Web Store developer registration](https://developer.chrome.com/docs/webstore/register) fee (one-time) with the Google account that will own the extension.
2. In the [Developer Dashboard](https://chrome.google.com/webstore/devconsole/), **New item** → upload the first build (or use the API once credentials exist).
3. Complete **Store listing** and **Privacy** (required before Google accepts submissions). See [Listing checklist](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).
4. Note the **extension ID** from the item URL:  
   `https://chrome.google.com/webstore/detail/<name>/<EXTENSION_ID>`
5. In **Publisher → Settings**, copy your **Publisher ID** (needed by `chrome-webstore-upload-cli` v4+).

---

## One-time: Google Cloud + OAuth for the Store API

Follow the official guide: [Using the Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api).

Summary:

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. Enable **Chrome Web Store API**.
3. **OAuth consent screen** (External is fine for personal use) → add your Google account as a test user if the app is in testing.
4. **Credentials** → **OAuth client ID** → type **Web application**.
5. Under **Authorized redirect URIs**, add:  
   `https://developers.google.com/oauthplayground`
6. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) → settings (gear) → **Use your own OAuth credentials** → paste Client ID and Secret.
7. In **Step 1**, enter scope:  
   `https://www.googleapis.com/auth/chromewebstore`
8. **Authorize APIs** → sign in with the **same Google account** that owns the Chrome Web Store items.
9. **Exchange authorization code for tokens** → copy the **Refresh token**.

Enable [2-Step Verification](https://support.google.com/accounts/answer/185839) on that Google account (required to publish).

More detail: [chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload-keys).

---

## GitHub repository secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description |
|--------|-------------|
| `CHROME_CLIENT_ID` | OAuth Web client ID from Google Cloud |
| `CHROME_CLIENT_SECRET` | OAuth client secret |
| `CHROME_REFRESH_TOKEN` | From OAuth Playground (chromewebstore scope) |
| `CHROME_EXTENSION_ID` | 32-character ID from the store URL |
| `CHROME_PUBLISHER_ID` | From Developer Dashboard → Publisher → Settings |

Optional:

| Secret | Description |
|--------|-------------|
| `WXT_GOOGLE_CLIENT_ID` | Same value as local `.env` if the **published** package should include Calendar OAuth in the manifest |

If `WXT_GOOGLE_CLIENT_ID` is omitted, CI builds the extension **without** `identity` / `oauth2` (Google URL + ICS modes only). You can still add it later and cut a new release.

---

## How to cut a release (syncs with your store account)

1. **Bump the version** in [`package.json`](../package.json) (and commit). WXT uses this for `manifest.json` and for the zip name `dist/flashscore-calendar-<version>-chrome.zip`. The Store **rejects** uploads if the manifest version is not higher than the last submitted version.
2. Tag and push:

   ```bash
   git checkout main
   git pull
   # edit package.json version, e.g. 0.2.0
   git add package.json && git commit -m "chore: release v0.2.0"
   git tag v0.2.0
   git push origin main && git push origin v0.2.0
   ```

3. Open **Actions** → workflow **Release (Chrome)** → confirm it is green.
4. The workflow will:
   - lint, typecheck, `bun run build`, `bun run zip`
   - attach the zip to a **GitHub Release** for that tag
   - call **Chrome Web Store** to upload the package and publish (submit for review)

Manual run without pushing a tag: **Actions → Release (Chrome) → Run workflow** — uncheck **publish_to_chrome** if you only want build + artifact.

---

## After the workflow runs

- In the [Developer Dashboard](https://chrome.google.com/webstore/devconsole/), the new version appears as **Pending review** (or similar) until Google finishes.
- You will receive email updates on the account tied to the publisher.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| `Invalid client` / OAuth errors | Redirect URI includes OAuth Playground; refresh token generated with **chromewebstore** scope and correct client. |
| `Version N must be greater than…` | Bump `version` in `package.json`, tag again. |
| Upload succeeds but item stuck | Complete **Privacy** + **Store listing** tabs for the item. |
| Wrong Google account | Refresh token must be from the account that **owns** the extension in the Web Store (can differ from Cloud project owner). |

---

## Related

- Workflow file: [`.github/workflows/release-chrome.yml`](../.github/workflows/release-chrome.yml)
- Local zip: `bun run zip` → `dist/*-chrome.zip`
