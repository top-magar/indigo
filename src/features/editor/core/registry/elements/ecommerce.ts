import { v4 } from 'uuid';
import { ShoppingCart, Package, Star, Tag, CreditCard, Truck, BadgePercent, Store } from 'lucide-react';
import { register } from '../types';
import type { El } from '../../types';

// ─── Product Card ───────────────────────────────────────
register({ type: 'productCard', name: 'Product Card', icon: Package, color: '#10b981', group: 'E-Commerce', isContainer: true,
  factory: () => ({ id: v4(), type: 'productCard', name: 'Product Card', styles: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#ffffff' }, content: [
    { id: v4(), type: 'image', name: 'Product Image', styles: { width: '100%', height: '280px', objectFit: 'cover', backgroundColor: '#f3f4f6' }, content: { src: '', alt: 'Product' } },
    { id: v4(), type: 'container', name: 'Card Body', styles: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }, content: [
      { id: v4(), type: 'text', name: 'Product Name', styles: { fontSize: '16px', fontWeight: '600', color: '#111827' }, content: { innerText: 'Product Name' } },
      { id: v4(), type: 'text', name: 'Price', styles: { fontSize: '18px', fontWeight: '700', color: '#10b981' }, content: { innerText: '$49.99' } },
      { id: v4(), type: 'button', name: 'Add to Cart', styles: { padding: '10px 20px', backgroundColor: '#111827', color: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '8px', textAlign: 'center', width: '100%' }, content: { innerText: 'Add to Cart', href: '#' } },
    ] as El[] },
  ] as El[] }) });

// ─── Product Grid ───────────────────────────────────────
register({ type: 'productGrid', name: 'Product Grid', icon: Store, color: '#10b981', group: 'E-Commerce', isContainer: true,
  factory: () => {
    const card = (name: string, price: string) => ({
      id: v4(), type: 'container', name, styles: { display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#ffffff' }, content: [
        { id: v4(), type: 'image', name: 'Image', styles: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#f3f4f6' }, content: { src: '', alt: name } },
        { id: v4(), type: 'container', name: 'Info', styles: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px' }, content: [
          { id: v4(), type: 'text', name: 'Name', styles: { fontSize: '14px', fontWeight: '600', color: '#111827' }, content: { innerText: name } },
          { id: v4(), type: 'text', name: 'Price', styles: { fontSize: '16px', fontWeight: '700', color: '#10b981' }, content: { innerText: price } },
        ] as El[] },
      ] as El[] });
    return { id: v4(), type: 'productGrid', name: 'Product Grid', styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', padding: '24px', width: '100%' }, content: [
      card('Classic T-Shirt', '$29.99'), card('Denim Jacket', '$89.99'), card('Running Shoes', '$119.99'), card('Leather Bag', '$149.99'),
    ] as El[] };
  } });

// ─── Price Tag ──────────────────────────────────────────
register({ type: 'priceTag', name: 'Price Tag', icon: Tag, color: '#10b981', group: 'E-Commerce', isContainer: true,
  factory: () => ({ id: v4(), type: 'priceTag', name: 'Price Tag', styles: { display: 'flex', alignItems: 'baseline', gap: '8px' }, content: [
    { id: v4(), type: 'text', name: 'Sale Price', styles: { fontSize: '28px', fontWeight: '800', color: '#10b981' }, content: { innerText: '$39.99' } },
    { id: v4(), type: 'text', name: 'Original Price', styles: { fontSize: '16px', fontWeight: '400', color: '#9ca3af', textDecoration: 'line-through' }, content: { innerText: '$59.99' } },
    { id: v4(), type: 'badge', name: 'Discount', styles: { display: 'inline-block', padding: '4px 10px', fontSize: '11px', fontWeight: '700', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '100px' }, content: { innerText: '-33%' } },
  ] as El[] }) });

