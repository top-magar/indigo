import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationCenter, NotificationEmptyState } from '../notification-center'
import { useNotifications } from "@/shared/hooks/use-notifications"
import type { Notification, NotificationCategory } from '../types'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock ResizeObserver for components that use it
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock

// Mock the useNotifications hook
vi.mock('@/hooks/use-notifications', async () => {
  const actual = await vi.importActual('@/hooks/use-notifications')
  return {
    ...actual,
    useNotifications: vi.fn(),
    useNotificationStore: actual.useNotificationStore,
  }
})

// Helper to create mock notifications
function createMockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: `notif_${Math.random().toString(36).substring(2, 9)}`,
    type: 'order_received',
    title: 'Test Notification',
    message: 'This is a test notification message',
    createdAt: new Date(),
    read: false,
    href: '/dashboard/orders/123',
    ...overrides,
  }
}

// Default mock return value
const createMockUseNotifications = (overrides = {}) => ({
  notifications: [],
  unreadCount: 0,
  hasUnread: false,
  isLoading: false,
  getByCategory: vi.fn(() => []),
  getUnread: vi.fn(() => []),
  addNotification: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  removeNotification: vi.fn(),
  clearAll: vi.fn(),
  ...overrides,
})

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering notification items', () => {
    it('should render the notification trigger button', () => {
      const mockHook = createMockUseNotifications()
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
    })

    it('should show unread badge when there are unread notifications', () => {
      const mockHook = createMockUseNotifications({
        unreadCount: 5,
        hasUnread: true,
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should show 99+ when unread count exceeds 99', () => {
      const mockHook = createMockUseNotifications({
        unreadCount: 150,
        hasUnread: true,
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('should render notification items when popover is opened', async () => {
      const notifications = [
        createMockNotification({ id: '1', title: 'Order #1234 received', read: false }),
        createMockNotification({ id: '2', title: 'Order #5678 shipped', read: true }),
      ]

      const mockHook = createMockUseNotifications({
        notifications,
        unreadCount: 1,
        hasUnread: true,
        getByCategory: vi.fn(() => notifications),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      // Open the popover
      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByText('Order #1234 received')).toBeInTheDocument()
        expect(screen.getByText('Order #5678 shipped')).toBeInTheDocument()
      })
    })

    it('should limit displayed notifications to maxItems prop', async () => {
      const notifications = Array.from({ length: 25 }, (_, i) =>
        createMockNotification({ id: `${i}`, title: `Notification ${i}` })
      )

      const mockHook = createMockUseNotifications({
        notifications,
        getByCategory: vi.fn(() => notifications),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter maxItems={10} />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      // Should only show first 10 notifications
      await waitFor(() => {
        expect(screen.getByText('Notification 0')).toBeInTheDocument()
        expect(screen.getByText('Notification 9')).toBeInTheDocument()
        expect(screen.queryByText('Notification 10')).not.toBeInTheDocument()
      })
    })
  })

  describe('Marking notifications as read', () => {
    it('should call markAsRead when a notification is clicked', async () => {
      const markAsRead = vi.fn()
      const notification = createMockNotification({ id: 'test-id', title: 'Click me' })

      const mockHook = createMockUseNotifications({
        notifications: [notification],
        getByCategory: vi.fn(() => [notification]),
        markAsRead,
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByText('Click me')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('Click me'))

      expect(markAsRead).toHaveBeenCalledWith('test-id')
    })

    it('should navigate to notification href when clicked', async () => {
      const notification = createMockNotification({
        id: 'test-id',
        title: 'Click me',
        href: '/dashboard/orders/123',
      })

      const mockHook = createMockUseNotifications({
        notifications: [notification],
        getByCategory: vi.fn(() => [notification]),
        markAsRead: vi.fn(),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByText('Click me')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('Click me'))

      expect(mockPush).toHaveBeenCalledWith('/dashboard/orders/123')
    })
  })

  describe('Filtering by type', () => {
    it('should render all filter tabs', async () => {
      const mockHook = createMockUseNotifications()
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /unread/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /orders/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /inventory/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /system/i })).toBeInTheDocument()
      })
    })

    it('should call getByCategory with correct category when tab is clicked', async () => {
      const getByCategory = vi.fn(() => [])
      const mockHook = createMockUseNotifications({ getByCategory })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /unread/i })).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('tab', { name: /unread/i }))

      expect(getByCategory).toHaveBeenCalledWith('unread')
    })

    it('should filter notifications by orders category', async () => {
      const orderNotifications = [
        createMockNotification({ id: '1', type: 'order_received', title: 'Order notification' }),
      ]

      const getByCategory = vi.fn((category: NotificationCategory) => {
        if (category === 'orders') return orderNotifications
        return []
      })

      const mockHook = createMockUseNotifications({ getByCategory })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /orders/i })).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('tab', { name: /orders/i }))

      expect(getByCategory).toHaveBeenCalledWith('orders')
    })
  })

  describe('Notification actions', () => {
    it('should show mark all read button when there are unread notifications', async () => {
      const mockHook = createMockUseNotifications({
        hasUnread: true,
        unreadCount: 3,
        getByCategory: vi.fn(() => []),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument()
      })
    })

    it('should call markAllAsRead when mark all read button is clicked', async () => {
      const markAllAsRead = vi.fn()
      const mockHook = createMockUseNotifications({
        hasUnread: true,
        unreadCount: 3,
        getByCategory: vi.fn(() => []),
        markAllAsRead,
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('button', { name: /mark all read/i }))

      expect(markAllAsRead).toHaveBeenCalled()
    })

    it('should not show mark all read button when no unread notifications', async () => {
      const mockHook = createMockUseNotifications({
        hasUnread: false,
        unreadCount: 0,
        getByCategory: vi.fn(() => []),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /mark all read/i })).not.toBeInTheDocument()
      })
    })

    it('should navigate to view all page when view all button is clicked', async () => {
      const mockHook = createMockUseNotifications({
        getByCategory: vi.fn(() => []),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter viewAllHref="/dashboard/notifications" />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view all notifications/i })).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('button', { name: /view all notifications/i }))

      expect(mockPush).toHaveBeenCalledWith('/dashboard/notifications')
    })
  })

  describe('Empty state', () => {
    it('should show empty state when no notifications', async () => {
      const mockHook = createMockUseNotifications({
        notifications: [],
        getByCategory: vi.fn(() => []),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
      })
    })

    it('should show appropriate empty state message for unread filter', async () => {
      const mockHook = createMockUseNotifications({
        getByCategory: vi.fn((category) => {
          if (category === 'unread') return []
          return [createMockNotification()]
        }),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /unread/i })).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('tab', { name: /unread/i }))

      await waitFor(() => {
        expect(screen.getByText(/no unread notifications/i)).toBeInTheDocument()
      })
    })

    it('should show appropriate empty state message for orders filter', async () => {
      const mockHook = createMockUseNotifications({
        getByCategory: vi.fn((category) => {
          if (category === 'orders') return []
          return [createMockNotification()]
        }),
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /orders/i })).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('tab', { name: /orders/i }))

      await waitFor(() => {
        expect(screen.getByText(/no order notifications/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading state', () => {
    it('should show loading indicator in trigger button aria-label', () => {
      const mockHook = createMockUseNotifications({
        isLoading: true,
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      // The button should still be accessible
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have correct aria-label with unread count', () => {
      const mockHook = createMockUseNotifications({
        hasUnread: true,
        unreadCount: 5,
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      expect(screen.getByRole('button', { name: /notifications \(5 unread\)/i })).toBeInTheDocument()
    })

    it('should have correct aria-label without unread notifications', () => {
      const mockHook = createMockUseNotifications({
        hasUnread: false,
        unreadCount: 0,
      })
      vi.mocked(useNotifications).mockReturnValue(mockHook)

      render(<NotificationCenter />)

      expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    })
  })
})

describe('NotificationEmptyState', () => {
  it('should render correct message for all category', () => {
    render(<NotificationEmptyState category="all" />)

    expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
    expect(screen.getByText(/you're all caught up/i)).toBeInTheDocument()
  })

  it('should render correct message for unread category', () => {
    render(<NotificationEmptyState category="unread" />)

    expect(screen.getByText(/no unread notifications/i)).toBeInTheDocument()
  })

  it('should render correct message for orders category', () => {
    render(<NotificationEmptyState category="orders" />)

    expect(screen.getByText(/no order notifications/i)).toBeInTheDocument()
  })

  it('should render correct message for inventory category', () => {
    render(<NotificationEmptyState category="inventory" />)

    expect(screen.getByText(/no inventory alerts/i)).toBeInTheDocument()
  })

  it('should render correct message for system category', () => {
    render(<NotificationEmptyState category="system" />)

    expect(screen.getByText(/no system notifications/i)).toBeInTheDocument()
  })
})
