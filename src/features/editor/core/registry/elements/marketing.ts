import { v4 } from 'uuid';
import { Mail, Bell, Search, ChevronLeft, ChevronRight, Building2, Navigation2, MoveHorizontal } from 'lucide-react';
import { register } from '../types';
import type { El } from '../../types';

// ─── Newsletter Signup ──────────────────────────────────
register({ type: 'newsletter', name: 'Newsletter', icon: Mail, color: '#6366f1', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'newsletter', name: 'Newsletter', styles: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '64px 24px', textAlign: 'center', width: '100%', backgroundColor: '#f8fafc' }, content: [
    { id: v4(), type: 'heading', name: 'Title', styles: { fontSize: '28px', fontWeight: '700', lineHeight: '1.2' }, content: { innerText: 'Stay in the Loop' } },
    { id: v4(), type: 'text', name: 'Description', styles: { fontSize: '16px', color: '#6b7280', maxWidth: '480px' }, content: { innerText: 'Subscribe to our newsletter for exclusive deals, new arrivals, and style tips delivered to your inbox.' } },
    { id: v4(), type: 'container', name: 'Form Row', styles: { display: 'flex', gap: '8px', width: '100%', maxWidth: '440px' }, content: [
      { id: v4(), type: 'container', name: 'Email Input', styles: { flex: '1', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', fontSize: '14px', color: '#9ca3af' }, content: [
        { id: v4(), type: 'text', name: 'Placeholder', styles: { fontSize: '14px', color: '#9ca3af' }, content: { innerText: 'Enter your email' } },
      ] as El[] },
      { id: v4(), type: 'button', name: 'Subscribe', styles: { padding: '12px 24px', backgroundColor: '#111827', color: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '8px', width: 'fit-content', whiteSpace: 'nowrap' }, content: { innerText: 'Subscribe', href: '#' } },
    ] as El[] },
    { id: v4(), type: 'text', name: 'Privacy', styles: { fontSize: '12px', color: '#9ca3af' }, content: { innerText: 'No spam. Unsubscribe anytime.' } },
  ] as El[] }) });

// ─── Announcement Bar ───────────────────────────────────
register({ type: 'announcementBar', name: 'Announcement Bar', icon: Bell, color: '#ef4444', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'announcementBar', name: 'Announcement Bar', styles: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '10px 24px', backgroundColor: '#111827', width: '100%' }, content: [
    { id: v4(), type: 'text', name: 'Text', styles: { fontSize: '13px', fontWeight: '500', color: '#ffffff' }, content: { innerText: '🎉 Free shipping on orders over $50 — Limited time offer!' } },
    { id: v4(), type: 'link', name: 'Link', styles: { fontSize: '13px', fontWeight: '600', color: '#ffffff', textDecoration: 'underline' }, content: { innerText: 'Shop Now →', href: '#' } },
  ] as El[] }) });

// ─── Search Bar ─────────────────────────────────────────
register({ type: 'searchBar', name: 'Search Bar', icon: Search, color: '#6b7280', group: 'Interactive', isContainer: true,
  factory: () => ({ id: v4(), type: 'searchBar', name: 'Search Bar', styles: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', width: '100%', maxWidth: '480px' }, content: [
    { id: v4(), type: 'icon', name: 'Search Icon', styles: { fontSize: '16px', color: '#9ca3af' }, content: { innerText: '🔍' } },
    { id: v4(), type: 'text', name: 'Placeholder', styles: { fontSize: '14px', color: '#9ca3af', flex: '1' }, content: { innerText: 'Search products...' } },
  ] as El[] }) });

// ─── Logo Cloud ─────────────────────────────────────────
register({ type: 'logoCloud', name: 'Logo Cloud', icon: Building2, color: '#6b7280', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'logoCloud', name: 'Logo Cloud', styles: { display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', padding: '48px 24px', width: '100%' }, content: [
    { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '13px', fontWeight: '600', color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase' }, content: { innerText: 'Trusted by leading brands' } },
    { id: v4(), type: 'container', name: 'Logos', styles: { display: 'flex', gap: '48px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', opacity: '0.4' }, content: [
      { id: v4(), type: 'text', name: 'Logo 1', styles: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }, content: { innerText: 'Acme Inc' } },
      { id: v4(), type: 'text', name: 'Logo 2', styles: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }, content: { innerText: 'Globex' } },
      { id: v4(), type: 'text', name: 'Logo 3', styles: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }, content: { innerText: 'Initech' } },
      { id: v4(), type: 'text', name: 'Logo 4', styles: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }, content: { innerText: 'Umbrella' } },
      { id: v4(), type: 'text', name: 'Logo 5', styles: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }, content: { innerText: 'Stark' } },
    ] as El[] },
  ] as El[] }) });

