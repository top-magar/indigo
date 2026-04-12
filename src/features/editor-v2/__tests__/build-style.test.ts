import { describe, it, expect } from 'vitest'
import { buildSectionStyle, mergePropsForViewport, getStyleProp, SHADOW_MAP } from '../build-style'

describe('buildSectionStyle', () => {
  it('returns object for empty props', () => {
    const style = buildSectionStyle({}, 'desktop')
    expect(style).toBeDefined()
    expect(typeof style).toBe('object')
  })

  it('maps padding props as numbers', () => {
    const style = buildSectionStyle({ _paddingTop: 16, _paddingRight: 8 }, 'desktop')
    expect(style.paddingTop).toBe(16)
    expect(style.paddingRight).toBe(8)
  })

  it('maps background color', () => {
    const style = buildSectionStyle({ _backgroundColor: '#ff0000' }, 'desktop')
    expect(style.backgroundColor).toBe('#ff0000')
  })

  it('omits backgroundColor when gradient is set', () => {
    const style = buildSectionStyle({ _backgroundColor: '#ff0000', _gradient: 'linear', _gradientFrom: '#000', _gradientTo: '#fff' }, 'desktop')
    expect(style.backgroundColor).toBeUndefined()
  })

  it('maps linear gradient', () => {
    const style = buildSectionStyle({ _gradient: 'linear', _gradientFrom: '#000', _gradientTo: '#fff', _gradientAngle: 90 }, 'desktop')
    expect(style.backgroundImage).toBe('linear-gradient(90deg, #000, #fff)')
  })

  it('maps radial gradient', () => {
    const style = buildSectionStyle({ _gradient: 'radial', _gradientFrom: '#000', _gradientTo: '#fff' }, 'desktop')
    expect(style.backgroundImage).toBe('radial-gradient(circle, #000, #fff)')
  })

  it('uses default gradient angle 135 when not specified', () => {
    const style = buildSectionStyle({ _gradient: 'linear', _gradientFrom: '#a', _gradientTo: '#b' }, 'desktop')
    expect(style.backgroundImage).toContain('135deg')
  })

  it('maps uniform border radius as number', () => {
    const style = buildSectionStyle({ _borderRadius: 8 }, 'desktop')
    expect(style.borderRadius).toBe(8)
  })

  it('maps individual corner radius as string', () => {
    const style = buildSectionStyle({ _borderRadiusTL: 4, _borderRadiusTR: 8 }, 'desktop')
    expect(style.borderRadius).toBe('4px 8px 0px 0px')
  })

  it('maps opacity as fraction', () => {
    const style = buildSectionStyle({ _opacity: 50 }, 'desktop')
    expect(style.opacity).toBe(0.5)
  })

  it('maps box shadow from preset', () => {
    const style = buildSectionStyle({ _shadow: 'md' }, 'desktop')
    expect(style.boxShadow).toBe(SHADOW_MAP.md)
  })

  it('returns no boxShadow for "none"', () => {
    const style = buildSectionStyle({ _shadow: 'none' }, 'desktop')
    expect(style.boxShadow).toBeUndefined()
  })

  it('maps transform rotate', () => {
    const style = buildSectionStyle({ _rotate: 45 }, 'desktop')
    expect(style.transform).toBe('rotate(45deg)')
  })

  it('no transform when all defaults', () => {
    const style = buildSectionStyle({}, 'desktop')
    expect(style.transform).toBeUndefined()
  })

  it('maps blend mode', () => {
    const style = buildSectionStyle({ _blendMode: 'multiply' }, 'desktop')
    expect(style.mixBlendMode).toBe('multiply')
  })

  it('omits blend mode for "normal"', () => {
    const style = buildSectionStyle({ _blendMode: 'normal' }, 'desktop')
    expect(style.mixBlendMode).toBeUndefined()
  })

  it('maps border width and color', () => {
    const style = buildSectionStyle({ _borderWidth: 2, _borderColor: '#000' }, 'desktop')
    expect(style.borderWidth).toBe(2)
    expect(style.borderColor).toBe('#000')
    expect(style.borderStyle).toBe('solid')
  })

  it('maps outside border as outline', () => {
    const style = buildSectionStyle({ _borderWidth: 2, _borderColor: '#000', _borderPosition: 'outside' }, 'desktop')
    expect(style.outline).toContain('#000')
  })

  it('maps max width with auto margin', () => {
    const style = buildSectionStyle({ _maxWidth: 1200 }, 'desktop')
    expect(style.maxWidth).toBe(1200)
    expect(style.marginInline).toBe('auto')
  })

  it('maps background image with overlay', () => {
    const style = buildSectionStyle({ _backgroundImage: 'https://example.com/img.jpg', _backgroundOverlay: 50 }, 'desktop')
    expect(style.backgroundImage).toContain('url(https://example.com/img.jpg)')
    expect(style.backgroundImage).toContain('linear-gradient')
  })

  it('maps backdrop blur', () => {
    const style = buildSectionStyle({ _backdropBlur: 10 }, 'desktop')
    expect(style.backdropFilter).toContain('blur(10px)')
  })

  it('maps custom shadow', () => {
    const style = buildSectionStyle({ _shadowX: 5, _shadowY: 10, _shadowBlur: 15, _shadowSpread: 2, _shadowColor: 'red' }, 'desktop')
    expect(style.boxShadow).toContain('5px')
    expect(style.boxShadow).toContain('red')
  })

  it('maps position sticky', () => {
    const style = buildSectionStyle({ _position: 'sticky', _positionTop: 0 }, 'desktop')
    expect(style.position).toBe('sticky')
    expect(style.top).toBe(0)
    expect(style.zIndex).toBe(10)
  })
})

describe('mergePropsForViewport', () => {
  it('returns props unchanged for desktop', () => {
    const props = { heading: 'Hello', _paddingTop: 16 }
    expect(mergePropsForViewport(props, 'desktop')).toEqual(props)
  })

  it('merges tablet overrides when object', () => {
    const props = { heading: 'Hello', _paddingTop: 16, _props_tablet: { _paddingTop: 8 } }
    const merged = mergePropsForViewport(props, 'tablet')
    expect(merged._paddingTop).toBe(8)
    expect(merged.heading).toBe('Hello')
  })

  it('returns props unchanged when no overrides for viewport', () => {
    const props = { heading: 'Hello', _paddingTop: 16 }
    const merged = mergePropsForViewport(props, 'tablet')
    expect(merged).toEqual(props)
  })
})

describe('getStyleProp', () => {
  it('returns underscore-prefixed prop for desktop', () => {
    expect(getStyleProp({ _paddingTop: 16 }, 'paddingTop', 'desktop')).toBe(16)
  })

  it('returns viewport override when available', () => {
    expect(getStyleProp({ _paddingTop: 16, _tablet_paddingTop: 8 }, 'paddingTop', 'tablet')).toBe(8)
  })

  it('falls back to desktop when viewport override missing', () => {
    expect(getStyleProp({ _paddingTop: 16 }, 'paddingTop', 'tablet')).toBe(16)
  })

  it('returns undefined for missing prop', () => {
    expect(getStyleProp({}, 'paddingTop', 'desktop')).toBeUndefined()
  })
})
