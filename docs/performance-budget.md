# Performance: measurements and budgets

Budgets (from the brief): p75 **LCP < 2500 ms**, **CLS < 0.1**, **INP < 200 ms**
on representative mobile conditions.

Method: `frontend/scripts/perf-budget.mjs`, Pixel 7 emulation, 4x CPU
throttling, ~1.6 Mbps / 150 ms RTT, 3 runs per page, p75 reported.
Run it yourself with `npm run perf:budget -- <base-url>`.

## Results

| Page | LCP before | LCP after | CLS before | CLS after | INP before | INP after |
|---|---|---|---|---|---|---|
| `/` | 5240 | 5560 | 0 | 0.001 | 166 | **21** |
| `/seeker/search?suburb=Kellyville` | 10108 | **5760** | **1.256** | **0.001** | 92 | 91 |
| `/listing/{id}` | 4248 | 6636 | 0 | 0.001 | 37 | 32 |
| `/pricing` | 5800 | 5824 | 0 | 0 | 49 | 25 |

## What these numbers do and do not show

**Not a like-for-like comparison for LCP.** "Before" was measured against the
live deployment on Vercel (CDN, edge cache, image optimisation, warm). "After"
was measured against a local `next start` on a development laptop with no CDN
and other work running. LCP is dominated by network and hosting, so the LCP
column is **not evidence of a regression or an improvement** either way. The
honest read: LCP must be re-measured on a Vercel preview of this branch before
any claim is made.

**CLS and INP are comparable**, because layout stability and main-thread
responsiveness are properties of the page, not the CDN:

- **Search CLS 1.256 to 0.001.** This is the single biggest user-visible fix
  in the batch. The old page rendered an empty shell, then injected results,
  then mounted the map, shifting content twice. Results are now
  server-rendered and the map is a fixed-size panel mounted after paint.
- **Homepage INP 166 ms to 21 ms.** hCaptcha is no longer mounted on pages
  that do not use it, the support widget is lazy, and fonts are self-hosted,
  so the main thread is free earlier.

**No page currently meets the 2500 ms LCP budget under 4x CPU throttling.**
That is a genuine open item, not something this batch closed. The likely
levers, in order: the listing page's hero image (needs `priority` + correct
`sizes` verification against real Supabase images), the homepage mood-field
SVG, and the framer-motion bundle on marketing pages.

## Standing budget

`npm run perf:budget` exits non-zero when `PERF_STRICT=1` is set and any page
misses a budget. It is **not** enforced in CI yet, because the CI runner's
numbers would differ again from both environments above. Enable it against a
stable Vercel preview URL once the domain is live.
