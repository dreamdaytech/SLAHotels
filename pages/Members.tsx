import React, { useState, useMemo } from 'react';
import {
  Search, MapPin, Star, Filter, Hotel, ChevronRight, Award,
  ChevronDown, X, Users, BedDouble, Wifi, UtensilsCrossed,
  ShieldCheck, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { createSlug } from '../lib/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800';

const StarRow = ({ count, size = 14 }: { count: number; size?: number }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} fill={i <= count ? '#f59e0b' : 'none'} stroke={i <= count ? '#f59e0b' : '#cbd5e1'} />
    ))}
  </span>
);

const Members: React.FC = () => {
  const { members: rawMembers, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStars, setSelectedStars] = useState('All');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [roomRange, setRoomRange] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const members = useMemo(() =>
    (rawMembers || [])
      .filter((m: any) => m.status === 'approved')
      .map((m: any) => ({
        id: m.id,
        name: m.hotel_name || 'Unnamed Property',
        location: m.city || m.address || 'Sierra Leone',
        district: m.district || 'Unspecified',
        stars: parseInt(m.stars) || 0,
        rooms: parseInt(m.rooms) || 0,
        employees: parseInt(m.employees) || 0,
        website: m.website || '',
        email: m.email || '',
        phone: m.phone || '',
        image: (m.gallery && Array.isArray(m.gallery) && m.gallery.length > 0)
          ? m.gallery[0] : FALLBACK_IMG,
        facilities: Array.isArray(m.facilities) ? m.facilities : [],
      })), [rawMembers]);

  const SL_DISTRICTS = [
    'Western Area Urban', 'Western Area Rural', 'Bo', 'Bombali', 'Bonthe',
    'Falaba', 'Kailahun', 'Kambia', 'Karene', 'Kenema', 'Koinadugu',
    'Kono', 'Moyamba', 'Port Loko', 'Pujehun', 'Tonkolili'
  ].sort();

  const districts = ['All', ...SL_DISTRICTS];
  const allPossibleFacilities = ['Restaurant', 'Bar', 'Pool', 'Conference Room', 'Spa', 'Wi-Fi'];

  const processedMembers = useMemo(() => {
    let result = members.filter(m => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = m.name.toLowerCase().includes(s) || m.location.toLowerCase().includes(s) || m.district.toLowerCase().includes(s);
      const matchesDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
      const matchesStars = selectedStars === 'All' || m.stars === parseInt(selectedStars);
      const matchesFacilities = selectedFacilities.length === 0 || selectedFacilities.every(f => m.facilities.includes(f));
      let matchesRooms = true;
      if (roomRange === '0-20') matchesRooms = m.rooms <= 20;
      else if (roomRange === '21-50') matchesRooms = m.rooms > 20 && m.rooms <= 50;
      else if (roomRange === '51-100') matchesRooms = m.rooms > 50 && m.rooms <= 100;
      else if (roomRange === '100+') matchesRooms = m.rooms > 100;
      return matchesSearch && matchesDistrict && matchesStars && matchesFacilities && matchesRooms;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'stars-desc': return b.stars - a.stars;
        case 'stars-asc': return a.stars - b.stars;
        case 'capacity-desc': return (b.rooms || 0) - (a.rooms || 0);
        case 'capacity-asc': return (a.rooms || 0) - (b.rooms || 0);
        default: return 0;
      }
    });
    return result;
  }, [members, searchTerm, selectedDistrict, selectedStars, selectedFacilities, roomRange, sortBy]);

  const toggleFacility = (f: string) =>
    setSelectedFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const resetFilters = () => {
    setSearchTerm(''); setSelectedDistrict('All'); setSelectedStars('All');
    setSelectedFacilities([]); setRoomRange('All'); setSortBy('name-asc');
  };

  const hasFilters = selectedDistrict !== 'All' || selectedStars !== 'All' || searchTerm || selectedFacilities.length > 0 || roomRange !== 'All';

  // Facility icon map
  const facilityIcon: Record<string, React.ReactNode> = {
    'Restaurant': <UtensilsCrossed size={11} />,
    'Wi-Fi': <Wifi size={11} />,
    'Bar': <span className="text-[10px]">🍸</span>,
    'Pool': <span className="text-[10px]">🏊</span>,
    'Conference Room': <span className="text-[10px]">💼</span>,
    'Spa': <span className="text-[10px]">🧖</span>,
  };

  return (
    <div className="pt-32 lg:pt-40 pb-32">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8 mb-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <p className="text-emerald-600 text-xs font-black uppercase tracking-[0.25em] mb-3">Sierra Leone Association of Hotels</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
              Member <span className="text-emerald-600">Directory</span>
            </h1>
            <p className="text-slate-500 text-lg mt-4 max-w-xl leading-relaxed">
              Sierra Leone's certified and SLAH-verified hotels — from intimate boutiques to large-scale properties.
            </p>
          </div>
          {/* live count pill */}
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl self-start lg:self-auto">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">SLAH Certified</p>
              <p className="text-2xl font-black text-emerald-900">{members.length} {members.length === 1 ? 'Property' : 'Properties'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTROLS BAR ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8 mb-10">
        <div className="bg-white rounded-[2.5rem] p-4 lg:p-5 shadow-xl border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Search */}
            <div className="flex-grow relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by hotel name, city or district…"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white border-2 border-transparent focus:border-emerald-300 transition-all font-semibold text-slate-800 placeholder-slate-300"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort — visible on all sizes */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Sort</span>
              <div className="relative">
                <select
                  value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-50 rounded-2xl pl-4 pr-9 py-4 text-xs font-black text-slate-700 outline-none cursor-pointer uppercase tracking-widest border-none"
                >
                  <option value="name-asc">A → Z</option>
                  <option value="name-desc">Z → A</option>
                  <option value="stars-desc">Highest Rated</option>
                  <option value="stars-asc">Lowest Rated</option>
                  <option value="capacity-desc">Most Rooms</option>
                  <option value="capacity-asc">Fewest Rooms</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`flex items-center justify-center gap-2 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${isFilterVisible || hasFilters
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'bg-slate-900 text-white hover:bg-slate-700'
                }`}
            >
              <Filter size={16} />
              {isFilterVisible ? 'Hide Filters' : 'Refine'}
              {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            </button>
          </div>

          {/* Filter Drawer */}
          {isFilterVisible && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* District */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={11} /> District</label>
                  <div className="relative">
                    <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
                      className="w-full appearance-none bg-slate-50 rounded-xl px-5 py-3 pr-9 text-sm font-bold text-slate-700 outline-none">
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {/* Stars */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Star size={11} /> Rating</label>
                  <div className="relative">
                    <select value={selectedStars} onChange={e => setSelectedStars(e.target.value)}
                      className="w-full appearance-none bg-slate-50 rounded-xl px-5 py-3 pr-9 text-sm font-bold text-slate-700 outline-none">
                      <option value="All">All Ratings</option>
                      {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} Stars</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {/* Rooms */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><BedDouble size={11} /> Room Range</label>
                  <div className="relative">
                    <select value={roomRange} onChange={e => setRoomRange(e.target.value)}
                      className="w-full appearance-none bg-slate-50 rounded-xl px-5 py-3 pr-9 text-sm font-bold text-slate-700 outline-none">
                      <option value="All">Any Size</option>
                      <option value="0-20">Boutique (1–20)</option>
                      <option value="21-50">Mid-size (21–50)</option>
                      <option value="51-100">Large (51–100)</option>
                      <option value="100+">Mega (100+)</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {/* Reset */}
                <div className="flex flex-col justify-end">
                  <button onClick={resetFilters}
                    className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-500 border border-slate-100 rounded-xl hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center gap-2">
                    <X size={13} /> Reset All
                  </button>
                </div>
              </div>
              {/* Amenity chips */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Must-have amenities</p>
                <div className="flex flex-wrap gap-2">
                  {allPossibleFacilities.map(f => (
                    <button key={f} onClick={() => toggleFacility(f)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedFacilities.includes(f)
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                        : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}>
                      {facilityIcon[f]} {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS META ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8 mb-8">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Hotel size={14} className="text-emerald-500" />
            {loading && !processedMembers.length ? 'Loading directory…' : `${processedMembers.length} certified ${processedMembers.length === 1 ? 'property' : 'properties'}`}
          </p>
          {hasFilters && (
            <button onClick={resetFilters} className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-1">
              <X size={11} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── DIRECTORY GRID ───────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8">
        {processedMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {processedMembers.map((hotel, idx) => (
              <Link
                to={`/members/${createSlug(hotel.name)}`}
                key={hotel.id}
                className={`group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col block ${idx === 0 && processedMembers.length >= 3 ? 'md:col-span-2 xl:col-span-1' : ''}`}
              >
                {/* Hero image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={hotel.image} alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Dark scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
                    <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-emerald-800 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow">
                      <ShieldCheck size={10} className="text-emerald-600" /> SLAH Certified
                    </span>
                    {hotel.stars > 0 && (
                      <span className="flex items-center gap-1 bg-amber-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow">
                        <Star size={9} fill="white" /> {hotel.stars}-Star
                      </span>
                    )}
                  </div>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-black text-white leading-tight drop-shadow-lg mb-1">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold">
                      <MapPin size={11} className="text-emerald-400 shrink-0" />
                      {hotel.location}{hotel.district && hotel.district !== hotel.location ? `, ${hotel.district}` : ''}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-7 flex-1 flex flex-col gap-5">

                  {/* Star row (always visible) */}
                  <div className="flex items-center justify-between">
                    <StarRow count={hotel.stars} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {hotel.stars > 0 ? `${hotel.stars}-Star Property` : 'Unrated'}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1 text-slate-400">
                        <BedDouble size={13} />
                      </div>
                      <p className="text-base font-black text-slate-900 leading-none">
                        {hotel.rooms > 0 ? hotel.rooms : '—'}
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Rooms</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1 text-slate-400">
                        <Users size={13} />
                      </div>
                      <p className="text-base font-black text-slate-900 leading-none">
                        {hotel.employees > 0 ? hotel.employees : '—'}
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Staff</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-100 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1 text-emerald-400">
                        <ShieldCheck size={13} />
                      </div>
                      <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest leading-tight mt-1">Verified<br />Member</p>
                    </div>
                  </div>

                  {/* Facilities */}
                  {hotel.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {hotel.facilities.slice(0, 4).map((f: string) => (
                        <span key={f} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                          {facilityIcon[f]} {f}
                        </span>
                      ))}
                      {hotel.facilities.length > 4 && (
                        <span className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                          +{hotel.facilities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div
                    className="mt-auto flex items-center justify-between w-full py-4 px-7 bg-slate-900 text-white group-hover:bg-emerald-700 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg"
                  >
                    View Full Profile
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hotel size={40} className="text-slate-200" />
            </div>
            <h3 className="text-slate-400 font-black text-xl uppercase tracking-widest mb-3">No Properties Found</h3>
            <p className="text-slate-300 text-sm mb-8 max-w-sm mx-auto">
              No establishments match your current filters. Try broadening your search.
            </p>
            <button
              onClick={resetFilters}
              className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all uppercase tracking-widest text-[10px] shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* ── JOIN CTA BANNER ───────────────────────────────────────────── */}
        <div className="mt-24 bg-emerald-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 african-accents" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
            <div className="max-w-2xl">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <Award size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-3">
                List Your Hotel in the Directory
              </h2>
              <p className="text-emerald-100/70 text-lg leading-relaxed">
                SLAH-certified members gain national visibility, direct policy representation, and access to exclusive industry events. Register your property today.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <Link
                to="/register"
                className="px-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] shadow-2xl transition-all hover:-translate-y-0.5"
              >
                Apply for Membership
              </Link>
              <Link to="/contact" className="text-emerald-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                Contact the Secretariat →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
