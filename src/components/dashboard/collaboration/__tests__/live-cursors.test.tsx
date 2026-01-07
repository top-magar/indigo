import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import {
  LiveCursors,
  Cursor,
  LiveCursorsProvider,
  useCursorTracking,
} from '../live-cursors'
import { useRoomUsers } from "@/shared/hooks/use-websocket"
import type { UserPresence, CursorPosition } from "@/infrastructure/services/websocket-server"
import { renderHook } from '@testing-library/react'
import * as React from 'react'

// Mock the useRoomUsers hook
vi.mock('@/hooks/use-websocket', () => ({
  useRoomUsers: vi.fn(),
}))

// ============================================================================
// Test Helpers
// ============================================================================

function createMockUser(overrides: Partial<UserPresence> = {}): UserPresence {
  return {
    userId: `user_${Math.random().toString(36).substring(2, 9)}`,
    userName: 'Test User',
    userColor: '#3b82f6',
    status: 'online',
    lastSeen: new Date(),
    ...overrides,
  }
}

function createMockCursor(overrides: Partial<CursorPosition> = {}): CursorPosition {
  return {
    x: 100,
    y: 200,
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('LiveCursors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Cursor rendering for multiple users', () => {
    it('should render nothing when no users have cursors', () => {
      const users = [createMockUser({ cursor: undefined })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      const { container } = render(<LiveCursors roomId="test-room" />)

      expect(container.firstChild).toBeNull()
    })

    it('should render cursor for user with cursor position', () => {
      const users = [
        createMockUser({
          userId: 'user_1',
          userName: 'John',
          cursor: createMockCursor({ x: 150, y: 250 }),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      expect(screen.getByText('John')).toBeInTheDocument()
    })

    it('should render multiple cursors', () => {
      const users = [
        createMockUser({
          userId: 'user_1',
          userName: 'John',
          cursor: createMockCursor({ x: 100, y: 100 }),
        }),
        createMockUser({
          userId: 'user_2',
          userName: 'Jane',
          cursor: createMockCursor({ x: 200, y: 200 }),
        }),
        createMockUser({
          userId: 'user_3',
          userName: 'Bob',
          cursor: createMockCursor({ x: 300, y: 300 }),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('Jane')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('should not render cursor for current user', () => {
      const users = [
        createMockUser({
          userId: 'current-user',
          userName: 'Current',
          cursor: createMockCursor(),
        }),
        createMockUser({
          userId: 'other-user',
          userName: 'Other',
          cursor: createMockCursor(),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" currentUserId="current-user" />)

      expect(screen.queryByText('Current')).not.toBeInTheDocument()
      expect(screen.getByText('Other')).toBeInTheDocument()
    })
  })

  describe('Cursor position updates', () => {
    it('should position cursor at correct coordinates', () => {
      const users = [
        createMockUser({
          userName: 'John',
          cursor: createMockCursor({ x: 150, y: 250 }),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      const cursorElement = screen.getByText('John').closest('.pointer-events-none.absolute')
      // Check that the element has the correct inline style
      expect(cursorElement?.getAttribute('style')).toContain('left: 150px')
      expect(cursorElement?.getAttribute('style')).toContain('top: 250px')
    })

    it('should update cursor position when user moves', () => {
      const initialUsers = [
        createMockUser({
          userId: 'user_1',
          userName: 'John',
          cursor: createMockCursor({ x: 100, y: 100 }),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(initialUsers)

      const { rerender } = render(<LiveCursors roomId="test-room" />)

      // Update cursor position
      const updatedUsers = [
        createMockUser({
          userId: 'user_1',
          userName: 'John',
          cursor: createMockCursor({ x: 200, y: 300 }),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(updatedUsers)

      rerender(<LiveCursors roomId="test-room" />)

      const cursorElement = screen.getByText('John').closest('.pointer-events-none.absolute')
      expect(cursorElement?.getAttribute('style')).toContain('left: 200px')
      expect(cursorElement?.getAttribute('style')).toContain('top: 300px')
    })
  })

  describe('Cursor color assignment', () => {
    it('should apply user color to cursor', () => {
      const users = [
        createMockUser({
          userName: 'John',
          userColor: '#ef4444',
          cursor: createMockCursor(),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      const label = screen.getByText('John')
      expect(label).toHaveStyle({ backgroundColor: '#ef4444' })
    })

    it('should render different colors for different users', () => {
      const users = [
        createMockUser({
          userId: 'user_1',
          userName: 'John',
          userColor: '#ef4444',
          cursor: createMockCursor({ x: 100, y: 100 }),
        }),
        createMockUser({
          userId: 'user_2',
          userName: 'Jane',
          userColor: '#3b82f6',
          cursor: createMockCursor({ x: 200, y: 200 }),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      const johnLabel = screen.getByText('John')
      const janeLabel = screen.getByText('Jane')

      expect(johnLabel).toHaveStyle({ backgroundColor: '#ef4444' })
      expect(janeLabel).toHaveStyle({ backgroundColor: '#3b82f6' })
    })
  })

  describe('Cursor label display', () => {
    it('should show user name label by default', () => {
      const users = [
        createMockUser({
          userName: 'John Doe',
          cursor: createMockCursor(),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should hide label when showLabels is false', () => {
      const users = [
        createMockUser({
          userName: 'John Doe',
          cursor: createMockCursor(),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" showLabels={false} />)

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('should show typing indicator in label when user is typing', () => {
      const users = [
        createMockUser({
          userName: 'John',
          cursor: createMockCursor(),
          isTyping: true,
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      // Check for animated dots (typing indicator)
      const dots = document.querySelectorAll('.animate-bounce')
      expect(dots.length).toBe(3)
    })
  })

  describe('Cursor fade out on inactivity', () => {
    it('should show cursor as stale after threshold', () => {
      const staleTime = new Date(Date.now() - 6000) // 6 seconds ago
      const users = [
        createMockUser({
          userName: 'John',
          cursor: createMockCursor(),
          lastSeen: staleTime,
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      // Advance time to trigger staleness check
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const cursorElement = screen.getByText('John').closest('.pointer-events-none.absolute')
      expect(cursorElement).toHaveClass('opacity-40')
    })

    it('should not show stale cursor as faded when recently active', () => {
      const recentTime = new Date() // Just now
      const users = [
        createMockUser({
          userName: 'John',
          cursor: createMockCursor(),
          lastSeen: recentTime,
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" />)

      const cursorElement = screen.getByText('John').closest('.pointer-events-none.absolute')
      expect(cursorElement).not.toHaveClass('opacity-40')
    })

    it('should hide cursor completely after fadeOutDelay', () => {
      const veryStaleTime = new Date(Date.now() - 10000) // 10 seconds ago
      const users = [
        createMockUser({
          userName: 'John',
          cursor: createMockCursor(),
          lastSeen: veryStaleTime,
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" fadeOutDelay={3000} />)

      // Advance time past fadeOutDelay + stale threshold
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.queryByText('John')).not.toBeInTheDocument()
    })
  })

  describe('Enabled/disabled state', () => {
    it('should render nothing when disabled', () => {
      const users = [
        createMockUser({
          userName: 'John',
          cursor: createMockCursor(),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      const { container } = render(<LiveCursors roomId="test-room" enabled={false} />)

      expect(container.firstChild).toBeNull()
    })

    it('should render cursors when enabled', () => {
      const users = [
        createMockUser({
          userName: 'John',
          cursor: createMockCursor(),
        }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<LiveCursors roomId="test-room" enabled={true} />)

      expect(screen.getByText('John')).toBeInTheDocument()
    })
  })
})

describe('Cursor', () => {
  it('should render cursor SVG', () => {
    const user = createMockUser({
      userName: 'John',
      cursor: createMockCursor({ x: 100, y: 200 }),
    })

    render(<Cursor user={user} />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should not render when user has no cursor', () => {
    const user = createMockUser({
      userName: 'John',
      cursor: undefined,
    })

    const { container } = render(<Cursor user={user} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render label at bottom by default', () => {
    const user = createMockUser({
      userName: 'John',
      cursor: createMockCursor(),
    })

    render(<Cursor user={user} />)

    const label = screen.getByText('John')
    expect(label).toHaveClass('top-5')
  })

  it('should render label at top when specified', () => {
    const user = createMockUser({
      userName: 'John',
      cursor: createMockCursor(),
    })

    render(<Cursor user={user} labelPosition="top" />)

    const label = screen.getByText('John')
    expect(label).toHaveClass('-top-6')
  })

  it('should render label at right when specified', () => {
    const user = createMockUser({
      userName: 'John',
      cursor: createMockCursor(),
    })

    render(<Cursor user={user} labelPosition="right" />)

    const label = screen.getByText('John')
    expect(label).toHaveClass('left-6')
  })

  it('should apply stale styling when isStale is true', () => {
    const user = createMockUser({
      userName: 'John',
      cursor: createMockCursor(),
    })

    render(<Cursor user={user} isStale={true} />)

    const cursorElement = screen.getByText('John').closest('.pointer-events-none')
    expect(cursorElement).toHaveClass('opacity-40')
  })
})

describe('LiveCursorsProvider', () => {
  it('should render children', () => {
    vi.mocked(useRoomUsers).mockReturnValue([])

    render(
      <LiveCursorsProvider roomId="test-room" currentUserId="user_1">
        <div>Child content</div>
      </LiveCursorsProvider>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should render LiveCursors component', () => {
    const users = [
      createMockUser({
        userId: 'other-user',
        userName: 'Other',
        cursor: createMockCursor(),
      }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(
      <LiveCursorsProvider roomId="test-room" currentUserId="current-user">
        <div>Child content</div>
      </LiveCursorsProvider>
    )

    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('should not render cursors when disabled', () => {
    const users = [
      createMockUser({
        userName: 'John',
        cursor: createMockCursor(),
      }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(
      <LiveCursorsProvider roomId="test-room" currentUserId="user_1" enabled={false}>
        <div>Child content</div>
      </LiveCursorsProvider>
    )

    expect(screen.queryByText('John')).not.toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    vi.mocked(useRoomUsers).mockReturnValue([])

    render(
      <LiveCursorsProvider
        roomId="test-room"
        currentUserId="user_1"
        className="custom-class"
      >
        <div>Child content</div>
      </LiveCursorsProvider>
    )

    const container = screen.getByText('Child content').parentElement
    expect(container).toHaveClass('custom-class')
  })
})

describe('useCursorTracking', () => {
  beforeEach(() => {
    vi.useRealTimers()
    // Mock document.elementFromPoint
    document.elementFromPoint = vi.fn().mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call onCursorMove when mouse moves', async () => {
    const onCursorMove = vi.fn()

    const TestComponent = () => {
      useCursorTracking({
        roomId: 'test-room',
        enabled: true,
        throttleMs: 0,
        onCursorMove,
      })
      return <div data-testid="test-container">Test</div>
    }

    render(<TestComponent />)

    // Simulate mouse move
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
      bubbles: true,
    })

    await act(async () => {
      document.dispatchEvent(event)
      // Wait for requestAnimationFrame
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    expect(onCursorMove).toHaveBeenCalled()
  })

  it('should not call onCursorMove when disabled', async () => {
    const onCursorMove = vi.fn()

    const TestComponent = () => {
      useCursorTracking({
        roomId: 'test-room',
        enabled: false,
        onCursorMove,
      })
      return <div>Test</div>
    }

    render(<TestComponent />)

    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
      bubbles: true,
    })

    await act(async () => {
      document.dispatchEvent(event)
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    expect(onCursorMove).not.toHaveBeenCalled()
  })

  it('should include scroll position in cursor data', async () => {
    const onCursorMove = vi.fn()

    // Mock scroll position
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true })
    Object.defineProperty(window, 'scrollX', { value: 25, writable: true })

    const TestComponent = () => {
      useCursorTracking({
        roomId: 'test-room',
        enabled: true,
        throttleMs: 0,
        onCursorMove,
      })
      return <div>Test</div>
    }

    render(<TestComponent />)

    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
      bubbles: true,
    })

    await act(async () => {
      document.dispatchEvent(event)
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    expect(onCursorMove).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollTop: 50,
        scrollLeft: 25,
      })
    )
  })

  it('should throttle cursor updates', async () => {
    vi.useFakeTimers()
    const onCursorMove = vi.fn()

    const TestComponent = () => {
      useCursorTracking({
        roomId: 'test-room',
        enabled: true,
        throttleMs: 100,
        onCursorMove,
      })
      return <div>Test</div>
    }

    render(<TestComponent />)

    // Simulate multiple rapid mouse moves
    for (let i = 0; i < 5; i++) {
      const event = new MouseEvent('mousemove', {
        clientX: 100 + i * 10,
        clientY: 200 + i * 10,
        bubbles: true,
      })
      document.dispatchEvent(event)
    }

    // Only first call should go through due to throttling
    expect(onCursorMove.mock.calls.length).toBeLessThanOrEqual(1)

    vi.useRealTimers()
  })

  it('should cleanup event listeners on unmount', () => {
    const onCursorMove = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const TestComponent = () => {
      useCursorTracking({
        roomId: 'test-room',
        enabled: true,
        onCursorMove,
      })
      return <div>Test</div>
    }

    const { unmount } = render(<TestComponent />)
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })
})

describe('Accessibility', () => {
  it('should have aria-hidden on cursor container', () => {
    const users = [
      createMockUser({
        userName: 'John',
        cursor: createMockCursor(),
      }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<LiveCursors roomId="test-room" />)

    const container = screen.getByText('John').closest('[aria-hidden]')
    expect(container).toHaveAttribute('aria-hidden', 'true')
  })

  it('should have pointer-events-none to not interfere with interactions', () => {
    const users = [
      createMockUser({
        userName: 'John',
        cursor: createMockCursor(),
      }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<LiveCursors roomId="test-room" />)

    const container = screen.getByText('John').closest('.pointer-events-none')
    expect(container).toBeInTheDocument()
  })
})
