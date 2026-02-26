
import React from 'react';
import { Gavel, FileText, Landmark, MessageSquare, ChevronRight, Users, Zap, Globe, BookOpen } from 'lucide-react';

const pillars = [
  {
    number: '01',
    title: 'Industry Advocacy and Representation',
    desc: 'SLAH represents member hotels in formal engagement with Government, regulators, and strategic partners—including the Ministry of Tourism and Cultural Affairs and other relevant institutions. We advocate for policies and reforms that support growth, reduce bottlenecks, and improve the overall operating environment for hotels.',
    icon: <Gavel size={22} className="text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    number: '02',
    title: 'Member Network and National Collaboration',
    desc: 'We bring together hotels from the Western Area, North, South, and East to address shared operational challenges, exchange best practices, and build stronger collaboration across the sector. SLAH creates a trusted platform where members can coordinate on industry priorities and speak with one voice.',
    icon: <Users size={22} className="text-indigo-600" />,
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    number: '03',
    title: 'Capacity Building and Professional Development',
    desc: 'SLAH supports skills development for the hotel workforce by promoting partnerships, mentorship, internships, and professional opportunities that raise competence and service quality across the industry. We believe that a stronger workforce builds stronger hotels—and a stronger destination.',
    icon: <BookOpen size={22} className="text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    number: '04',
    title: 'Sector Growth and Structural Development',
    desc: 'We work toward long-term sector improvements—supporting initiatives that expand representation nationwide, encourage investment, improve hotel standards, and strengthen industry structures that enable sustainable growth.',
    icon: <Globe size={22} className="text-teal-600" />,
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
];

const industryIssues = [
  'High operational costs, including power constraints and service reliability',
  'Multiple and overlapping taxation, creating unnecessary strain on hotel operations',
  'Limited large-scale hotel investment, including gaps in internationally rated infrastructure',
  'High travel costs and entry barriers that reduce international arrivals and competitiveness',
];

const Advocacy: React.FC = () => {
  return (
    <div className="pt-24 lg:pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">

        {/* Page Header */}
        <div className="max-w-4xl mb-16">
          <p className="text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mb-3">Sierra Leone Association of Hotels</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Advocacy &amp; Industry Policy</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            As the official voice of the industry, SLAH works directly with policymakers, parliament, and regulatory bodies to ensure a sustainable future for hospitality in Sierra Leone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Pillars */}
          <div className="lg:col-span-2 space-y-12">

            {/* Our Role - 4 Pillars */}
            <section>
              <h2 className="text-2xl font-bold mb-8 text-slate-900 flex items-center gap-3">
                <MessageSquare className="text-amber-500" size={24} />
                Our Role and What We Do
              </h2>
              <div className="space-y-6">
                {pillars.map((p) => (
                  <div key={p.number} className={`${p.bg} border ${p.border} p-6 rounded-2xl flex items-start gap-5`}>
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        {p.icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.number}</span>
                        <h4 className="font-bold text-slate-900">{p.title}</h4>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Key Industry Issues */}
            <section className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl">
              <h2 className="text-2xl font-bold mb-2">Key Industry Issues We Champion</h2>
              <p className="text-slate-400 text-sm mb-8">
                SLAH actively engages on the major challenges that limit sector performance and national tourism growth:
              </p>
              <div className="space-y-4">
                {industryIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-4 border-l-4 border-amber-500 pl-6 py-2">
                    <p className="text-slate-300 leading-relaxed">{issue}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* Policy Library */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-emerald-600" size={20} /> Policy Library
              </h3>
              <ul className="space-y-2">
                {['SLAH Code of Ethics', 'Minimum Standards Guidelines', 'Annual Economic Report 2024'].map(doc => (
                  <li key={doc}>
                    <a
                      href="#"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <span className="text-slate-600 font-medium text-sm">{doc}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ministry Engagement */}
            <div className="bg-emerald-700 text-white p-8 rounded-3xl">
              <h3 className="font-bold text-lg mb-3">Engage with SLAH</h3>
              <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
                Are you a hotelier facing a regulatory challenge or policy concern? Let the SLAH advocacy team know.
              </p>
              <a
                href="/contact"
                className="block w-full text-center bg-amber-500 text-slate-900 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors"
              >
                Contact the Secretariat
              </a>
            </div>

            {/* Engagement Partners */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-5">Key Engagement Partners</h3>
              <div className="space-y-3">
                {[
                  'Ministry of Tourism and Cultural Affairs',
                  'National Revenue Authority',
                  'Electricity Distribution and Supply Authority',
                  'National Tourist Board',
                ].map(p => (
                  <div key={p} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-slate-600 text-sm">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advocacy;
