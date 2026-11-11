# ShopSense frontend

ShopSense is a React marketplace across electronics, fashion, home and living, beauty, grocery, sports, and accessories. This repository contains the working frontend and browser-local demonstration data. A separate developer will implement the backend.

**Project decision — The Shortlist / Good finds on the homepage is the recommendation section.** Its current curated products satisfy the recommendation UI requirement. Preserve its title, layout, three product sets, and motion when connecting recommendations. It is not currently personalized by an algorithm.

This documentation describes the source as of 11 November 2026. This documentation pass changes no frontend code or design.

## Start here

1. Read this README for the application map and requirement coverage.
2. Read [Backend integration](docs/BACKEND-INTEGRATION.md) for current data, proposed endpoints, integration points, and migration.
3. See [Asset sources](ASSET-SOURCES.md) before changing product imagery.
4. Review [Verification history](artifacts/VERIFICATION.md) for earlier checks and visual QA limitations.

## Run on another laptop

### 1. Install the prerequisites

Install [Node.js](https://nodejs.org/) **22 LTS** (includes npm) and [Git](https://git-scm.com/downloads). Windows, macOS and Linux can run this project. Open a new terminal after installing, then check:

```sh
node --version
npm --version
git --version
```

No Python, database, backend server, API key or `.env` file is needed to run the current frontend. Python is only used by the optional catalogue preparation utility.

### 2. Download and install

```sh
git clone https://github.com/tony19053000/demo.git
cd demo
npm ci
```

The repository root contains `package.json`; do not look for another `shopsense-marketplace` folder inside the clone. Alternatively, download the repository ZIP, extract it, open a terminal in the extracted folder containing `package.json`, and run `npm ci`. Internet access is required for the initial dependency install. Do not copy `node_modules` from another laptop.

### 3. Start the website

```sh
npm run dev -- --port 5173 --strictPort
```

Keep this terminal running and open **http://127.0.0.1:5173/#/** in your browser. Stop the server with **Ctrl+C**. If the site is already running on that port, reuse it. If another application owns the port, use `--port 5174` and open the corresponding URL instead.

For later updates to a Git clone:

```sh
git pull --ff-only
npm ci
npm run dev -- --port 5173 --strictPort
```

Commit or otherwise preserve your own local edits before pulling updates.

### Local troubleshooting

| Symptom | What to do |
| --- | --- |
| `npm` or `node` is not recognized | Install Node.js and reopen the terminal. |
| PowerShell blocks `npm.ps1` | Use Command Prompt, or run `npm.cmd` instead of `npm` in the commands above. |
| Cannot find `package.json` | Change into the cloned/extracted repository root. |
| Connection refused | Start the dev server and keep its terminal open; check its printed URL. |
| Port already in use | Reuse the existing ShopSense server or choose another port. |
| Old account or empty bag on another laptop | Demo data belongs to that browser and origin; it is not synchronized. Register a new demo account there. |

Use a demo password. Registration, saved addresses, wishlist, bag and order previews are browser-local. Switching from `127.0.0.1` to `localhost`, changing the port, or opening the deployed domain uses a different storage origin. There are no real payments or deliveries.

## Verify the production frontend locally

```sh
npm test
npm run build
npm exec -- vite preview --host 127.0.0.1 --port 4173 --strictPort
```

Open **http://127.0.0.1:4173/#/**. `npm run build` creates `dist/`, including the compiled application and public assets. Do not open `dist/index.html` directly from the filesystem. The preview server is for local checking, not production hosting.

## Deploy the frontend

The current application is a static frontend. Host it at the **root of an HTTPS domain**, such as `https://your-site.example/`. It requires no running Node server after building. Deployment does not add a backend or turn demo checkout into real payments.

### Option A: Git-connected hosting (Vercel or Netlify)

1. Sign in to your chosen hosting provider and import `tony19053000/demo` from GitHub.
2. Select `main` as the production branch and the repository root as the project directory.
3. Use the following build settings, reviewing any automatically detected values.
4. Deploy, then open the provider's HTTPS URL and perform the checks below.

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Root/base directory | Repository root (`.`); not `src` |
| Node.js version | 22.x |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output/publish directory | `dist` |
| Environment variables | None required for the current frontend |

With Git integration enabled, future pushes to the configured production branch can publish automatically. Review the provider's deployment settings before enabling this for an existing live site.

### Option B: Upload a static build

Run `npm ci`, `npm test`, and `npm run build` locally. Upload the **contents of `dist/`** to the static host's web root, preserving every asset folder and filename. The resulting web root must contain `index.html`, `assets/`, `products/`, and the other copied public assets. Enable HTTPS. Upload a new complete build after each source change; copying only the source files will not update a static deployment.

### Routing and asset paths

ShopSense uses `HashRouter`: product links look like `https://your-site.example/#/product/81`. Keep the `#` route format. These routes do not need a server-side SPA rewrite because the browser handles the fragment.

**Subdirectory hosting is not configured.** Product images and several brand/artwork URLs start with `/`. A GitHub Pages project URL such as `https://tony19053000.github.io/demo/` will need an asset-path audit and Vite base-path configuration before use; changing only the Vite base setting will not fix all current absolute URLs. Use root-domain hosting for an unchanged frontend.

There is currently no backend URL configuration or API client. When a backend is added, follow [Backend integration](docs/BACKEND-INTEGRATION.md). Never put private API keys or server secrets in frontend code or client-exposed environment variables.

### After deployment

- Open the homepage and confirm product images, logo, fonts and animations load.
- Open a product URL directly and refresh it; test search, category filters and wishlist.
- Register a demo account, add an address, and test bag/payment selection through the demo confirmation.
- Check mobile layouts and the system reduced-motion setting.
- Confirm the browser console and network panel show no failed asset requests.

The existing Site identity remains in `.openai/hosting.json`. Preserve it when using that existing hosting workflow. This guide does not deploy or replace that Site.

Deployment reference: [Vite static deployment guide](https://vite.dev/guide/static-deploy), including Vercel and Netlify instructions.

## Requirement checklist

These rows correspond to the original supplied requirements screenshot.

| Requirement | Location in the frontend | Current implementation / backend work |
| --- | --- | --- |
| Login and registration pages | /login, /register; AuthPage.jsx, demoAuth.js | Working browser demo, hashed demo passwords and password changes. Backend identity, sessions, recovery, and verification remain to be implemented. |
| Homepage with product listings | /; landing/LandingPage.jsx | Animated category journey, editorial links, product recommendations, coupon. Backend can supply catalogue and recommendation data. |
| Product details page | /product/:id; ProductDetail.jsx | Gallery, category-specific facts, size or quantity, delivery PIN format check, ratings, reviews, related products. Live availability, fulfilment and reviews require backend services. |
| Search bar and category filters | Header and /shop; main.jsx, shop.js | Local search, category/type/brand/size/price/rating/discount filters and sorting. Backend search and pagination remain. |
| Shopping cart | /bag and /checkout; main.jsx, CheckoutFlow.jsx | Quantity, sizes, wishlist move, coupon, totals, saved/new address selection, payment choices and local order previews. Real checkout requires server validation and payment integration. |
| Wishlist | /wishlist; main.jsx | Add/remove saved products and add to bag or choose size. Currently browser/device scoped. |
| Recommended For You section | Homepage **THE SHORTLIST / Good finds.**; landing/FindsReel.jsx | This is the agreed recommendation section. Twelve curated products in three sets. Backend recommendations should populate this existing component. |
| Similar Products section | Bottom of /product/:id; ProductDetail.jsx | Five same-category items ranked by product type, then subcategory. Section wording varies by category. Backend can supply related product IDs. |
| Chatbot interface | Floating Sense button; SenseChat.jsx, shop.js | Personal shopper and Help desk modes, local matching, guided replies and route links. No external AI, support ticket service or human agent connection. |

## Routes and navigation

| Route | Purpose / query parameters |
| --- | --- |
| / | Landing page, recommendations and coupon |
| /shop | q, category, type, sort are URL search parameters; other filters live in component state |
| /product/:id | Numeric catalogue ID |
| /wishlist | Device-saved favourites |
| /bag | Device cart and coupon |
| /checkout | Address → payment → demo order confirmation |
| /login, /register | Browser-local authentication |
| /account | Login required; section=profile, orders, addresses, payments, security |
| /help | Shopping FAQs and entry points into Sense |
| unmatched path | Friendly fallback |

An account section selected while logged out is carried through the login redirect. The header and footer link to shop, wishlist, bag, account, and help. Sense actions link into these same routes.

## File structure

~~~text
shopsense-marketplace/
  index.html                     HTML entry, favicon, early scroll reset
  package.json                   Scripts and dependencies
  package-lock.json              Locked dependency versions
  .openai/hosting.json            Existing Site identity and dist target
  public/
    products/                    Local catalogue images
    journey/                     Homepage artwork
    brand-mark.svg               Plain S used by header/footer/chat masks
    favicon.svg                  Plain rose S browser icon
  scripts/
    prepare-catalog.py           Catalogue/asset preparation utility
  src/
    main.jsx                     App context, routes, Header, Footer, ProductCard,
                                 Catalogue, Wishlist, Bag, Summary, Help and wrappers
    shop.js                      Search, sorting, money, totals, assistant rules
    ProductDetail.jsx            Category-aware detail page and similar items
    CheckoutFlow.jsx             Saved/new address, payment choices, demo order
    AccountCenter.jsx            Profile, orders, address book, preferences, password
    accountPreferences.js        Per-account local addresses and payment preference
    AuthPage.jsx                 Login/register forms and account return route
    demoAuth.js                   Browser auth persistence and password hashing
    AuthOrbit.jsx                Animated authentication-page product display
    authProductMotion.js         Product pose and timing calculation
    SenseChat.jsx                Shopper/help modes, conversations and action links
    useOverlay.js                Overlay focus, Escape and optional focus trap
    data/
      catalog.js                 Runtime products and categories
      product-details.js         Category-specific presentation and model facts
      source.json                Source catalogue input
    landing/
      LandingPage.jsx            Homepage assembly
      edits.js                   Hero/editorial product mappings and poses
      useLandingMotion.js        Motion loading and lifecycle
      motionEngine.js            GSAP/ScrollTrigger timelines and teardown
      FindsReel.jsx              Recommendation reel and continuous manual input
      findsReelData.js           Three recommendation sets and position helpers
      reelAutoplay.js            Pauses, transitions, automatic return, cleanup
      WelcomeCoupon.jsx         Copy code, feedback and tear state
      landing.css               Homepage styles
    styles.css                   Shared styles and older page rules
    shop-interior.css            Catalogue, details, wishlist and specification styling
    shop-motion.css              Scoped interior motion
    auth.css, account.css        Authentication and account layouts
    checkout.css                 Checkout layout
    sense-chat.css               Current assistant panel
    *.test.js                    Node test files; see test coverage below
  docs/
    BACKEND-INTEGRATION.md        Data contracts and backend handoff
  artifacts/                     QA notes, historical screenshots and previews
  dist/                          Generated production build
~~~

SenseMascot.jsx, SenseLauncher.jsx, petBehavior.js and assistant-mascot.css are retained experimental mascot files. They are not the current assistant entry point. Do not reconnect them as part of backend integration.

The source is only partially modularized. Several page components intentionally still live in main.jsx. This map describes the actual files; it does not imply a refactor has occurred.

## How the frontend connects

~~~mermaid
flowchart TD
  Entry[index.html] --> App[main.jsx / App / HashRouter]
  App --> Context[Shopping Context]
  Context --> State[Wishlist, bag, profile, orders, toast, assistant state]
  App --> Home[LandingPage]
  Home --> Reel[FindsReel / recommendation section]
  App --> Catalogue[Catalogue and ProductCard]
  App --> Detail[ProductDetail]
  App --> Checkout[CheckoutFlow]
  App --> Account[AccountCenter]
  App --> Chat[SenseChat]
  Data[catalog.js] --> Catalogue
  Data --> Detail
  Data --> Reel
  Data --> Chat
  Rules[shop.js] --> Catalogue
  Rules --> Checkout
  Rules --> Chat
  Auth[demoAuth.js] --> Context
  Preferences[accountPreferences.js] --> Account
  Preferences --> Checkout
~~~

App owns the shopping state. ProductCard consumes that context, so hearts update the shared wishlist. Product details add a product ID, size and quantity to the shared bag. The bag joins IDs to catalogue records, and Summary renders totals from shop.js. Checkout reads the signed-in account's preferences, saves an order preview into App state and clears the bag.

AccountCenter uses demoAuth for password changes and App's setProfile for name edits and sign-out. Its address and payment settings are saved through accountPreferences. Sense uses catalogue search and rule-based help responses. Its two message threads and drafts exist only while the panel is open.

## Design and motion

The design uses warm cream, peach, charcoal and muted rose. Shared variables include --sense-rose, --sense-ink and --sense-paper in styles.css. Interior styles also have scoped accent variables. The brand-mark and favicon serve different display contexts.

Homepage motion belongs to landing/. The recommendation reel keeps manual dragging continuous while autoplay holds a view, transitions, then returns to the beginning. Interior entrances are scoped by .shopping-pages. AuthOrbit has its own timed product composition. Reduced-motion preferences suppress or simplify animations.

Backend work should preserve current routes, copy, layouts, category-specific details, logo, and animations. Asynchronous data should maintain layout dimensions, prevent stale responses from replacing newer searches, and refresh animation measurements when required.

## Verification and known limits

npm test currently runs 17 tests across shop.test.js, startup.test.js, landing/findsReel.test.js and demoAuth.test.js. They cover catalogue/search/pricing/assistant behavior, startup scrolling, recommendation data/handlers and browser authentication including password changes. petBehavior.test.js is outside the current npm test command.

The tests are not a complete browser end-to-end suite. Recent desktop/mobile screenshots and live animation checks were blocked by disabled local browser access. Historical artifacts are evidence of the versions they captured, not guarantees about the latest layout.

The app currently has no backend, real payments, inventory reservation, shipping, order tracking, refunds, recovery emails or live customer support. The account and checkout demonstrations explain their limitations in the UI.
