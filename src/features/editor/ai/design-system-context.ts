/**
 * Design System Context for AI Content Generation
 * 
 * Extracts design tokens from global styles and creates context strings
 * for AI prompts to generate brand-consistent content.
 */

import type { GlobalStyles } from '@/features/editor/global-styles/types';

// ============================================================================
// TYPES
// ============================================================================

export interface DesignTokens {
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingScale;
  borderRadius: BorderRadius;
  buttonStyle: ButtonStyle;
  shadowIntensity: ShadowIntensity;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  fontSizes: {
    small: string;
    base: string;
    large: string;
    xl: string;
    xxl: string;
  };
}

export type SpacingScale = 'compact' | 'normal' | 'relaxed';
export type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full';
export type ButtonStyle = 'solid' | 'outline' | 'ghost';
export type ShadowIntensity = 'none' | 'subtle' | 'medium' | 'strong';

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Convert hex color to human-readable description
 */
export function getColorDescription(hex: string): string {
  if (!hex || !hex.startsWith('#')) return 'unknown';
  
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Calculate HSL for better color naming
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  
  // Lightness-based descriptions
  if (l < 0.15) return 'very dark (near black)';
  if (l > 0.85) return 'very light (near white)';
  
  // Determine dominant hue
  if (r > g && r > b) {
    if (g > b * 1.5) return l > 0.5 ? 'warm orange/yellow' : 'deep orange';
    return l > 0.5 ? 'soft red/coral' : 'deep red';
  }
  if (g > r && g > b) {
    if (b > r * 1.2) return l > 0.5 ? 'teal/cyan' : 'deep teal';
    return l > 0.5 ? 'fresh green' : 'deep green';
  }
  if (b > r && b > g) {
    if (r > g * 1.2) return l > 0.5 ? 'soft purple/violet' : 'deep purple';
    return l > 0.5 ? 'sky blue' : 'deep blue';
  }
  
  // Neutral colors
  if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
    if (l > 0.7) return 'light gray';
    if (l > 0.4) return 'medium gray';
    return 'dark gray';
  }
  
  return 'mixed tone';
}

/**
 * Infer brand tone from design tokens
 */
export function inferBrandTone(tokens: DesignTokens): string {
  const { colors, typography, spacing } = tokens;
  const tones: string[] = [];
  
  // Analyze primary color
  const primary = colors.primary.toLowerCase();
  if (primary.includes('blue') || primary.includes('#0') || primary.includes('#1') || primary.includes('#2')) {
    tones.push('professional', 'trustworthy');
  }
  if (primary.includes('green') || primary.includes('#2') || primary.includes('#3')) {
    tones.push('natural', 'eco-friendly');
  }
  if (primary.includes('red') || primary.includes('orange') || primary.includes('#f') || primary.includes('#e')) {
    tones.push('energetic', 'bold');
  }
  if (primary.includes('pink') || primary.includes('purple')) {
    tones.push('playful', 'creative');
  }
  
  // Analyze typography
  const headingFont = typography.headingFont.toLowerCase();
  if (headingFont.includes('serif') && !headingFont.includes('sans')) {
    tones.push('traditional', 'elegant');
  }
  if (headingFont.includes('mono')) {
    tones.push('technical', 'modern');
  }
  
  // Analyze spacing
  if (spacing === 'compact') {
    tones.push('efficient', 'dense');
  }
  if (spacing === 'relaxed') {
    tones.push('luxurious', 'spacious');
  }
  
  // Default tones
  if (tones.length === 0) {
    tones.push('modern', 'clean');
  }
  
  return tones.slice(0, 3).join(', ');
}

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract design tokens from GlobalStyles
 */
export function extractDesignTokens(globalStyles: GlobalStyles): DesignTokens {
  return {
    colors: {
      primary: globalStyles.colors?.primary || '#0066FF',
      secondary: globalStyles.colors?.secondary || '#6B7280',
      accent: globalStyles.colors?.accent || '#8B5CF6',
      background: globalStyles.colors?.background || '#FFFFFF',
      text: globalStyles.colors?.foreground || '#111827',
    },
    typography: {
      headingFont: globalStyles.typography?.fontFamily?.heading || 'Inter',
      bodyFont: globalStyles.typography?.fontFamily?.body || 'Inter',
      fontSizes: {
        small: globalStyles.typography?.scale?.sm || '12px',
        base: globalStyles.typography?.scale?.base || '14px',
        large: globalStyles.typography?.scale?.lg || '18px',
        xl: globalStyles.typography?.scale?.xl || '24px',
        xxl: globalStyles.typography?.scale?.['2xl'] || '32px',
      },
    },
    spacing: inferSpacingScale(globalStyles.spacing),
    borderRadius: inferBorderRadius(globalStyles.borderRadius),
    buttonStyle: 'solid', // Default, could be extended
    shadowIntensity: inferShadowIntensity(globalStyles.shadows),
  };
}

