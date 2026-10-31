// Kolam design system — SwiftUI tokens. Generated from tokens.json (light + dark).
// High-contrast: iOS "Increase Contrast" swaps to the contrast palette automatically.
import SwiftUI
import UIKit

enum Kolam {
    // MARK: Color
    /// Page background behind surfaces. Light value is the Ink Slate tint.
    static let bg = dyn(light: 0xF4F5F8, alpha: 1.00, dark: 0x10131B, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Cards, sheets, inputs, nav bars.
    static let surface = dyn(light: 0xFFFFFF, alpha: 1.00, dark: 0x171B26, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Wells, code blocks, track of progress bars, hover rows.
    static let surfaceSunken = dyn(light: 0xEAECF1, alpha: 1.00, dark: 0x0B0D13, alpha: 1.00, contrast: 0xF0F1F4, alpha: 1.00)
    /// Dialogs, menus, toasts — anything floating above surface. Dark value is Ink Slate.
    static let surfaceRaised = dyn(light: 0xFFFFFF, alpha: 1.00, dark: 0x1F2433, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Decorative dividers and card outlines only — never the only boundary of a control.
    static let line = dyn(light: 0xDDE0E8, alpha: 1.00, dark: 0x2A3040, alpha: 1.00, contrast: 0x595959, alpha: 1.00)
    /// Control borders (inputs, checkboxes, outline buttons). 3:1 on bg, surface and surface-sunken.
    static let lineStrong = dyn(light: 0x767E93, alpha: 1.00, dark: 0x6F7891, alpha: 1.00, contrast: 0x000000, alpha: 1.00)
    /// Ink Slate — primary text and headers on bg, surface, surface-sunken, surface-raised, and on every -soft tint.
    static let ink = dyn(light: 0x1F2433, alpha: 1.00, dark: 0xECEEF4, alpha: 1.00, contrast: 0x000000, alpha: 1.00)
    /// Secondary text: descriptions, meta, table cells. AA on every surface.
    static let ink2 = dyn(light: 0x474E60, alpha: 1.00, dark: 0xB4BACB, alpha: 1.00, contrast: 0x1A1A1A, alpha: 1.00)
    /// Placeholders, captions, hints. Still AA 4.5:1 on every surface.
    static let inkMuted = dyn(light: 0x5B6275, alpha: 1.00, dark: 0x9097AA, alpha: 1.00, contrast: 0x333333, alpha: 1.00)
    /// Ink Slate — dark sidebars, app bars and hero panels. Text on it uses on-sidebar.
    static let sidebar = dyn(light: 0x1F2433, alpha: 1.00, dark: 0x0B0D13, alpha: 1.00, contrast: 0x000000, alpha: 1.00)
    /// Text and icons on sidebar.
    static let onSidebar = dyn(light: 0xF4F5F8, alpha: 1.00, dark: 0xECEEF4, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Ocean Azure — main buttons, active states, selected nav, progress fill, brand highlights.
    static let primary = dyn(light: 0x0077B6, alpha: 1.00, dark: 0x4FB3E8, alpha: 1.00, contrast: 0x005480, alpha: 1.00)
    /// Hover/pressed fill of primary.
    static let primaryHover = dyn(light: 0x006AA2, alpha: 1.00, dark: 0x7CC7F0, alpha: 1.00, contrast: 0x003F60, alpha: 1.00)
    /// Text and icons on a primary fill.
    static let onPrimary = dyn(light: 0xFFFFFF, alpha: 1.00, dark: 0x04223A, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Ocean Azure tint — selected rows, active tab pill, nav pip.
    static let primarySoft = dyn(light: 0xE0F1FA, alpha: 1.00, dark: 0x0B2B40, alpha: 1.00, contrast: 0xE0F1FA, alpha: 1.00)
    /// Links and azure text on surfaces and on primary-soft. (#0077B6 itself is 4.47:1 on bg, so text uses this shade.)
    static let primaryText = dyn(light: 0x0070AC, alpha: 1.00, dark: 0x7CC7F0, alpha: 1.00, contrast: 0x005480, alpha: 1.00)
    /// Deep Teal — charts, icons, tag outlines, decorative fills. 3:1 on surfaces; not for small text, and white text on it is only 4.08:1.
    static let secondary = dyn(light: 0x0E8C8C, alpha: 1.00, dark: 0x3CC4C4, alpha: 1.00, contrast: 0x095959, alpha: 1.00)
    /// Teal fill behind white text: solid secondary buttons. 4.6:1 with on-secondary.
    static let secondaryStrong = dyn(light: 0x0D8080, alpha: 1.00, dark: 0x3CC4C4, alpha: 1.00, contrast: 0x095959, alpha: 1.00)
    /// Hover/pressed fill of secondary-strong.
    static let secondaryHover = dyn(light: 0x0B6B6B, alpha: 1.00, dark: 0x6FD8D8, alpha: 1.00, contrast: 0x064545, alpha: 1.00)
    /// Text and icons on secondary-strong.
    static let onSecondary = dyn(light: 0xFFFFFF, alpha: 1.00, dark: 0x032A2A, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Deep Teal tint — tonal secondary buttons, tags, info banners.
    static let secondarySoft = dyn(light: 0xE3F4F4, alpha: 1.00, dark: 0x0B3232, alpha: 1.00, contrast: 0xE3F4F4, alpha: 1.00)
    /// Teal text on surfaces and on secondary-soft.
    static let secondaryText = dyn(light: 0x0C7777, alpha: 1.00, dark: 0x6FD8D8, alpha: 1.00, contrast: 0x095959, alpha: 1.00)
    /// Magenta Rose — notification badges, counts, call-to-action highlights. White text on it is exactly 4.5:1.
    static let accent = dyn(light: 0xD63384, alpha: 1.00, dark: 0xF06AAA, alpha: 1.00, contrast: 0x921D58, alpha: 1.00)
    /// Hover/pressed fill of accent.
    static let accentHover = dyn(light: 0xBF2672, alpha: 1.00, dark: 0xF594C2, alpha: 1.00, contrast: 0x73164A, alpha: 1.00)
    /// Text and icons on an accent fill.
    static let onAccent = dyn(light: 0xFFFFFF, alpha: 1.00, dark: 0x2A0716, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Magenta Rose tint — featured cards, highlight banners.
    static let accentSoft = dyn(light: 0xFBE7F1, alpha: 1.00, dark: 0x3D1029, alpha: 1.00, contrast: 0xFBE7F1, alpha: 1.00)
    /// Magenta text on surfaces and on accent-soft.
    static let accentText = dyn(light: 0xC52876, alpha: 1.00, dark: 0xF59AC5, alpha: 1.00, contrast: 0x921D58, alpha: 1.00)
    /// Success text and icons on surfaces and success-soft. Always paired with an icon or word.
    static let success = dyn(light: 0x0B7A55, alpha: 1.00, dark: 0x4CC79A, alpha: 1.00, contrast: 0x00533A, alpha: 1.00)
    /// Success banner and badge background.
    static let successSoft = dyn(light: 0xDCF2E8, alpha: 1.00, dark: 0x0E3326, alpha: 1.00, contrast: 0xDCF2E8, alpha: 1.00)
    /// Warning text and icons on surfaces and warning-soft.
    static let warning = dyn(light: 0x8C5300, alpha: 1.00, dark: 0xF2B44A, alpha: 1.00, contrast: 0x5C3B00, alpha: 1.00)
    /// Warning banner and badge background.
    static let warningSoft = dyn(light: 0xFCEFD3, alpha: 1.00, dark: 0x3A2A0C, alpha: 1.00, contrast: 0xFCEFD3, alpha: 1.00)
    /// Error text, destructive buttons, invalid field borders. Always paired with an icon or word.
    static let danger = dyn(light: 0xB5360B, alpha: 1.00, dark: 0xFF8A63, alpha: 1.00, contrast: 0x8A2400, alpha: 1.00)
    /// Error banner and badge background.
    static let dangerSoft = dyn(light: 0xFBE5DC, alpha: 1.00, dark: 0x42190D, alpha: 1.00, contrast: 0xFBE5DC, alpha: 1.00)
    /// Text on a danger fill (destructive button).
    static let onDanger = dyn(light: 0xFFFFFF, alpha: 1.00, dark: 0x2A0A00, alpha: 1.00, contrast: 0xFFFFFF, alpha: 1.00)
    /// Info text and icons — Deep Teal, same as secondary-text.
    static let info = dyn(light: 0x0C7777, alpha: 1.00, dark: 0x6FD8D8, alpha: 1.00, contrast: 0x095959, alpha: 1.00)
    /// Info banner and badge background — Deep Teal tint.
    static let infoSoft = dyn(light: 0xE3F4F4, alpha: 1.00, dark: 0x0B3232, alpha: 1.00, contrast: 0xE3F4F4, alpha: 1.00)
    /// Focus ring: 2px solid, 2px offset. 3:1 on bg, surface, surface-sunken and surface-raised.
    static let focus = dyn(light: 0x1D4ED8, alpha: 1.00, dark: 0x9CBCFF, alpha: 1.00, contrast: 0x0033CC, alpha: 1.00)
    /// Backdrop behind dialogs and sheets.
    static let scrim = dyn(light: 0x1F2433, alpha: 0.60, dark: 0x000000, alpha: 0.70, contrast: 0x000000, alpha: 0.70)

    // MARK: Spacing (4pt grid)
    enum Space {
        static let s1: CGFloat = 4, s2: CGFloat = 8, s3: CGFloat = 12, s4: CGFloat = 16, s5: CGFloat = 20
        static let s6: CGFloat = 24, s8: CGFloat = 32, s10: CGFloat = 40, s12: CGFloat = 48, s16: CGFloat = 64
    }
    // MARK: Radius
    enum Radius {
        static let xs: CGFloat = 4, sm: CGFloat = 8, md: CGFloat = 12, lg: CGFloat = 16, xl: CGFloat = 24, pill: CGFloat = 999
    }
    // MARK: Size
    enum Size {
        static let controlSm: CGFloat = 32, controlMd: CGFloat = 44, controlLg: CGFloat = 52, targetMin: CGFloat = 44
        static let iconSm: CGFloat = 16, iconMd: CGFloat = 20, iconLg: CGFloat = 24
    }
    // MARK: Type — scales with Dynamic Type. Bundle Bricolage Grotesque and Lato (Lato-Regular.ttf, Lato-Bold.ttf; list them under UIAppFonts), or these fall back to SF.
    enum Font {
        static func display(_ size: CGFloat, relativeTo style: SwiftUI.Font.TextStyle) -> SwiftUI.Font {
            .custom("Bricolage Grotesque", size: size, relativeTo: style).weight(.bold)
        }
        static let displayXL = display(48, relativeTo: .largeTitle)
        static let displayLG = display(36, relativeTo: .largeTitle)
        static let heading1 = display(28, relativeTo: .title)
        static let heading2 = display(22, relativeTo: .title2)
        static let heading3 = display(18, relativeTo: .title3)
        static let bodyLG = SwiftUI.Font.custom("Lato-Regular", size: 18, relativeTo: .body)
        static let body = SwiftUI.Font.custom("Lato-Regular", size: 16, relativeTo: .body)
        static let bodySM = SwiftUI.Font.custom("Lato-Regular", size: 14, relativeTo: .subheadline)
        static let label = SwiftUI.Font.custom("Lato-Bold", size: 14, relativeTo: .subheadline)
        static let caption = SwiftUI.Font.custom("Lato-Bold", size: 12, relativeTo: .caption)
        static let mono = SwiftUI.Font.system(size: 14, design: .monospaced)
    }

    private static func dyn(light: UInt32, alpha la: Double, dark: UInt32, alpha da: Double, contrast: UInt32, alpha ca: Double) -> Color {
        Color(UIColor { t in
            if t.accessibilityContrast == .high && t.userInterfaceStyle != .dark { return ui(contrast, ca) }
            return t.userInterfaceStyle == .dark ? ui(dark, da) : ui(light, la)
        })
    }
    private static func ui(_ hex: UInt32, _ a: Double) -> UIColor {
        UIColor(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: a)
    }
}

// MARK: - Components
struct KolamPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Kolam.Font.label).frame(minHeight: Kolam.Size.controlMd).padding(.horizontal, Kolam.Space.s5)
            .foregroundStyle(Kolam.onPrimary)
            .background(configuration.isPressed ? Kolam.primaryHover : Kolam.primary, in: RoundedRectangle(cornerRadius: Kolam.Radius.md))
    }
}
/// Tonal Deep Teal — matches .k-btn-secondary.
struct KolamSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Kolam.Font.label).frame(minHeight: Kolam.Size.controlMd).padding(.horizontal, Kolam.Space.s5)
            .foregroundStyle(configuration.isPressed ? Kolam.onSecondary : Kolam.secondaryText)
            .background(configuration.isPressed ? Kolam.secondaryStrong : Kolam.secondarySoft, in: RoundedRectangle(cornerRadius: Kolam.Radius.md))
    }
}
/// Neutral outline — matches .k-btn-outline.
struct KolamOutlineButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Kolam.Font.label).frame(minHeight: Kolam.Size.controlMd).padding(.horizontal, Kolam.Space.s5)
            .foregroundStyle(Kolam.ink)
            .background(configuration.isPressed ? Kolam.surfaceSunken : Kolam.surface, in: RoundedRectangle(cornerRadius: Kolam.Radius.md))
            .overlay(RoundedRectangle(cornerRadius: Kolam.Radius.md).strokeBorder(Kolam.lineStrong, lineWidth: 1.5))
    }
}
/// Magenta Rose call-to-action highlight — matches .k-btn-accent.
struct KolamAccentButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Kolam.Font.label).frame(minHeight: Kolam.Size.controlMd).padding(.horizontal, Kolam.Space.s5)
            .foregroundStyle(Kolam.onAccent)
            .background(configuration.isPressed ? Kolam.accentHover : Kolam.accent, in: RoundedRectangle(cornerRadius: Kolam.Radius.md))
    }
}
struct KolamCard: ViewModifier {
    func body(content: Content) -> some View {
        content.padding(Kolam.Space.s4)
            .background(Kolam.surface, in: RoundedRectangle(cornerRadius: Kolam.Radius.lg))
            .overlay(RoundedRectangle(cornerRadius: Kolam.Radius.lg).strokeBorder(Kolam.line, lineWidth: 1))
    }
}
extension View { func kolamCard() -> some View { modifier(KolamCard()) } }
