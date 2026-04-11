import SwiftUI

struct AuthGate: View {
    @StateObject private var viewModel = AuthViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("Loading…")
            } else if viewModel.isAuthenticated {
                MainTabView()
                    .environmentObject(viewModel)
            } else {
                LoginView(viewModel: viewModel)
            }
        }
    }
}

/// Placeholder — will be built out in a later step.
struct MainTabView: View {
    @EnvironmentObject var auth: AuthViewModel

    var body: some View {
        TabView {
            Text("Dashboard")
                .tabItem { Label("Home", systemImage: "house") }
            Text("Orders")
                .tabItem { Label("Orders", systemImage: "shippingbox") }
            Text("Products")
                .tabItem { Label("Products", systemImage: "tag") }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Sign Out") {
                    Task { await auth.signOut() }
                }
            }
        }
    }
}
