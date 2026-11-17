import SwiftUI

struct ContentView: View {
    @State private var loading = true
    @State private var failed = false
    @State private var reloadToken = 0

    var body: some View {
        ZStack {
            Color("LaunchBackground").ignoresSafeArea()

            // The page draws edge to edge and handles the safe areas itself (viewport-fit=cover).
            AppWebView(url: AppWebView.home, loading: $loading, failed: $failed, reloadToken: reloadToken)
                .ignoresSafeArea()
                .opacity(loading || failed ? 0 : 1)

            if loading && !failed {
                VStack(spacing: 20) {
                    Image("AppLogo")
                        .resizable().scaledToFit().frame(width: 96, height: 96)
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                        .accessibilityHidden(true)
                    ProgressView()
                        .accessibilityLabel("__DISPLAY_NAME__ is loading")
                }
            }

            if failed {
                ContentUnavailableView {
                    Label("You're offline", systemImage: "wifi.slash")
                } description: {
                    Text("__DISPLAY_NAME__ needs the internet. Check your connection, then try again.")
                } actions: {
                    Button("Try Again") {
                        failed = false
                        loading = true
                        reloadToken += 1
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.accentColor)
                }
            }
        }
        .animation(.easeOut(duration: 0.25), value: loading)
    }
}

#Preview {
    ContentView()
}
