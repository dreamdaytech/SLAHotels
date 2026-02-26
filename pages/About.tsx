
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Lightbulb, Leaf, Globe, Star, HandshakeIcon } from 'lucide-react';

// Inline SVG for Handshake (lucide doesn't export HandshakeIcon in all versions)
const Handshake = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.9 8.1L16 11 13 8l2.9-2.9a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8z" />
    <path d="M11 10l-2 2-2-2 2-2z" />
    <path d="M8 13l-5 5" />
    <path d="M13 8l2-2" />
    <path d="M16 16l5-5" />
    <path d="M8 16l-5 5" />
  </svg>
);

const coreValues = [
  {
    icon: <Users size={22} className="text-emerald-600" />,
    title: 'Unity and Collaboration',
    desc: 'We promote solidarity and cooperation among hotels to achieve shared goals and strengthen the sector.',
    bg: 'bg-emerald-50',
  },
  {
    icon: <Star size={22} className="text-amber-600" />,
    title: 'Professionalism and Excellence',
    desc: 'We uphold high standards of service, ethics, and operational excellence across the industry.',
    bg: 'bg-amber-50',
  },
  {
    icon: <Shield size={22} className="text-indigo-600" />,
    title: 'Advocacy and Accountability',
    desc: 'We actively represent member interests while maintaining transparency, integrity, and accountability in all engagements.',
    bg: 'bg-indigo-50',
  },
  {
    icon: <Leaf size={22} className="text-teal-600" />,
    title: 'Sustainability',
    desc: 'We support environmentally responsible, culturally respectful, and economically sustainable hospitality practices.',
    bg: 'bg-teal-50',
  },
  {
    icon: <Globe size={22} className="text-violet-600" />,
    title: 'Inclusiveness',
    desc: 'We value diversity and ensure fair representation of hotels across all regions and categories.',
    bg: 'bg-violet-50',
  },
  {
    icon: <Lightbulb size={22} className="text-rose-600" />,
    title: 'Innovation and Growth',
    desc: 'We encourage innovation, skills development, and continuous improvement to enhance competitiveness and long-term growth.',
    bg: 'bg-rose-50',
  },
];

const About: React.FC = () => {
  return (
    <div className="pt-24 lg:pt-32 pb-24">
      {/* Hero Header */}
      <section className="bg-emerald-900 text-white py-20 mb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 african-accents"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <p className="text-emerald-300 text-xs font-black uppercase tracking-[0.2em] mb-4">Sierra Leone Association of Hotels</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Who We Are</h1>
            <p className="text-xl text-emerald-100 font-light leading-relaxed">
              The national umbrella body for hotels in Sierra Leone—uniting owners, operators, and leaders under one voice to protect industry interests, raise standards, and strengthen the business environment.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">

            {/* Who We Are */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-slate-900">About SLAH</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">
                The Sierra Leone Association of Hotels (SLAH) is the national umbrella body for hotels in Sierra Leone. We unite hotel owners, operators, and hospitality leaders under one voice to protect industry interests, raise standards, and strengthen the business environment for hotels across the country.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                SLAH exists to ensure the hotel sector is organized, heard, and respected—and to champion a hospitality industry that can confidently compete regionally and internationally.
              </p>
            </section>

            {/* Vision & Mission */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-800 mb-4">Our Vision</h3>
                <p className="text-emerald-900/70 leading-relaxed">
                  To be a strong, unified, and influential hotel association that drives sustainable tourism development and positions Sierra Leone as a competitive and preferred destination in Africa.
                </p>
              </div>
              <div className="bg-amber-50 p-8 rounded-2xl border border-amber-100">
                <h3 className="text-2xl font-bold text-amber-800 mb-4">Our Mission</h3>
                <p className="text-amber-900/70 leading-relaxed">
                  To represent, support, and promote the interests of hotels in Sierra Leone by advocating for favorable policies, enhancing professional standards, encouraging collaboration, and contributing to the long-term growth and sustainability of the tourism and hospitality industry.
                </p>
              </div>
            </section>

            {/* National Presence */}
            <section className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl">
              <h2 className="text-2xl font-bold mb-4">National Presence</h2>
              <p className="text-slate-300 leading-relaxed">
                SLAH is committed to representing hotels across the entire country—not just the capital. Our leadership structure includes executives and regional representatives serving the <strong className="text-white">Southern, Northern, and Eastern regions</strong>, ensuring that members nationwide are heard and included.
              </p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Western Area', 'Southern Region', 'Northern Region', 'Eastern Region'].map(region => (
                  <div key={region} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
                    <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">{region}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Core Values */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-slate-900">Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coreValues.map((v, i) => (
                  <div key={i} className={`${v.bg} p-6 rounded-2xl flex items-start gap-4`}>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                      {v.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{v.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">

            {/* Leadership */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 uppercase tracking-widest text-xs text-emerald-400">Current Leadership</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-900 text-lg shrink-0">
                    JS
                  </div>
                  <div>
                    <h5 className="font-bold">John Shallop</h5>
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">President</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-black text-slate-200 text-lg shrink-0">
                    LK
                  </div>
                  <div>
                    <h5 className="font-bold">Lonnel Kargbo</h5>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Secretary General</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Join CTA */}
            <div className="bg-emerald-700 text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-xl font-bold mb-4">Interested in Joining?</h3>
              <p className="text-emerald-100 mb-6 text-sm leading-relaxed">
                Become part of the national hotel association and access advocacy, networking, and professional development opportunities.
              </p>
              <Link
                to="/register"
                className="block w-full text-center bg-amber-500 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors text-slate-900"
              >
                Apply for Membership
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: 'Advocacy & Policy', to: '/advocacy' },
                  { label: 'Contact the Secretariat', to: '/contact' },
                  { label: 'Member Directory', to: '/members' },
                ].map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <span className="text-slate-600 font-medium text-sm">{link.label}</span>
                    <span className="text-slate-300 group-hover:text-emerald-600 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
