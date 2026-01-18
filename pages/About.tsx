
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="pt-24 lg:pt-32 pb-24">
      {/* Header */}
      <section className="bg-emerald-900 text-white py-20 mb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 african-accents"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Legacy, Our Mission</h1>
            <p className="text-xl text-emerald-100 font-light leading-relaxed">
              Serving the hospitality industry of Sierra Leone for over 15 years as the official platform for growth and advocacy.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6 text-slate-900">Who We Are</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">
                The Sierra Leone Association of Hotels (SLAH) is the national umbrella organization for all registered hotels, guest houses, and hospitality stakeholders in Sierra Leone. We act as the central voice for the industry, bridging the gap between private enterprise and government policy.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Founded with a vision to transform Sierra Leone into a premium tourism hub, SLAH ensures that the hospitality sector maintains the highest standards of service, safety, and ethics, while advocating for the economic interests of its members.
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-emerald-800 mb-4">Our Vision</h3>
                <p className="text-emerald-900/70">
                  To be the leading catalyst for hospitality excellence in West Africa, fostering an environment where every hotel stakeholder thrives and every guest experiences the unique warmth of Sierra Leone.
                </p>
              </div>
              <div className="bg-amber-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-amber-800 mb-4">Our Mission</h3>
                <p className="text-amber-900/70">
                  To advocate for favorable industry policies, provide continuous professional training, and market Sierra Leone's hospitality offerings to the global stage.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-slate-900">History & Milestones</h2>
              <div className="space-y-8 border-l-2 border-emerald-100 pl-8 ml-4">
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-5 h-5 bg-emerald-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-slate-900">2008: The Foundation</h4>
                  <p className="text-slate-500 mt-2">SLAH was officially incorporated to address the fragmentation in the hotel industry post-conflict.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-5 h-5 bg-emerald-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-slate-900">2014: Crisis Response</h4>
                  <p className="text-slate-500 mt-2">Played a pivotal role in creating health and safety protocols during the Ebola outbreak, saving the sector from collapse.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-5 h-5 bg-emerald-600 rounded-full"></div>
                  <h4 className="text-xl font-bold text-slate-900">2021: Digital Transformation</h4>
                  <p className="text-slate-500 mt-2">Launched the first national hotel database to streamline marketing and data collection for investors.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Leadership */}
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-slate-900 text-white p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-6">Current Leadership</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img src="https://picsum.photos/seed/person1/100/100" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500" alt="President" />
                  <div>
                    <h5 className="font-bold">Hon. Mariama Conteh</h5>
                    <p className="text-emerald-400 text-sm">President</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <img src="https://picsum.photos/seed/person2/100/100" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" alt="VP" />
                  <div>
                    <h5 className="font-bold">Mr. Ibrahim Sesay</h5>
                    <p className="text-slate-400 text-sm">Vice President</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <img src="https://picsum.photos/seed/person3/100/100" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" alt="Sec" />
                  <div>
                    <h5 className="font-bold">Mrs. Fatmata Bangura</h5>
                    <p className="text-slate-400 text-sm">General Secretary</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-700 text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-xl font-bold mb-4">Interested in Joining?</h3>
              <p className="text-emerald-100 mb-6">Our executive team holds monthly orientation sessions for new members.</p>
              <button className="w-full bg-amber-500 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors">
                Contact Leadership
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
