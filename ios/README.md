# Kolam iOS app mode

Apple Human Interface Guidelines (iOS 26, Liquid Glass) for Kolam web apps, **only inside the iOS app**.
In Safari, Chrome or any other browser the app keeps its Kolam look. Reference: [HIG Components](https://developer.apple.com/design/human-interface-guidelines/components).

- Demo: https://tgopinath.github.io/kolam-design-system/ios/ (add `?app=ios` to preview the iOS look in a browser, `?app=web` to go back)
- CSS: https://tgopinath.github.io/kolam-design-system/ios/kolam-ios.css
- JS: https://tgopinath.github.io/kolam-design-system/ios/kolam-ios.js
- Shell template: `ios/shell-template/new-shell.sh`

## When the iOS look turns on

`kolam-ios.js` adds `k-ios` to `<html>` when any of these is true, and never otherwise:

1. `?app=ios` in the URL (kept for the tab in `sessionStorage["kolam.app"]`; `?app=web` or `?app=android` turns it off).
2. `window.KolamShell.platform === 'ios'` (the shell template injects it before the page loads).
3. The user agent has `Kolam-iOS`, a `<Name>-iOS/1.0` token, a token from `init({ uaTokens })` or `<html data-ios-ua="ZoorassicPark-iOS">`.
4. An iOS WKWebView with `window.webkit.messageHandlers` and no `Safari/` token (Safari, Chrome, Firefox and Edge for iOS all have it).
5. An iOS Home Screen web app (`navigator.standalone` / `display-mode: standalone`).

Everything in `kolam-ios.css` is scoped to `html.k-ios`, so the stylesheet is inert in a normal browser.
`.ios-only` and `.web-only` show or hide markup for one look.

## Adopting it in an app

1. Viewport must cover the safe areas:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
   ```
2. Load after Kolam, with the script in `<head>` so `<html>` is tagged before first paint:
   ```html
   <link rel="stylesheet" href="https://tgopinath.github.io/kolam-design-system/tokens.css">
   <link rel="stylesheet" href="https://tgopinath.github.io/kolam-design-system/kolam.css">
   <link rel="stylesheet" href="https://tgopinath.github.io/kolam-design-system/ios/kolam-ios.css">
   <script src="https://tgopinath.github.io/kolam-design-system/ios/kolam-ios.js"></script>
   ```
3. After the DOM is ready:
   ```js
   const ios = KolamIOS.init({
     appName: 'Vanam',
     uaTokens: ['ZoorassicPark-iOS'],        // an older shell's own token, if it has no KolamShell
     style: 'glass',                          // or 'classic' (iOS 18-style bars, "‹ Back")
     tint: { light: '#1F5A43', dark: '#7CC6A3' }, // optional; default = the app's Kolam --primary family
     navBar: { title: 'Discover', large: true, actions: [{ icon: 'magnifyingglass', label: 'Search', onClick: openSearch }] },
     tabs: [                                  // 5 at most (HIG); role 'search' = trailing search tab
       { id: 'home', label: 'Discover', icon: 'house', href: '#/' },
       { id: 'map', label: 'Map', icon: 'map', href: '#/map' },
       { id: 'saved', label: 'Saved', icon: 'heart', href: '#/saved', badge: 3 },
       { id: 'search', label: 'Search', icon: 'magnifyingglass', href: '#/search', role: 'search' }
     ],
     currentTab: 'home',
     onTabSelect: id => {},                   // return false to cancel the link
     toolbar: null,                           // [{ icon, label, onClick }, { spacer: true }, …]
     content: '#app',                         // element that slides on swipe back (Home Screen apps)
     swipeBack: true,                         // or a handler; the shell's native gesture wins inside the app
     haptics: true, dynamicType: true, enhance: true
   });
   if (ios) {
     // iOS look is on: hide the web header, update the bar per route
     KolamIOS.navBar.set({ title: 'Lion', back: { label: 'Discover' } });   // back defaults to history.back()
     KolamIOS.tabBar.select('home');
   }
   ```
   `init` returns `null` when the iOS look is off, so the web app is untouched.
4. Hide the web-only chrome (site header, footer nav, breadcrumbs) with `.web-only` or `html.k-ios .site-header { display: none }`.
5. Call `KolamIOS.enhance(container)` after rendering new markup (segmented controls, steppers, sliders, search fields, swipe rows, page controls).

## What you get

**Skin of existing Kolam components** (no markup change): `k-btn` (filled / tinted / gray / plain capsules, 44 / 52 / 32 pt), `k-iconbtn`, `k-input` / `k-select`, `k-label`, `k-list` (inset grouped, inset separators, disclosure chevrons on links), `k-card`, `k-tabs` (segmented control), `k-switch` (51 × 31 toggle), `k-check` (circular checkmark), `k-bottomnav` (floating Liquid Glass tab bar), `k-progress`, `k-toast` (glass banner), `k-dialog` (alert), `k-badge`, `k-count`, `k-chat` (Messages bubbles). Kolam's colour tokens are remapped to iOS system colours, and type classes follow the Dynamic Type scale.

**Opt-in `ios-` classes**

| HIG component | Markup / API |
|---|---|
| Navigation bar | `KolamIOS.navBar.set({ title, subtitle, large, back, leading, actions })`. Large title (34 pt) collapses to the inline title (17 pt semibold) on scroll; bar buttons share a glass capsule; `prominent: true` = tinted Done. `menu: [...]` on an action opens a pull-down menu. |
| Tab bar | `KolamIOS.tabBar.build(destinations, { current, onSelect })`, `.select(id)`, `.badge(id, n)` |
| Toolbar | `KolamIOS.toolbar([{ icon, label, onClick }, { spacer: true }, { title: 'Updated now' }])` |
| Buttons | `.ios-btn` + `-filled` `-tinted` `-gray` `-plain` `-glass` `-destructive`; sizes `-mini` 28, `-small` 32, regular 44, `-large` 52, `-xl` 64; `-circle`, `-rect`, `-block`. Small sizes keep a 44 pt hit region. |
| Lists | `.ios-section` > `.ios-section-header` + `.ios-list` > `.ios-row` (`a.ios-row` gets a chevron; `.ios-row-icon`, `.ios-row-text` + `small`, `.ios-row-detail`, `.ios-check`, `.is-destructive`, `.is-action`) + `.ios-section-footer` |
| Swipe actions | `.ios-swipe` > `.ios-row` + `.ios-swipe-actions` > `button.is-destructive / .is-tint / .is-indigo / .is-orange`. Buttons stay in the tab order; focusing one reveals them. |
| Segmented control | `.ios-seg[aria-label]` > `button.ios-seg-btn[aria-checked]` → `change` event `{ index, value }` |
| Toggle | `label.ios-switch` > text + `input[type=checkbox][role=switch]` + `span.ios-switch-track` |
| Slider | `input[type=range].ios-slider` (tint fill kept current) |
| Stepper | `div.ios-stepper[data-min][data-max][data-step][data-value][data-for=outputId][aria-label]` → `change` `{ value }` |
| Text field | `.ios-textfield`, or a bare `input` inside `label.ios-row` (+ `.ios-row-label`) |
| Search field | `form.ios-search` > `.ios-search-field` (icon, `input[type=search]`, `button.ios-search-clear`) + `button.ios-search-cancel` |
| Sheet | `KolamIOS.sheet({ title, content, detents: ['medium','large'], cancel, done: { text, onClick }, onClose })` → `{ el, body, close, setDetent }`. Grabber and header drag between detents or dismiss. |
| Alert | `await KolamIOS.alert({ title, message, field, actions: [{ text, role: 'cancel'|'destructive'|'default' }] })` → `{ text, role, input }` |
| Action sheet | `await KolamIOS.actionSheet({ title, message, actions })` → value or `null` |
| Menu | `await KolamIOS.menu(anchor, [{ text, icon, checked, role, onClick }, '-', { title }])` |
| Progress | `progress.ios-progress`, `.ios-spinner` (`.is-large`) |
| Page control | `div.ios-pagecontrol[data-count][data-current]` (`.is-glass`) → `change` `{ index }` |
| Type | `.ios-large-title` `.ios-title1/2/3` `.ios-headline` `.ios-body` `.ios-callout` `.ios-subhead` `.ios-footnote` `.ios-caption1/2`, `.ios-secondary` |
| Icons | `KolamIOS.icon('house')`: SF Symbols-style line icons named after their symbols (`KolamIOS.icons` lists them). Pass your own `<svg>` string anywhere an icon name is accepted. |
| Haptics | `KolamIOS.haptic('light'|'medium'|'heavy'|'soft'|'rigid'|'selection'|'success'|'warning'|'error')` → `webkit.messageHandlers.haptic`; no-op elsewhere. Tabs, toggles, segments, steppers, swipe actions and dialogs already call it. |
| Swipe back | `KolamIOS.onSwipeBack(handler, { force })`. In the shell, WKWebView's edge swipe already walks history (hash and pushState included). |

## Accessibility and settings

- **Dynamic Type**: the kit reads the user's text size through `font: -apple-system-body` and scales text with `--ios-dt` (bars stay fixed size, as in UIKit).
- **Dark mode** follows the system, or Kolam's `data-theme="light|dark|contrast"`.
- **Increase Contrast** (`prefers-contrast: more` or `data-theme="contrast"`): stronger labels and separators, opaque materials, on/off marks on toggles.
- **Reduce Transparency**: solid materials. WebKit has no media query for it yet, so the shell passes it in `window.KolamShell.reduceTransparency`.
- **Reduce Motion**: sheets, alerts, menus and swipes don't slide.
- 44 × 44 pt minimum hit regions; dim-on-press instead of ripples; real `<dialog>` elements with focus handling, Esc to close and focus returned to the opener.

## Deviations from Kolam and from the HIG (on purpose)

- **Typography**: iOS mode uses San Francisco via `-apple-system` (HIG), with **Noto Sans Tamil** for Tamil text. This departs from Kolam's Lato-only rule; Lato remains for the web look.
- **WCAG AA kept**: HIG secondary label (60 % gray) fails 4.5:1 on white, so it is darkened to 74 %. Destructive text and badges use the Increase Contrast red (#D70015). Standalone fields get a 3:1 outline; fields inside list rows use the row as their boundary.
- **Tint** comes from the app's Kolam `--primary-text` / `--primary` (AA-checked), not system blue. Toggles use the tint, not system green.

## iOS shell template

`shell-template/new-shell.sh` creates a SwiftUI WKWebView app (iOS 17+) from `shell-template/Template`:

```sh
~/Documents/kolam-design-system/ios/shell-template/new-shell.sh "Farmer Friend" farmer-friend \
  https://farmer-friend.vercel.app/ ~/Documents/farmer-friend/icon-512.png 2E7D32 \
  [--hosts "extra.host,other.host"] [--dark-tint 7CC6A3] [--team 22CAB8R3V5] [--category public.app-category.lifestyle] [--force]
# → ~/Documents/FarmerFriend-iOS (bundle id com.gopinath.farmer-friend)
```

The shell has: UA token `<Target>-iOS/1.0 Kolam-iOS/1.0` and `window.KolamShell` injected at document start; haptic message handler; `AVAudioSession` `.playback` (sound with the silent switch on); edge-swipe back; outside links in `SFSafariViewController` (`mailto:`/`tel:` to the system); JavaScript `alert`/`confirm` as iOS alerts; camera/microphone granted for the app's own hosts; reload after the web process is killed; an offline screen with Try Again; a launch screen in the system background colour, then the app icon and a spinner while the page loads; AccentColor = tint (dark mode gets a lighter mix).

## Limits

- **Distribution**: an iOS app can't be downloaded from the portfolio like an Android APK. Installing on someone else's iPhone needs TestFlight or the App Store, both of which need a paid Apple Developer Program membership (US$99 a year). Without it, Gopinath can run the shell on their own devices from Xcode (free provisioning expires after 7 days) and show it with Simulator screenshots or recordings.
- **Google sign-in** (Kolam Auth with Firebase) is blocked by Google inside embedded web views (`disallowed_useragent`). An app that needs sign-in in the shell must use Sign in with Apple or a native Google Sign-In SDK flow; the web look in Safari is unaffected.
- Liquid Glass is approximated with CSS blur and translucency: no refraction, no lensing, no morphing between controls.
- WebKit doesn't expose Bold Text or Button Shapes to CSS; the shell passes Bold Text in `KolamShell.boldText` for apps that want it.

## Checking the kit

`node ios/tools/check.mjs [outDir]` opens the demo headless at 393 × 852 in light and dark, visits every tab, opens each overlay, saves screenshots and fails on any console error.
