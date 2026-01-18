import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Star, Filter, Hotel, ChevronRight, Award, SortAsc, SortDesc, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering & Sorting State
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStars, setSelectedStars] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('status', 'approved');

        if (error) throw error;

        // Normalize data structure for the directory grid
        const formatted = (data || []).map((m: any) => ({
          id: m.id,
          name: m.hotel_name,
          location: m.city,
          address: m.address,
          district: m.district,
          stars: m.stars,
          image: (m.gallery && m.gallery.length > 0) ? m.gallery[0] : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
          type: 'Hotel', // Property type not explicitly in schema
          rooms: m.rooms || 'N/A'
        }));

        setMembers(formatted);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Derive unique filter options from live data
  const districts = useMemo(() => ['All', ...new Set(members.map(m => m.district).filter(Boolean))], [members]);
  const propertyTypes = useMemo(() => ['All', ...new Set(members.map(m => m.type).filter(Boolean))], [members]);

  // Combined Filtering & Sorting Logic
  const processedMembers = useMemo(() => {
    let result = members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.district?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
      const matchesStars = selectedStars === 'All' || m.stars === parseInt(selectedStars);
      const matchesType = selectedType === 'All' || m.type === selectedType;

      return matchesSearch && matchesDistrict && matchesStars && matchesType;
    });

    // Apply Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'stars-desc': return b.stars - a.stars;
        case 'stars-asc': return a.stars - b.stars;
        default: return 0;
      }
    });

    return result;
  }, [members, searchTerm, selectedDistrict, selectedStars, selectedType, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDistrict('All');
    setSelectedStars('All');
    setSelectedType('All');
    setSortBy('name-asc');
  };

  return (
    <div className="pt-32 lg:pt-40 pb-32 african-accents">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mb-20">
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-none">
            Member <span className="text-emerald-600">Directory</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
            Discover Sierra Leone's finest hotels. Use the controls below to find certified establishments by location, rating, or class.
          </p>
        </div>

        {/* Dynamic Controls Area */}
        <div className="bg-white rounded-[3rem] p-4 lg:p-6 shadow-xl border border-slate-100 mb-16">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Search Bar */}
            <div className="flex-grow relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={24} />
              <input
                type="text"
                placeholder="Search by hotel name or city..."
                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-transparent rounded-[2rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-bold text-lg shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Desktop Quick Sort */}
            <div className="hidden lg:flex items-center space-x-2 px-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-50 border-none rounded-2xl px-6 py-4 pr-12 text-xs font-black text-slate-700 outline-none hover:bg-slate-100 transition-all cursor-pointer uppercase tracking-widest"
                >
                  <option value="name-asc">Alphabetical (A-Z)</option>
                  <option value="name-desc">Alphabetical (Z-A)</option>
                  <option value="stars-desc">Highest Rated</option>
                  <option value="stars-asc">Lowest Rated</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`flex items-center justify-center space-x-3 px-10 py-5 rounded-[2rem] transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg ${isFilterVisible ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              <Filter size={18} />
              <span>{isFilterVisible ? 'Hide Filters' : 'Refine Results'}</span>
            </button>
          </div>

          {/* Advanced Filter Drawer */}
          {isFilterVisible && (
            <div className="mt-8 pt-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* District Filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <MapPin size={12} className="mr-2" /> By District
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border-none rounded-2xl px-6 py-4 pr-10 text-sm font-bold text-slate-700 outline-none"
                    >
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Star size={12} className="mr-2" /> Star Rating
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStars}
                      onChange={(e) => setSelectedStars(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border-none rounded-2xl px-6 py-4 pr-10 text-sm font-bold text-slate-700 outline-none"
                    >
                      <option value="All">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Hotel size={12} className="mr-2" /> Property Class
                  </label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border-none rounded-2xl px-6 py-4 pr-10 text-sm font-bold text-slate-700 outline-none"
                    >
                      {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Reset Actions */}
                <div className="flex flex-col justify-end">
                  <button
                    onClick={resetFilters}
                    className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-colors flex items-center justify-center border border-slate-100 rounded-2xl hover:bg-rose-50 hover:border-rose-100"
                  >
                    <X size={14} className="mr-2" /> Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Metadata */}
        <div className="mb-10 flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-4">
          <div className="flex items-center">
            <Hotel size={14} className="mr-2 text-emerald-500" />
            <span>{loading ? 'Consulting Directory...' : `Showing ${processedMembers.length} Certified Properties`}</span>
          </div>
          {(selectedDistrict !== 'All' || selectedStars !== 'All' || selectedType !== 'All' || searchTerm) && (
            <span className="text-emerald-600 animate-pulse">Filtered Active</span>
          )}
        </div>

        {/* Directory Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {loading ? (
            <div className="col-span-full py-40 flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-700"></div>
            </div>
          ) : processedMembers.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="h-72 relative overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-8 left-8">
                  <span className="bg-white/95 backdrop-blur-md text-emerald-800 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                    {hotel.type}
                  </span>
                </div>
                <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex text-amber-400">
                    {[...Array(hotel.stars)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                </div>
              </div>

              <div className="p-10 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-emerald-700 transition-colors">
                  {hotel.name}
                </h3>

                <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
                  <MapPin size={14} className="mr-2 text-emerald-500" />
                  {hotel.location}, {hotel.district}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Star Class</p>
                    <p className="text-sm font-bold text-slate-800">{hotel.stars} Stars</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                    <p className="text-sm font-bold text-slate-800">{hotel.rooms} Rooms</p>
                  </div>
                </div>

                <Link
                  to={`/members/${hotel.id}`}
                  className="mt-auto flex items-center justify-between w-full py-5 px-8 bg-slate-50 text-slate-900 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] group/btn"
                >
                  View Profile <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {processedMembers.length === 0 && (
          <div className="py-40 text-center bg-white rounded-[4rem] border border-slate-50 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] african-accents"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <Hotel size={48} />
              </div>
              <h3 className="text-slate-400 font-black text-2xl uppercase tracking-[0.2em] mb-4">No Members Found</h3>
              <p className="text-slate-300 font-medium text-lg mb-8 max-w-md mx-auto px-6">
                We couldn't find any establishments matching your specific search or filter criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/10"
              >
                Clear All Criteria
              </button>
            </div>
          </div>
        )}

        {/* Certification Notice */}
        <div className="mt-24 p-12 bg-emerald-900 rounded-[3.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 african-accents"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
            <div className="max-w-2xl">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 text-emerald-400">
                <Award size={32} />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Join the Member Directory</h2>
              <p className="text-emerald-100/70 text-lg leading-relaxed">
                Certified members gain national visibility, direct advocacy, and access to exclusive training summits. Get your property verified today.
              </p>
            </div>
            <Link to="/register" className="px-12 py-6 bg-white text-emerald-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-amber-500 hover:text-white transition-all transform hover:-translate-y-1">
              Apply for Certification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
