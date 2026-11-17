import SwiftUI
import WebKit
import SafariServices

/// The live __DISPLAY_NAME__ web app in a WKWebView, set up to behave like a native iPhone app:
/// edge swipe to go back, inline media, sound without a tap first, haptics from the page,
/// JavaScript alerts as iOS alerts, and outside links in Safari's in-app viewer.
/// Generated from the Kolam iOS shell template (kolam-design-system/ios/shell-template).
struct AppWebView: UIViewRepresentable {
    static let home = URL(string: "__HOME_URL__")!
    /// Hosts that stay inside the app; every other http(s) link opens in Safari's viewer.
    static let appHosts: Set<String> = [__HOSTS__]

    let url: URL
    @Binding var loading: Bool
    @Binding var failed: Bool
    let reloadToken: Int

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        // "__UA_TOKEN__" + "Kolam-iOS" let the page's kolam-ios.js turn on the iOS look.
        config.applicationNameForUserAgent = "__UA_TOKEN__/1.0 Kolam-iOS/1.0 Mobile/15E148"
        config.userContentController.add(context.coordinator, name: "haptic")
        config.userContentController.addUserScript(WKUserScript(source: Self.shellScript(),
                                                                injectionTime: .atDocumentStart,
                                                                forMainFrameOnly: true))

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.allowsBackForwardNavigationGestures = true      // swipe from the left edge to go back
        web.allowsLinkPreview = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.isOpaque = false
        web.backgroundColor = UIColor(named: "LaunchBackground")
        #if DEBUG
        web.isInspectable = true                             // Safari ▸ Develop, for debugging
        #endif
        web.load(URLRequest(url: url))
        context.coordinator.lastToken = reloadToken
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {
        if context.coordinator.lastToken != reloadToken {    // "Try Again" after being offline
            context.coordinator.lastToken = reloadToken
            web.load(URLRequest(url: url))
        }
    }

    /// window.KolamShell tells the kit it runs in this shell, and passes accessibility settings
    /// that have no CSS media query in WebKit yet.
    static func shellScript() -> String {
        let reduceTransparency = UIAccessibility.isReduceTransparencyEnabled ? "true" : "false"
        let boldText = UIAccessibility.isBoldTextEnabled ? "true" : "false"
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        return """
        window.KolamShell = { platform: 'ios', app: '__DISPLAY_NAME__', version: '\(version)', nativeBack: true,
          reduceTransparency: \(reduceTransparency), boldText: \(boldText) };
        """
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        let parent: AppWebView
        var lastToken = 0
        init(_ parent: AppWebView) { self.parent = parent }

        // MARK: Loading state
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.loading = false
        }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            if (error as NSError).code != NSURLErrorCancelled { parent.failed = true }
        }
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            webView.reload()                                 // iOS reclaimed memory in the background
        }

        // MARK: Links: the app stays in the web view; other sites open in Safari's viewer
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url else { return decisionHandler(.allow) }
            let scheme = url.scheme?.lowercased() ?? ""
            if ["mailto", "tel", "sms", "facetime", "maps", "itms-apps"].contains(scheme) {
                UIApplication.shared.open(url)
                return decisionHandler(.cancel)
            }
            let isApp = url.host.map { AppWebView.appHosts.contains($0) } ?? true
            if action.navigationType == .linkActivated && !isApp && (scheme == "https" || scheme == "http") {
                openInSafari(url, from: webView)
                return decisionHandler(.cancel)
            }
            decisionHandler(.allow)
        }

        // target="_blank" links and window.open()
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            guard let url = action.request.url else { return nil }
            if let host = url.host, AppWebView.appHosts.contains(host) { webView.load(URLRequest(url: url)) }
            else { openInSafari(url, from: webView) }
            return nil
        }

        private func openInSafari(_ url: URL, from view: UIView) {
            guard let root = view.window?.rootViewController else { return }
            let safari = SFSafariViewController(url: url)
            safari.preferredControlTintColor = UIColor(named: "AccentColor")
            (root.presentedViewController ?? root).present(safari, animated: true)
        }

        // MARK: JavaScript alert() / confirm() as iOS alerts (WKWebView shows nothing otherwise)
        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
            present(alert, from: webView, orElse: completionHandler)
        }
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
            present(alert, from: webView) { completionHandler(false) }
        }
        private func present(_ vc: UIViewController, from view: UIView, orElse fallback: @escaping () -> Void) {
            guard let root = view.window?.rootViewController else { return fallback() }
            (root.presentedViewController ?? root).present(vc, animated: true)
        }

        // Camera and microphone for the app's own pages: iOS asks once; the page then gets it.
        func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                     initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
                     decisionHandler: @escaping (WKPermissionDecision) -> Void) {
            decisionHandler(AppWebView.appHosts.contains(origin.host) ? .grant : .prompt)
        }

        // MARK: Haptics requested by the page (KolamIOS.haptic(kind))
        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "haptic" else { return }
            switch message.body as? String ?? "light" {
            case "success": UINotificationFeedbackGenerator().notificationOccurred(.success)
            case "warning": UINotificationFeedbackGenerator().notificationOccurred(.warning)
            case "error": UINotificationFeedbackGenerator().notificationOccurred(.error)
            case "selection": UISelectionFeedbackGenerator().selectionChanged()
            case "medium": UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            case "heavy": UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
            case "soft": UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            case "rigid": UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
            default: UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
        }
    }
}
