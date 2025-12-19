Cloudflare Worker: Telegram proxy

Purpose

- Forward POST requests from your static site to Telegram Bot API without exposing the bot token in client code.
- Add CORS headers so browser can call the worker from GitHub Pages.

How it works

1. Client posts FormData (fields: `chat_id`, `caption`, `photo`) to the worker URL.
2. Worker reads form, forwards `photo` and `caption` to `https://api.telegram.org/bot<token>/sendPhoto`.
3. Worker returns Telegram's JSON response and includes CORS headers.

Deployment (recommended via Wrangler)

1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Create a worker project or use this file. Example `wrangler.toml`:

```
name = "telegram-proxy"
main = "./worker.js"
compatibility_date = "2025-12-15"

[env.production]

```

4. Set bot token as a secret (do NOT put token in client code):

```bash
wrangler secret put BOT_TOKEN
# paste your bot token when prompted
```

5. Publish:

```bash
wrangler publish
```

6. After publish you'll get a worker URL like `https://telegram-proxy.<your-subdomain>.workers.dev`.

Usage on the site

- In `gallery.html` set `TG_PROXY_URL` to the worker URL and `TG_CHAT_ID` to your chat id (admin).
- The client will POST `photo` (file blob), `chat_id`, and `caption` to the worker.

Security notes

- Keep `BOT_TOKEN` only in worker secret.
- `chat_id` is less sensitive but keep it private if possible.
- The worker currently allows any origin (`*`) in CORS; restrict it after testing by checking `request.headers.get('Origin')`.

Alternative fast test (not recommended):

- Use a temporary CORS proxy, but this risks exposing your bot token.

If you want, I can generate `wrangler.toml` in this repo and adjust instructions for a specific account.