/**
 * Infer spacing scale from spacing config
 */
function inferSpacingScale(spacing?: GlobalStyles['spacing']): SpacingScale {
  if (!spacing) return 'normal';
  // Check if spacing values are compact or relaxed
  const mdValue = spacing.md || '16px';
  const numValue = parseInt(mdValue, 10);
  if (numValue < 12) return 'compact';
  if (numValue > 20) return 'relaxed';
  return 'normal';
}

/**
 * Infer border radius preference from config
 */
function inferBorderRadius(borderRadius?: GlobalStyles['borderRadius']): BorderRadius {
  if (!borderRadius) return 'medium';
  const mdValue = borderRadius.md || '6px';
  const numValue = parseInt(mdValue, 10);
  if (numValue === 0) return 'none';
  if (numValue <= 4) return 'small';
  if (numValue <= 8) return 'medium';
  if (numValue <= 16) return 'large';
  return 'full';
}

/**
 * Infer shadow intensity from config
 */
function inferShadowIntensity(shadows?: GlobalStyles['shadows']): ShadowIntensity {
  if (!shadows) return 'subtle';
  const mdValue = shadows.md || '';
  if (!mdValue || mdValue === 'none') return 'none';
  if (mdValue.includes('0.05') || mdValue.includes('1px')) return 'subtle';
  if (mdValue.includes('0.15') || mdValue.includes('4px')) return 'medium';
  return 'strong';
}

/**
 * Generate content guidelines based on design tokens
 */
export function getContentGuidelines(tokens: DesignTokens): string[] {
  const guidelines: string[] = [];
  
  // Color-based guidelines
  const primaryDesc = getColorDescription(tokens.colors.primary);
  if (primaryDesc.includes('blue')) {
    guidelines.push('Use professional, trustworthy language');
  }
  if (primaryDesc.includes('green')) {
    guidelines.push('Emphasize sustainability and natural qualities');
  }
  if (primaryDesc.includes('red') || primaryDesc.includes('orange')) {
    guidelines.push('Use energetic, action-oriented language');
  }
  
  // Spacing-based guidelines
  if (tokens.spacing === 'compact') {
    guidelines.push('Keep text concise and scannable');
  }
  if (tokens.spacing === 'relaxed') {
    guidelines.push('Allow for more descriptive, flowing text');
  }
  
  // Typography-based guidelines
  if (tokens.typography.headingFont !== tokens.typography.bodyFont) {
    guidelines.push('Create clear hierarchy between headings and body text');
  }
  
  // Default guidelines
  guidelines.push('Match the brand\'s visual identity in tone');
  guidelines.push('Use language appropriate for the target audience');
  
  return guidelines;
}

// ============================================================================
// MAIN CONTEXT GENERATOR
// ============================================================================

/**
 * Generate a comprehensive design system context string for AI prompts
 */
export function getDesignSystemContext(globalStyles: GlobalStyles): string {
  const tokens = extractDesignTokens(globalStyles);
  const brandTone = inferBrandTone(tokens);
  const guidelines = getContentGuidelines(tokens);
  
  const sections: string[] = [];
  
  // Color palette section
  sections.push(`DESIGN SYSTEM CONTEXT:
- Color Palette: Primary color is ${tokens.colors.primary} (${getColorDescription(tokens.colors.primary)}), secondary is ${tokens.colors.secondary} (${getColorDescription(tokens.colors.secondary)}), accent is ${tokens.colors.accent} (${getColorDescription(tokens.colors.accent)}).`);
  
  // Typography section
  sections.push(`- Typography: Headings use ${tokens.typography.headingFont} font family, body text uses ${tokens.typography.bodyFont}. Base font size is ${tokens.typography.fontSizes.base}.`);
  
  // Spacing and layout section
  sections.push(`- Spacing & Layout: The design uses ${tokens.spacing} spacing with ${tokens.borderRadius} border radius. Shadows are ${tokens.shadowIntensity} intensity.`);
  
  // Visual style section
  sections.push(`- Visual Style: Buttons are ${tokens.buttonStyle} style. The overall brand tone is ${brandTone}.`);
  
  // Content guidelines section
  sections.push(`
CONTENT GUIDELINES:
${guidelines.map(g => `- ${g}`).join('\n')}`);
  
  return sections.join('\n');
}

/**
 * Get a brief design context for shorter prompts
 */
export function getBriefDesignContext(globalStyles: GlobalStyles): string {
  const tokens = extractDesignTokens(globalStyles);
  const brandTone = inferBrandTone(tokens);
  
  return `Brand style: ${brandTone}. Primary color: ${getColorDescription(tokens.colors.primary)}. Typography: ${tokens.typography.headingFont}/${tokens.typography.bodyFont}. Spacing: ${tokens.spacing}.`;
}
