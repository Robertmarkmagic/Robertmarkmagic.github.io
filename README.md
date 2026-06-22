# Market Foundry

A dependency-free browser prototype for a business and stock-market simulation game.

## Run

Open `index.html` directly or host the files on GitHub Pages. No install, build
step, desktop wrapper, Electron, Tauri, or executable runtime is required.

## Web-only build rules

- The playable game is plain `index.html`, `styles.css`, `game.js`, and optional
  `supabase-config.js`.
- Rendering uses responsive HTML UI plus an HTML5 canvas for the live price chart.
- The game runtime uses a `requestAnimationFrame` loop for HUD/FPS updates.
- Keyboard controls: Arrow/WASD changes selected company or quantity, Enter
  advances one day, Space places the current trade, M toggles sound.
- Touch controls: swipe the chart left/right to change company; swipe up/down to
  advance time.
- Sound effects use Web Audio synthesis, so no audio files are required.

## Public deployment

The site is ready for GitHub Pages. Publish `index.html`, `styles.css`, `game.js`,
`.nojekyll`, `README.md`, `THIRD_PARTY_NOTICES.md`, `supabase-config.js`, and
`supabase-schema.sql` at the repository root.

## Email signup and cloud saves

GitHub Pages is static, so cloud accounts and saved games need a hosted database.
This prototype is wired for Supabase Auth and a Postgres `saved_games` table.

1. Create a free Supabase project.
2. Open the Supabase SQL editor and run everything in `supabase-schema.sql`.
3. In Supabase, copy the Project URL and public anon key from Project Settings > API.
4. Paste them into `supabase-config.js`:

```js
window.MARKET_FOUNDRY_SUPABASE = {
  url: "https://your-project.supabase.co",
  anonKey: "your-public-anon-key",
  siteUrl: "https://robertmarkmagic.github.io/",
  redirectTo: "https://robertmarkmagic.github.io/"
};
```

Use only the public anon key in the website. Never paste the service-role key into
GitHub Pages. Row-level security in `supabase-schema.sql` limits each player to
their own saved-game row.

### Supabase email link settings

If a sign-in email opens `http://localhost:3000`, Supabase is still using a local
development redirect. Fix it in Supabase Dashboard > Authentication > URL
Configuration:

- Site URL: `https://robertmarkmagic.github.io`
- Redirect URLs: add `https://robertmarkmagic.github.io/**`
- Optional exact redirect: add `https://robertmarkmagic.github.io/`

Old email links cannot be changed after they are sent. After updating Supabase,
request a new save-game email link from the live game.

## Current gameplay

- Trade five fictional companies using market orders.
- See simulated Level 2 bids and asks.
- Advance time and react to company news.
- Track cash, holdings, average cost, profit/loss, and net worth.
- Stock prices respond to fundamentals, volatility, growth, and events.
- Run Nova Devices by setting product price, production, marketing, and research budgets.
- Company decisions affect demand, inventory, profit, cash, growth, and share price.
- Use market orders or leave limit orders that execute when prices reach your target.
- Open short positions under a margin limit and cover them by buying shares.
- Receive quarterly dividends on long positions and owe them on short positions.
- Review open orders and account activity in the trading ledger.
- Finance Nova with bonds or new shares, repay debt, and conduct buybacks.
- Track voting ownership and retain majority control of the board.
- Bond interest reduces operating profit while share issuance dilutes fair value.
- Navigate evolving interest rates, inflation, GDP growth, confidence, and fuel costs.
- Economic conditions affect company demand, costs, profits, bond coupons, and valuations.
- Industries have different sensitivities to recessions and inflation shocks.
- Save and load campaigns locally in the browser.
- Create an email account and save/load the campaign from the cloud when Supabase is configured.
- Choose easy, normal, or hard difficulty when starting a new game.
- Complete a 240-day campaign with wealth, market-share, liquidity, and control objectives.
- Campaigns end through personal bankruptcy, corporate bankruptcy, or year-end scoring.
- Accumulate 10% strategic stakes in rival companies and pay rising control premiums.
- Gain subsidiary earnings and industry-specific synergies at 50% ownership.
- Divest stakes for liquidity, with loss of control below a majority position.
- Rival boards can adopt takeover defenses that make later purchases more expensive.
- Manage separate mainstream, budget, and premium product lines.
- Launch new products using company cash and tune each product independently.
- Compete against changing segment prices using price, quality, marketing, and availability.
- Track product-level sales, inventory, quality, costs, and competitor benchmarks.
- Follow a seven-step executive advisor for the main game systems.
- Advance the simulation by one day, one week, or one month at a time.
- Review quarterly income, margin, cash, debt, and earnings-surprise reports.
- Compare actual results with analyst estimates and trade the resulting price reactions.
- Buy call and put options with configurable strikes, expiries, and contract quantities.
- Close options early or hold them for automatic cash settlement at expiry.
- Option values respond to share price, volatility, interest rates, and time remaining.
- Compete with four visible AI funds using value, momentum, macro, and short-selling strategies.
- Follow institutional portfolios, performance, cash, positions, and large trades as their orders move prices.
- Watch company news cascade through supplier, logistics, innovation, energy-cost, and capital-rotation links.
- Track secondary stock moves and changes to confidence, growth, inflation, and interest-rate expectations in the market ripple monitor.
- Progress from cash trading into limit orders, margin shorts, options, and M&A through account-growth or experience milestones.
- Use a live LED ticker, portfolio-HQ hero, allocation ring, quick statistics, top movers, and clickable market heatmap.
- Navigate a blue corporate command center inspired by classic business simulators, with a tool rail, city atmosphere, framed data windows, and persistent bottom news/status console.
- Place market, limit, stop, and stop-limit orders with portfolio-percentage quick sizing and animated execution confirmations.
- Start from a clear launch screen with CSS-generated corporate-city artwork and a guided six-step tutorial.
- Meet a CSS-generated fictional executive advisor portrait used in the launch screen and tutorial.

## Foundation

The order-book design is inspired by Dave Cliff's Bristol Stock Exchange (BSE):
https://github.com/davecliff/BristolStockExchange

BSE is licensed under the MIT License. Its original source and license are preserved in
`work/BristolStockExchange` in the project workspace. This prototype is a new JavaScript
implementation of the core educational concepts rather than a direct port of `BSE.py`.
