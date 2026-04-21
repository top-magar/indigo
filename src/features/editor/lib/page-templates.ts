import { v4 } from 'uuid';
import type { El } from '../core/types';

type PageTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  factory: () => El[];
};

const body = (children: El[]): El[] => [{
  id: v4(), type: '__body', name: 'Body',
  styles: { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' },
  content: children,
}];

const t = (name: string, text: string, styles: React.CSSProperties = {}): El => ({
  id: v4(), type: 'text', name, styles: { fontSize: '16px', ...styles }, content: { innerText: text },
});

const box = (name: string, styles: React.CSSProperties, children: El[]): El => ({
  id: v4(), type: 'container', name, styles: { display: 'flex', ...styles }, content: children,
});

const section = (name: string, children: El[], styles: React.CSSProperties = {}): El =>
  box(name, { flexDirection: 'column', gap: '16px', padding: '64px 24px', maxWidth: '960px', margin: '0 auto', width: '100%', ...styles }, children);

const heading = (text: string, size = '36px'): El =>
  t('Title', text, { fontSize: size, fontWeight: '800', lineHeight: '1.2' });

const sub = (text: string): El =>
  t('Subtitle', text, { fontSize: '18px', color: '#6b7280', lineHeight: '1.6' });

const card = (name: string, children: El[], styles: React.CSSProperties = {}): El =>
  box(name, { flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', ...styles }, children);

const btn = (text: string, styles: React.CSSProperties = {}): El => ({
  id: v4(), type: 'button', name: 'Button',
  styles: { padding: '14px 36px', backgroundColor: '#10b981', color: '#ffffff', fontSize: '16px', fontWeight: '600', borderRadius: '8px', width: 'fit-content', ...styles },
  content: { innerText: text, href: '#' },
});

const img = (alt: string, h = '200px'): El => ({
  id: v4(), type: 'image', name: alt,
  styles: { width: '100%', height: h, objectFit: 'cover', backgroundColor: '#f3f4f6', borderRadius: '8px' },
  content: { src: '', alt },
});

const grid = (name: string, cols: string, children: El[], gap = '24px'): El => ({
  id: v4(), type: 'container', name,
  styles: { display: 'grid', gridTemplateColumns: cols, gap, width: '100%' },
  content: children,
});

// ─── Templates ──────────────────────────────────────────

const blank = (): El[] => body([]);

const aboutUs = (): El[] => body([
  section('About Section', [
    heading('About Us'),
    sub('We believe great things happen when passionate people come together with a shared purpose.'),
    t('Story', 'Founded in 2020, we set out to solve a simple problem: making quality products accessible to everyone. What started as a small team of three has grown into a thriving community of creators, thinkers, and doers.', { lineHeight: '1.8', color: '#4b5563' }),
  ]),
  section('Mission', [
    t('Label', 'Our Mission', { fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981' }),
    t('Mission Text', 'To empower individuals and businesses with tools and products that make a real difference — built with integrity, delivered with care.', { fontSize: '20px', fontWeight: '600', lineHeight: '1.6' }),
  ]),
  section('Team', [
    heading('Meet the Team', '28px'),
    grid('Team Grid', 'repeat(3, 1fr)', [
      card('Member 1', [img('Photo', '180px'), t('Name', 'Alex Rivera', { fontWeight: '700', fontSize: '18px' }), t('Role', 'CEO & Founder', { color: '#6b7280', fontSize: '14px' })]),
      card('Member 2', [img('Photo', '180px'), t('Name', 'Jordan Lee', { fontWeight: '700', fontSize: '18px' }), t('Role', 'Head of Design', { color: '#6b7280', fontSize: '14px' })]),
      card('Member 3', [img('Photo', '180px'), t('Name', 'Sam Chen', { fontWeight: '700', fontSize: '18px' }), t('Role', 'Lead Engineer', { color: '#6b7280', fontSize: '14px' })]),
    ]),
  ]),
]);

const contact = (): El[] => body([
  section('Contact Section', [
    heading('Get in Touch'),
    sub('We\'d love to hear from you. Reach out and we\'ll get back to you within 24 hours.'),
    grid('Contact Grid', 'repeat(2, 1fr)', [
      card('Email', [t('Icon', '📧', { fontSize: '28px' }), t('Label', 'Email', { fontWeight: '700' }), t('Value', 'hello@yourcompany.com', { color: '#6b7280' })]),
      card('Phone', [t('Icon', '📞', { fontSize: '28px' }), t('Label', 'Phone', { fontWeight: '700' }), t('Value', '+1 (555) 123-4567', { color: '#6b7280' })]),
      card('Address', [t('Icon', '📍', { fontSize: '28px' }), t('Label', 'Address', { fontWeight: '700' }), t('Value', '123 Main Street, Suite 100\nSan Francisco, CA 94102', { color: '#6b7280', whiteSpace: 'pre-line' })]),
      card('Hours', [t('Icon', '🕐', { fontSize: '28px' }), t('Label', 'Business Hours', { fontWeight: '700' }), t('Value', 'Mon–Fri: 9am – 6pm\nSat: 10am – 4pm\nSun: Closed', { color: '#6b7280', whiteSpace: 'pre-line' })]),
    ]),
  ]),
]);

const services = (): El[] => body([
  section('Services Section', [
    heading('Our Services'),
    sub('Everything you need to grow your business, all in one place.'),
    grid('Services Grid', 'repeat(3, 1fr)', [
      card('Service 1', [t('Icon', '🎨', { fontSize: '32px' }), t('Name', 'Brand Design', { fontWeight: '700', fontSize: '20px' }), t('Desc', 'Complete visual identity including logo, color palette, typography, and brand guidelines.', { color: '#6b7280', lineHeight: '1.6' })]),
      card('Service 2', [t('Icon', '💻', { fontSize: '32px' }), t('Name', 'Web Development', { fontWeight: '700', fontSize: '20px' }), t('Desc', 'Custom websites built for performance, accessibility, and conversion. From landing pages to full platforms.', { color: '#6b7280', lineHeight: '1.6' })]),
      card('Service 3', [t('Icon', '📈', { fontSize: '32px' }), t('Name', 'Growth Strategy', { fontWeight: '700', fontSize: '20px' }), t('Desc', 'Data-driven marketing strategies to reach your audience and scale your business sustainably.', { color: '#6b7280', lineHeight: '1.6' })]),
    ]),
  ]),
]);

const faq = (): El[] => body([
  section('FAQ Section', [
    heading('Frequently Asked Questions'),
    sub('Find answers to the most common questions below.'),
    ...[
      ['What is your return policy?', 'We offer a 30-day money-back guarantee on all purchases. If you\'re not satisfied, simply contact our support team and we\'ll process your refund within 3–5 business days.'],
      ['How long does shipping take?', 'Standard shipping takes 5–7 business days. Express shipping is available for 2–3 business day delivery. Free shipping on all orders over $50.'],
      ['Do you offer customer support?', 'Yes! Our support team is available Monday through Friday, 9am to 6pm EST via email, phone, and live chat. We typically respond within 2 hours.'],
      ['Can I change or cancel my order?', 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and changes may not be possible.'],
      ['Do you ship internationally?', 'We currently ship to the US, Canada, UK, and EU countries. International shipping typically takes 10–14 business days. Customs fees may apply.'],
    ].map(([q, a], i) =>
      card(`Q${i + 1}`, [
        t('Question', q, { fontWeight: '700', fontSize: '18px' }),
        t('Answer', a, { color: '#6b7280', lineHeight: '1.7' }),
      ], { gap: '8px' })
    ),
  ]),
]);

const testimonials = (): El[] => body([
  section('Testimonials Section', [
    heading('What Our Customers Say'),
    sub('Don\'t just take our word for it — hear from people who love our products.'),
    grid('Reviews Grid', 'repeat(3, 1fr)', [
      card('Review 1', [
        t('Stars', '★★★★★', { color: '#f59e0b', fontSize: '20px' }),
        t('Quote', '"Absolutely love the quality. I\'ve ordered three times now and every product has exceeded my expectations. The customer service is top-notch too."', { lineHeight: '1.7', color: '#374151', fontStyle: 'italic' }),
        t('Author', '— Sarah M., Portland', { fontWeight: '600', fontSize: '14px', color: '#6b7280' }),
      ]),
      card('Review 2', [
        t('Stars', '★★★★★', { color: '#f59e0b', fontSize: '20px' }),
        t('Quote', '"Fast shipping, great packaging, and the product was exactly as described. This is my go-to store now. Highly recommend to anyone looking for quality."', { lineHeight: '1.7', color: '#374151', fontStyle: 'italic' }),
        t('Author', '— James K., Austin', { fontWeight: '600', fontSize: '14px', color: '#6b7280' }),
      ]),
      card('Review 3', [
        t('Stars', '★★★★★', { color: '#f59e0b', fontSize: '20px' }),
        t('Quote', '"I was skeptical at first, but the 30-day guarantee gave me confidence. Turns out I didn\'t need it — the product is fantastic and I\'m already planning my next order."', { lineHeight: '1.7', color: '#374151', fontStyle: 'italic' }),
        t('Author', '— Maria L., Denver', { fontWeight: '600', fontSize: '14px', color: '#6b7280' }),
      ]),
    ]),
  ]),
]);

const pricing = (): El[] => body([
  section('Pricing Section', [
    heading('Simple, Transparent Pricing'),
    sub('No hidden fees. Choose the plan that works for you.'),
    grid('Pricing Grid', 'repeat(3, 1fr)', [
      card('Starter', [
        t('Plan', 'Starter', { fontWeight: '700', fontSize: '20px' }),
        t('Price', '$9/mo', { fontSize: '36px', fontWeight: '800' }),
        t('Desc', 'Perfect for individuals just getting started.', { color: '#6b7280', fontSize: '14px' }),
        t('F1', '✓ 1 project', { fontSize: '14px' }),
        t('F2', '✓ 5 GB storage', { fontSize: '14px' }),
        t('F3', '✓ Email support', { fontSize: '14px' }),
        t('F4', '✗ Custom domain', { fontSize: '14px', color: '#d1d5db' }),
        btn('Get Started'),
      ]),
      card('Pro', [
        t('Badge', 'Most Popular', { fontSize: '12px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }),
        t('Plan', 'Pro', { fontWeight: '700', fontSize: '20px' }),
        t('Price', '$29/mo', { fontSize: '36px', fontWeight: '800' }),
        t('Desc', 'For growing teams that need more power.', { color: '#6b7280', fontSize: '14px' }),
        t('F1', '✓ 10 projects', { fontSize: '14px' }),
        t('F2', '✓ 50 GB storage', { fontSize: '14px' }),
        t('F3', '✓ Priority support', { fontSize: '14px' }),
        t('F4', '✓ Custom domain', { fontSize: '14px' }),
        btn('Get Started'),
      ], { border: '2px solid #10b981' }),
      card('Enterprise', [
        t('Plan', 'Enterprise', { fontWeight: '700', fontSize: '20px' }),
        t('Price', '$99/mo', { fontSize: '36px', fontWeight: '800' }),
        t('Desc', 'For large organizations with advanced needs.', { color: '#6b7280', fontSize: '14px' }),
        t('F1', '✓ Unlimited projects', { fontSize: '14px' }),
        t('F2', '✓ 500 GB storage', { fontSize: '14px' }),
        t('F3', '✓ 24/7 phone support', { fontSize: '14px' }),
        t('F4', '✓ SSO & audit logs', { fontSize: '14px' }),
        btn('Contact Sales'),
      ]),
    ]),
  ]),
]);

const portfolio = (): El[] => body([
  section('Portfolio Section', [
    heading('Our Work'),
    sub('A selection of projects we\'re proud of.'),
    grid('Gallery Grid', 'repeat(3, 1fr)', [
      ...['Brand Identity Redesign', 'E-Commerce Platform', 'Mobile App UI', 'Marketing Campaign', 'Product Photography', 'Website Redesign'].map(name =>
        box(name, { flexDirection: 'column', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', backgroundColor: '#ffffff' }, [
          img(name, '220px'),
          box('Info', { flexDirection: 'column', gap: '4px', padding: '16px' }, [
            t('Title', name, { fontWeight: '700' }),
            t('Category', 'Design & Development', { fontSize: '13px', color: '#6b7280' }),
          ]),
        ])
      ),
    ]),
  ]),
]);

const landingPage = (): El[] => body([
  // Hero
  box('Hero', { flexDirection: 'column', gap: '24px', alignItems: 'center', padding: '96px 24px', textAlign: 'center', width: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }, [
    t('Title', 'Build Something Amazing', { fontSize: '56px', fontWeight: '800', lineHeight: '1.1', color: '#ffffff', maxWidth: '700px' }),
    t('Subtitle', 'The all-in-one platform that helps you launch faster, grow smarter, and scale with confidence.', { fontSize: '20px', color: '#94a3b8', maxWidth: '540px', lineHeight: '1.6' }),
    box('CTA Row', { gap: '16px', justifyContent: 'center' }, [
      btn('Start Free Trial'),
      btn('Watch Demo', { backgroundColor: 'transparent', border: '2px solid #ffffff', color: '#ffffff' }),
    ]),
  ]),
  // Features
  section('Features', [
    t('Label', 'Features', { fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981', textAlign: 'center' }),
    t('Heading', 'Everything You Need', { fontSize: '32px', fontWeight: '800', textAlign: 'center' }),
    grid('Features Grid', 'repeat(3, 1fr)', [
      card('Feature 1', [t('Icon', '⚡', { fontSize: '28px' }), t('Name', 'Lightning Fast', { fontWeight: '700', fontSize: '18px' }), t('Desc', 'Optimized for speed with sub-second load times and instant interactions.', { color: '#6b7280', lineHeight: '1.6' })]),
      card('Feature 2', [t('Icon', '🔒', { fontSize: '28px' }), t('Name', 'Secure by Default', { fontWeight: '700', fontSize: '18px' }), t('Desc', 'Enterprise-grade security with encryption, SSO, and compliance built in.', { color: '#6b7280', lineHeight: '1.6' })]),
      card('Feature 3', [t('Icon', '🔌', { fontSize: '28px' }), t('Name', 'Easy Integrations', { fontWeight: '700', fontSize: '18px' }), t('Desc', 'Connect with 100+ tools you already use. Set up in minutes, not days.', { color: '#6b7280', lineHeight: '1.6' })]),
    ]),
  ]),
  // Social Proof
  section('Social Proof', [
    t('Stat', '10,000+ teams trust us', { fontSize: '28px', fontWeight: '800', textAlign: 'center' }),
    grid('Logos', 'repeat(4, 1fr)', [
      t('Logo 1', 'Acme Corp', { fontSize: '18px', fontWeight: '700', color: '#d1d5db', textAlign: 'center' }),
      t('Logo 2', 'Globex Inc', { fontSize: '18px', fontWeight: '700', color: '#d1d5db', textAlign: 'center' }),
      t('Logo 3', 'Initech', { fontSize: '18px', fontWeight: '700', color: '#d1d5db', textAlign: 'center' }),
      t('Logo 4', 'Umbrella Co', { fontSize: '18px', fontWeight: '700', color: '#d1d5db', textAlign: 'center' }),
    ]),
  ], { textAlign: 'center', padding: '48px 24px', backgroundColor: '#f8fafc' }),
  // Final CTA
  box('Final CTA', { flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '80px 24px', textAlign: 'center', width: '100%' }, [
    t('Heading', 'Ready to Get Started?', { fontSize: '36px', fontWeight: '800' }),
    t('Sub', 'Join thousands of teams already using our platform.', { color: '#6b7280', fontSize: '18px' }),
    btn('Start Your Free Trial'),
  ]),
]);

const shop = (): El[] => body([
  section('Shop Header', [
    heading('All Products'),
    sub('Browse our full collection of handpicked items.'),
  ]),
  {
    id: v4(), type: 'container', name: 'Product Grid',
    styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', padding: '0 24px 64px', maxWidth: '960px', margin: '0 auto', width: '100%' },
    content: [
      ['Classic T-Shirt', '$29.99'], ['Denim Jacket', '$89.99'], ['Running Shoes', '$119.99'], ['Leather Bag', '$149.99'],
      ['Sunglasses', '$59.99'], ['Watch', '$199.99'], ['Hoodie', '$49.99'], ['Backpack', '$79.99'],
    ].map(([name, price]) =>
      box(name, { flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#ffffff' }, [
        img(name, '200px'),
        box('Info', { flexDirection: 'column', gap: '4px', padding: '12px' }, [
          t('Name', name, { fontWeight: '600', fontSize: '14px' }),
          t('Price', price, { fontSize: '16px', fontWeight: '700', color: '#10b981' }),
        ]),
      ])
    ),
  },
]);

// ─── Export ──────────────────────────────────────────────

export const pageTemplates: PageTemplate[] = [
  { id: 'blank', name: 'Blank', icon: 'File', description: 'Empty page', factory: blank },
  { id: 'about', name: 'About Us', icon: 'Users', description: 'Story, mission, and team', factory: aboutUs },
  { id: 'contact', name: 'Contact', icon: 'Mail', description: 'Email, phone, address, hours', factory: contact },
  { id: 'services', name: 'Services', icon: 'Briefcase', description: '3-column service cards', factory: services },
  { id: 'faq', name: 'FAQ', icon: 'HelpCircle', description: 'Accordion with 5 questions', factory: faq },
  { id: 'testimonials', name: 'Testimonials', icon: 'MessageSquare', description: '3 customer reviews', factory: testimonials },
  { id: 'pricing', name: 'Pricing', icon: 'CreditCard', description: '3-tier pricing table', factory: pricing },
  { id: 'portfolio', name: 'Portfolio', icon: 'Image', description: 'Image grid gallery', factory: portfolio },
  { id: 'landing', name: 'Landing Page', icon: 'Rocket', description: 'Hero + CTA + features + social proof', factory: landingPage },
  { id: 'shop', name: 'Shop', icon: 'ShoppingBag', description: 'Product grid with header', factory: shop },
];
