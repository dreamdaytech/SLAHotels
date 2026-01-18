
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Added Image as ImageIcon and ArrowUpRight to imports to fix missing component errors
import { MapPin, Phone, Mail, Globe, Star, Users, Calendar, Building2, CheckCircle2, ChevronLeft, Info, Briefcase, Award, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MemberDetails: React.FC = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setHotel({
            ...data,
            name: data.hotel_name,
            year: data.year_established?.toString() || 'N/A',
            image: (data.gallery && data.gallery.length > 0) ? data.gallery[0] : 'https://images.unsplash.com/photo-1551882547-ff43c63fedfe?auto=format&fit=crop&q=80&w=1200'
          });
        }
      } catch (err) {
        console.error('Error fetching member details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMember();
  }, [id]);

  if (loading) return (
    <div className="pt-40 pb-40 text-center text-slate-400">
      <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-xl font-bold tracking-tighter text-slate-900">Synchronizing Directory Data...</p>
      <p className="text-xs font-black uppercase tracking-[0.3em] mt-2">Loading Official Member Details</p>
    </div>
  );

  if (!hotel) return (
    <div className="pt-40 text-center">
      <Building2 size={48} className="mx-auto mb-6 text-slate-200" />
      <p className="text-xl font-bold text-slate-900">Member Not Found</p>
      <Link to="/members" className="text-emerald-600 underline mt-4 inline-block font-bold">Return to Directory</Link>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px]">
        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="container mx-auto px-4 md:px-8">
            <Link to="/members" className="inline-flex items-center text-emerald-400 mb-6 hover:text-emerald-300 transition-colors">
              <ChevronLeft size={20} className="mr-1" /> Back to Directory
            </Link>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{hotel.type}</span>
                  <div className="flex text-amber-400">
                    {[...Array(parseInt(hotel.stars || 0))].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter leading-tight">{hotel.name}</h1>
                <div className="flex items-center text-slate-300">
                  <MapPin size={18} className="mr-2 text-emerald-500" />
                  {hotel.address}, {hotel.city}, {hotel.district}
                </div>
              </div>
              <div className="flex space-x-4">
                <a href={`tel:${hotel.contact}`} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20">
                  <Phone size={24} />
                </a>
                <a href={`mailto:${hotel.email}`} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20">
                  <Mail size={24} />
                </a>
                <a href={`https://${hotel.website}`} target="_blank" rel="noreferrer" className="p-4 bg-emerald-600 rounded-2xl text-white hover:bg-emerald-700 transition-all shadow-lg">
                  <Globe size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-12">

            {/* Overview Section */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center mb-10 border-b border-slate-50 pb-6">
                <Info className="text-emerald-600 mr-4" size={28} />
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Property Profile</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-slate-600">
                <div className="space-y-6">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Since</span>
                    <p className="text-xl font-bold text-slate-900">{hotel.year || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory</span>
                    <p className="text-xl font-bold text-slate-900">{hotel.rooms || 0} Professional Guest Rooms</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impact</span>
                    <p className="text-xl font-bold text-slate-900">{hotel.employees || '0+'} Staff Members</p>
                  </div>
                  {hotel.website && (
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Web Presence</span>
                      <p className="text-lg font-bold text-emerald-600 hover:underline cursor-pointer" onClick={() => window.open(`https://${hotel.website.replace('https://', '').replace('http://', '')}`)}>{hotel.website}</p>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Association Status</span>
                    <div className="flex items-center text-emerald-600 font-black uppercase text-xs tracking-widest">
                      <CheckCircle2 size={16} className="mr-2" /> Certified SLAH Member
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Gallery Section */}
            {hotel.gallery && hotel.gallery.length > 1 && (
              <section className="space-y-6">
                <div className="flex items-center mb-6">
                  <ImageIcon className="text-emerald-600 mr-4" size={28} />
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Public Gallery</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {hotel.gallery.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group">
                      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Gallery ${idx}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Facilities Section */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center mb-10 border-b border-slate-50 pb-6">
                <Award className="text-emerald-600 mr-4" size={28} />
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Facilities & Excellence</h2>
              </div>
              <div className="space-y-10">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Property Facilities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(hotel.facilities || []).map((f: string) => (
                      <div key={f} className="flex items-center p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold border border-slate-100 text-sm">
                        <CheckCircle2 size={14} className="mr-3 text-emerald-500" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Room Categories</h4>
                    <div className="flex flex-wrap gap-3">
                      {hotel.roomTypes.map((t: string) => (
                        <span key={t} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-bold uppercase tracking-widest">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hotel.amenities && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Additional Amenities</h4>
                    <p className="text-slate-600 leading-relaxed p-8 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 font-medium italic">
                      "{hotel.amenities}"
                    </p>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-10">

            {/* Management Card */}
            <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl">
              <div className="flex items-center mb-8 text-emerald-400">
                <Briefcase size={20} className="mr-3" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Secretariat Data</h3>
              </div>
              <div className="space-y-8">
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Corporate Owner</span>
                  <p className="text-lg font-bold text-white tracking-tight">{hotel.owner || 'Registered Entity'}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Managing Director</span>
                  <p className="text-lg font-bold text-white tracking-tight">{hotel.manager || 'Appointed Head'}</p>
                </div>
              </div>
              <div className="mt-10 pt-10 border-t border-white/5">
                <Link to="/contact" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-950/20">
                  Request Partner Data <ArrowUpRight size={14} className="ml-2" />
                </Link>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center mb-8 text-emerald-600">
                <MapPin size={20} className="mr-3" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Verified Location</h3>
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed font-bold">
                {hotel.address}<br />
                {hotel.city}<br />
                {hotel.district}, Sierra Leone
              </p>
              <div className="h-56 w-full bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s-l+285A43(-13.23,8.48)/-13.23,8.48,13/400x200@2x?access_token=pk.placeholder')] bg-cover opacity-60"></div>
                <div className="relative z-10 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-xl text-center">
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-800">SLAH Map Integration</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Pending Secretariat Sync</p>
                </div>
              </div>
            </div>

            {/* Certification Badge */}
            <div className="bg-amber-50 rounded-[3rem] p-10 border border-amber-200 text-center african-accents">
              <div className="w-20 h-20 bg-white text-amber-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-amber-100 transform rotate-3">
                <Award size={40} />
              </div>
              <h4 className="font-black text-amber-900 mb-2 uppercase tracking-tighter text-xl">SLAH Certified</h4>
              <p className="text-amber-800/60 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                Subject to strict ethical & operational audits 2024
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
