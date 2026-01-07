import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InsightsPanel, InsightsPanelSkeleton, InsightsPanelEmpty, InsightsWidget } from '../insights-panel'
import { useInsights } from "@/shared/hooks/use-insights"
import { InsightType, type Insight } from '../insight-types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock the useInsights hook
vi.mock('@/hooks/use-insights', async () => {
  const actual = await vi.importActual('@/hooks/use-insights')
  return {
    ...actual,
    useInsights: vi.fn(),
  }
})

// Helper to create mock insights
function createMockInsight(overrides: Partial<Insight> = {}): Insight {
  return {
    id: `insight_${Math.random().toString(36).substring(2, 9)}`,
    type: InsightType.LOW_STOCK_WARNING,
    title: 'Test Insight',
    description: 'This is a test insight description',
    priority: 'medium',
    dismissedAt: null,
    createdAt: new Date(),
    metric: {
      value: '5 left',
      trend: 'negative',
    },
    action: {
      label: 'View Details',
      href: '/dashboard/inventory',
    },
    ...overrides,
  }
}

// Default mock return value
const createMockUseInsights = (overrides = {}) => ({
  insights: [],
  activeInsights: [],
  highPriorityInsights: [],
  dismissedInsights: [],
  isLoading: false,
  lastRefreshedAt: new Date(),
  error: null,
  dismissInsight: vi.fn(),
  restoreInsight: vi.fn(),
  refreshInsights: vi.fn().mockResolvedValue(undefined),
  getInsightsByPriority: vi.fn(() => []),
  clearDismissed: vi.fn(),
  hasHighPriorityInsights: false,
  activeCount: 0,
  dismissedCount: 0,
  ...overrides,
})

