
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    inquiryType: 'General Inquiry',
    message: ''
  });
  
  const [securityQuestion, setSecurityQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Generate random math question on load
  const generateMathQuestion = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setSecurityQuestion({ num1: n1, num2: n2, answer: n1 + n2 });
    setUserAnswer('');
  };

  useEffect(() => {
    generateMathQuestion();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Anti-Spam Answer
    if (parseInt(userAnswer) !== securityQuestion.answer) {
      setSubmitStatus('error');
      setErrorMessage('Incorrect security answer. Please try again.');
      generateMathQuestion(); // generate a new one
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          inquiry_type: formData.inquiryType,
          message: formData.message,
          // status defaults to 'unread'
        });

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        inquiryType: 'General Inquiry',
        message: ''
      });
      generateMathQuestion();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);

    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setSubmitStatus('error');
      setErrorMessage('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
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
                    <p className="text-slate-500">info@slahotels.org / secretariat@slahotels.org</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-3xl text-white">
              <h3 className="text-2xl font-bold mb-2">Contact Leadership</h3>
              <p className="text-slate-400 mb-8 text-sm">Reach out directly to SLAH leadership for membership, policy, or partnership inquiries.</p>

              <div className="space-y-5 mb-8">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-900 shrink-0">JS</div>
                  <div>
                    <p className="font-bold text-white text-sm">John Shallop</p>
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">President, SLAH</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-black text-slate-200 shrink-0">LK</div>
                  <div>
                    <p className="font-bold text-white text-sm">Lonnel Kargbo</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Secretary General, SLAH</p>
                  </div>
                </div>
              </div>

              <Link to="/register" className="inline-block bg-amber-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all mb-5 w-full text-center">
                Official Registration Form
              </Link>
              <div className="flex items-center space-x-3 text-amber-500 font-bold">
                <MessageSquare size={20} />
                <span>secretariat@slahotels.org</span>
              </div>
            </div>

          </div>

          {/* Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 relative">
            <h2 className="text-2xl font-bold mb-8">Send Us a Message</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start">
                <CheckCircle2 className="mt-0.5 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-bold">Message Sent Successfully!</h4>
                  <p className="text-sm">Thank you for contacting us. We'll get back to you shortly.</p>
                </div>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start">
                <ShieldAlert className="mt-0.5 mr-3 flex-shrink-0" size={20} />
                <p className="font-bold text-sm">{errorMessage}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Inquiry Type</label>
                <select name="inquiryType" value={formData.inquiryType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white">
                  <option>General Inquiry</option>
                  <option>Membership Application</option>
                  <option>Media/Press Inquiry</option>
                  <option>Policy/Advocacy Matter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"></textarea>
              </div>

              {/* Anti-Spam Security Check */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                  <ShieldAlert size={16} className="text-amber-500 mr-2" />
                  Security Check (Anti-Spam)
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-slate-600 bg-white px-4 py-2 border border-slate-200 rounded-lg">
                    What is {securityQuestion.num1} + {securityQuestion.num2}?
                  </span>
                  <input 
                    type="number" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    required
                    placeholder="Answer"
                    className="w-24 px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold text-lg"
                  />
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} {!isSubmitting && <Send size={20} className="ml-2" />}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
