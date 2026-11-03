# Kolam design system

Shared, WCAG 2.2 AA design system for all pet projects.
**Website:** https://tgopinath.github.io/kolam-design-system/ (live docs with theme switcher, tokens, contrast checks and component previews)

## Brand palette
| Role | Name | Hex | Tint | Text-safe shade |
|---|---|---|---|---|
| Primary | Ocean Azure | #0077B6 | #E0F1FA | #0070AC |
| Secondary | Deep Teal | #0E8C8C | #E3F4F4 | #0C7777 |
| Accent | Magenta Rose | #D63384 | #FBE7F1 | #C52876 |
| Neutral | Ink Slate | #1F2433 | #F4F5F8 | — |

## Files
- `tokens.css`: colour tokens for the light, dark and high-contrast themes, plus spacing, radius, size and type classes.
- `kolam.css`: the components (`k-btn`, `k-input`, `k-card`, `k-alert`, `k-bottomnav`…). Load it after tokens.css.
- `Kolam.swift`: SwiftUI colours (light, dark and Increase Contrast), spacing, radius, fonts and button styles.
- `tokens.json`: the source of truth.

## Web
```html
<link rel="stylesheet" href="kolam/tokens.css">
<link rel="stylesheet" href="kolam/kolam.css">
<!-- optional theme switch: <html data-theme="dark|light|contrast"> -->
```

## Per-project accent
Override only `--primary`, `--primary-hover`, `--on-primary`, `--primary-soft` and `--primary-text`, in both light and dark. Re-check contrast after any change.

## AI interfaces
When an app needs chat, an assistant or an agent, take element ideas from these libraries, then rebuild them with Kolam tokens (see the AI section on the website for the shadcn-to-Kolam variable mapping and the AI patterns checklist):
- AI Elements (Vercel): https://elements.ai-sdk.dev
- assistant-ui: https://www.assistant-ui.com
- prompt-kit: https://www.prompt-kit.com
- CopilotKit: https://www.copilotkit.ai
- 21st.dev AI chat components: https://21st.dev/community/components/explore/ai-chat-components

Kolam's own `k-chat` ChatThread component (in `kolam.css`) covers the common pieces: message log, sources, thinking state, suggestions and composer.
