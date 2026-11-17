# Kolam M3: Android app mode

Material Design 3 for Kolam web apps, **only inside the Android app**. In a normal browser (desktop or phone) nothing changes and the app keeps its Kolam look.

- Demo (every component, light and dark): https://tgopinath.github.io/kolam-design-system/m3/?app=android
- Files: `kolam-m3.js` (detection, colour scheme, app bar, navigation bar, snackbar, back, ripple, haptics) and `kolam-m3.css` (`--md-sys-*` tokens, `md-` components, and a skin that restyles existing `k-` components).

## When it switches on
`kolam-m3.js` adds `k-android k-app` to `<html>` when any of these is true:
- `Capacitor.getPlatform() === 'android'` (the Capacitor shell from `android-wrappers/build-remote.sh`)
- the user agent is an Android WebView (`; wv)`)
- the page runs as an installed PWA (`display-mode: standalone` or `fullscreen`) on Android

`?app=android` forces it on and `?app=web` forces it off; the choice is kept in `sessionStorage` for that tab. `KolamM3.setMode('android' | 'web' | null)` does the same from code.

## Adopting it in an app
1. In `<head>`, before the app's own scripts (so the class is set before the first paint):
   ```html
   <html lang="en" data-m3-primary="#1f5a43"> <!-- the app's light-theme Kolam primary -->
   <script src="https://tgopinath.github.io/kolam-design-system/m3/kolam-m3.js"></script>
   <link rel="stylesheet" href="https://tgopinath.github.io/kolam-design-system/m3/kolam-m3.css"> <!-- after tokens.css, kolam.css and the app's CSS -->
   ```
   If the app copies Kolam locally, copy `m3/` next to it the same way.
2. Once, after the page's markup exists:
   ```js
   const m3 = KolamM3.init({
     primary: '#1f5a43',          // source colour for the whole M3 scheme (default: data-m3-primary, else Kolam Ocean Azure)
     title: 'Vanam',              // top app bar title; change per screen with m3.setTitle()
     destinations: [              // navigation bar, 3–5 items; Material Symbols Rounded icon names
       { id: 'home', label: 'Discover', icon: 'home', href: '#/' },
       { id: 'explore', label: 'Explore', icon: 'travel_explore', href: '#/explore' },
       { id: 'games', label: 'Games', icon: 'sports_esports', href: '#/game' },
     ],
     actions: [{ icon: 'search', label: 'Search', onClick: openSearch }], // up to 3 app bar icon buttons ({ text, lang } for a text action such as "த")
     hide: ['.site-header', '.site-footer', '.tabbar'], // website chrome to hide in the app
     back: 'auto',                // 'auto' | 'history' | false | function({ source, root })
     onBack: ({ source, root }) => closeMyOverlay(), // return true when you handled Back yourself
   });
   ```
   In a normal browser `init()` returns a stub whose methods do nothing, so the same code runs on the website.
3. In the app's router, per screen: `m3.setTitle('Tiger')`, and optionally `m3.setBack(true | false | '#/explore')` (a string is where Up goes when there is no in-app history) and `m3.setActive('explore')`. Without these the kit works it out from the URL: destinations match `location.hash` (exact, else longest prefix), and any URL that is not a destination shows the back arrow.
4. Rebuild the Android shell only if it lacks `@capacitor/app` (needed for the hardware Back button). Optional plugins it uses when present: `@capacitor/haptics`, Capacitor 8 `SystemBars` (or `@capacitor/status-bar`). Keep `"plugins": { "SystemBars": { "insetsHandling": "css" } }` in `capacitor.config.json` for edge-to-edge insets.

### All init options
| Option | Default | What it does |
|---|---|---|
| `primary` | `data-m3-primary` or `#0077b6` | Source colour; generates light, dark and high-contrast schemes |
| `title` | `document.title` | App bar title |
| `appBar` | `true` | Build the M3 top app bar |
| `appBarVariant` | `'small'` | `'small'`, `'center'`, `'medium'`, `'large'` (medium/large show a headline that collapses into the bar on scroll) |
| `actions` | `[]` | `{ icon, label, onClick, href, id, text, lang }`, max 3 |
| `destinations` | `[]` | `{ id, label, icon, href \| onSelect, badge }`, max 5; re-selecting scrolls to top |
| `navBar` | `destinations.length >= 2` | Build the M3 navigation bar |
| `active` | from the URL | Fixed active destination id |
| `home` | first destination's `href` | Where Up goes when the app was opened on a deep link |
| `back` | `'auto'` | Back-arrow and Up behaviour (see above) |
| `onBack` | none | Called before the default Back; return `true` to stop it |
| `isRoot` | URL match | `() => boolean`, whether the current screen is a top-level one |
| `hide` | `[]` | Selectors that get `k-web-only` (hidden in the app) |
| `ripple` | `true` | Material ripple on press |
| `haptics` | `true` | Light haptic tick on navigation and `KolamM3.haptic()` |
| `edgeToEdge` | `true` | Pads for system bars using `env()` and Capacitor's `--safe-area-inset-*` |
| `icons` | `'auto'` | Icon font subset: names from destinations, actions and `.md-icon` elements at init. Pass an array to add names, or `'all'` for the full font |
| `mount` | `document.body` | Where the bars are inserted |

