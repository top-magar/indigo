"use client";

import React, { useMemo } from 'react';
import type { El } from '../core/types';

/**
 * Recursively extracts hoverStyles from the element tree
 * and generates a single CSS string to inject into the document.
 */
function extractHoverCSS(elements: El[]): string {
  let css = '';

  function traverse(el: El) {
    if (el.hoverStyles && Object.keys(el.hoverStyles).length > 0) {
      // Create a CSS rule for .el-[id]:hover
      // Using a data attribute or class, we'll use class .el-[id] which is set in ElementWrapper
      const selector = `.el-${el.id}:hover`;
      
      let rules = '';
      for (const [key, value] of Object.entries(el.hoverStyles)) {
        if (value === undefined || value === null || value === '') continue;
        
        // Convert camelCase to kebab-case (e.g. backgroundColor -> background-color)
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        rules += `${kebabKey}: ${value} !important;\n`;
      }
      
      if (rules) {
        css += `${selector} {\n${rules}}\n`;
      }
    }
    
    // Traverse children if any
    if (Array.isArray(el.content)) {
      el.content.forEach(traverse);
    }
  }

  elements.forEach(traverse);
  return css;
}

export function HoverStylesInjector({ elements }: { elements: El[] }) {
  const css = useMemo(() => extractHoverCSS(elements), [elements]);

  if (!css) return null;

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
}
