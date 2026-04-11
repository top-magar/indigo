import Foundation
import Supabase

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = true
    @Published var errorMessage: String?
    @Published var userEmail: String?

    private let manager = SupabaseManager.shared

    init() {
        Task { await checkSession() }
        Task { await listenToAuthChanges() }
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            try await manager.signIn(email: email, password: password)
            let session = await manager.session
            userEmail = session?.user.email
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func signOut() async {
        do {
            try await manager.signOut()
            isAuthenticated = false
            userEmail = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func checkSession() async {
        isLoading = true
        if let session = await manager.session {
            userEmail = session.user.email
            isAuthenticated = true
        }
        isLoading = false
    }

    private func listenToAuthChanges() async {
        for await event in manager.authStateChanges {
            switch event {
            case .signedIn:
                isAuthenticated = true
                if let session = await manager.session {
                    userEmail = session.user.email
                }
            case .signedOut:
                isAuthenticated = false
                userEmail = nil
            default:
                break
            }
        }
    }
}
