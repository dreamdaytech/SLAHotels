
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
// Added Globe to imports to resolve undefined component error
import { ShieldCheck, TrendingUp, Users, Building2, ChevronRight, Calendar, ArrowRight, Globe } from 'lucide-react';

const Home: React.FC = () => {
  const { news, members, profiles, loading: appLoading } = useAppContext();

  const newsItems = news.slice(0, 3);
  const stats = {
    hotels: members.length || 120,
    members: profiles.length || 5,
    impact: '4.5B'
  };

  const impacts = [
    {
      title: 'Industry Advocacy',
      description: 'The official voice of the hotel industry, engaging with government on policy and regulatory matters.',
      icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
    },
    {
      title: 'Capacity Building',
      description: 'Enhancing professional standards through training, certification programs, and best practice workshops.',
      icon: <Users className="w-10 h-10 text-emerald-600" />,
    },
    {
      title: 'Tourism Promotion',
      description: 'Strategic marketing to position Sierra Leone as a premier global destination for travel and business.',
      icon: <TrendingUp className="w-10 h-10 text-emerald-600" />,
    },
    {
      title: 'Policy Engagement',
      description: 'Collaborating with stakeholders to create an enabling environment for hospitality investment.',
      icon: <Building2 className="w-10 h-10 text-emerald-600" />,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"
            alt="Luxury Hotel in Sierra Leone"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-slate-900/40"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              Official Association
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
              Uniting Hotels.<br />
              Strengthening Hospitality.<br />
              Growing Tourism.
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 font-light mb-10 max-w-2xl leading-relaxed">
              SLAH is the national umbrella body representing the interests of hotels and hospitality stakeholders across the Sierra Leonean landscape.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-center transition-all transform hover:scale-105 shadow-xl">
                Become a Member
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-lg font-bold text-center transition-all">
                About SLAH
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stats - Hidden on Mobile */}
        <div className="hidden lg:flex absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-4/5 max-w-5xl justify-between items-center z-20">
          <div className="text-center px-8 border-r border-slate-100 last:border-0 flex-1">
            <div className="text-3xl font-bold text-emerald-800">{stats.hotels}+</div>
            <div className="text-slate-500 text-sm uppercase font-semibold">Member Hotels</div>
          </div>
          <div className="text-center px-8 border-r border-slate-100 last:border-0 flex-1">
            <div className="text-3xl font-bold text-emerald-800">{stats.members >= 1000 ? `${(stats.members / 1000).toFixed(1)}k+` : `${stats.members}+`}</div>
            <div className="text-slate-500 text-sm uppercase font-semibold">Jobs Represented</div>
          </div>
          <div className="text-center px-8 border-r border-slate-100 last:border-0 flex-1">
            <div className="text-3xl font-bold text-emerald-800">15+</div>
            <div className="text-slate-500 text-sm uppercase font-semibold">Years of Service</div>
          </div>
          <div className="text-center px-8 flex-1">
            <div className="text-3xl font-bold text-emerald-800">{stats.impact}</div>
            <div className="text-slate-500 text-sm uppercase font-semibold">Economic Impact</div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 pt-32 lg:pt-48 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000"
                alt="Hotel Staff"
                className="rounded-2xl shadow-2xl relative z-10"
              />
              <div className="absolute -bottom-10 -right-10 hidden md:block w-64 p-6 bg-emerald-800 text-white rounded-2xl shadow-xl z-20">
                <p className="italic text-sm font-light">"Our mission is to foster excellence, ethics, and growth within the hospitality sector of Sierra Leone."</p>
                <p className="mt-4 font-bold text-amber-400">— SLAH Secretariat</p>
              </div>
            </div>
            <div>
              <span className="text-amber-600 font-bold tracking-widest uppercase text-sm">Professional Authority</span>
              <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-8 text-slate-900 leading-tight">The Trusted Voice of Sierra Leone's Hospitality</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Established as the primary representative for the hospitality sector, the Sierra Leone Association of Hotels (SLAH) works tirelessly to ensure our members operate in a thriving, fair, and professional environment.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-10">
                We represent a diverse range of accommodations, from international boutique hotels to historic local establishments, all committed to the shared goal of positioning Sierra Leone as a top-tier global destination.
              </p>
              <Link to="/about" className="inline-flex items-center text-emerald-700 font-bold hover:text-emerald-800 group">
                Read More About Our History <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role & Impact */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Role & Impact</h2>
            <div className="w-20 h-1.5 bg-amber-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-slate-500 text-lg">SLAH provides critical infrastructure and support systems that empower hotels to reach their full potential while contributing to national growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impacts.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-emerald-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900">
          <div className="absolute inset-0 opacity-10 african-accents"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-amber-600 rounded-3xl p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between shadow-2xl">
            <div className="lg:max-w-xl text-center lg:text-left mb-10 lg:mb-0">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Elevate Your Hospitality Business</h2>
              <p className="text-amber-50 text-xl font-light leading-relaxed">
                Join a network of leading hoteliers, gain access to exclusive policy updates, industry research, and professional training opportunities.
              </p>
              <ul className="mt-8 space-y-3">
                <li className="flex items-center text-white justify-center lg:justify-start">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-3"><ChevronRight size={14} /></div>
                  Priority Access to Industry Events
                </li>
                <li className="flex items-center text-white justify-center lg:justify-start">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-3"><ChevronRight size={14} /></div>
                  Direct Policy Representation
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <Link to="/register" className="bg-white text-emerald-900 px-10 py-5 rounded-xl font-bold text-xl shadow-lg hover:bg-slate-50 transition-colors text-center">
                Join the Association
              </Link>
              <p className="text-amber-100 text-sm text-center">Request a membership prospectus today</p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Updates */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">News & Updates</h2>
              <p className="text-slate-500 text-lg">Stay informed about the latest developments, regulatory changes, and success stories in Sierra Leonean hospitality.</p>
            </div>
            <Link to="/news" className="text-emerald-700 font-bold flex items-center group">
              View All News <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {appLoading ? (
              <div className="col-span-3 text-center py-12 text-slate-400">Loading latest news...</div>
            ) : newsItems.length > 0 ? (
              newsItems.map((item, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl mb-6 h-64 shadow-md">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-sm">{item.category || item.tag}</div>
                  </div>
                  <div className="flex items-center text-slate-400 text-sm mb-3">
                    <Calendar size={14} className="mr-2" /> {item.date}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-4 line-clamp-2">{item.title}</h3>
                  <Link to={`/news/${item.id}`} className="text-sm font-semibold text-amber-600 flex items-center uppercase tracking-wider">
                    Read Article <ChevronRight size={14} className="ml-1" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400 italic">No news updates available.</div>
            )}
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-center text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-12">Our Partners & Stakeholders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Partner Logos */}
            <div className="text-2xl font-black text-slate-400 flex items-center"><Globe className="mr-2" /> MINISTRY OF TOURISM</div>
            <div className="text-2xl font-black text-slate-400 flex items-center"><Building2 className="mr-2" /> NATIONAL TOURIST BOARD</div>
            <div className="text-2xl font-black text-slate-400 flex items-center"><Users className="mr-2" /> CHAMBER OF COMMERCE</div>
            <div className="text-2xl font-black text-slate-400 flex items-center"><ShieldCheck className="mr-2" /> EPA SIERRA LEONE</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