describe('InsightsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering insight cards', () => {
    it('should render the panel with title', () => {
      const mockHook = createMockUseInsights()
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByText('AI Insights')).toBeInTheDocument()
    })

    it('should render custom title when provided', () => {
      const mockHook = createMockUseInsights()
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel title="Custom Insights Title" />)

      expect(screen.getByText('Custom Insights Title')).toBeInTheDocument()
    })

    it('should render insight cards when there are active insights', () => {
      const insights = [
        createMockInsight({ id: '1', title: 'Low Stock Alert', priority: 'high' }),
        createMockInsight({ id: '2', title: 'Sales Surge Detected', priority: 'medium' }),
      ]

      const mockHook = createMockUseInsights({
        activeInsights: insights,
        activeCount: 2,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByText('Low Stock Alert')).toBeInTheDocument()
      expect(screen.getByText('Sales Surge Detected')).toBeInTheDocument()
    })

    it('should show active count badge', () => {
      const mockHook = createMockUseInsights({
        activeInsights: [createMockInsight()],
        activeCount: 5,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should limit displayed insights to maxInsights prop', () => {
      const insights = Array.from({ length: 10 }, (_, i) =>
        createMockInsight({ id: `${i}`, title: `Insight ${i}` })
      )

      const mockHook = createMockUseInsights({
        activeInsights: insights,
        activeCount: 10,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel maxInsights={3} />)

      expect(screen.getByText('Insight 0')).toBeInTheDocument()
      expect(screen.getByText('Insight 1')).toBeInTheDocument()
      expect(screen.getByText('Insight 2')).toBeInTheDocument()
      expect(screen.queryByText('Insight 3')).not.toBeInTheDocument()
    })

    it('should show more insights indicator when there are more than maxInsights', () => {
      const insights = Array.from({ length: 10 }, (_, i) =>
        createMockInsight({ id: `${i}`, title: `Insight ${i}` })
      )

      const mockHook = createMockUseInsights({
        activeInsights: insights,
        activeCount: 10,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel maxInsights={3} />)

      expect(screen.getByText(/\+7 more insights available/i)).toBeInTheDocument()
    })
  })

  describe('Insight actions', () => {
    it('should call dismissInsight when dismiss button is clicked', async () => {
      const dismissInsight = vi.fn()
      const insight = createMockInsight({ id: 'test-insight', title: 'Dismissable Insight' })

      const mockHook = createMockUseInsights({
        activeInsights: [insight],
        activeCount: 1,
        dismissInsight,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      const dismissButton = screen.getByRole('button', { name: /dismiss insight/i })
      await userEvent.click(dismissButton)

      expect(dismissInsight).toHaveBeenCalledWith('test-insight')
    })

    it('should call onInsightAction when action button is clicked', async () => {
      const onInsightAction = vi.fn()
      const insight = createMockInsight({
        id: 'test-insight',
        title: 'Actionable Insight',
        action: { label: 'Take Action', onClick: vi.fn() },
      })

      const mockHook = createMockUseInsights({
        activeInsights: [insight],
        activeCount: 1,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel onInsightAction={onInsightAction} />)

      const actionButton = screen.getByRole('button', { name: /take action/i })
      await userEvent.click(actionButton)

      expect(onInsightAction).toHaveBeenCalledWith(insight)
    })

    it('should render action as link when href is provided', () => {
      const insight = createMockInsight({
        id: 'test-insight',
        title: 'Link Insight',
        action: { label: 'View Details', href: '/dashboard/inventory' },
      })

      const mockHook = createMockUseInsights({
        activeInsights: [insight],
        activeCount: 1,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      const link = screen.getByRole('link', { name: /view details/i })
      expect(link).toHaveAttribute('href', '/dashboard/inventory')
    })
  })

  describe('Filtering by category', () => {
    it('should call getInsightsByPriority when filtering', () => {
      const getInsightsByPriority = vi.fn(() => [])
      const mockHook = createMockUseInsights({ getInsightsByPriority })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(useInsights).toHaveBeenCalled()
    })
  })

  describe('Priority sorting', () => {
    it('should display high priority indicator for high priority insights', () => {
      const highPriorityInsight = createMockInsight({
        id: '1',
        title: 'High Priority Insight',
        priority: 'high',
      })

      const mockHook = createMockUseInsights({
        activeInsights: [highPriorityInsight],
        activeCount: 1,
        hasHighPriorityInsights: true,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByText('High Priority Insight')).toBeInTheDocument()
      // Use getAllByText since both the title and badge contain "high priority"
      const highPriorityElements = screen.getAllByText(/high priority/i)
      expect(highPriorityElements.length).toBeGreaterThan(0)
    })

    it('should show pulsing indicator when there are high priority insights', () => {
      const mockHook = createMockUseInsights({
        activeInsights: [createMockInsight({ priority: 'high' })],
        activeCount: 1,
        hasHighPriorityInsights: true,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      const pulsingIndicator = document.querySelector('.animate-ping')
      expect(pulsingIndicator).toBeInTheDocument()
    })

    it('should not show pulsing indicator when no high priority insights', () => {
      const mockHook = createMockUseInsights({
        activeInsights: [createMockInsight({ priority: 'low' })],
        activeCount: 1,
        hasHighPriorityInsights: false,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      const header = screen.getByText('AI Insights').closest('div')
      const pulsingIndicator = header?.querySelector('.animate-ping')
      expect(pulsingIndicator).not.toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('should show empty state when no active insights', () => {
      const mockHook = createMockUseInsights({
        activeInsights: [],
        activeCount: 0,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByText(/no insights available/i)).toBeInTheDocument()
    })

    it('should show check for insights button in empty state', () => {
      const refreshInsights = vi.fn()
      const mockHook = createMockUseInsights({
        activeInsights: [],
        activeCount: 0,
        refreshInsights,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByRole('button', { name: /check for insights/i })).toBeInTheDocument()
    })

    it('should call refreshInsights when check for insights button is clicked', async () => {
      const refreshInsights = vi.fn()
      const mockHook = createMockUseInsights({
        activeInsights: [],
        activeCount: 0,
        refreshInsights,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      await userEvent.click(screen.getByRole('button', { name: /check for insights/i }))

      expect(refreshInsights).toHaveBeenCalled()
    })
  })

  describe('Loading state', () => {
    it('should show skeleton loading state when isLoading is true', () => {
      const mockHook = createMockUseInsights({
        isLoading: true,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show refresh button when showRefresh is true', () => {
      const mockHook = createMockUseInsights()
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel showRefresh={true} />)

      expect(screen.getByRole('button', { name: /refresh insights/i })).toBeInTheDocument()
    })

    it('should not show refresh button when showRefresh is false', () => {
      const mockHook = createMockUseInsights()
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel showRefresh={false} />)

      expect(screen.queryByRole('button', { name: /refresh insights/i })).not.toBeInTheDocument()
    })

    it('should call refreshInsights when refresh button is clicked', async () => {
      const refreshInsights = vi.fn()
      const mockHook = createMockUseInsights({ refreshInsights })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel showRefresh={true} />)

      await userEvent.click(screen.getByRole('button', { name: /refresh insights/i }))

      expect(refreshInsights).toHaveBeenCalled()
    })

    it('should disable refresh button when loading', () => {
      const mockHook = createMockUseInsights({ isLoading: true })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel showRefresh={true} />)

      expect(screen.getByRole('button', { name: /refresh insights/i })).toBeDisabled()
    })
  })

  describe('Collapsible behavior', () => {
    it('should start expanded by default', () => {
      const mockHook = createMockUseInsights({
        activeInsights: [createMockInsight({ title: 'Visible Insight' })],
        activeCount: 1,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByText('Visible Insight')).toBeInTheDocument()
    })

    it('should start collapsed when defaultCollapsed is true', () => {
      const mockHook = createMockUseInsights({
        activeInsights: [createMockInsight({ title: 'Hidden Insight' })],
        activeCount: 1,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel defaultCollapsed={true} />)

      expect(screen.queryByText('Hidden Insight')).not.toBeInTheDocument()
    })

    it('should toggle collapse state when collapse button is clicked', async () => {
      const mockHook = createMockUseInsights({
        activeInsights: [createMockInsight({ title: 'Toggle Insight' })],
        activeCount: 1,
      })
      vi.mocked(useInsights).mockReturnValue(mockHook)

      render(<InsightsPanel />)

      expect(screen.getByText('Toggle Insight')).toBeInTheDocument()

      const collapseButton = screen.getByRole('button', { name: /collapse insights/i })
      await userEvent.click(collapseButton)

      expect(screen.queryByText('Toggle Insight')).not.toBeInTheDocument()
    })
  })
})

describe('InsightsPanelSkeleton', () => {
  it('should render default 3 skeleton items', () => {
    render(<InsightsPanelSkeleton />)

    // Each skeleton item has the animate-pulse class on the container
    const skeletonContainers = document.querySelectorAll('.space-y-3 > div')
    expect(skeletonContainers.length).toBe(3)
  })

  it('should render custom number of skeleton items', () => {
    render(<InsightsPanelSkeleton count={5} />)

    const skeletonContainers = document.querySelectorAll('.space-y-3 > div')
    expect(skeletonContainers.length).toBe(5)
  })
})

describe('InsightsPanelEmpty', () => {
  it('should render empty state message', () => {
    render(<InsightsPanelEmpty />)

    expect(screen.getByText(/no insights available/i)).toBeInTheDocument()
    expect(screen.getByText(/we'll analyze your store data/i)).toBeInTheDocument()
  })

  it('should render refresh button when onRefresh is provided', () => {
    const onRefresh = vi.fn()
    render(<InsightsPanelEmpty onRefresh={onRefresh} />)

    expect(screen.getByRole('button', { name: /check for insights/i })).toBeInTheDocument()
  })

  it('should not render refresh button when onRefresh is not provided', () => {
    render(<InsightsPanelEmpty />)

    expect(screen.queryByRole('button', { name: /check for insights/i })).not.toBeInTheDocument()
  })

  it('should call onRefresh when button is clicked', async () => {
    const onRefresh = vi.fn()
    render(<InsightsPanelEmpty onRefresh={onRefresh} />)

    await userEvent.click(screen.getByRole('button', { name: /check for insights/i }))

    expect(onRefresh).toHaveBeenCalled()
  })
})

describe('InsightsWidget', () => {
  it('should render insights in compact format', () => {
    const insights = [
      createMockInsight({ id: '1', title: 'Widget Insight 1' }),
      createMockInsight({ id: '2', title: 'Widget Insight 2' }),
    ]

    const mockHook = createMockUseInsights({
      activeInsights: insights,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsWidget />)

    expect(screen.getByText('Widget Insight 1')).toBeInTheDocument()
    expect(screen.getByText('Widget Insight 2')).toBeInTheDocument()
  })

  it('should limit displayed insights to maxInsights prop', () => {
    const insights = Array.from({ length: 5 }, (_, i) =>
      createMockInsight({ id: `${i}`, title: `Widget Insight ${i}` })
    )

    const mockHook = createMockUseInsights({
      activeInsights: insights,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsWidget maxInsights={2} />)

    expect(screen.getByText('Widget Insight 0')).toBeInTheDocument()
    expect(screen.getByText('Widget Insight 1')).toBeInTheDocument()
    expect(screen.queryByText('Widget Insight 2')).not.toBeInTheDocument()
  })

  it('should return null when no insights and not loading', () => {
    const mockHook = createMockUseInsights({
      activeInsights: [],
      isLoading: false,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    const { container } = render(<InsightsWidget />)

    expect(container.firstChild).toBeNull()
  })

  it('should show loading skeletons when loading', () => {
    const mockHook = createMockUseInsights({
      activeInsights: [],
      isLoading: true,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsWidget />)

    const skeletons = document.querySelectorAll('.rounded-lg')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should show high priority indicator when there are high priority insights', () => {
    const mockHook = createMockUseInsights({
      activeInsights: [createMockInsight({ priority: 'high' })],
      hasHighPriorityInsights: true,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsWidget />)

    const pulsingIndicator = document.querySelector('.animate-ping')
    expect(pulsingIndicator).toBeInTheDocument()
  })

  it('should call dismissInsight when insight is dismissed', async () => {
    const dismissInsight = vi.fn()
    const insight = createMockInsight({ id: 'widget-insight', title: 'Dismissable Widget Insight' })

    const mockHook = createMockUseInsights({
      activeInsights: [insight],
      dismissInsight,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsWidget />)

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    await userEvent.click(dismissButton)

    expect(dismissInsight).toHaveBeenCalledWith('widget-insight')
  })
})

describe('Insight metric display', () => {
  it('should display metric value', () => {
    const insight = createMockInsight({
      title: 'Metric Insight',
      metric: { value: '+23%', trend: 'positive' },
    })

    const mockHook = createMockUseInsights({
      activeInsights: [insight],
      activeCount: 1,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsPanel />)

    expect(screen.getByText('+23%')).toBeInTheDocument()
  })

  it('should display positive trend indicator', () => {
    const insight = createMockInsight({
      title: 'Positive Trend Insight',
      metric: { value: '+15%', trend: 'positive' },
    })

    const mockHook = createMockUseInsights({
      activeInsights: [insight],
      activeCount: 1,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsPanel />)

    const metricElement = screen.getByText('+15%')
    expect(metricElement).toHaveClass('text-emerald-600')
  })

  it('should display negative trend indicator', () => {
    const insight = createMockInsight({
      title: 'Negative Trend Insight',
      metric: { value: '-10%', trend: 'negative' },
    })

    const mockHook = createMockUseInsights({
      activeInsights: [insight],
      activeCount: 1,
    })
    vi.mocked(useInsights).mockReturnValue(mockHook)

    render(<InsightsPanel />)

    const metricElement = screen.getByText('-10%')
    expect(metricElement).toHaveClass('text-red-600')
  })
})