// ─── Breadcrumbs ────────────────────────────────────────
register({ type: 'breadcrumbs', name: 'Breadcrumbs', icon: Navigation2, color: '#6b7280', group: 'Navigation', isContainer: true,
  factory: () => ({ id: v4(), type: 'breadcrumbs', name: 'Breadcrumbs', styles: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', fontSize: '13px' }, content: [
    { id: v4(), type: 'link', name: 'Home', styles: { fontSize: '13px', color: '#6b7280', textDecoration: 'none' }, content: { innerText: 'Home', href: '#' } },
    { id: v4(), type: 'text', name: 'Sep', styles: { fontSize: '13px', color: '#d1d5db' }, content: { innerText: '/' } },
    { id: v4(), type: 'link', name: 'Category', styles: { fontSize: '13px', color: '#6b7280', textDecoration: 'none' }, content: { innerText: 'Category', href: '#' } },
    { id: v4(), type: 'text', name: 'Sep', styles: { fontSize: '13px', color: '#d1d5db' }, content: { innerText: '/' } },
    { id: v4(), type: 'text', name: 'Current', styles: { fontSize: '13px', color: '#111827', fontWeight: '500' }, content: { innerText: 'Product Name' } },
  ] as El[] }) });

// ─── Marquee / Ticker ───────────────────────────────────
register({ type: 'marquee', name: 'Marquee', icon: MoveHorizontal, color: '#8b5cf6', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'marquee', name: 'Marquee', styles: { display: 'flex', gap: '48px', alignItems: 'center', padding: '16px 0', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }, content: [
    { id: v4(), type: 'text', name: 'Item 1', styles: { fontSize: '14px', fontWeight: '600', color: '#6b7280', flexShrink: '0' }, content: { innerText: '✨ New Arrivals' } },
    { id: v4(), type: 'text', name: 'Item 2', styles: { fontSize: '14px', fontWeight: '600', color: '#6b7280', flexShrink: '0' }, content: { innerText: '🚚 Free Shipping Over $50' } },
    { id: v4(), type: 'text', name: 'Item 3', styles: { fontSize: '14px', fontWeight: '600', color: '#6b7280', flexShrink: '0' }, content: { innerText: '↩️ 30-Day Returns' } },
    { id: v4(), type: 'text', name: 'Item 4', styles: { fontSize: '14px', fontWeight: '600', color: '#6b7280', flexShrink: '0' }, content: { innerText: '🔒 Secure Checkout' } },
    { id: v4(), type: 'text', name: 'Item 5', styles: { fontSize: '14px', fontWeight: '600', color: '#6b7280', flexShrink: '0' }, content: { innerText: '⭐ 4.9/5 Rating' } },
  ] as El[] }) });

// ─── Collection Grid ────────────────────────────────────
register({ type: 'collectionGrid', name: 'Collection Grid', icon: ChevronRight, color: '#10b981', group: 'E-Commerce', isContainer: true,
  factory: () => {
    const col = (name: string) => ({
      id: v4(), type: 'container', name, styles: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }, content: [
        { id: v4(), type: 'container', name: 'Image', styles: { width: '100%', aspectRatio: '1', borderRadius: '16px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }, content: [
          { id: v4(), type: 'text', name: 'Emoji', styles: { fontSize: '32px' }, content: { innerText: '👕' } },
        ] as El[] },
        { id: v4(), type: 'text', name: 'Name', styles: { fontSize: '16px', fontWeight: '600' }, content: { innerText: name } },
        { id: v4(), type: 'text', name: 'Count', styles: { fontSize: '13px', color: '#6b7280' }, content: { innerText: '24 products' } },
      ] as El[] });
    return { id: v4(), type: 'collectionGrid', name: 'Collection Grid', styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', padding: '24px', width: '100%' }, content: [
      col('Clothing'), col('Accessories'), col('Footwear'), col('Electronics'),
    ] as El[] };
  } });
