
import React, { useState } from 'react';
import { Users, Mail, Phone, MapPin, ChevronRight, Award, ShieldCheck, Briefcase, X } from 'lucide-react';

const Secretariat: React.FC = () => {
  const [selectedBio, setSelectedBio] = useState<{ name: string, position: string, fullBio: string, image: string } | null>(null);

  const executives = [
    {
      name: 'Mr. John Shallop',
      position: 'National President',
      image: '/John Shallop - National President SLAH.webp',
      shortBio: 'He is the National President of SLAH and a seasoned hospitality professional with over two decades of experience in the industry. Under his leadership, SLAH has become a dynamic advocate for key reforms, capacity building, and regional collaboration.',
      fullBio: 'He is the National President of SLAH and a seasoned hospitality professional with over two decades of experience in the industry. Under his leadership, SLAH has become a dynamic advocate for key reforms, capacity building, and regional collaboration.\n\nMr. Shallop is widely recognised for championing initiatives that elevate Sierra Leone’s hospitality standards — from supporting the nation’s culinary delegation at major regional events like the West African Food Festival (WAFFEST), where Sierra Leone secured several top awards, to advocating for infrastructure improvements, training opportunities, and investment incentives that benefit hotels and hospitality professionals nationwide.\n\nHis vision emphasises professional development, strategic partnerships, and industry unity, aiming to ensure that Sierra Leone’s hotels and hospitality businesses thrive in a competitive global market. Mr. Shallop also continues to engage with stakeholders to enhance policy frameworks, reduce operational burdens like excessive taxation, and improve the overall business environment for the tourism and hospitality sector.',
      email: null // Removed email
    }
  ];

  const adminTeam = [
    {
      name: 'Lonnel Kargbo',
      position: 'Secretary General',
      image: ''
    },
    {
      name: 'Mr. Samuel Bangura',
      position: 'Finance & Accounts Officer',
      image: '/assets/images/secretariat/finance_officer.png'
    },
    {
      name: 'Mrs. Zainab Kamara',
      position: 'Communications & PR',
      image: '/assets/images/secretariat/comm_officer.png'
    },
    {
      name: 'Mr. Alusine Sesay',
      position: 'IT & Systems Support',
      image: '/assets/images/secretariat/it_support.png'
    },
    {
      name: 'Ms. Aminata Conteh',
      position: 'Office Assistant',
      image: '/assets/images/secretariat/office_assistant.png'
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
            <div key={idx} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col lg:flex-row hover:shadow-2xl transition-all duration-500 group">
              <div className="lg:w-1/3 min-h-[300px] h-full relative">
                <img src={exec.image} alt={exec.name} className="w-full h-full absolute inset-0 object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors lg:hidden"></div>
              </div>
              <div className="lg:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                <div className="mb-4">
                  <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-1">{exec.position}</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">{exec.name}</h3>
                </div>
                <div className="mb-6">
                  <p className="text-slate-600 leading-relaxed italic line-clamp-3">
                    "{exec.shortBio}"
                  </p>
                  <button
                    onClick={() => setSelectedBio(exec as any)}
                    className="mt-2 text-emerald-600 font-bold text-sm hover:text-emerald-700 hover:underline uppercase tracking-wide flex items-center"
                  >
                    Read More <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {exec.email && (
                    <div className="flex items-center space-x-2 text-slate-500 text-sm font-bold bg-slate-50 px-3 py-1.5 rounded-xl">
                      <Mail size={16} className="text-emerald-600" />
                      <span>{exec.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-slate-500 text-sm font-bold bg-slate-50 px-3 py-1.5 rounded-xl">
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
                <div className="relative mb-6 rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100 flex items-center justify-center">
                  {member.image ? (
                    <>
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors"></div>
                    </>
                  ) : (
                    <Users size={64} className="text-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{member.name}</h4>
                  <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4">{member.position}</p>
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
              <a href="mailto:info@slahotels.org" className="flex items-center space-x-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20">
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

      {/* Bio Modal Pop-up */}
      {selectedBio && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 md:p-10 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedBio(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-6 mb-8 border-b border-slate-100 pb-8">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                <img src={selectedBio.image} alt={selectedBio.name} className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-1">{selectedBio.position}</p>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedBio.name}</h3>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                {selectedBio.fullBio}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Secretariat;
