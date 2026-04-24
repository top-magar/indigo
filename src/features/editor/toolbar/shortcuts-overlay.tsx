'use client';

import { MIcon } from '../ui/m-icon';
import { k } from '../lib/keys';

const groups = [
  { title: 'General', shortcuts: [
    { keys: k('⌘ Z', 'Ctrl+Z'), action: 'Undo' },
    { keys: k('⌘ ⇧ Z', 'Ctrl+Shift+Z'), action: 'Redo' },
    { keys: k('⌘ D', 'Ctrl+D'), action: 'Duplicate' },
    { keys: k('⌘ C / V', 'Ctrl+C / V'), action: 'Copy / Paste' },
    { keys: k('⌘ ⌥ C', 'Ctrl+Alt+C'), action: 'Copy styles' },
    { keys: k('⌘ ⌥ V', 'Ctrl+Alt+V'), action: 'Paste styles' },
    { keys: 'Del', action: 'Delete element' },
    { keys: 'Esc', action: 'Select parent' },
    { keys: k('⌘ A', 'Ctrl+A'), action: 'Select body' },
  ]},
  { title: 'Navigation', shortcuts: [
    { keys: k('⌘ + / −', 'Ctrl++ / -'), action: 'Zoom in / out' },
    { keys: k('⌘ 0', 'Ctrl+0'), action: 'Zoom to 100%' },
    { keys: k('⌘ 1', 'Ctrl+1'), action: 'Zoom to fit' },
    { keys: k('⌘ 2', 'Ctrl+2'), action: 'Zoom to selection' },
    { keys: k('⌘ Scroll', 'Ctrl+Scroll'), action: 'Zoom to cursor' },
    { keys: 'Scroll', action: 'Pan canvas' },
    { keys: 'Space + Drag', action: 'Pan canvas' },
    { keys: 'Middle-click', action: 'Pan canvas' },
  ]},
  { title: 'Elements', shortcuts: [
    { keys: k('⌘ [ / ]', 'Ctrl+[ / ]'), action: 'Send backward / forward' },
    { keys: k('⌘ ↑ / ↓', 'Ctrl+↑ / ↓'), action: 'Reorder in tree' },
    { keys: k('⌘ ⇧ L', 'Ctrl+Shift+L'), action: 'Lock / unlock' },
    { keys: k('⌘ ⇧ H', 'Ctrl+Shift+H'), action: 'Hide / show' },
    { keys: 'Right-click', action: 'Context menu' },
  ]},
  { title: 'Handles', shortcuts: [
    { keys: 'Drag edge', action: 'Adjust padding / margin' },
    { keys: 'Alt + Drag', action: 'Adjust opposite side' },
    { keys: 'Alt + ⇧ + Drag', action: 'Adjust all sides' },
    { keys: 'Drag corner dot', action: 'Adjust border radius' },
    { keys: '⇧ + Resize', action: 'Lock aspect ratio' },
  ]},
];

export default function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-popover border border-border rounded-lg shadow-2xl w-[520px] max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <MIcon name="close" size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">{g.title}</h3>
              <div className="space-y-1">
                {g.shortcuts.map(({ keys, action }) => (
                  <div key={keys} className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-foreground/70">{action}</span>
                    <kbd className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-4 text-center">Press <kbd className="rounded-md border border-border px-1 py-px text-[10px]">?</kbd> to toggle</p>
      </div>
    </div>
  );
}
