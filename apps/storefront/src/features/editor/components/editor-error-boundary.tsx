import { Component, type ReactNode } from "react"

export class EditorErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { hasError: false, error: "" } }
  static getDerivedStateFromError(e: Error) { return { hasError: true, error: e.message } }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center" style={{ minHeight: 400 }}>
        <p className="text-sm font-medium">Something went wrong in the editor</p>
        <p className="text-xs text-muted-foreground">{this.state.error}</p>
        <button className="text-xs text-primary underline" onClick={() => this.setState({ hasError: false, error: "" })}>Try again</button>
      </div>
    )
  }
}
