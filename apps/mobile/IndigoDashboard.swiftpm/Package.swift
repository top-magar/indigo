// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "IndigoDashboard",
    platforms: [.iOS("17.0")],
    products: [
        .iOSApplication(
            name: "IndigoDashboard",
            targets: ["IndigoDashboard"],
            displayVersion: "1.0.0",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .shopping),
            accentColor: .presetColor(.indigo),
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft,
            ]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
    ],
    targets: [
        .executableTarget(
            name: "IndigoDashboard",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift")
            ],
            path: "Sources"
        )
    ]
)
