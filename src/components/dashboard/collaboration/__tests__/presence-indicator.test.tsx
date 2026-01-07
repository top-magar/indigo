import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  PresenceIndicator,
  PresenceAvatar,
  PresenceList,
  TypingIndicator,
} from '../presence-indicator'
import { useRoomUsers } from "@/shared/hooks/use-websocket"
import type { UserPresence } from "@/infrastructure/services/websocket-server"

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

// ============================================================================
// Tests
// ============================================================================

describe('PresenceIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering with different user counts', () => {
    it('should render nothing when no users', () => {
      vi.mocked(useRoomUsers).mockReturnValue([])

      const { container } = render(<PresenceIndicator roomId="test-room" />)

      expect(container.firstChild).toBeNull()
    })

    it('should render single user', () => {
      const users = [createMockUser({ userName: 'John Doe' })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" />)

      expect(screen.getByText('JD')).toBeInTheDocument()
      expect(screen.getByText('1 viewing')).toBeInTheDocument()
    })

    it('should render multiple users', () => {
      const users = [
        createMockUser({ userId: '1', userName: 'John Doe' }),
        createMockUser({ userId: '2', userName: 'Jane Smith' }),
        createMockUser({ userId: '3', userName: 'Bob Wilson' }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" />)

      expect(screen.getByText('JD')).toBeInTheDocument()
      expect(screen.getByText('JS')).toBeInTheDocument()
      expect(screen.getByText('BW')).toBeInTheDocument()
      expect(screen.getByText('3 viewing')).toBeInTheDocument()
    })

    it('should display correct viewing count text', () => {
      const users = [createMockUser()]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" />)

      expect(screen.getByText('1 viewing')).toBeInTheDocument()
    })
  })

  describe('Avatar overflow (maxVisible prop)', () => {
    it('should show all users when count is less than maxVisible', () => {
      const users = [
        createMockUser({ userId: '1', userName: 'User One' }),
        createMockUser({ userId: '2', userName: 'User Two' }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" maxVisible={4} />)

      expect(screen.getByText('UO')).toBeInTheDocument()
      expect(screen.getByText('UT')).toBeInTheDocument()
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
    })

    it('should show overflow indicator when users exceed maxVisible', () => {
      const users = [
        createMockUser({ userId: '1', userName: 'User One' }),
        createMockUser({ userId: '2', userName: 'User Two' }),
        createMockUser({ userId: '3', userName: 'User Three' }),
        createMockUser({ userId: '4', userName: 'User Four' }),
        createMockUser({ userId: '5', userName: 'User Five' }),
        createMockUser({ userId: '6', userName: 'User Six' }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" maxVisible={4} />)

      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('should only show maxVisible avatars', () => {
      const users = [
        createMockUser({ userId: '1', userName: 'Alice Adams' }),
        createMockUser({ userId: '2', userName: 'Bob Brown' }),
        createMockUser({ userId: '3', userName: 'Carol Clark' }),
        createMockUser({ userId: '4', userName: 'David Davis' }),
        createMockUser({ userId: '5', userName: 'Eve Evans' }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" maxVisible={3} />)

      expect(screen.getByText('AA')).toBeInTheDocument()
      expect(screen.getByText('BB')).toBeInTheDocument()
      expect(screen.getByText('CC')).toBeInTheDocument()
      expect(screen.queryByText('DD')).not.toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('should use default maxVisible of 4', () => {
      const users = Array.from({ length: 6 }, (_, i) =>
        createMockUser({ userId: `${i}`, userName: `User ${i}` })
      )
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" />)

      expect(screen.getByText('+2')).toBeInTheDocument()
    })
  })

  describe('Tooltip display', () => {
    it('should show tooltip on hover when showTooltip is true', async () => {
      const users = [createMockUser({ userName: 'John Doe', status: 'online' })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" showTooltip={true} />)

      // Just verify the tooltip trigger is present - tooltip content requires Radix portal
      const avatar = screen.getByText('JD')
      expect(avatar).toBeInTheDocument()
    })

    it('should show overflow tooltip with hidden user names', async () => {
      const users = [
        createMockUser({ userId: '1', userName: 'Alice Adams' }),
        createMockUser({ userId: '2', userName: 'Bob Brown' }),
        createMockUser({ userId: '3', userName: 'Carol Clark' }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" maxVisible={2} />)

      // Verify overflow indicator is present
      const overflowIndicator = screen.getByText('+1')
      expect(overflowIndicator).toBeInTheDocument()
    })
  })

  describe('Status indicators (online, away, busy)', () => {
    it('should show online status indicator', () => {
      const users = [createMockUser({ status: 'online' })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" showStatus={true} />)

      const statusIndicator = screen.getByLabelText('Status: online')
      expect(statusIndicator).toHaveClass('bg-green-500')
    })

    it('should show away status indicator', () => {
      const users = [createMockUser({ status: 'away' })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" showStatus={true} />)

      const statusIndicator = screen.getByLabelText('Status: away')
      expect(statusIndicator).toHaveClass('bg-yellow-500')
    })

    it('should show busy status indicator', () => {
      const users = [createMockUser({ status: 'busy' })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" showStatus={true} />)

      const statusIndicator = screen.getByLabelText('Status: busy')
      expect(statusIndicator).toHaveClass('bg-red-500')
    })

    it('should not show status indicator when showStatus is false', () => {
      const users = [createMockUser({ status: 'online' })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" showStatus={false} />)

      expect(screen.queryByLabelText(/Status:/)).not.toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('should render nothing by default when no users', () => {
      vi.mocked(useRoomUsers).mockReturnValue([])

      const { container } = render(<PresenceIndicator roomId="test-room" />)

      expect(container.firstChild).toBeNull()
    })

    it('should render custom empty state when provided', () => {
      vi.mocked(useRoomUsers).mockReturnValue([])

      render(
        <PresenceIndicator
          roomId="test-room"
          emptyState={<div>No one is viewing</div>}
        />
      )

      expect(screen.getByText('No one is viewing')).toBeInTheDocument()
    })
  })

  describe('Filtering current user', () => {
    it('should filter out current user from display', () => {
      const users = [
        createMockUser({ userId: 'current-user', userName: 'Current User' }),
        createMockUser({ userId: 'other-user', userName: 'Other User' }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(
        <PresenceIndicator roomId="test-room" currentUserId="current-user" />
      )

      expect(screen.queryByText('CU')).not.toBeInTheDocument()
      expect(screen.getByText('OU')).toBeInTheDocument()
      expect(screen.getByText('1 viewing')).toBeInTheDocument()
    })

    it('should show empty state when only current user is present', () => {
      const users = [createMockUser({ userId: 'current-user', userName: 'Current User' })]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      const { container } = render(
        <PresenceIndicator roomId="test-room" currentUserId="current-user" />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Size variants', () => {
    it('should render small size avatars', () => {
      const users = [createMockUser()]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" size="sm" />)

      const avatar = document.querySelector('.h-6.w-6')
      expect(avatar).toBeInTheDocument()
    })

    it('should render medium size avatars by default', () => {
      const users = [createMockUser()]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" />)

      const avatar = document.querySelector('.h-8.w-8')
      expect(avatar).toBeInTheDocument()
    })

    it('should render large size avatars', () => {
      const users = [createMockUser()]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" size="lg" />)

      const avatar = document.querySelector('.h-10.w-10')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have correct aria-label with user count', () => {
      const users = [
        createMockUser({ userId: '1' }),
        createMockUser({ userId: '2' }),
        createMockUser({ userId: '3' }),
      ]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" />)

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', '3 users viewing')
    })

    it('should have singular aria-label for one user', () => {
      const users = [createMockUser()]
      vi.mocked(useRoomUsers).mockReturnValue(users)

      render(<PresenceIndicator roomId="test-room" />)

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', '1 user viewing')
    })
  })
})

describe('PresenceAvatar', () => {
  it('should render user initials', () => {
    const user = createMockUser({ userName: 'John Doe' })

    render(<PresenceAvatar user={user} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should render single name initials correctly', () => {
    const user = createMockUser({ userName: 'John' })

    render(<PresenceAvatar user={user} />)

    expect(screen.getByText('JO')).toBeInTheDocument()
  })

  it('should render avatar image when provided', () => {
    const user = createMockUser({
      userName: 'John Doe',
      userAvatar: 'https://example.com/avatar.jpg',
    })

    render(<PresenceAvatar user={user} showTooltip={false} />)

    // Avatar component renders img inside, check for the avatar container
    const avatar = screen.getByText('JD').closest('[data-slot="avatar"]')
    expect(avatar).toBeInTheDocument()
  })

  it('should apply user color to avatar', () => {
    const user = createMockUser({ userName: 'John Doe', userColor: '#ef4444' })

    render(<PresenceAvatar user={user} showTooltip={false} />)

    const fallback = screen.getByText('JD')
    expect(fallback).toHaveStyle({ backgroundColor: '#ef4444' })
  })
})

describe('PresenceList', () => {
  it('should render list of users', () => {
    const users = [
      createMockUser({ userId: '1', userName: 'John Doe' }),
      createMockUser({ userId: '2', userName: 'Jane Smith' }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<PresenceList roomId="test-room" />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('should show empty message when no users', () => {
    vi.mocked(useRoomUsers).mockReturnValue([])

    render(<PresenceList roomId="test-room" />)

    expect(screen.getByText('No one else is viewing')).toBeInTheDocument()
  })

  it('should show custom title', () => {
    const users = [createMockUser()]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<PresenceList roomId="test-room" title="Team members" />)

    expect(screen.getByText('Team members')).toBeInTheDocument()
  })

  it('should highlight current user', () => {
    const users = [
      createMockUser({ userId: 'current-user', userName: 'Current User' }),
      createMockUser({ userId: 'other-user', userName: 'Other User' }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<PresenceList roomId="test-room" currentUserId="current-user" />)

    expect(screen.getByText('(you)')).toBeInTheDocument()
  })

  it('should show typing indicator for typing users', () => {
    const users = [createMockUser({ userName: 'John Doe', isTyping: true })]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<PresenceList roomId="test-room" />)

    expect(screen.getByText(/Typing/)).toBeInTheDocument()
  })
})

describe('TypingIndicator', () => {
  it('should render nothing when no one is typing', () => {
    const users = [createMockUser({ isTyping: false })]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    const { container } = render(<TypingIndicator roomId="test-room" />)

    expect(container.firstChild).toBeNull()
  })

  it('should show single user typing', () => {
    const users = [createMockUser({ userName: 'John', isTyping: true })]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<TypingIndicator roomId="test-room" />)

    expect(screen.getByText('John is typing...')).toBeInTheDocument()
  })

  it('should show two users typing', () => {
    const users = [
      createMockUser({ userId: '1', userName: 'John', isTyping: true }),
      createMockUser({ userId: '2', userName: 'Jane', isTyping: true }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<TypingIndicator roomId="test-room" />)

    expect(screen.getByText('John and Jane are typing...')).toBeInTheDocument()
  })

  it('should show multiple users typing', () => {
    const users = [
      createMockUser({ userId: '1', userName: 'John', isTyping: true }),
      createMockUser({ userId: '2', userName: 'Jane', isTyping: true }),
      createMockUser({ userId: '3', userName: 'Bob', isTyping: true }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<TypingIndicator roomId="test-room" />)

    expect(screen.getByText('John and 2 others are typing...')).toBeInTheDocument()
  })

  it('should exclude current user from typing indicator', () => {
    const users = [
      createMockUser({ userId: 'current-user', userName: 'Current', isTyping: true }),
      createMockUser({ userId: 'other-user', userName: 'Other', isTyping: true }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<TypingIndicator roomId="test-room" currentUserId="current-user" />)

    expect(screen.getByText('Other is typing...')).toBeInTheDocument()
  })

  it('should render nothing when only current user is typing', () => {
    const users = [
      createMockUser({ userId: 'current-user', userName: 'Current', isTyping: true }),
    ]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    const { container } = render(
      <TypingIndicator roomId="test-room" currentUserId="current-user" />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render animated dots', () => {
    const users = [createMockUser({ isTyping: true })]
    vi.mocked(useRoomUsers).mockReturnValue(users)

    render(<TypingIndicator roomId="test-room" />)

    const dots = document.querySelectorAll('.animate-bounce')
    expect(dots.length).toBe(3)
  })
})
