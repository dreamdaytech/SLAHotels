
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import {
  Users, Building2, FileText, BarChart3, Settings, LogOut,
  CheckCircle2, XCircle, Clock, Search, Plus, UserPlus,
  Menu, X, Bell, LayoutDashboard, Hotel, Star, MapPin,
  Lock, Eye, Trash2, Edit3, Calendar, UploadCloud, Info,
  Briefcase, Send, Target, Trash, ListTodo, Camera,
  User as UserIcon, Copy, AlertTriangle, CheckCircle, Newspaper,
  Image as ImageIcon, Globe, Award, ChevronRight, FileCheck,
  History, Filter, Phone, Scale, FileBadge, FileSignature, CheckSquare,
  ShieldCheck, AlertCircle
} from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';

// --- Dashboard Sub-Components ---

const Stats = ({ user }: { user: any }) => {
  const [counts, setCounts] = useState({ members: 0, pending: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: hotels, error: hotelError } = await supabase
          .from('hotels')
          .select('status');

        if (hotelError) throw hotelError;

        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        const approved = (hotels || []).filter(h => h.status === 'approved').length;
        const pending = (hotels || []).filter(h => h.status === 'pending').length;

        setCounts({
          members: approved,
          pending: pending,
          users: usersCount || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Members', value: counts.members.toString(), icon: <Hotel className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Pending Apps', value: counts.pending.toString(), icon: <FileText className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'System Users', value: counts.users.toString(), icon: <Users className="text-indigo-600" />, color: 'bg-indigo-50' },
    { label: 'Avg Rating', value: '4.2', icon: <BarChart3 className="text-rose-600" />, color: 'bg-rose-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 mt-2">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex md:block items-center justify-between md:justify-start">
          <div className="flex items-center space-x-4 md:block md:space-x-0">
            <div className={`p-3 rounded-2xl ${stat.color} w-fit`}>{stat.icon}</div>
            <div className="md:mt-4">
              <p className="text-slate-500 text-xs font-medium md:mb-1">{stat.label}</p>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </div>
          <span className="hidden md:inline-block mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Live Status</span>
        </div>
      ))}
    </div>
  );
};

