
import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Clock, Search, ArrowUpRight, Filter, ChevronDown, CalendarDays, History, PlayCircle, LayoutGrid, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
  status?: string;
  schedule?: { date: string; time: string }[];
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const isMultiDay = Array.isArray(event.schedule) && event.schedule.length > 1;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  const dateDisplay = isMultiDay && event.schedule
    ? `${formatDate(event.schedule[0].date)} — ${formatDate(event.schedule[event.schedule.length - 1].date)}`
    : new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="h-72 relative overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-8 left-8">
          <span className="bg-white/95 backdrop-blur-md text-emerald-800 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            {event.category}
          </span>
        </div>
        <Link
          to={`/events/${event.id}`}
          className="absolute bottom-8 right-8 p-5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl hover:bg-slate-900 transition-all transform hover:rotate-12 group/btn"
        >
          <ArrowUpRight size={24} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <div className="p-10 flex-grow flex flex-col">
        <div className="flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
          <Calendar size={12} className="mr-2" />
          {dateDisplay}
        </div>

        <Link to={`/events/${event.id}`}>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 hover:text-emerald-700 transition-colors leading-tight">{event.title}</h3>
        </Link>

        <p className="text-slate-500/80 text-sm leading-relaxed line-clamp-3 mb-8 font-medium italic">
          "{event.description}"
        </p>

        <div className="mt-auto pt-8 border-t border-slate-50 space-y-4">
          <div className="flex items-center text-slate-500 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-4">
              <Clock size={16} className="text-emerald-500/50" />
            </div>
            {isMultiDay ? 'Multiple Sessions' : event.time}
          </div>
          <div className="flex items-center text-slate-500 text-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-4">
              <MapPin size={16} className="text-emerald-500/50" />
            </div>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="mt-10 flex items-center justify-center w-full py-5 bg-emerald-600 text-white hover:bg-slate-900 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/10 group/btn"
        >
          View Details <ArrowUpRight size={14} className="ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const Events: React.FC = () => {
  const { events, loading } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past' | 'current'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const today = new Date().toISOString().split('T')[0];

  const filteredEvents = events
    .filter(e => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = e.title.toLowerCase().includes(searchStr) ||
        e.location.toLowerCase().includes(searchStr) ||
        e.description.toLowerCase().includes(searchStr) ||
        e.category.toLowerCase().includes(searchStr);

      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'upcoming') matchesStatus = e.date > today;
      else if (statusFilter === 'past') matchesStatus = e.date < today;
      else if (statusFilter === 'current') matchesStatus = e.date === today;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      return sortOrder === 'newest'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    });

  const categories = ['All', 'Summit', 'Corporate', 'Training', 'Community'];

  return (
    <div className="pt-32 lg:pt-40 pb-32 african-accents">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mb-20">
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-none">
            Events <span className="text-emerald-600">&</span> Summits
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
            Discover the roadmap for Sierra Leone's hospitality excellence. Join industry-defining summits, professional workshops, and networking forums.
          </p>
        </div>

        {/* Search, Filter, and Sort Controls Area */}
        <div className="space-y-8 mb-16">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            {/* Status Navigation Tabs */}
            <div className="flex p-1.5 bg-slate-100 rounded-[1.75rem] w-fit overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: 'all', label: 'All Events', icon: <LayoutGrid size={14} /> },
                { id: 'upcoming', label: 'Upcoming', icon: <CalendarDays size={14} /> },
                { id: 'current', label: 'Today', icon: <PlayCircle size={14} /> },
                { id: 'past', label: 'Archive', icon: <History size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center whitespace-nowrap ${statusFilter === tab.id
                    ? 'bg-white text-emerald-700 shadow-xl'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="appearance-none bg-white border border-slate-100 rounded-2xl px-6 py-3.5 pr-10 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/5 shadow-sm min-w-[160px]"
                >
                  <option value="newest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Search Input */}
            <div className="lg:col-span-7 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Search by topic, venue, or category..."
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2.5rem] outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-medium text-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Pills */}
            <div className="lg:col-span-5 flex items-center">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${categoryFilter === cat
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="mb-10 flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest px-4">
          <div className="flex items-center">
            <Filter size={14} className="mr-2 text-emerald-500/50" />
            <span>
              {loading ? 'Searching...' : `Showing ${filteredEvents.length} result${filteredEvents.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          {searchQuery && <span className="text-emerald-600">Search: "{searchQuery}"</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            /* Empty State */
            <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-slate-50 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] african-accents"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Calendar size={48} />
                </div>
                <h3 className="text-slate-400 font-black text-2xl uppercase tracking-[0.2em] mb-4">No events match your criteria</h3>
                <p className="text-slate-300 font-medium text-lg mb-8 max-w-md mx-auto px-6">
                  We couldn't find any {statusFilter !== 'all' ? statusFilter : ''} events {categoryFilter !== 'All' ? `in the ${categoryFilter} category` : ''} matching your search.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setStatusFilter('all');
                  }}
                  className="px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/10"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
