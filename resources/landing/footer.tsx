'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background pt-24 pb-0 overflow-hidden border-t border-border flex flex-col justify-between relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-0 mb-32">
          
          {/* Left Side: Brand & Copyright */}
          <div className="flex flex-col space-y-8">
             <div className="flex items-center gap-2.5">
                <div className="bg-foreground text-background p-2 rounded-lg">
                   <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-foreground tracking-tight">Pasaal</span>
             </div>
             
             <div className="space-y-2 text-sm text-muted-foreground">
                <p>Copyright © 2024 Pasaal Inc.</p>
                <p>All rights reserved</p>
             </div>
          </div>

          {/* Right Side: Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-10">
             
             {/* Column 1 */}
             <div className="flex flex-col space-y-4">
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
                <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
             </div>

             {/* Column 2 */}
             <div className="flex flex-col space-y-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Refund Policy</a>
             </div>

             {/* Column 3: Social Icons */}
             <div className="flex flex-col space-y-4">
                <SocialLink href="#" label="Twitter" icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                } />
                <SocialLink href="#" label="LinkedIn" icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
                } />
                <SocialLink href="#" label="Facebook" icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                } />
                <SocialLink href="#" label="Instagram" icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                } />
             </div>
          </div>
        </div>
      </div>
      
      {/* Massive Watermark Text */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none pb-8">
        <h1 className="text-[25vw] font-black text-center text-foreground/5 leading-none select-none tracking-tight -mb-[0.1em]">
          PASAAL
        </h1>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => (
    <a href={href} className="flex items-center gap-2 group">
        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
            {icon}
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </a>
);