// ─── Star Rating ────────────────────────────────────────
register({ type: 'starRating', name: 'Star Rating', icon: Star, color: '#f59e0b', group: 'E-Commerce', isContainer: false,
  factory: () => ({ id: v4(), type: 'starRating', name: 'Star Rating', styles: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#f59e0b' }, content: { rating: '4.5', reviews: '128' } }) });

// ─── Add to Cart Button ─────────────────────────────────
register({ type: 'cartButton', name: 'Cart Button', icon: ShoppingCart, color: '#10b981', group: 'E-Commerce', isContainer: false,
  factory: () => ({ id: v4(), type: 'cartButton', name: 'Add to Cart', styles: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 32px', backgroundColor: '#111827', color: '#ffffff', fontSize: '15px', fontWeight: '600', borderRadius: '8px', width: 'fit-content', cursor: 'pointer' }, content: { innerText: 'Add to Cart' } }) });

// ─── Promo Banner ───────────────────────────────────────
register({ type: 'promoBanner', name: 'Promo Banner', icon: BadgePercent, color: '#ef4444', group: 'E-Commerce', isContainer: true,
  factory: () => ({ id: v4(), type: 'promoBanner', name: 'Promo Banner', styles: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px 24px', backgroundColor: '#111827', width: '100%' }, content: [
    { id: v4(), type: 'text', name: 'Promo Text', styles: { fontSize: '14px', fontWeight: '600', color: '#ffffff' }, content: { innerText: '🔥 Summer Sale — Up to 50% off everything' } },
    { id: v4(), type: 'button', name: 'Shop Now', styles: { padding: '8px 20px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '13px', fontWeight: '600', borderRadius: '6px', width: 'fit-content' }, content: { innerText: 'Shop Now', href: '#' } },
  ] as El[] }) });

// ─── Shipping Info ──────────────────────────────────────
register({ type: 'shippingInfo', name: 'Shipping Info', icon: Truck, color: '#6366f1', group: 'E-Commerce', isContainer: true,
  factory: () => ({ id: v4(), type: 'shippingInfo', name: 'Shipping Info', styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '24px', width: '100%' }, content: [
    { id: v4(), type: 'container', name: 'Free Shipping', styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }, content: [
      { id: v4(), type: 'text', name: 'Icon', styles: { fontSize: '24px' }, content: { innerText: '🚚' } },
      { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '14px', fontWeight: '600', color: '#111827' }, content: { innerText: 'Free Shipping' } },
      { id: v4(), type: 'text', name: 'Desc', styles: { fontSize: '12px', color: '#6b7280' }, content: { innerText: 'On orders over $50' } },
    ] as El[] },
    { id: v4(), type: 'container', name: 'Easy Returns', styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }, content: [
      { id: v4(), type: 'text', name: 'Icon', styles: { fontSize: '24px' }, content: { innerText: '↩️' } },
      { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '14px', fontWeight: '600', color: '#111827' }, content: { innerText: '30-Day Returns' } },
      { id: v4(), type: 'text', name: 'Desc', styles: { fontSize: '12px', color: '#6b7280' }, content: { innerText: 'Hassle-free returns' } },
    ] as El[] },
    { id: v4(), type: 'container', name: 'Secure Payment', styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }, content: [
      { id: v4(), type: 'text', name: 'Icon', styles: { fontSize: '24px' }, content: { innerText: '🔒' } },
      { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '14px', fontWeight: '600', color: '#111827' }, content: { innerText: 'Secure Payment' } },
      { id: v4(), type: 'text', name: 'Desc', styles: { fontSize: '12px', color: '#6b7280' }, content: { innerText: 'SSL encrypted checkout' } },
    ] as El[] },
  ] as El[] }) });

// ─── Checkout Summary ───────────────────────────────────
register({ type: 'checkoutSummary', name: 'Order Summary', icon: CreditCard, color: '#6366f1', group: 'E-Commerce', isContainer: true,
  factory: () => ({ id: v4(), type: 'checkoutSummary', name: 'Order Summary', styles: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', width: '100%', maxWidth: '420px' }, content: [
    { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '18px', fontWeight: '700', color: '#111827', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }, content: { innerText: 'Order Summary' } },
    { id: v4(), type: 'container', name: 'Line Item', styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, content: [
      { id: v4(), type: 'text', name: 'Item', styles: { fontSize: '14px', color: '#374151' }, content: { innerText: 'Classic T-Shirt × 2' } },
      { id: v4(), type: 'text', name: 'Price', styles: { fontSize: '14px', fontWeight: '600', color: '#111827' }, content: { innerText: '$59.98' } },
    ] as El[] },
    { id: v4(), type: 'container', name: 'Shipping', styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, content: [
      { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '14px', color: '#374151' }, content: { innerText: 'Shipping' } },
      { id: v4(), type: 'text', name: 'Value', styles: { fontSize: '14px', fontWeight: '600', color: '#10b981' }, content: { innerText: 'Free' } },
    ] as El[] },
    { id: v4(), type: 'container', name: 'Total', styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }, content: [
      { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '16px', fontWeight: '700', color: '#111827' }, content: { innerText: 'Total' } },
      { id: v4(), type: 'text', name: 'Value', styles: { fontSize: '20px', fontWeight: '800', color: '#111827' }, content: { innerText: '$59.98' } },
    ] as El[] },
    { id: v4(), type: 'button', name: 'Checkout', styles: { padding: '14px 32px', backgroundColor: '#10b981', color: '#ffffff', fontSize: '15px', fontWeight: '700', borderRadius: '8px', textAlign: 'center', width: '100%' }, content: { innerText: 'Proceed to Checkout', href: '#' } },
  ] as El[] }) });
