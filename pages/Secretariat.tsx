
import React from 'react';
import { Users, Mail, Phone, MapPin, ChevronRight, Award, ShieldCheck, Briefcase } from 'lucide-react';

const Secretariat: React.FC = () => {
  const executives = [
    {
      name: 'Mr. David Kallon',
      position: 'Executive Secretary',
      image: '/assets/images/secretariat/executive_secretary.png',
      bio: 'With over 20 years of experience in public administration and hospitality management, Mr. Kallon leads the Secretariat with a focus on strategic growth and international partnerships.'
    }
  ];

  const adminTeam = [
    {
      name: 'Ms. Sia Koroma',
      position: 'Administrative Officer',
      image: '/assets/images/secretariat/admin_officer.png',
      email: 'admin@slah.org.sl'
    },
    {
      name: 'Mr. Samuel Bangura',
      position: 'Finance & Accounts Officer',
      image: '/assets/images/secretariat/finance_officer.png',
      email: 'finance@slah.org.sl'
    },
    {
      name: 'Mrs. Zainab Kamara',
      position: 'Communications & PR',
      image: '/assets/images/secretariat/comm_officer.png',
      email: 'press@slah.org.sl'
    },
    {
      name: 'Mr. Alusine Sesay',
      position: 'IT & Systems Support',
      image: '/assets/images/secretariat/it_support.png',
      email: 'support@slah.org.sl'
    },
    {
      name: 'Ms. Aminata Conteh',
      position: 'Office Assistant',
      image: '/assets/images/secretariat/office_assistant.png',
      email: 'info@slah.org.sl'
    }
  ];

  return (
    <div className="pt-24 lg:pt-32 pb-24 bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <section className="bg-emerald-900 text-white py-24 mb-16 relative overflow-hidden African-accents">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/50 px-4 py-2 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-700">
              <Users size={14} />
              <span>SLAH Administration</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">The Secretariat</h1>
            <p className="text-xl text-emerald-100/80 font-medium leading-relaxed">
              Meet the dedicated professionals driving the daily operations, advocacy, and service excellence of the Sierra Leone Association of Hotels.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8">
        {/* Executive Leadership */}
        <div className="mb-24">
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-1 w-12 bg-amber-500"></div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Executive Leadership</h2>
          </div>
          
          {executives.map((exec, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col lg:flex-row hover:shadow-2xl transition-all duration-500">
              <div className="lg:w-1/3 h-[400px] lg:h-auto relative">
                <img src={exec.image} alt={exec.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent lg:hidden"></div>
              </div>
              <div className="lg:w-2/3 p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-6">
                  <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-2">{exec.position}</p>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{exec.name}</h3>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed mb-8 italic">
                  "{exec.bio}"
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl">
                    <Mail size={16} className="text-emerald-600" />
                    <span>exec.secretary@slah.org.sl</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl">
                    <Award size={16} className="text-amber-500" />
                    <span>Senior Administrator</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Administrative Staff Grid */}
        <div>
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-1 w-12 bg-emerald-600"></div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Administrative Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminTeam.map((member, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="relative mb-6 rounded-2xl overflow-hidden aspect-[4/5]">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{member.name}</h4>
                  <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4">{member.position}</p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-slate-400 text-xs font-medium">{member.email}</p>
                    <Mail size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-24 bg-slate-900 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-6">Reach the Secretariat</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg">
              Our office is open Monday to Friday, 9:00 AM – 5:00 PM. For official inquiries regarding membership, policy, or media, please contact our team.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a href="mailto:info@slah.org.sl" className="flex items-center space-x-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20">
                <Mail size={20} />
                <span>Email Official Inquiry</span>
              </a>
              <a href="/contact" className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest border border-white/10 transition-all">
                <span>View Contact Details</span>
                <ChevronRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Secretariat;