const RecentActivity = () => {
  const activities = [
    { id: 1, type: 'registration', text: 'New application from "Bonthe Seaside Lodge"', time: '2 hours ago', icon: <FileText size={14} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 2, type: 'approval', text: 'Admin approved "Gola Forest Lodge"', time: '5 hours ago', icon: <CheckCircle2 size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, type: 'update', text: 'Radisson Blu updated their gallery', time: 'Yesterday', icon: <Hotel size={14} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 4, type: 'user', text: 'New staff user added to Secretariat', time: '2 days ago', icon: <UserPlus size={14} />, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className={`mt-1 p-2 rounded-lg ${activity.bg} ${activity.color}`}>
              {activity.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{activity.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-8 py-3 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors border-t border-slate-50">
        View All Logs
      </button>
    </div>
  );
};

const ApplicationModal = ({ app, onClose, onApprove, onReject }: { app: any, onClose: () => void, onApprove: (id: string) => void, onReject: (id: string) => void }) => {
  if (!app) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="p-2 md:p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <FileCheck size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-sm md:text-xl font-black text-slate-900 uppercase tracking-tight">Membership Review</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {app.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content - Matches Register.tsx Sections */}
        <div className="flex-grow overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12 no-scrollbar bg-slate-50/30">

          {/* SECTION A: Hotel Information */}
          <section className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 md:space-y-8">
            <div className="flex items-center space-x-3 md:space-x-4 border-b border-slate-50 pb-4">
              <Hotel className="text-emerald-600" size={18} />
              <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.2em] md:tracking-[0.3em]">SECTION A: Hotel Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hotel Name</p>
                <p className="text-base md:text-lg font-bold text-slate-900">{app.hotelName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Official Email Address</p>
                <p className="text-lg font-bold text-slate-900">{app.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                <p className="text-lg font-bold text-slate-900">{app.contact || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hotel Website</p>
                <p className="text-lg font-bold text-slate-900">{app.website || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Address</p>
                <p className="text-lg font-bold text-slate-900">{app.address}, {app.city}, {app.district}</p>
              </div>
            </div>
          </section>

          {/* SECTION B: Ownership & Management */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center space-x-4 border-b border-slate-50 pb-4">
              <Briefcase className="text-emerald-600" size={20} />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">SECTION B: Ownership & Management</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner / Proprietor Name</p>
                <p className="text-lg font-bold text-slate-900">{app.owner}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Managing Director / GM</p>
                <p className="text-lg font-bold text-slate-900">{app.manager || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Business Registration #</p>
                <p className="text-lg font-bold text-slate-900">{app.regNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Year Established</p>
                <p className="text-lg font-bold text-slate-900">{app.year || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Employees</p>
                <p className="text-lg font-bold text-slate-900">{app.employees || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* SECTION C: Hotel Facilities & Classification */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center space-x-4 border-b border-slate-50 pb-4">
              <Award className="text-emerald-600" size={20} />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">SECTION C: Facilities & Classification</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hotel Classification</p>
                  <div className="flex text-amber-400 space-x-1">
                    {[...Array(parseInt(app.stars || 4))].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Room Count</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{app.rooms || '0'}</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Room Types Available</p>
                  <div className="flex flex-wrap gap-2">
                    {(app.roomTypes || ['Standard']).map((type: string) => (
                      <span key={type} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest">{type}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">In-House Facilities</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(app.facilities || ['Wi-Fi']).map((facility: string) => (
                      <div key={facility} className="flex items-center p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-bold">
                        <CheckCircle2 size={14} className="mr-2 flex-shrink-0" />
                        {facility}
                      </div>
                    ))}
                  </div>
                </div>
                {app.otherAmenities && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Other Amenities</p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl italic">{app.otherAmenities}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION D: Legal & Compliance */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center space-x-4 border-b border-slate-50 pb-4">
              <Scale className="text-emerald-600" size={20} />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">SECTION D: Legal & Compliance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax ID Number (TIN)</p>
                <p className="text-lg font-bold text-slate-900">{app.tin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NTB License Number</p>
                <p className="text-lg font-bold text-slate-900">{app.ntbLicense || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Uploaded Certificates</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Incorporation', key: 'certIncorporation' },
                    { label: 'Business Reg', key: 'bizRegCert' },
                    { label: 'Other Docs', key: 'otherCerts' }
                  ].map((doc) => (
                    <div key={doc.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="text-emerald-600 mr-3" size={18} />
                        <span className="text-xs font-bold text-slate-700">{doc.label}</span>
                      </div>
                      {app.documents?.[doc.key] ? (
                        <button onClick={() => {
                          const win = window.open();
                          win?.document.write(`<iframe src="${app.documents[doc.key]}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        }} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View</button>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Missing</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {app.complianceRemarks && (
                <div className="md:col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Compliance Remarks</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">{app.complianceRemarks}</p>
                </div>
              )}
            </div>
          </section>

          {/* SECTION E: Association Commitment */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center space-x-4 border-b border-slate-50 pb-4">
              <FileSignature className="text-emerald-600" size={20} />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">SECTION E: Association Commitment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
              <div className="md:col-span-3 bg-emerald-50/50 p-6 rounded-2xl italic text-slate-600 text-sm">
                "By signing this form, I acknowledge that our hotel agrees to abide by the rules and regulations of the Sierra Leone Association of Hotels and commit to active participation in its activities."
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signatory Name</p>
                <p className="text-lg font-bold text-slate-900">{app.signeeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</p>
                <p className="text-lg font-bold text-slate-900">{app.signeePosition || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Date</p>
                <p className="text-lg font-bold text-slate-900">{app.signeeDate || app.date}</p>
              </div>
            </div>
          </section>

          {/* SECTION F: Hotel Gallery */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center space-x-4 border-b border-slate-50 pb-4">
              <ImageIcon className="text-emerald-600" size={20} />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">SECTION F: Property Showcase</h3>
            </div>
            {app.gallery && app.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {app.gallery.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group relative">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Gallery ${idx}`} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <ImageIcon size={48} className="text-slate-100 mx-auto mb-4" />
                <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No gallery images provided with application</p>
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 flex justify-between items-center z-10">
          <div className="flex flex-col">
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              <Clock size={14} className="mr-2" /> Current Application Status
            </div>
            <span className={`text-sm font-black uppercase tracking-[0.1em] ${app.status === 'approved' ? 'text-emerald-600' :
              app.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'
              }`}>
              {app.status.toUpperCase()}
            </span>
          </div>

          <div className="flex space-x-4">
            {app.status === 'pending' && (
              <>
                <button
                  onClick={() => { onReject(app.id); onClose(); }}
                  className="px-8 py-3 bg-white border border-slate-200 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all"
                >
                  Deny Membership
                </button>
                <button
                  onClick={() => { onApprove(app.id); onClose(); }}
                  className="px-12 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-900/20 flex items-center"
                >
                  <CheckCircle size={16} className="mr-2" /> Approve Membership
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Close Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Applications = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map database fields to UI expectations
        const formatted = (data || []).map((m: any) => ({
          ...m,
          hotelName: m.hotel_name,
          date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          regNumber: m.reg_number,
          year: m.year_established?.toString()
        }));

        setApps(formatted);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };

    fetchApps();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      setApps(apps.map(app => app.id === id ? { ...app, status: 'approved' } : app));
      alert('Membership Approved. Hotel profile is now live in the directory.');
    } catch (err: any) {
      console.error('Error approving application:', err.message);
      alert('Error updating application status.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      setApps(apps.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
      alert('Application Rejected.');
    } catch (err: any) {
      console.error('Error rejecting application:', err.message);
      alert('Error updating application status.');
    }
  };

  const filteredApps = apps.filter(app => app.status === activeTab);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full">
        <div className="p-4 md:p-10 border-b border-slate-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Membership Applications</h2>
              <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">Reviewing and archiving joining requests.</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center justify-center px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-fit flex-1 lg:flex-none ${activeTab === 'pending' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Clock size={14} className="mr-2" /> Pending ({apps.filter(a => a.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex items-center justify-center px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-fit flex-1 lg:flex-none ${activeTab === 'approved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <FileCheck size={14} className="mr-2" /> Approved ({apps.filter(a => a.status === 'approved').length})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex items-center justify-center px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-fit flex-1 lg:flex-none ${activeTab === 'rejected' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <History size={14} className="mr-2" /> Rejected ({apps.filter(a => a.status === 'rejected').length})
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 md:py-4 bg-slate-50 rounded-3xl px-4 md:px-6">
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <Filter size={14} className="mr-2" />
              Showing {activeTab} Records
            </div>
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Quick find..." className="pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] md:text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all w-full sm:w-64" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-5">Hotel Entity</th>
                <th className="px-10 py-5">Corporate Head</th>
                <th className="px-10 py-5">Submission</th>
                <th className="px-10 py-5">Star Class</th>
                <th className="px-10 py-5 text-right">Review Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors text-sm group">
                  <td className="px-10 py-6">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{app.hotelName}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-black">{app.city}</div>
                  </td>
                  <td className="px-10 py-6 text-slate-500 font-medium">{app.owner}</td>
                  <td className="px-10 py-6 text-slate-400 font-bold text-xs">{app.date}</td>
                  <td className="px-10 py-6">
                    <div className="flex text-amber-400">
                      {[...Array(parseInt(app.stars || 4))].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className={`flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${app.status === 'pending' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-slate-900' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        <Eye size={14} className="mr-2" />
                        {app.status === 'pending' ? 'Review & Approve' : 'View Archive'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="max-w-xs mx-auto">
                      <FileCheck size={48} className="text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No {activeTab} applications found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Section for Approved Apps (Informational) */}
      {activeTab === 'approved' && filteredApps.length > 0 && (
        <div className="bg-emerald-900 text-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <FileCheck size={180} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Secretariat Notice</h3>
            <p className="text-emerald-100/70 font-medium leading-relaxed mb-8">
              All applications listed above have been successfully verified and synchronized with the member directory. Members can now access their private portals using the credentials provided during registration.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Profiles Live</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Emails Sent</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedApp && <ApplicationModal app={selectedApp} onClose={() => setSelectedApp(null)} onApprove={handleApprove} onReject={handleReject} />}
    </div>
  );
};

const MembersManagement = () => {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('status', 'approved')
          .order('hotel_name');

        if (error) throw error;

        // Map database fields to UI expectations
        const formatted = (data || []).map((m: any) => ({
          ...m,
          hotelName: m.hotel_name
        }));

        setMembers(formatted);
      } catch (err) {
        console.error('Error fetching members management:', err);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
      <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Official Member Directory</h2>
          <p className="text-slate-500 text-xs md:text-sm">Active certified members</p>
        </div>
        <div className="flex space-x-2 md:space-x-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-3 md:px-4 py-2 border border-slate-200 rounded-xl font-bold text-[10px] md:text-sm text-slate-600 hover:bg-slate-50">Export</button>
          <Link to="/register" className="flex-1 sm:flex-none bg-emerald-600 text-white px-3 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-sm hover:bg-emerald-700 text-center">Add Member</Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-4 md:px-8 py-4">Hotel Name</th>
              <th className="px-4 md:px-8 py-4">Location</th>
              <th className="px-4 md:px-8 py-4">Rating</th>
              <th className="px-4 md:px-8 py-4">Status</th>
              <th className="px-4 md:px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 md:px-8 py-4 md:py-5">
                  <div className="font-bold text-slate-900 text-sm">{member.hotelName}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-black">ID: {member.id}</div>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-5 text-slate-500 text-sm">{member.city}</td>
                <td className="px-4 md:px-8 py-4 md:py-5">
                  <div className="flex text-amber-400">
                    {[...Array(parseInt(member.stars || 4))].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                  </div>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                    ACTIVE
                  </span>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-5 text-right">
                  <div className="flex justify-end space-x-1">
                    <Link to={`/members/${member.id}`} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Eye size={14} /></Link>
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">No approved members found in directory.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSecurity = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to mark this account as ${currentStatus ? 'Pending Change' : 'Secure'} manually?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password_changed: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, password_changed: !currentStatus } : u));
    } catch (err: any) {
      console.error('Error toggling security status:', err.message);
      alert('Error: ' + err.message);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            role: newUser.role
          }
        }
      });

      if (error) throw error;

      alert('User account created successfully! The user can now log in with their temporary credentials.');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err.message);
      alert('Error creating user: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {showAddUser ? (
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Register New User</h2>
            <button onClick={() => setShowAddUser(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <input required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Temporary Password</label>
                <input required type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none">
                  <option value="admin">SLAH Admin (Secretariat)</option>
                  <option value="super-admin">Super Admin</option>
                  <option value="member">Hotel Member</option>
                </select>
              </div>
            </div>
            <button disabled={creating} type="submit" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center shadow-lg uppercase tracking-widest text-xs">
              {creating ? 'Creating User...' : 'Create Account'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">User Management</h2>
              <p className="text-slate-500 text-xs md:text-sm">Control platform access</p>
            </div>
            <button onClick={() => setShowAddUser(true)} className="w-full sm:w-auto bg-emerald-600 text-white px-4 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-sm flex items-center justify-center hover:bg-emerald-700">
              <UserPlus size={16} className="mr-2" /> New User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 md:px-8 py-4">Name</th>
                  <th className="px-4 md:px-8 py-4">Email</th>
                  <th className="px-4 md:px-8 py-4">Role</th>
                  <th className="px-4 md:px-8 py-4">Security</th>
                  <th className="px-4 md:px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading users...</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-8 py-4 font-bold text-slate-900 text-sm">
                      {u.name || 'No Name'}
                    </td>
                    <td className="px-4 md:px-8 py-4 text-slate-500 text-xs truncate max-w-[150px] md:max-w-none">{u.email}</td>
                    <td className="px-4 md:px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-4">
                      <span className={`flex items-center space-x-1.5 font-bold text-[10px] uppercase tracking-widest ${u.password_changed ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {u.password_changed ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                        <span>{u.password_changed ? 'Secure' : 'Pending Change'}</span>
                      </span>
                      {!u.password_changed && (
                        <button
                          onClick={() => handleToggleSecurity(u.id, u.password_changed)}
                          className="mt-1 text-[9px] text-emerald-600 hover:underline font-bold uppercase block"
                        >
                          Verify Manually
                        </button>
                      )}
                    </td>
                    <td className="px-4 md:px-8 py-4 text-right">
                      <button className="text-slate-400 hover:text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const EventsManagement = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  const initialFormState = {
    title: '',
    location: '',
    description: '',
    fullContent: '',
    category: 'Corporate',
    status: 'Published',
    image: '',
    schedule: [{ date: '', time: '', agenda: [{ time: '', activity: '' }] }],
    speakers: [{ name: '', role: '', image: '' }]
  };

  const [formEvent, setFormEvent] = useState(initialFormState);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching events management:', err);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setEvents(events.filter(e => e.id !== id));
      } catch (err: any) {
        console.error('Error deleting event:', err.message);
        alert('Error deleting event.');
      }
    }
  };

  const handleDuplicate = async (event: any) => {
    const duplicatedEvent = {
      title: `${event.title} (Copy)`,
      description: event.description,
      full_content: event.full_content || event.fullContent,
      location: event.location,
      date: event.date,
      time: event.time,
      image: event.image,
      category: event.category,
      status: 'Draft',
      schedule: event.schedule,
      speakers: event.speakers
    };

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([duplicatedEvent])
        .select();

      if (error) throw error;
      setEvents([data[0], ...events]);
      alert(`A copy of "${event.title}" has been created as a draft.`);
    } catch (err: any) {
      console.error('Error duplicating event:', err.message);
      alert('Error duplicating event.');
    }
  };

  const handlePublish = async (id: string) => {
    if (window.confirm('Ready to publish this event to the live website?')) {
      try {
        const { error } = await supabase
          .from('events')
          .update({ status: 'Published' })
          .eq('id', id);

        if (error) throw error;
        setEvents(events.map(e => e.id === id ? { ...e, status: 'Published' } : e));
      } catch (err: any) {
        console.error('Error publishing event:', err.message);
        alert('Error publishing event.');
      }
    }
  };

  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormEvent({ ...formEvent, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const openEditForm = (event: any) => {
    setEditingEventId(event.id);
    setFormEvent({
      ...event,
      schedule: Array.isArray(event.schedule) && event.schedule.length > 0
        ? event.schedule
        : [{ date: event.date || '', time: event.time || '', agenda: Array.isArray(event.agenda) ? event.agenda : [] }],
      speakers: Array.isArray(event.speakers) && event.speakers.length > 0
        ? event.speakers
        : [{ name: '', role: '', image: '' }]
    });
    setShowAddForm(true);
  };

  const handleAddScheduleItem = () => {
    setFormEvent({
      ...formEvent,
      schedule: [...(formEvent.schedule || []), { date: '', time: '', agenda: [{ time: '', activity: '' }] }]
    });
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updated = (formEvent.schedule || []).filter((_, i) => i !== index);
    setFormEvent({ ...formEvent, schedule: updated });
  };

  const handleAddDailyAgendaItem = (scheduleIdx: number) => {
    const updated = [...(formEvent.schedule || [])];
    if (updated[scheduleIdx]) {
      updated[scheduleIdx].agenda = [...(updated[scheduleIdx].agenda || []), { time: '', activity: '' }];
      setFormEvent({ ...formEvent, schedule: updated });
    }
  };

  const handleRemoveDailyAgendaItem = (scheduleIdx: number, agendaIdx: number) => {
    const updated = [...(formEvent.schedule || [])];
    if (updated[scheduleIdx]) {
      updated[scheduleIdx].agenda = (updated[scheduleIdx].agenda || []).filter((_, i) => i !== agendaIdx);
      setFormEvent({ ...formEvent, schedule: updated });
    }
  };

  const handleAddSpeaker = () => {
    setFormEvent({
      ...formEvent,
      speakers: [...(formEvent.speakers || []), { name: '', role: '', image: '' }]
    });
  };

  const handleRemoveSpeaker = (index: number) => {
    const updated = (formEvent.speakers || []).filter((_, i) => i !== index);
    setFormEvent({ ...formEvent, speakers: updated });
  };

  const handleSpeakerImageUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...(formEvent.speakers || [])];
      if (updated[idx]) {
        updated[idx].image = reader.result as string;
        setFormEvent({ ...formEvent, speakers: updated });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const primarySchedule = (formEvent.schedule && formEvent.schedule.length > 0)
      ? formEvent.schedule[0]
      : { date: '', time: '' };

    const finalImage = formEvent.image || 'https://picsum.photos/seed/event' + Math.floor(Math.random() * 1000) + '/1200/800';

    const eventPayload = {
      title: formEvent.title,
      location: formEvent.location,
      description: formEvent.description,
      full_content: formEvent.fullContent || formEvent.full_content,
      category: formEvent.category,
      status: formEvent.status,
      image: finalImage,
      schedule: formEvent.schedule,
      speakers: formEvent.speakers,
      date: primarySchedule.date || formEvent.date,
      time: primarySchedule.time || formEvent.time
    };

    try {
      if (editingEventId) {
        const { error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', editingEventId);

        if (error) throw error;
        setEvents(events.map(ev => ev.id === editingEventId ? { ...ev, ...eventPayload } : ev));
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventPayload])
          .select();

        if (error) throw error;
        setEvents([data[0], ...events]);
      }
      closeForm();
    } catch (err: any) {
      console.error('Error saving event:', err.message);
      alert('Error saving event.');
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingEventId(null);
    setFormEvent(initialFormState);
  };

  const renderEventDetails = (event: any) => {
    return (
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <button
            onClick={() => setViewingEvent(null)}
            className="absolute top-6 right-6 p-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white transition-all"
          >
            <X size={24} />
          </button>
          <div className="absolute bottom-10 left-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] inline-block">
                {event.category}
              </span>
              {event.status === 'Draft' && (
                <span className="bg-amber-500 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                  <AlertTriangle size={12} className="mr-2" /> Draft Mode
                </span>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{event.title}</h2>
          </div>
        </div>

        <div className="p-10 md:p-16 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-10">
              <section>
                <h3 className="text-xl font-bold text-slate-900 flex items-center mb-6">
                  <Info className="mr-3 text-emerald-600" size={24} /> Event Overview
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">{event.fullContent || event.description}</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 flex items-center mb-8">
                  <ListTodo className="mr-3 text-emerald-600" size={24} /> Complete Itinerary
                </h3>
                <div className="space-y-8">
                  {(event.schedule || []).map((day: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{day.date}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{day.time}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {(day.agenda || []).map((item: any, agendaIdx: number) => (
                          <div key={agendaIdx} className="flex gap-4 items-start">
                            <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest pt-1 w-20 flex-shrink-0">{item.time}</span>
                            <span className="text-slate-700 text-sm font-medium">{item.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-10">
              <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center mb-6">
                  <MapPin className="mr-3 text-emerald-600" size={20} /> Venue
                </h3>
                <p className="text-slate-700 font-bold">{event.location}</p>
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex items-center text-slate-500 text-xs">
                    <Calendar size={14} className="mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-slate-500 text-xs">
                    <Clock size={14} className="mr-2" />
                    {event.time}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-6">Keynote Speakers</h3>
                <div className="space-y-6">
                  {(event.speakers || []).map((speaker: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                        {speaker.image ? (
                          <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <UserIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{speaker.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{speaker.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
            {event.status === 'Draft' ? (
              <button
                onClick={() => handlePublish(event.id)}
                className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs flex items-center shadow-lg"
              >
                <CheckCircle size={18} className="mr-2" /> Publish Live
              </button>
            ) : <div />}
            <button
              onClick={() => setViewingEvent(null)}
              className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
            >
              Return to List
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {viewingEvent ? (
        renderEventDetails(viewingEvent)
      ) : showAddForm ? (
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                {editingEventId ? 'Edit Event' : 'Create Professional Event'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {editingEventId ? 'Update the details of this event.' : 'Schedule multi-day summits with unique daily itineraries.'}
              </p>
            </div>
            <button onClick={closeForm} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"><X size={24} /></button>
          </div>

          <form onSubmit={handleSaveEvent} className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Event Feature Image Upload Area */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Event Feature Image</label>
                <div className="relative group/feature w-full h-64 md:h-80 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center">
                  {formEvent.image ? (
                    <img src={formEvent.image} className="w-full h-full object-cover" alt="Feature" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={48} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 font-medium">Click the camera button below to upload a feature image</p>
                    </div>
                  )}
                  <label className="absolute bottom-6 right-6 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl cursor-pointer hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                    <Camera size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Upload Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEventImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Event Title</label>
                <input required type="text" value={formEvent.title} onChange={e => setFormEvent({ ...formEvent, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium" placeholder="e.g. Annual General Meeting 2025" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Location / Venue</label>
                <input required type="text" value={formEvent.location} onChange={e => setFormEvent({ ...formEvent, location: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium" placeholder="e.g. Bintumani Hotel, Freetown" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Category</label>
                <select value={formEvent.category} onChange={e => {
                  const value = e.target.value;
                  setFormEvent({ ...formEvent, category: value });
                }} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium appearance-none text-slate-700">
                  <option value="Corporate">Corporate</option>
                  <option value="Training">Training</option>
                  <option value="Summit">Summit</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Card Summary (Short Excerpt)</label>
                <textarea required rows={3} value={formEvent.description} onChange={e => setFormEvent({ ...formEvent, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium resize-none" placeholder="A brief overview for the events listing page..."></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Full Content / Detailed Description</label>
                <textarea required rows={6} value={formEvent.fullContent} onChange={e => setFormEvent({ ...formEvent, fullContent: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium resize-none" placeholder="Detailed goals, context, and information..."></textarea>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Calendar className="mr-3 text-emerald-600" /> Event Schedule & Daily Agenda
                </h3>
                <button type="button" onClick={handleAddScheduleItem} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <Plus size={16} className="mr-2" /> Add New Day
                </button>
              </div>

              <div className="space-y-12">
                {(formEvent.schedule || []).map((item, scheduleIdx) => (
                  <div key={scheduleIdx} className="bg-slate-50/50 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 relative animate-in slide-in-from-left-4 duration-300">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                      {scheduleIdx + 1}
                    </div>

                    {(formEvent.schedule || []).length > 1 && (
                      <button type="button" onClick={() => handleRemoveScheduleItem(scheduleIdx)} className="absolute top-6 right-6 p-3 bg-white text-rose-300 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-xl transition-all shadow-sm">
                        <Trash size={18} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule Date</label>
                        <input required type="date" value={item.date} onChange={e => {
                          const updated = [...(formEvent.schedule || [])];
                          updated[scheduleIdx].date = e.target.value;
                          setFormEvent({ ...formEvent, schedule: updated });
                        }} className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-sm font-bold shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">General Time Frame</label>
                        <input required type="text" placeholder="e.g. 09:00 AM - 05:00 PM" value={item.time} onChange={e => {
                          const updated = [...(formEvent.schedule || [])];
                          updated[scheduleIdx].time = e.target.value;
                          setFormEvent({ ...formEvent, schedule: updated });
                        }} className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-sm font-medium shadow-sm" />
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                          <ListTodo size={16} className="mr-2 text-emerald-500" /> Day {scheduleIdx + 1} Itinerary
                        </h4>
                        <button type="button" onClick={() => handleAddDailyAgendaItem(scheduleIdx)} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 flex items-center">
                          <Plus size={12} className="mr-1" /> Add Activity
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(item.agenda || []).map((agendaItem: any, agendaIdx: number) => (
                          <div key={agendaIdx} className="flex gap-4 items-center animate-in slide-in-from-top-2">
                            <div className="w-32">
                              <input required type="text" placeholder="Time" value={agendaItem.time} onChange={e => {
                                const updated = [...(formEvent.schedule || [])];
                                updated[scheduleIdx].agenda[agendaIdx].time = e.target.value;
                                setFormEvent({ ...formEvent, schedule: updated });
                              }} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold" />
                            </div>
                            <div className="flex-grow">
                              <input required type="text" placeholder="Activity Title" value={agendaItem.activity} onChange={e => {
                                const updated = [...(formEvent.schedule || [])];
                                updated[scheduleIdx].agenda[agendaIdx].activity = e.target.value;
                                setFormEvent({ ...formEvent, schedule: updated });
                              }} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-medium" />
                            </div>
                            {(item.agenda || []).length > 1 && (
                              <button type="button" onClick={() => handleRemoveDailyAgendaItem(scheduleIdx, agendaIdx)} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                <Trash size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Users className="mr-3 text-emerald-600" /> Keynote Speakers
                </h3>
                <button type="button" onClick={handleAddSpeaker} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <Plus size={16} className="mr-2" /> Add Speaker
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(formEvent.speakers || []).map((speaker: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative group animate-in zoom-in-95 duration-300 flex flex-col">
                    {(formEvent.speakers || []).length > 1 && (
                      <button type="button" onClick={() => handleRemoveSpeaker(idx)} className="absolute top-6 right-6 p-2 text-rose-300 hover:text-rose-500 transition-colors">
                        <Trash size={18} />
                      </button>
                    )}

                    <div className="flex flex-col items-center mb-8">
                      <div className="relative group/avatar w-32 h-32 mb-6">
                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-md flex items-center justify-center">
                          {speaker.image ? (
                            <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={48} className="text-slate-200" />
                          )}
                        </div>
                        <label className="absolute bottom-2 right-2 p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all active:scale-95">
                          <Camera size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSpeakerImageUpload(e, idx)}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speaker Avatar</p>
                    </div>

                    <div className="space-y-6 flex-grow">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Speaker Name</label>
                        <input required type="text" placeholder="Full Name" value={speaker.name} onChange={e => {
                          const updated = [...(formEvent.speakers || [])];
                          updated[idx].name = e.target.value;
                          setFormEvent({ ...formEvent, speakers: updated });
                        }} className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Professional Role</label>
                        <input required type="text" placeholder="e.g. CEO, Radisson Blu" value={speaker.role} onChange={e => {
                          const updated = [...(formEvent.speakers || [])];
                          updated[idx].role = e.target.value;
                          setFormEvent({ ...formEvent, speakers: updated });
                        }} className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-medium shadow-sm focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-12">
              <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-emerald-900/20 hover:bg-slate-900 transition-all flex items-center justify-center">
                <Send size={20} className="mr-4" />
                {editingEventId ? 'Update Event' : 'Publish Live Event'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">Event Management</h2>
              <p className="text-slate-500 text-xs md:text-sm">Schedule and manage association events</p>
            </div>
            <button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto bg-emerald-600 text-white px-4 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-sm flex items-center justify-center hover:bg-emerald-700 shadow-lg">
              <Plus size={16} className="mr-2" /> Add New Event
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 md:px-8 py-4">Event Details</th>
                  <th className="px-4 md:px-8 py-4">Schedule</th>
                  <th className="px-4 md:px-8 py-4">Status</th>
                  <th className="px-4 md:px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((event) => {
                  const isPast = event.date < new Date().toISOString().split('T')[0];
                  const isMultiDay = Array.isArray(event.schedule) && event.schedule.length > 1;
                  const isDraft = event.status === 'Draft';

                  return (
                    <tr
                      key={event.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${isDraft ? 'bg-amber-50/10' : ''}`}
                      onClick={() => setViewingEvent(event)}
                    >
                      <td className="px-4 md:px-8 py-4 md:py-5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">{event.title}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-black">{event.category}</div>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-5 text-xs md:text-sm text-slate-600">
                        <div className="font-bold">{event.date}</div>
                        <div className="text-slate-400">{isMultiDay ? `${event.schedule.length} Days` : event.time}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-center ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {event.status}
                          </span>
                          {!isDraft && (
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-center border ${isPast ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-white text-emerald-600 border-emerald-100'
                              }`}>
                              {isPast ? 'Past' : 'Upcoming'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setViewingEvent(event)}
                            title="View Details"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => openEditForm(event)}
                            title="Edit Event"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>

                          {isDraft && (
                            <button
                              onClick={() => handlePublish(event.id)}
                              title="Publish Now"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicate(event)}
                            title="Duplicate Event"
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Copy size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(event.id)}
                            title="Delete Event"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">No events created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const NewsManagement = () => {
  const [news, setNews] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const featureImageRef = useRef<HTMLInputElement>(null);

  const initialForm = {
    title: '',
    excerpt: '',
    fullContent: '',
    category: 'Policy',
    author: 'Secretariat',
    status: 'Published',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    image: '' // Initialize with empty, fallback to random in handleSave if still empty
  };

  const [formNews, setFormNews] = useState(initialForm);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        setNews(data || []);
      } catch (err) {
        console.error('Error fetching news management:', err);
      }
    };

    fetchNews();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormNews({ ...formNews, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = formNews.image || 'https://picsum.photos/seed/news' + Math.floor(Math.random() * 1000) + '/800/500';
    const entryToSave = { ...formNews, image: finalImage };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('news')
          .update(entryToSave)
          .eq('id', editingId);

        if (error) throw error;
        setNews(news.map(n => n.id === editingId ? { ...n, ...entryToSave } : n));
      } else {
        const { data, error } = await supabase
          .from('news')
          .insert([entryToSave])
          .select();

        if (error) throw error;
        setNews([data[0], ...news]);
      }
      setShowAddForm(false);
      setEditingId(null);
      setFormNews(initialForm);
    } catch (err: any) {
      console.error('Error saving news:', err.message);
      alert('Error saving article.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this article?')) {
      try {
        const { error } = await supabase
          .from('news')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setNews(news.filter(n => n.id !== id));
      } catch (err: any) {
        console.error('Error deleting news:', err.message);
        alert('Error deleting article.');
      }
    }
  };

  const openEdit = (article: any) => {
    setEditingId(article.id);
    setFormNews(article);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-8">
      {showAddForm ? (
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{editingId ? 'Edit Article' : 'Create News Article'}</h2>
            <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature Image Area */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Feature Image</label>
                <div className="relative group/feature w-full h-64 md:h-80 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center">
                  {formNews.image ? (
                    <img src={formNews.image} className="w-full h-full object-cover" alt="Feature" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={48} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">Click the camera to upload a feature image</p>
                    </div>
                  )}
                  <label className="absolute bottom-6 right-6 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl cursor-pointer hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                    <Camera size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Headline</label>
                <input required value={formNews.title} onChange={e => setFormNews({ ...formNews, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select value={formNews.category} onChange={e => setFormNews({ ...formNews, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none">
                  {['Policy', 'Training', 'Community', 'Research', 'Member News', 'Industry Reports', 'Tourism'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Author</label>
                <input required value={formNews.author} onChange={e => setFormNews({ ...formNews, author: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Short Excerpt (For Listing)</label>
                <textarea required rows={2} value={formNews.excerpt} onChange={e => setFormNews({ ...formNews, excerpt: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Article Content</label>
                <textarea required rows={8} value={formNews.fullContent} onChange={e => setFormNews({ ...formNews, fullContent: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none resize-none" />
              </div>
            </div>
            <button type="submit" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center shadow-lg uppercase tracking-widest text-xs">
              <Send size={18} className="mr-2" /> {editingId ? 'Update Article' : 'Publish News'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">News & Press</h2>
              <p className="text-slate-500 text-xs md:text-sm">Managing communications</p>
            </div>
            <button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto bg-emerald-600 text-white px-4 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-sm flex items-center justify-center hover:bg-emerald-700 shadow-lg">
              <Plus size={16} className="mr-2" /> Create Article
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 md:px-8 py-4">Article</th>
                  <th className="px-4 md:px-8 py-4">Status</th>
                  <th className="px-4 md:px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {news.sort((a, b) => b.id.localeCompare(a.id)).map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-8 py-4 md:py-5">
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <img src={article.image} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs md:text-sm truncate max-w-[150px] md:max-w-none">{article.title}</div>
                          <div className="text-[9px] text-emerald-600 uppercase font-black">{article.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">{article.author}</td>
                    <td className="px-8 py-5 text-sm text-slate-400">{article.date}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {article.status || 'Published'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end space-x-1">
                        <button onClick={() => openEdit(article)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(article.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileEdit = ({ user }: { user: any }) => {
  const [formData, setFormData] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<(string | File)[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // If not found by ID, try email (fallback for older mock accounts)
          const { data: byEmail, error: emailError } = await supabase
            .from('hotels')
            .select('*')
            .eq('email', user.email)
            .single();

          if (!emailError && byEmail) {
            setFormData({
              ...byEmail,
              hotelName: byEmail.hotel_name,
              year: byEmail.year_established?.toString()
            });
            setGalleryImages(byEmail.gallery || []);
            setGalleryPreviews(byEmail.gallery || []);
            return;
          }
          throw error;
        }

        if (data) {
          setFormData({
            ...data,
            hotelName: data.hotel_name,
            year: data.year_established?.toString()
          });
          setGalleryImages(data.gallery || []);
          setGalleryPreviews(data.gallery || []);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Process Gallery Images (Upload only new Files)
      const galleryUrls = await Promise.all(
        galleryImages.map(async (item) => {
          if (typeof item === 'string') return item; // Already a URL

          const file = item as File;
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Math.random()}.${fileExt}`;
          const filePath = `gallery/${fileName}`;

          const { data, error } = await supabase.storage
            .from('hotel-gallery')
            .upload(filePath, file);

          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('hotel-gallery').getPublicUrl(filePath);
          return publicUrl;
        })
      );

      const payload = {
        ...formData,
        hotel_name: formData.hotelName,
        year_established: parseInt(formData.year) || 2024,
        gallery: galleryUrls
      };

      const { error } = await supabase
        .from('hotels')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;

      setSaving(false);
      alert('Membership details updated successfully! Your public directory listing is now synchronized.');
    } catch (err: any) {
      console.error('Error saving profile:', err.message);
      alert('Error updating profile information.');
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentCount = galleryImages.length;
    const remainingSlots = 10 - currentCount;
    if (remainingSlots <= 0) return;

    const newFiles = Array.from(files).slice(0, remainingSlots) as File[];
    setGalleryImages(prev => [...prev, ...newFiles].slice(0, 10));

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFacility = (facility: string) => {
    const current = formData.facilities || [];
    if (current.includes(facility)) {
      setFormData({ ...formData, facilities: current.filter((f: string) => f !== facility) });
    } else {
      setFormData({ ...formData, facilities: [...current, facility] });
    }
  };

  if (!formData) return <div className="p-12 text-center text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-5xl space-y-12 pb-24 african-accents">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Directory Listing</h1>
            <p className="text-slate-500 text-sm md:text-base font-medium">Manage how your hotel appears publically.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto bg-emerald-600 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-xl shadow-emerald-900/10 hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div> : <CheckCircle size={16} className="md:mr-3 mr-2" />}
            {saving ? 'Saving...' : 'Update Listing'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-10">

            {/* Section 1: Basic Identity */}
            <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-slate-100 shadow-sm space-y-6 md:space-y-8">
              <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 md:pb-6 flex items-center">
                <Info className="mr-3 md:mr-4 text-emerald-600" size={20} md:size={24} /> Primary Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Professional Hotel Name</label>
                  <input type="text" value={formData.hotelName} onChange={e => setFormData({ ...formData, hotelName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Street Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">City / Town</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Property Classification</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-700 appearance-none">
                    {['Luxury', 'Boutique', 'Resort', 'Eco-Lodge', 'Mid-range', 'Guest House', 'Business'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Section 2: Operational Data */}
            <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-slate-100 shadow-sm space-y-6 md:space-y-8">
              <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 md:pb-6 flex items-center">
                <BarChart3 className="mr-3 md:mr-4 text-emerald-600" size={20} md:size={24} /> Operational Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Establishment Year</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Staff Represented</label>
                  <input type="text" value={formData.employees} onChange={e => setFormData({ ...formData, employees: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Guest Rooms</label>
                  <input type="number" value={formData.rooms} onChange={e => setFormData({ ...formData, rooms: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Official Star Rating</label>
                  <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, stars: star })}
                        className={`flex-grow py-2 rounded-xl transition-all ${formData.stars >= star ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <Star size={18} fill={formData.stars >= star ? 'currentColor' : 'none'} className="mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Facilities & Services */}
            <section className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-6 flex items-center">
                <Award className="mr-4 text-emerald-600" size={24} /> Facilities & Services
              </h3>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6">Available Amenities (Check all that apply)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {['Restaurant', 'Bar', 'Pool', 'Conference Room', 'Spa', 'Wi-Fi', 'Gym', 'Laundry', 'Beachfront', 'Airport Shuttle', 'Security'].map((f) => {
                    const isChecked = (formData.facilities || []).includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFacility(f)}
                        className={`flex items-center p-4 rounded-2xl border text-sm font-bold transition-all ${isChecked ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'}`}
                      >
                        <div className={`w-5 h-5 rounded-lg mr-3 flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200'}`}>
                          {isChecked && <CheckCircle size={12} />}
                        </div>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Detailed Amenities & Remarks</label>
                <textarea rows={4} value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} placeholder="Describe additional services, unique features, or highlights..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700 resize-none" />
              </div>
            </section>

            {/* Section 4: Public Gallery */}
            <section className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-6 gap-4">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center">
                  <UploadCloud className="mr-4 text-emerald-600" size={24} /> Public Showcase
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full">{galleryImages.length} / 10 Active</span>
              </div>
              <p className="text-slate-500 font-medium italic">High-resolution images significantly improve directory engagement and SLAH visibility.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {galleryPreviews.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden group border border-slate-100 shadow-md">
                    <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(idx)} className="p-3 bg-rose-500 text-white rounded-2xl shadow-xl transform scale-75 group-hover:scale-100 transition-all hover:bg-rose-600">
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                {galleryImages.length < 10 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[2rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:text-emerald-500 hover:border-emerald-100 hover:bg-emerald-50 transition-all group">
                    <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
            </section>
          </div>

          {/* Right Column: Sticky Sidebar Info */}
          <div className="space-y-10">

            {/* Public Contact Card */}
            <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-2xl sticky top-32">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-10 flex items-center">
                <Globe className="mr-3" size={16} /> Public Contact Points
              </h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Inquiry Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Front Desk Phone</label>
                  <input type="tel" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Official Website</label>
                  <input type="text" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="www.yourhotel.sl" className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center">
                    <Briefcase className="mr-2 text-emerald-400" size={12} /> Management Details
                  </label>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2">Owner / Proprietor</label>
                      <input type="text" value={formData.owner} onChange={e => setFormData({ ...formData, owner: e.target.value })} className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2">Managing Director / GM</label>
                      <input type="text" value={formData.manager} onChange={e => setFormData({ ...formData, manager: e.target.value })} className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl p-6 flex items-start gap-4">
                <Info className="text-emerald-400 mt-1" size={20} />
                <p className="text-[10px] font-bold text-emerald-100/70 leading-relaxed uppercase tracking-widest">
                  Changes made here update the public SLAH directory in real-time. Please ensure all data is accurate to maintain SLAH standard compliance.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ user }: { user: any }) => {
  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-8 flex items-center text-slate-800">
          <Settings className="mr-3 text-emerald-600" /> Account Settings
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500" defaultValue={user.name} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none" defaultValue={user.email} readOnly />
            </div>
          </div>
          <div className="pt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-4">Notification Preferences</h4>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 accent-emerald-600 rounded" defaultChecked />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Email me on new membership applications</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 accent-emerald-600 rounded" defaultChecked />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Notify me about SLAH policy updates</span>
              </label>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50">
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md">Save All Settings</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-8 flex items-center text-slate-800">
          <Lock className="mr-3 text-amber-500" /> Security & Privacy
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md">Update Password</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('slah_auth');
    if (!auth) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(auth));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('slah_auth');
    setUser(null);
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'super-admin';

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Applications', path: '/dashboard/applications', icon: <FileText size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Members', path: '/dashboard/members', icon: <Hotel size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Events', path: '/dashboard/events', icon: <Calendar size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'News', path: '/dashboard/news', icon: <Newspaper size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Users', path: '/dashboard/users', icon: <Users size={20} />, roles: ['super-admin'] },
    { name: 'My Profile', path: '/dashboard/profile', icon: <Building2 size={20} />, roles: ['member'] },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} />, roles: ['super-admin', 'admin', 'member'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex African-accents">
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white fixed h-full z-50">
        <div className="p-8 border-b border-slate-800">
          <Link to="/">
            <SLAHLogo variant="light" className="h-16 w-auto" />
          </Link>
        </div>
        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all uppercase tracking-widest text-xs ${location.pathname === item.path
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center space-x-3 p-4 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-900/10 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-grow lg:ml-72 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40 p-4 md:p-6 flex items-center justify-between shadow-sm African-accents">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-3 md:mr-4 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <Menu size={22} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 capitalize truncate max-w-[150px] md:max-w-none">
              {location.pathname === '/dashboard' ? 'Overview' : location.pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Quick search..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 w-64 transition-all" />
            </div>
            <button className="p-2 text-slate-400 hover:text-emerald-600 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm ring-2 ring-emerald-50">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-10 flex-grow">
          <Routes>
            <Route path="/" element={
              isAdmin ? (
                <div className="space-y-8">
                  <Stats user={user} />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <Applications />
                    </div>
                    <div>
                      <RecentActivity />
                    </div>
                  </div>
                  {user.role === 'super-admin' && (
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between border border-slate-800">
                      <div>
                        <h3 className="text-xl font-bold mb-2">System Performance</h3>
                        <p className="text-slate-400 text-sm">Real-time health check of SLAH databases and portals.</p>
                      </div>
                      <div className="flex space-x-4 mt-6 md:mt-0">
                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold uppercase tracking-widest">Database: OK</div>
                        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-bold uppercase tracking-widest">Uptime: 99.9%</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ProfileEdit user={user} />
              )
            } />
            <Route path="/applications" element={<Applications />} />
            <Route path="/members" element={<MembersManagement />} />
            <Route path="/events" element={<EventsManagement />} />
            <Route path="/news" element={<NewsManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/profile" element={<ProfileEdit user={user} />} />
            <Route path="/settings" element={<SettingsView user={user} />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                <Settings size={64} className="mb-4 opacity-10 animate-spin-slow" />
                <p className="text-xl font-medium">Page Under Development</p>
                <Link to="/dashboard" className="mt-4 text-emerald-600 font-bold hover:underline">Return to Overview</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <aside className="w-72 bg-slate-900 h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex justify-between items-center border-b border-slate-800">
              <SLAHLogo variant="light" className="h-12" />
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl"><X size={24} /></button>
            </div>
            <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all uppercase tracking-widest text-xs ${location.pathname === item.path
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t border-slate-800">
              <button onClick={handleLogout} className="flex items-center space-x-3 p-4 w-full text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-rose-400 transition-colors">
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
