
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ChevronLeft, User, Mail, Building2,
  Send, CheckCircle2, Download, QrCode, X, Info, Users,
  Target, Award, Share2, Facebook, Twitter, Linkedin, ChevronRight,
  CalendarPlus, BellRing, ArrowUpRight, ListTodo
} from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';

interface AgendaItem {
  time: string;
  activity: string;
}

interface ScheduleItem {
  date: string;
  time: string;
  agenda: AgendaItem[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
  fullContent?: string;
  agenda?: AgendaItem[];
  speakers?: { name: string; role: string; image: string }[];
  schedule?: ScheduleItem[];
}

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAgendaDay, setActiveAgendaDay] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', org: '' });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // Default fallback for legacy events or those without complex schedule
          const defaultAgenda = [
            { time: "08:30 AM", activity: "Delegate Arrival & Networking Breakfast" },
            { time: "09:30 AM", activity: "Official Opening: Keynote Address" },
            { time: "11:00 AM", activity: "Plenary Session: Industry Standards" },
            { time: "01:00 PM", activity: "Hosted Networking Lunch" },
            { time: "02:30 PM", activity: "Breakout Workshops" },
            { time: "04:30 PM", activity: "Closing Reception" }
          ];

          setEvent({
            ...data,
            fullContent: data.full_content || data.fullContent || data.description + " This landmark summit provides a critical forum for stakeholders to align on national hospitality standards. We will explore digital transformation, sustainable energy solutions for resorts, and the latest trends in luxury guest experiences in West Africa.",
            agenda: data.agenda || defaultAgenda,
            speakers: data.speakers || [
              { name: "Hon. Tamba Lamina", role: "Tourism Specialist", image: "https://i.pravatar.cc/150?u=tamba" },
              { name: "Ms. Sia Bangura", role: "Eco-Hospitality Lead", image: "https://i.pravatar.cc/150?u=sia" },
              { name: "Mr. Kelvin Cole", role: "NTB Representative", image: "https://i.pravatar.cc/150?u=kelvin" }
            ],
            schedule: data.schedule || []
          });
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1500);
  };

  const handleDownload = () => {
    alert('Processing your high-resolution ticket...');
    setTimeout(() => {
      alert(`SLAH Entry Pass (Ref: ${Math.floor(Math.random() * 100000)}) has been saved successfully.`);
    }, 1000);
  };

  const generateGoogleCalendarUrl = () => {
    if (!event) return '';
    const start = event.date.replace(/-/g, '');
    const title = encodeURIComponent(event.title);
    const loc = encodeURIComponent(event.location);
    const details = encodeURIComponent(event.description);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}T090000Z/${start}T170000Z&details=${details}&location=${loc}`;
  };

  const downloadIcsFile = () => {
    if (!event) return;
    const date = event.date.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${date}T090000Z
DTEND:${date}T170000Z
SUMMARY:${event.title}
LOCATION:${event.location}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="pt-40 pb-40 text-center text-slate-400">
      <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-xl font-bold">Synchronizing Event Details...</p>
    </div>
  );

  if (!event) return (
    <div className="pt-40 pb-40 text-center text-slate-400">
      <Target size={48} className="mx-auto mb-6 opacity-20" />
      <p className="text-xl font-bold">Event not found.</p>
      <Link to="/events" className="text-emerald-600 underline mt-4 inline-block">Return to Calendar</Link>
    </div>
  );

  const isMultiDay = event.schedule && event.schedule.length > 1;
  const currentAgenda = isMultiDay && event.schedule?.[activeAgendaDay]?.agenda
    ? event.schedule[activeAgendaDay].agenda
    : event.agenda;

  return (
    <div className="bg-white min-h-screen">
      {/* Immersive Hero */}
      <section className="relative h-[70vh] min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 pb-20">
          <Link to="/events" className="inline-flex items-center text-white/70 font-bold text-xs uppercase tracking-[0.3em] mb-12 hover:text-emerald-400 transition-colors group">
            <div className="bg-white/10 p-2 rounded-xl mr-4 group-hover:bg-emerald-600 transition-colors"><ChevronLeft size={16} /></div>
            Back to Calendar
          </Link>
          <div className="max-w-5xl">
            <div className="flex items-center space-x-4 mb-8">
              <span className="bg-emerald-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                {event.category}
              </span>
              <div className="h-px w-12 bg-white/20"></div>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Official Association Event</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-tight mb-10 tracking-tighter">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-10">
              <div className="flex items-center text-emerald-400">
                <Calendar size={20} className="mr-3" />
                <span className="font-bold text-lg">
                  {isMultiDay ? `${event.schedule?.length} Day Summit` : new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center text-slate-300">
                <MapPin size={20} className="mr-3 text-emerald-500" />
                <span className="font-medium text-lg">{event.location}</span>
              </div>
              {!isMultiDay && (
                <div className="flex items-center text-slate-300">
                  <Clock size={20} className="mr-3 text-emerald-500" />
                  <span className="font-medium text-lg">{event.time}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-32 container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Main Info Area */}
          <div className="lg:col-span-8 space-y-24">

            <div className="space-y-10">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center">
                <Info className="mr-6 text-emerald-600" size={32} /> Overview
              </h2>
              <div className="text-2xl text-slate-600 leading-relaxed font-light first-letter:text-7xl first-letter:font-black first-letter:text-emerald-700 first-letter:mr-3 first-letter:float-left">
                {event.fullContent}
              </div>
            </div>

            {/* Agenda Section */}
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center">
                  <Target className="mr-6 text-emerald-600" size={32} /> {isMultiDay ? 'Summit Itinerary' : 'Official Agenda'}
                </h2>

                {isMultiDay && event.schedule && (
                  <div className="flex p-1 bg-slate-100 rounded-2xl">
                    {event.schedule.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveAgendaDay(idx)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeAgendaDay === idx ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Day {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-[4rem] p-10 md:p-16 border border-slate-100 relative overflow-hidden">
                {isMultiDay && event.schedule && (
                  <div className="mb-12 flex items-center text-emerald-600 font-bold text-sm">
                    <Calendar size={16} className="mr-2" />
                    {new Date(event.schedule[activeAgendaDay].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    <span className="mx-3 text-slate-300">|</span>
                    <Clock size={16} className="mr-2" />
                    {event.schedule[activeAgendaDay].time}
                  </div>
                )}

                <div className="space-y-12 relative z-10">
                  {currentAgenda?.map((item, idx) => (
                    <div key={idx} className="flex gap-10 group items-start animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="w-28 flex-shrink-0 pt-1">
                        <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] block">{item.time}</span>
                        <div className="h-px w-8 bg-emerald-100 mt-2"></div>
                      </div>
                      <div className="relative pl-10 border-l border-slate-200 flex-grow pb-4">
                        <div className="absolute -left-[5.5px] top-2.5 w-2.5 h-2.5 bg-slate-200 rounded-full group-hover:bg-emerald-500 transition-colors shadow-sm ring-4 ring-white"></div>
                        <h4 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.activity}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Speaker Showcase */}
            <div className="space-y-12">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center">
                <Users className="mr-6 text-emerald-600" size={32} /> Keynote Speakers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                {event.speakers?.map((speaker, idx) => (
                  <div key={idx} className="group">
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden mb-8 shadow-2xl ring-8 ring-slate-50 transform group-hover:-translate-y-2 transition-all duration-500">
                      <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900">{speaker.name}</h4>
                    <p className="text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mt-2">{speaker.role}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Multi-day Overview */}
            {isMultiDay && (
              <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                  <Calendar className="mr-2 text-emerald-600" size={16} /> Full Schedule
                </h3>
                <div className="space-y-4">
                  {event.schedule?.map((session, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeAgendaDay === idx ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-50 hover:border-slate-200'}`} onClick={() => setActiveAgendaDay(idx)}>
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Day {idx + 1}</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registration Card */}
            <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-50 sticky top-32">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">Registration</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium" />
                  <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium" />
                  <input required type="text" placeholder="Organization" value={formData.org} onChange={e => setFormData({ ...formData, org: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium" />
                </div>

                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Info size={16} /></div>
                  <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-widest">
                    Your registration includes full access to all panels, workshops, and networking luncheons.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl uppercase tracking-[0.2em] text-xs hover:bg-slate-900 transition-all shadow-2xl shadow-emerald-900/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Register Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 african-accents">
            <div className="p-16 text-center bg-emerald-50 border-b border-emerald-100 relative">
              <div className="w-24 h-24 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-6 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">SUCCESS!</h2>
              <p className="text-emerald-700 font-black uppercase tracking-[0.3em] text-xs">You are registered for {event.title}</p>
            </div>

            <div className="p-16 text-center space-y-10">
              <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-8 border border-slate-50">
                  <QrCode size={180} className="text-slate-900" />
                </div>
                <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
                  SLAH Reference: #EVT-{Math.floor(10000 + Math.random() * 90000)}
                </p>
              </div>
              <button
                onClick={() => { setShowSuccess(false); navigate('/events'); }}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]"
              >
                Return to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
