# Lumi Lockets ♥

A static, animated necklace storefront with **2,741 products** (including the **1,540-piece Fine Gold line**) and a **virtual try-on**, built with **Next.js 16 (App Router) + React 19** and plain CSS (global tokens + CSS Modules). It is the sister store of [Lumi Lobes](https://github.com/jaisudhakar/lumi-lobes) (earrings) and shares its platform. No UI or animation libraries: every effect is CSS keyframes/transitions plus a little Web Animations API.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out (also writes out/.htaccess)
npm start        # serve ./out locally
```

`predev`/`prebuild` copy the MediaPipe WebAssembly runtime from `node_modules` into `public/mediapipe/` (git-ignored) for the try-on. The build pre-renders ~2,700 product pages and 2,700 artwork files.

The store name and tagline live in `lib/brand.ts`; the developer section in `lib/author.ts`.

## Deploying to GoDaddy (cPanel) or any Apache host

**Sub-folder** (e.g. `https://onemandeveloper.com/sites/necklace/`): build with `BASE_PATH=/sites/necklace npm run build` and upload the contents of `out/` into `public_html/sites/necklace`. The **Build static site** GitHub Action (`.github/workflows/build.yml`, run from the Actions tab) does this build and attaches `out` as a downloadable artifact.

**Root of a domain**: `npm run build` and upload into `public_html`.

`out/.htaccess` forces HTTPS (the camera try-on requires it), sets the 404 page, serves `.wasm` correctly, and adds compression and caching. Make sure the domain has SSL first (cPanel → SSL/TLS Status). `netlify.toml` is included for Netlify too.

## Look and feel

A heritage jeweller's look: temple maroon, antique gold and ivory, Cormorant Garamond headings, gold temple-arch borders (`.temple-band`) and lotus ornaments (`components/Ornament.tsx`) under section titles. A top strip (`components/GoldRateBar.tsx`) shows the live gold rate per gram (24K/22K/18K) from the free public feed at `api.gold-api.com`, fetched in the visitor's browser; if the feed can't be reached it shows only the store's promises. The home page adds **shop by occasion** (bridal, festive, daily wear, office wear, gifting; also a shop filter, `?occasion=`) in temple-arch frames, and **signature collections** (Devi, Rajkumari, Mangalyam, Nitya, Mayil, Kamalam) defined in `lib/heritage.ts`. Colours are design tokens at the top of `app/globals.css`.

## Pages

| Route | What's there |
| --- | --- |
| `/` | Hero with a necklace lowered onto a display bust (drag to swing, live metal swap, auto-cycling designs), featured cards, marquee, Fine Gold Edit (velvet showcase of the 10 gold styles), gold lookbook on the model (each look opens in the try-on, layered looks included), shop by style, new arrivals carousel, try-on promo on the model, bestsellers by mood, stats, reviews, gift guide, perks, FAQ, newsletter, "Built by" section |
| `/shop/` | 2,741 necklaces: search, a Fine Gold chip plus 21 style chips, colour swatches, motif / mood / price filters, 5 sorts, infinite scroll, URL-synced filters |
| `/product/[slug]/` | Swing viewer on a bust (drag, arrow keys, zoom, fullscreen), metal finish redrawn in gold / silver / rose, quantity, "Try on", related designs |
| `/try-on/` | Virtual try-on: live camera, uploaded photo or the sample model photo; necklace placed at the neckline, swaying with movement; **layer up to three necklaces**; shelves (Trending, Fine Gold, Bridal & Temple, Gold Chains, Everyday Charms); Surprise me; auto-playing lookbook; size + metal controls; snapshot; add the whole look to cart |
| `/collections/` | Temple & bridal gold, gold chains, mangalsutra & malas, lockets, pearl strands, coin & temple, layered, evil eye, chokers, tennis & collars, long chains |
| `/cart/` | Line items, gift box toggle, animated totals, empty state (persists in `localStorage`) |

## Catalog

`lib/catalog.ts` generates the catalog with fixed seeds (server and browser agree exactly), plus one photographed piece, from the taxonomy in `lib/design.ts`.

**Everyday charms (1,200 designs)**

- **11 styles:** pendants, chokers, lockets, lariats, layered, collars, pearl strands, tennis, station, long/opera chains, coin & temple
- **18 motifs:** heart, star, moon, sun, blossom, butterfly, bow, pearl, teardrop, leaf, cluster, halo, hexagon, clover, key, evil eye, infinity, seashell
- **12 colourways** × **3 metals**

**Fine Gold (1,540 designs): every gold style × gold motif × stone**

- **10 gold styles** trending now: rope chain, Cuban link, paperclip, herringbone, figaro (solid 18K); temple necklace, mangalsutra, haram, bridal choker, bead mala (hallmarked 22K)
- **14 motifs:** lotus, peacock, mango (paisley), kasu coin, solitaire, bar, heart, moon, evil eye, infinity, clover, halo, teardrop, blossom
- **11 stones:** polished gold, diamond, ruby, emerald, sapphire, pearl, kundan, onyx, firoza, meenakari, coral

`lib/necklaceArt.ts` draws every design as original SVG: each necklace hangs from the two sides of the neck as a bezier chain, and each style builds on that curve (pearls strung by arc length, stones set along it, temple coins fringing it, three layered chains, a velvet choker ribbon, a Y-drop lariat). Fine Gold chains are drawn link by link (rope twists, Cuban links, paperclips, herringbone chevrons, figaro runs, black-bead strands, mango links, gold beads) with a polished-metal gradient and a specular bevel, and shown on a jeweller's velvet neck form. Cards are pre-rendered to `/art/<slug>.svg` by `app/art/[file]/route.ts`.

## Virtual try-on

`lib/tryon.ts` loads Google's **MediaPipe Pose Landmarker** (shoulders) and **Face Landmarker** (chin, jaw); the models are fetched at runtime from Google's hosted bucket. The base of the neck is estimated from them: the neck is about a third of the shoulder width and sits a little over halfway from the chin to the shoulder line, with a face-only fallback for close-up selfies. The necklace's two chain ends are placed at the sides of the neck, tilted with the shoulders, with a damped pendulum so the pendant sways as you move. Everything runs in the browser; no image leaves the device.

The default **sample model** photo (`public/try-on/model.jpg`) is used with the model's permission; its neckline was measured once with the models (`lib/sampleModels.ts`) so it shows instantly. To use another photo, replace the file, update `w`/`h` and delete `neck`, and the try-on will detect it itself.

## Animation effects

- **Intro curtain** (first page of a visit): a chain draws itself, a pendant drops, the curtain lifts
- **Letter-by-letter headline** with a rose shimmer wave
- **Necklace lowered onto the bust**, swaying gently, drag to swing on a damped pendulum, live metal swap
- **Glitter trail** following the cursor
- **Magnetic buttons** that lean toward the cursor
- **3D tilt + moving glare** on product and collection cards
- **Scroll progress bar** and **scroll parallax** on the floating orbs
- Fly-to-cart with sparkle burst, wishlist heart pop, rolling quantity numbers, counting totals, scroll reveals, marquees, collection photo fans

All motion respects `prefers-reduced-motion`.

## Placeholder content

The review quotes, ratings and review counts are demo content, the newsletter has no backend, and checkout takes no payments. Connect a payment provider and email service before launch.
