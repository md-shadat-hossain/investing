import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Have questions about our investment plans or need technical assistance? Our dedicated support team is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 p-10 flex flex-col justify-between relative overflow-hidden">
             {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gold-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-8">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-slate-700/50 p-3 rounded-lg text-gold-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Email Us</p>
                    <p className="text-white font-medium">support@wealthflow.com</p>
                    <p className="text-white font-medium">invest@wealthflow.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-slate-700/50 p-3 rounded-lg text-gold-500">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Call Us</p>
                    <p className="text-white font-medium">+1 (555) 123-4567</p>
                    <p className="text-slate-500 text-sm">Mon-Fri from 8am to 5pm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-slate-700/50 p-3 rounded-lg text-gold-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Visit Us</p>
                    <p className="text-white font-medium">123 Financial District</p>
                    <p className="text-white font-medium">New York, NY 10005</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <p className="text-slate-400 text-sm mb-4">Connect with us</p>
              <div className="flex space-x-4">
                 {['twitter', 'linkedin', 'facebook', 'instagram'].map((social) => (
                   <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-white hover:bg-gold-500 hover:text-slate-900 transition-colors">
                     <span className="sr-only">{social}</span>
                     <div className="w-4 h-4 bg-current rounded-sm"></div>
                   </a>
                 ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 p-10">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors">
                  <option>General Inquiry</option>
                  <option>Investment Support</option>
                  <option>Technical Issue</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors resize-none" placeholder="How can we help you today?"></textarea>
              </div>

              <button type="button" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 rounded-lg font-bold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transform hover:-translate-y-1 transition-all flex items-center justify-center">
                Send Message
                <Send size={18} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