### Back order (hardware Back and the arrow)
1. An open `<dialog>` closes (anything with `data-m3-back-closes` gets a `k-m3:close` event).
2. A cancelable `k-m3:back` event fires on `window`; `onBack()` runs. Either can stop the default.
3. Not a top-level screen: back a screen (in-app history), else go to `home`.
4. A top-level destination other than the first: go to the first one.
5. On the first destination: leave the app (`App.exitApp()`).

### API
`KolamM3.isAndroid`, `init(opts)`, `snackbar(text, { action, onAction, duration, closable })`, `haptic('light' | 'medium' | 'heavy' | 'selection')`, `onSwipe(el, { left, right, threshold, ignore })`, `back()`, `applyColors(hex)`, `scheme(hex)` (light / dark / lightHigh / darkHigh role maps), `checkContrast(roles)`, `contrastRatio(a, b)`, `loadIcons([names])`, `icon(name, filled)`, `setMode(mode)`.

## What you get without changing markup (the skin)
With `html.k-android` set, Kolam tokens (`--primary`, `--surface`, `--ink`, `--line`…) point at the generated M3 roles, so app CSS written against Kolam turns M3 too, and these Kolam components are restyled:
`k-btn` → filled / tonal / outlined / text buttons (40dp, full radius) · `k-iconbtn` → icon buttons · `k-input`, `k-select` → outlined text fields (56dp) · `k-check`, `k-switch` → M3 checkbox, radio and switch · `k-tabs` → segmented buttons · `k-card` → elevated card · `k-list` → M3 list · `k-badge`, `k-count` → labels and large badge · `k-alert` → tonal container · `k-bottomnav` → navigation bar · `k-progress` → 4dp linear indicator · `k-toast` → snackbar · `k-dialog` → basic dialog with text-button actions · `k-avatar`, `k-chat` · Kolam type classes → the M3 type scale.

Use `k-android-only` / `k-web-only` on anything that should exist only in one mode.

## Opt-in `md-` components
`md-top-app-bar`, `md-navigation-bar` / `md-nav-item` (built by JS), `md-button` (`--tonal --outlined --text --elevated --error`), `md-icon-button` (`--filled --tonal --outlined`, `aria-pressed`), `md-fab` (`--small --large --extended --secondary --tertiary --surface --fixed`), `md-chip` (`--assist --filter --input --elevated`, `md-chip-set --scroll`), `md-card` (`--filled --outlined`), `md-dialog` (native `<dialog>`), `md-snackbar` (JS), `md-text-field` (`--outlined --filled`, floating label with `placeholder=" "`), `md-search-bar`, `md-list` / `md-list-item`, `md-divider`, `input.md-switch`, `input.md-checkbox`, `input.md-radio`, `md-linear-progress` / `md-circular-progress` (`--md-progress: 0–1`, `--indeterminate`), `md-tabs` / `md-tab`, `md-segmented`, `md-badge` (`--large`), `md-icon`, and the type classes `md-display-large` … `md-label-small`. Markup for each is in `index.html`.

## Design decisions
- **Colour.** One source colour makes six tonal palettes (primary, secondary = same hue at low chroma, tertiary = hue + 60°, neutral, neutral variant, error). Tone is CIELAB L*, which is what HCT uses, so tone-based contrast is exact; hue and chroma use LCh instead of CAM16 (an approximation). Roles use the M3 baseline tones (on-container at tone 30 in light, per the current Material Theme Builder) plus high-contrast schemes for `data-theme="contrast"` and `prefers-contrast: more`. `node m3/tools/build.mjs [#hex …]` regenerates the CSS defaults and checks 21 role pairs per scheme against WCAG AA (4.5:1 text, 3:1 outlines).
- **Type.** Kolam's rule wins over Roboto: Lato + Noto Sans Tamil on the M3 type scale; M3's weight 500 maps to Lato 700. Letter-spacing is off for Tamil (it breaks conjuncts).
- **Icons.** Material Symbols Rounded from Google Fonts, loaded only in app mode and subset with `icon_names`, so the website never downloads it.
- **Motion, shape, elevation, state.** M3 tokens: standard and emphasized easing, 50–600 ms durations, corner scale 4–28dp, elevation levels 0–5, state layers 8% hover and 10% focus / pressed, 3dp secondary focus ring.

## Known limits
- Hue and chroma are an LCh approximation of HCT, so palettes differ slightly from the Material Theme Builder for the same seed (most visible on blues and purples).
- No predictive-back animation (Android WebView has no API for it); Back is handled through `@capacitor/app`.
- Not included yet: bottom sheets, menus, navigation drawer/rail, date and time pickers, sliders, tooltips, carousel, and M3 Expressive extras (shape morphing, spring motion, button groups, the 64dp flexible navigation bar). The baseline 80dp navigation bar is used.
- Icons added to the page after `init()` need `KolamM3.loadIcons(['name'])` (or `icons: 'all'`).
- `color-mix()` and `:has()` need Android System WebView 111+ (any updated Android 7+ phone).
- The skin covers Kolam components; an app's own custom CSS picks up M3 colours through the Kolam tokens but keeps its own shapes until restyled under `html.k-android`.

## Files
- `kolam-m3.js`, `kolam-m3.css`: the kit.
- `index.html`: the demo. `shots/`: Pixel-size screenshots (light and dark). `tools/build.mjs`: regenerate colour defaults + contrast check. `tools/shots.mjs`: capture the screenshots with headless Chrome (Android WebView user agent, so detection is tested without `?app=`).
