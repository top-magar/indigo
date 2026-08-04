import React from 'react';
import { v4 } from 'uuid';
import { ChevronDown, Rows3, Timer, Code } from 'lucide-react';
import { register } from '../types';

register({ type: 'accordion', name: 'Accordion', icon: ChevronDown, color: '#f97316', group: 'Interactive', isContainer: false,
  factory: () => ({ id: v4(), type: 'accordion', name: 'Accordion', styles: {}, content: { items: JSON.stringify([
    { title: 'What is this product?', body: 'A brief description of your product or service.' },
    { title: 'How does pricing work?', body: 'Explain your pricing model here.' },
    { title: 'Do you offer support?', body: 'Yes, we offer 24/7 support via email and chat.' },
  ])} }) });

register({ type: 'tabs', name: 'Tabs', icon: Rows3, color: '#fb923c', group: 'Interactive', isContainer: false,
  factory: () => ({ id: v4(), type: 'tabs', name: 'Tabs', styles: {}, content: { items: JSON.stringify([
    { title: 'Tab 1', body: 'Content for the first tab.' },
    { title: 'Tab 2', body: 'Content for the second tab.' },
    { title: 'Tab 3', body: 'Content for the third tab.' },
  ])} }) });

register({ type: 'countdown', name: 'Countdown', icon: Timer, color: '#e11d48', group: 'Interactive', isContainer: false,
  factory: () => ({ id: v4(), type: 'countdown', name: 'Countdown', styles: { display: 'flex', justifyContent: 'center', gap: '16px', padding: '24px', fontSize: '32px', fontWeight: '700', textAlign: 'center' }, content: { targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16) } }) });

register({ type: 'embed', name: 'Embed Code', icon: Code, color: '#10b981', group: 'Interactive', isContainer: false,
  factory: () => ({ id: v4(), type: 'embed', name: 'Embed Code', styles: { width: '100%', minHeight: '50px' }, content: { code: '<div style="padding: 20px; background: #eee; text-align: center; border-radius: 4px;">Custom HTML Block</div>' } }),
  render: ({ element }) => {
    const code = (element.content as any).code || '';
    return React.createElement('div', {
      style: element.styles as React.CSSProperties,
      dangerouslySetInnerHTML: { __html: code }
    });
  },
  exportHTML: (el) => {
    const code = (el.content as any).code || '';
    // Simply return the raw code, wrapping in styles if needed
    // Assuming styles will be handled by the generic exporter for inline styles
    return code;
  }
});
