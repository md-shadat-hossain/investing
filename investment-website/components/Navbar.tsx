'use client'

import React, { useState, useEffect } from 'react';
import { Menu, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';

  const getLink = (id: string) => isHome ? `#${id}` : `/#${id}`;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-wide">
              Wealth<span className="text-gold-500">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
             <a href={isHome ? "#" : "/"} className="text-slate-300 hover:text-gold-400 transition-colors text-sm font-medium uppercase tracking-wider">Home</a>
             <a href={getLink('about')} className="text-slate-300 hover:text-gold-400 transition-colors text-sm font-medium uppercase tracking-wider">About Us</a>
             <a href={getLink('plans')} className="text-slate-300 hover:text-gold-400 transition-colors text-sm font-medium uppercase tracking-wider">Investment Plans</a>
             <a href={getLink('calculator')} className="text-slate-300 hover:text-gold-400 transition-colors text-sm font-medium uppercase tracking-wider">Calculator</a>
             <a href={getLink('contact')} className="text-slate-300 hover:text-gold-400 transition-colors text-sm font-medium uppercase tracking-wider">Contact</a>
          </div>

          {/* Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-white hover:text-gold-400 font-medium">Login</Link>
            <Link
              href="/register"
              className="bg-gold-500 hover:bg-gold-600 text-slate-950 px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 shadow-lg shadow-gold-500/20"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 p-4 flex flex-col space-y-4 shadow-2xl">
            <a href={isHome ? "#" : "/"} onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-gold-400 font-medium block">Home</a>
            <a href={getLink('about')} onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-gold-400 font-medium block">About Us</a>
            <a href={getLink('plans')} onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-gold-400 font-medium block">Investment Plans</a>
            <a href={getLink('calculator')} onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-gold-400 font-medium block">Calculator</a>
            <a href={getLink('contact')} onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-gold-400 font-medium block">Contact</a>

            <div className="h-px bg-slate-800 my-2"></div>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-gold-400 font-medium block">Login</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="bg-gold-500 text-slate-950 px-6 py-3 rounded-lg font-bold text-center block">Get Started</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
