import { describe, it, expect } from 'vitest'
import { commands, getCommand, matchKeyboardEvent } from '../commands'
import { buildSectionStyle } from '../build-style'

// Helper to create a KeyboardEvent-like object
function key(k: string, opts: { meta?: boolean; shift?: boolean; alt?: boolean; target?: string } = {}): KeyboardEvent {
  return {
    key: k,
    metaKey: opts.meta ?? false,
    ctrlKey: opts.meta ?? false,
    shiftKey: opts.shift ?? false,
    altKey: opts.alt ?? false,
    target: { tagName: opts.target ?? 'DIV' } as HTMLElement,
    preventDefault: () => {},
  } as unknown as KeyboardEvent
}

describe('commands registry', () => {
  it('has at least 22 commands', () => {
    expect(commands.length).toBeGreaterThanOrEqual(22)
  })

  it('every command has required fields', () => {
    for (const cmd of commands) {
      expect(cmd.id).toBeTruthy()
      expect(cmd.label).toBeTruthy()
      expect(cmd.icon).toBeTruthy()
      expect(cmd.group).toBeTruthy()
      expect(typeof cmd.run).toBe('function')
    }
  })

  it('has no duplicate IDs', () => {
    const ids = commands.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('getCommand returns correct command', () => {
    expect(getCommand('save')?.label).toBe('Save')
    expect(getCommand('undo')?.label).toBe('Undo')
    expect(getCommand('delete')?.label).toBe('Delete')
  })

  it('getCommand returns undefined for unknown ID', () => {
    expect(getCommand('nonexistent')).toBeUndefined()
  })
})

describe('matchKeyboardEvent', () => {
  it('matches ⌘S to save', () => {
    expect(matchKeyboardEvent(key('s', { meta: true }))?.id).toBe('save')
  })

  it('matches ⌘Z to undo', () => {
    expect(matchKeyboardEvent(key('z', { meta: true }))?.id).toBe('undo')
  })

  it('matches ⇧⌘Z to redo', () => {
    expect(matchKeyboardEvent(key('z', { meta: true, shift: true }))?.id).toBe('redo')
  })

  it('matches Delete to delete', () => {
    expect(matchKeyboardEvent(key('Delete'))?.id).toBe('delete')
  })

  it('matches Escape to deselect', () => {
    expect(matchKeyboardEvent(key('Escape'))?.id).toBe('deselect')
  })

  it('does not match ⌘S in input fields', () => {
    // ⌘S should still work in inputs (it's a save shortcut)
    // But ⌘A, ⌘C, ⌘V, ⌘D, ⌘F should not
    expect(matchKeyboardEvent(key('a', { meta: true, target: 'INPUT' }))).toBeUndefined()
    expect(matchKeyboardEvent(key('c', { meta: true, target: 'INPUT' }))).toBeUndefined()
  })

  it('does not match Delete in input fields', () => {
    expect(matchKeyboardEvent(key('Delete', { target: 'INPUT' }))).toBeUndefined()
    expect(matchKeyboardEvent(key('Backspace', { target: 'INPUT' }))).toBeUndefined()
  })

  it('does not match unregistered shortcuts', () => {
    expect(matchKeyboardEvent(key('x', { meta: true }))).toBeUndefined()
  })

  it('matches ⌘D to duplicate', () => {
    expect(matchKeyboardEvent(key('d', { meta: true }))?.id).toBe('duplicate')
  })

  it('matches ⌥⌘C to copy-style', () => {
    expect(matchKeyboardEvent(key('c', { meta: true, alt: true }))?.id).toBe('copy-style')
  })
})

describe('buildSectionStyle zero-value handling', () => {
  it('preserves paddingTop: 0', () => {
    const style = buildSectionStyle({ _paddingTop: 0 }, 'desktop')
    expect(style.paddingTop).toBe(0)
  })

  it('preserves width: 0', () => {
    const style = buildSectionStyle({ _width: 0 }, 'desktop')
    expect(style.width).toBe(0)
  })

  it('preserves fontSize: 0', () => {
    const style = buildSectionStyle({ _fontSize: 0 }, 'desktop')
    expect(style.fontSize).toBe(0)
  })

  it('preserves height: 0', () => {
    const style = buildSectionStyle({ _height: 0 }, 'desktop')
    expect(style.height).toBe(0)
  })

  it('returns undefined for unset numeric props', () => {
    const style = buildSectionStyle({}, 'desktop')
    expect(style.paddingTop).toBeUndefined()
    expect(style.width).toBeUndefined()
    expect(style.fontSize).toBeUndefined()
  })
})
