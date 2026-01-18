
import React from 'react';
// Added ChevronRight to imports to fix component definition error
import { Gavel, FileText, Landmark, MessageSquare, ChevronRight } from 'lucide-react';

const Advocacy: React.FC = () => {
  const priorities = [
    {
      title: 'Taxation & Fiscal Policy',
      desc: 'Advocating for a fair and simplified tax regime that encourages investment in the hospitality sector.',
      icon: <Gavel className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Labor Relations',
      desc: 'Engaging with unions and the Ministry of Labor to ensure a harmonious work environment and fair wages.',
      icon: <Users className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Energy Costs',
      desc: 'Negotiating with utility providers to reduce the high operational costs associated with power generation.',
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Licensing & Regulation',
      desc: 'Streamlining the multi-agency licensing processes to improve the ease of doing business.',
      icon: <Landmark className="w-8 h-8 text-emerald-600" />
    }
  ];

  return (
    <div className="pt-24 lg:pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Advocacy & Industry Policy</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            As the official voice of the industry, SLAH works directly with policymakers, parliament, and regulatory bodies to ensure a sustainable future for hospitality in Sierra Leone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Priorities */}
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <MessageSquare className="mr-3 text-amber-500" /> Current Advocacy Priorities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {priorities.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">{item.icon}</div>
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6">Our Success Stories</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-6 py-2">
                  <h4 className="font-bold mb-2">2023 Hotel Levy Negotiation</h4>
                  <p className="text-slate-400">Successfully lobbied for a 15% reduction in municipal taxes for hotels investing in renewable energy.</p>
                </div>
                <div className="border-l-4 border-amber-500 pl-6 py-2">
                  <h4 className="font-bold mb-2">Visa-on-Arrival Policy</h4>
                  <p className="text-slate-400">Collaborated with the NTB to implement the visa-on-arrival system for over 40 countries, boosting tourist arrivals.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Resources Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <FileText className="mr-3 text-emerald-600" /> Policy Library
              </h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <span className="text-slate-600 font-medium">SLAH Code of Ethics</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <span className="text-slate-600 font-medium">Minimum Standards Guidelines</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <span className="text-slate-600 font-medium">Annual Economic Report 2023</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
               <h3 className="font-bold text-amber-900 mb-4">Report an Issue</h3>
               <p className="text-amber-800/70 text-sm mb-6">Are you facing a regulatory challenge or unfair competition? Let the SLAH advocacy team know.</p>
               <button className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold">Lodge Formal Complaint</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Help helper for icons used in priorities list
const TrendingUp = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
const Users = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

export default Advocacy;
