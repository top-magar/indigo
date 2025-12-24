'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, Moon, Sun, ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 border-b transition-all duration-300",
        scrolled || isOpen ? "bg-background/80 backdrop-blur-xl border-border supports-[backdrop-filter]:bg-background/60" : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group select-none relative z-50">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Pasaal</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md transition-all"
              >
                {link.name}
              </a>
            ))}

            {/* Resources Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md transition-all focus:outline-none">
                Resources <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", activeDropdown === 'resources' ? "rotate-180" : "")} />
              </button>

              {/* Dropdown Menu */}
              <div className={cn(
                "absolute top-full left-0 w-48 pt-2 transition-all duration-200 origin-top-left",
                activeDropdown === 'resources' ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
              )}>
                <div className="bg-card border border-border rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5">
                  {['Blog', 'Community', 'Help Center', 'API Docs'].map((item) => (
                    <a key={item} href="#" className="flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors group/item">
                      {item}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative overflow-hidden"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun className={cn("w-5 h-5 absolute inset-0 transition-all duration-500 rotate-0 scale-100", theme === 'dark' ? "invisible opacity-0 -rotate-90 scale-0" : "opacity-100")} />
                <Moon className={cn("w-5 h-5 absolute inset-0 transition-all duration-500 rotate-90 scale-0", theme === 'dark' ? "rotate-0 scale-100 opacity-100" : "invisible opacity-0")} />
              </div>
            </button>

            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hidden lg:flex">Log in</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="default" size="sm" className="shadow-lg shadow-primary/20">Start Free Trial</Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4 relative z-50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-1 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 bg-background/95 backdrop-blur-xl z-40 md:hidden transition-all duration-300 ease-in-out flex flex-col pt-24 px-6",
        isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex flex-col space-y-6">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              className="text-2xl font-bold text-foreground/80 hover:text-primary transition-colors flex items-center gap-3 group"
              style={{ transitionDelay: isOpen ? `${idx * 50}ms` : '0ms' }}
              onClick={() => setIsOpen(false)}
            >
              <span className="w-8 h-[1px] bg-border group-hover:bg-primary transition-colors"></span>
              {link.name}
            </a>
          ))}
          {/* Mobile Resources */}
          <div className="py-2">
            <p className="text-sm font-semibold text-muted-foreground tracking-wide mb-3">Resources</p>
            <div className="grid grid-cols-2 gap-3">
              {['Blog', 'Community', 'Help Center', 'API Docs'].map((item) => (
                <a key={item} href="#" className="text-sm font-medium text-foreground p-2 rounded-md bg-muted/50 border border-border text-center">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-border my-2" />
          <div className="flex flex-col gap-3">
            <Link href="/sign-in">
              <Button variant="outline" className="w-full justify-center h-12 text-base">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="default" className="w-full justify-center h-12 text-base shadow-lg shadow-primary/20">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};