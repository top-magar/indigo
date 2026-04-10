import type { Meta, StoryObj } from "@storybook/react";
import { withCraftEditor } from "./craft-decorator";
import { TextBlock } from "../blocks/text";
import { HeroBlock } from "../blocks/hero";
import { ButtonBlock } from "../blocks/button";
import { ImageBlock } from "../blocks/image";
import { DividerBlock } from "../blocks/divider";
import { FaqBlock } from "../blocks/faq";
import { TestimonialsBlock } from "../blocks/testimonials";
import { NewsletterBlock } from "../blocks/newsletter";
import { RichTextBlock } from "../blocks/rich-text";
import { CountdownBlock } from "../blocks/countdown";

const meta: Meta = { title: "Editor/Blocks", decorators: [withCraftEditor] };
export default meta;

export const Text: StoryObj = {
  render: () => <TextBlock text="Edit this text" fontSize={16} fontWeight={400} color="#000000" alignment="left" tagName="p" lineHeight={1.6} letterSpacing={0} maxWidth={0} textTransform="none" opacity={100} />,
};

export const Hero: StoryObj = {
  render: () => <HeroBlock variant="full" heading="Welcome to our store" subheading="Discover amazing products crafted just for you" ctaText="Shop Now" ctaHref="/products" ctaStyle="solid" ctaColor="#ffffff" ctaBackground="#000000" secondCtaText="" secondCtaHref="" backgroundImage="" backgroundColor="#1a1a2e" backgroundPosition="center" textColor="#ffffff" overlayOpacity={40} minHeight={500} contentPosition="center" headingSize={48} subheadingSize={20} paddingTop={64} paddingBottom={64} contentMaxWidth={600} showBadge={false} badgeText="New" />,
};

export const Button: StoryObj = {
  render: () => <ButtonBlock text="Click me" href="#" variant="solid" size="md" fullWidth={false} alignment="left" backgroundColor="" textColor="" borderRadius={8} shadow="none" icon="" iconPosition="right" openInNewTab={false} />,
};

export const Image: StoryObj = {
  render: () => <ImageBlock src="" alt="" objectFit="cover" borderRadius={8} maxHeight={400} width="full" alignment="center" shadow="none" hoverEffect="none" caption="" linkUrl="" aspectRatio="" />,
};

export const Divider: StoryObj = {
  render: () => <DividerBlock _v={1} height={48} showLine={true} lineStyle="solid" lineColor="#e5e7eb" lineWidth={1} maxWidth={0} />,
};

const faqItems = JSON.stringify([
  { question: "What is your return policy?", answer: "We offer a 30-day return policy on all items." },
  { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days within Nepal." },
  { question: "Do you offer international shipping?", answer: "Currently we only ship within Nepal." },
]);

export const Faq: StoryObj = {
  render: () => <FaqBlock heading="Frequently Asked Questions" subheading="" items={faqItems} variant="accordion" backgroundColor="" textColor="" accentColor="#3b82f6" paddingTop={48} paddingBottom={48} />,
};

const testimonialItems = JSON.stringify([
  { quote: "Amazing quality and fast shipping!", author: "Sarah M.", role: "Verified Buyer", rating: 5, avatarUrl: "" },
  { quote: "Best purchase I've made this year.", author: "James K.", role: "Verified Buyer", rating: 5, avatarUrl: "" },
  { quote: "Great customer service and beautiful products.", author: "Emily R.", role: "Verified Buyer", rating: 4, avatarUrl: "" },
]);

export const Testimonials: StoryObj = {
  render: () => <TestimonialsBlock heading="What Our Customers Say" subheading="" items={testimonialItems} columns={3} variant="cards" showRating={true} showAvatar={true} cardStyle="bordered" backgroundColor="" cardBackgroundColor="#ffffff" accentColor="#f59e0b" paddingTop={48} paddingBottom={48} />,
};

export const Newsletter: StoryObj = {
  render: () => <NewsletterBlock heading="Stay in the loop" subheading="Get updates on new products and exclusive offers." buttonText="Subscribe" variant="stacked" backgroundColor="" textColor="" buttonColor="#000000" buttonTextColor="#ffffff" paddingTop={48} paddingBottom={48} maxWidth={600} showName={false} placeholderText="Enter your email" />,
};

export const RichText: StoryObj = {
  render: () => <RichTextBlock content="<h2>About Us</h2><p>Write your story here. This block supports <strong>bold</strong>, <em>italic</em>, and <a href='#'>links</a>.</p>" maxWidth={700} alignment="left" backgroundColor="" textColor="" fontSize={16} lineHeight={1.7} paddingTop={32} paddingBottom={32} paddingX={24} />,
};

export const Countdown: StoryObj = {
  render: () => <CountdownBlock targetDate={new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 19)} heading="Sale Ends In" expiredText="This offer has expired" variant="card" backgroundColor="#0f172a" textColor="#ffffff" accentColor="#ef4444" paddingTop={48} paddingBottom={48} />,
};
