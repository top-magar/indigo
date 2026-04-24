export default function OfflinePage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">You're offline</h1>
        <p className="text-muted-foreground">Check your internet connection and try again.</p>
      </div>
    </div>
  )
}
