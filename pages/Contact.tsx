
import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  return (
    <div className="pt-24 lg:pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Get in Touch</h1>
              <p className="text-xl text-slate-500 leading-relaxed mb-8">
                Whether you're a hotelier looking to join, an investor seeking data, or a partner interested in tourism promotion, we're here to help.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Office Address</h4>
                    <p className="text-slate-500">12 Siaka Stevens Street, Freetown, Sierra Leone</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Phone Number</h4>
                    <p className="text-slate-500">+232 76 123 456 / +232 33 987 654</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Email Address</h4>
                    <p className="text-slate-500">info@slah.org.sl / secretariat@slah.org.sl</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-10 rounded-3xl text-white">
               <h3 className="text-2xl font-bold mb-4">Membership Inquiries</h3>
               <p className="text-slate-400 mb-8">Ready to join our professional network? Access the official registration portal below.</p>
               <Link to="/register" className="inline-block bg-amber-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all mb-8">
                 Official Registration Form
               </Link>
               <div className="flex items-center space-x-3 text-amber-500 font-bold">
                  <MessageSquare size={20} />
                  <span>WhatsApp: +232 76 555 444</span>
               </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 relative">
            <h2 className="text-2xl font-bold mb-8">Send Us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Inquiry Type</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white">
                   <option>General Inquiry</option>
                   <option>Membership Application</option>
                   <option>Media/Press Inquiry</option>
                   <option>Policy/Advocacy Matter</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"></textarea>
              </div>
              
              <button className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center">
                Send Message <Send size={20} className="ml-2" />
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Contact;
