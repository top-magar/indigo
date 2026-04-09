import { Component, type ReactNode } from "react"

export class PanelErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-xs text-muted-foreground">Panel crashed</p>
        <button className="text-xs text-primary underline" onClick={() => this.setState({ hasError: false })}>Retry</button>
      </div>
    )
  }
}
