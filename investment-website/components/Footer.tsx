import React from 'react';
import { Mail, ShieldAlert, FileText, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Wealth<span className="text-gold-500">Flow</span></h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Leading the industry in automated wealth generation. Our algorithms work 24/7 so you don&apos;t have to.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-gold-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center"><Lock className="w-3 h-3 mr-2" /><a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a></li>
              <li className="flex items-center"><FileText className="w-3 h-3 mr-2" /><a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> support@wealthflow.com</li>
              <li>123 Wall Street, NY, USA</li>
            </ul>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="border-t border-slate-900 pt-8 mt-8">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 flex items-start space-x-4">
            <ShieldAlert className="text-red-500 w-6 h-6 flex-shrink-0 mt-1" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-300">Risk Disclaimer:</strong> Investing in financial markets involves a high degree of risk and may not be suitable for all investors. You could lose some or all of your initial investment. Past performance is not indicative of future results. Please ensure you fully understand the risks involved before trading.
            </p>
          </div>
          <div className="text-center text-slate-600 text-sm mt-8">
            &copy; {new Date().getFullYear()} WealthFlow. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
