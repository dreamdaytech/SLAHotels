
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// Added Target to imports to support promotions section
import { MapPin, Phone, Mail, Globe, Star, Users, Calendar, Building2, CheckCircle2, ChevronLeft, Info, Briefcase, Award, Image as ImageIcon, ArrowUpRight, Target, ChevronDown, ChevronUp, MessageSquare, X, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { createSlug, formatPhoneLink, formatPhoneDisplay, formatWhatsAppLink, formatWhatsAppDisplay } from '../lib/utils';



const MemberDetails: React.FC = () => {
  const { slug } = useParams();
  const { hotels, promotions, loading: appLoading } = useAppContext();

  const hotel = useMemo(() => {
    const found = hotels.find(h => createSlug(h.hotel_name) === slug);
    if (!found) return null;
    return {
      ...found,
      name: found.hotel_name,
      year: found.year_established?.toString() || 'N/A',
      image: (found.gallery && found.gallery.length > 0) ? found.gallery[0] : 'https://images.unsplash.com/photo-1551882547-ff43c63fedfe?auto=format&fit=crop&q=80&w=1200'
    };
  }, [hotels, slug]);

  const activePromotions = useMemo(() => {
    if (!hotel || !promotions) return [];
    return promotions.filter(p => p.hotel_id === hotel.id && p.status === 'Active');
  }, [hotel, promotions]);

  const [expandedPromoId, setExpandedPromoId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  if (appLoading && !hotel) return (
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
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        hotel={hotel} 
      />
      {/* Hero Section */}
      <div className="relative min-h-[500px] md:h-[600px] flex flex-col">
        <img src={hotel.image} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20"></div>
        
        <div className="relative flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-4">
          <div className="container mx-auto px-4 md:px-8">
            <Link to="/members" className="inline-flex items-center text-emerald-400 mb-8 hover:text-emerald-300 transition-colors bg-slate-900/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 mx-auto md:mx-0">
              <ChevronLeft size={16} className="mr-1" /> Back to Directory
            </Link>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 text-center md:text-left">
              <div className="max-w-3xl mx-auto md:mx-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                  <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">{hotel.type}</span>
                  <div className="flex text-amber-400 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    {[...Array(parseInt(hotel.stars || 0))].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1] drop-shadow-2xl">
                  {hotel.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start text-slate-300">
                  <MapPin size={18} className="mr-2 text-emerald-500" />
                  {hotel.address}, {hotel.city}, {hotel.district}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-5 mt-8 md:mt-0">
                <div className="flex justify-center md:justify-start gap-4">
                  <a href={formatPhoneLink(hotel.contact)} className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20">
                    <Phone size={20} className="md:w-6 md:h-6" />
                  </a>
                  <a href={`mailto:${hotel.email}`} className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20">
                    <Mail size={20} className="md:w-6 md:h-6" />
                  </a>
                  {hotel.whatsapp && (
                    <a 
                      href={formatWhatsAppLink(hotel.whatsapp)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-3 md:p-4 bg-emerald-500 rounded-xl md:rounded-2xl text-white hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare size={20} className="md:w-6 md:h-6" />
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full md:w-auto px-8 py-4 bg-emerald-600 rounded-xl md:rounded-2xl text-white hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
                >
                  <Calendar size={20} />
                  Book Now
                </button>
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
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-sm border border-slate-100">
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
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Association Status</span>
                    <div className="flex items-center text-emerald-600 font-black uppercase text-xs tracking-widest">
                      <CheckCircle2 size={16} className="mr-2" /> Certified SLAH Member
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Promotions Section (Moved up for visibility) */}
             {activePromotions.length > 0 && (
              <section className="bg-emerald-50 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-sm border border-emerald-100">
                <div className="flex items-center mb-10 border-b border-emerald-100/50 pb-6">
                  <Target className="text-emerald-600 mr-4" size={28} />
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Active Promotions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activePromotions.map((promo: any) => {
                    const isExpanded = expandedPromoId === promo.id;
                    return (
                      <div
                        key={promo.id}
                        onClick={() => setExpandedPromoId(isExpanded ? null : promo.id)}
                        className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 rounded-bl-[4rem] flex items-start justify-end p-4 z-0 transition-transform group-hover:scale-110">
                          <Star className="text-white w-6 h-6 animate-pulse" fill="currentColor" />
                        </div>
                        <div className="relative z-10">
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                            {promo.discount_value || 'Special Offer'}
                          </span>
                          <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{promo.title}</h4>

                          {/* Description — truncated by default, full when expanded */}
                          <p className={`text-sm text-slate-500 whitespace-pre-line transition-all duration-300 ${isExpanded ? 'mb-6' : 'line-clamp-2 mb-3'}`}>
                            {promo.description}
                          </p>

                          {/* Read more toggle */}
                          <button
                            onClick={e => { e.stopPropagation(); setExpandedPromoId(isExpanded ? null : promo.id); }}
                            className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors mb-4"
                          >
                            {isExpanded ? <><ChevronUp size={12} /> Show Less</> : <><ChevronDown size={12} /> Read More</>}
                          </button>

                          {(promo.discount_code || promo.valid_until) && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                              {promo.discount_code && (
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</span>
                                  <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-800">{promo.discount_code}</span>
                                </div>
                              )}
                              {promo.valid_until && (
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires</span>
                                  <span className="text-xs font-bold text-slate-600">{new Date(promo.valid_until).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Facilities Section */}
            <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-sm border border-slate-100">
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
                {(hotel.room_types || hotel.roomTypes) && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Room Types Available</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(hotel.room_types || hotel.roomTypes || []).map((t: string) => (
                        <div key={t} className="flex items-center p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold border border-slate-100 text-sm">
                          <CheckCircle2 size={14} className="mr-3 text-emerald-500" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hotel.amenities && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">The Atmosphere</h4>
                    <div className="relative p-6 sm:p-10 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Award size={120} />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">Manager's Remark</span>
                        <p className="text-lg md:text-xl font-medium leading-relaxed italic text-slate-200">
                          "{hotel.amenities}"
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                          <div className="w-10 h-1 border-t-2 border-emerald-500"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commitment to Excellence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Gallery Section */}
            {hotel.gallery && hotel.gallery.length > 0 && (
              <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <ImageIcon className="text-emerald-600 mr-4" size={28} />
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Hotel Gallery</h2>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                    {hotel.gallery.length} Verified Photos
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {hotel.gallery.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className={`relative rounded-[2rem] overflow-hidden shadow-md border border-white group cursor-pointer ${idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-video' : 'aspect-square'
                        }`}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt={`${hotel.name} Gallery ${idx + 1}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">View Image</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                  <button 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-950/20"
                  >
                    Book Your Stay Now <ArrowUpRight size={14} className="ml-2" />
                  </button>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center mb-8 text-emerald-600">
                <Phone size={20} className="mr-3" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Contact Information</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone size={16} className="text-slate-400 mt-0.5 mr-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Telephone</span>
                    <a href={formatPhoneLink(hotel.contact)} className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                      {formatPhoneDisplay(hotel.contact) || 'Not Provided'}
                    </a>
                  </div>
                </div>
                {hotel.whatsapp && (
                  <div className="flex items-start">
                    <MessageSquare size={16} className="text-emerald-500 mt-0.5 mr-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">WhatsApp Number</span>
                      <a href={formatWhatsAppLink(hotel.whatsapp)} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                        {formatWhatsAppDisplay(hotel.whatsapp)}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <Mail size={16} className="text-slate-400 mt-0.5 mr-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Address</span>
                    <a href={`mailto:${hotel.email}`} className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate block max-w-full">
                      {hotel.email || 'Not Provided'}
                    </a>
                  </div>
                </div>
                {hotel.website && (
                  <div className="flex items-start">
                    <Globe size={16} className="text-slate-400 mt-0.5 mr-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Website URL</span>
                      <a href={`https://${hotel.website}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate block max-w-full">
                        {hotel.website}
                      </a>
                    </div>
                  </div>
                )}
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

const BookingModal = ({ isOpen, onClose, hotel }: { isOpen: boolean, onClose: () => void, hotel: any }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 p-6 sm:p-10 relative">
        <button onClick={onClose} className="absolute top-6 sm:top-8 right-6 sm:right-8 p-2 sm:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all border border-transparent hover:border-slate-100">
          <X size={24} className="text-slate-400 hover:text-rose-500" />
        </button>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <Calendar size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Book Your Stay</h2>
          <p className="text-slate-500 font-bold text-sm tracking-tight uppercase">At {hotel.name}</p>
        </div>

        <div className="space-y-4">
          {hotel.website && (
            <a 
              href={`https://${hotel.website}`} 
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl hover:bg-emerald-700 transition-all group shadow-xl shadow-slate-900/10"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                  <Globe size={20} />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Primary Method</span>
                  <span className="font-bold text-base">Visit Official Website</span>
                </div>
              </div>
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          )}

          {hotel.email && (
            <a 
              href={`mailto:${hotel.email}`}
              className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 group-hover:bg-white rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                  <Mail size={20} className="text-emerald-600" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Inquiry & Reservation</span>
                  <span className="font-bold text-base text-slate-800">Direct Email</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </a>
          )}

          {hotel.whatsapp && (
            <a 
              href={formatWhatsAppLink(hotel.whatsapp)} 
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center justify-between p-6 bg-emerald-50 border border-emerald-100 rounded-3xl hover:bg-emerald-100 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <MessageSquare size={20} className="text-emerald-600" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Instant Message</span>
                  <span className="font-bold text-base text-emerald-900">{formatWhatsAppDisplay(hotel.whatsapp)}</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-emerald-300 group-hover:text-emerald-600 transition-colors" />
            </a>
          )}
        </div>

        <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-widest">
          All bookings are directly handled by the hotel secretariat.
        </p>
      </div>
    </div>
  );
};

export default MemberDetails;
