import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import {
  Users, Building2, FileText, BarChart3, Settings, LogOut,
  CheckCircle2, XCircle, Clock, Search, Plus, UserPlus,
  Menu, X, Bell, LayoutDashboard, Hotel, Star, MapPin,
  Lock, Eye, Trash2, Edit3, Calendar, UploadCloud, Info,
  Briefcase, Send, Target, Trash, ListTodo, Camera,
  User as UserIcon, Copy, AlertTriangle, CheckCircle, Newspaper,
  Image as ImageIcon, Globe, Award, ChevronRight, FileCheck, Check,
  MoreHorizontal, History, Filter, Phone, Scale, FileBadge, FileSignature, CheckSquare,
  ShieldCheck, AlertCircle, ChevronLeft
} from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

// --- Dashboard Sub-Components ---

const Stats = ({ user }: { user: any }) => {
  const { hotels, profiles } = useAppContext();

  const approvedCount = hotels.filter(h => h.status === 'approved').length;
  const pendingCount = hotels.filter(h => h.status === 'pending').length;
  const usersCount = profiles.length;

  const stats = [
    { label: 'Total Members', value: approvedCount.toString(), icon: <Hotel className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Pending Apps', value: pendingCount.toString(), icon: <FileText className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'System Users', value: usersCount.toString(), icon: <Users className="text-indigo-600" />, color: 'bg-indigo-50' },
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
  const { activities } = useAppContext();
  const navigate = useNavigate();

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'registration': return <FileText size={14} />;
      case 'approval': return <CheckCircle2 size={14} />;
      case 'update': return <Hotel size={14} />;
      case 'user': return <UserPlus size={14} />;
      case 'event': return <Calendar size={14} />;
      case 'news': return <Newspaper size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'registration': return 'text-amber-600 bg-amber-50';
      case 'approval': return 'text-emerald-600 bg-emerald-50';
      case 'update': return 'text-indigo-600 bg-indigo-50';
      case 'user': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const displayActivities = activities.slice(0, 6);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {displayActivities.length > 0 ? (
          displayActivities.map((activity) => {
            const colorClass = getColor(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${colorClass}`}>
                  {getIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(activity.created_at)}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center text-slate-400">
            <Clock size={24} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">No recent logs</p>
          </div>
        )}
      </div>
      <button
        onClick={() => navigate('/dashboard/logs')}
        className="w-full mt-8 py-3 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors border-t border-slate-50"
      >
        View All Logs
      </button>
    </div>
  );
};

const ApplicationModal = ({ app, onClose, onApprove, onReject, onMoveToPending, isProcessing }: {
  app: any,
  onClose: () => void,
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onMoveToPending: (id: string) => void,
  isProcessing: boolean
}) => {
  if (!app) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
              <Hotel size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{app.hotelName}</h2>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{app.regNumber} • {app.status} application</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:text-rose-500 rounded-2xl transition-all border border-transparent hover:border-slate-100 shadow-sm">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-grow overflow-y-auto p-10 no-scrollbar space-y-12 bg-slate-50/30">

          {/* Section A: Hotel Information */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-50 flex items-center">
              <Info size={14} className="mr-2 text-emerald-500" /> SECTION A: Hotel Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Registered Address</label>
                <p className="font-bold text-slate-900 text-lg">{app.address}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Location</label>
                <p className="font-bold text-slate-900">{app.city}, {app.district}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Official Email</label>
                <p className="font-bold text-slate-700">{app.email}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Contact Number</label>
                <p className="font-bold text-slate-700">{app.contact}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Official Website</label>
                <p className="font-bold text-emerald-600">{app.website || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Section B: Ownership & Management */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-50 flex items-center">
              <Users size={14} className="mr-2 text-emerald-500" /> SECTION B: Ownership & Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Owner / Proprietor</label>
                <p className="font-bold text-slate-900">{app.owner}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Managing Director / GM</label>
                <p className="font-bold text-slate-900">{app.manager || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Business Reg #</label>
                <p className="font-bold text-slate-900">{app.regNumber}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Year Established</label>
                <p className="font-bold text-slate-900">{app.year}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Total Employees</label>
                <p className="font-bold text-slate-900">{app.employees}</p>
              </div>
            </div>
          </section>

          {/* Section C: Facilities & Classification */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-50 flex items-center">
              <Star size={14} className="mr-2 text-emerald-500" /> SECTION C: Facilities & Classification
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase mb-4">Official Rating</label>
                  <div className="flex text-amber-400 space-x-1">
                    {[...Array(parseInt(app.stars || 4))].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase mb-4">Room Count</label>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{app.rooms}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase mb-4">Room Types</label>
                  <div className="flex flex-wrap gap-2">
                    {app.roomTypes?.map((type: string) => (
                      <span key={type} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">{type}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase mb-4">In-House Facilities</label>
                  <div className="flex flex-wrap gap-2">
                    {app.facilities?.map((f: string) => (
                      <span key={f} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              {app.otherAmenities && (
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Other Amenities</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl italic">{app.otherAmenities}</p>
                </div>
              )}
            </div>
          </section>

          {/* Section D: Legal & Compliance */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-100 flex items-center">
              <Scale size={14} className="mr-2 text-emerald-500" /> SECTION D: Legal & Compliance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Tax ID Number (TIN)</label>
                <p className="text-xl font-black text-slate-900 tracking-tight">{app.tin}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">NTB License Number</label>
                <p className="text-xl font-black text-slate-900 tracking-tight">{app.ntbLicense}</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[8px] font-black text-slate-400 uppercase mb-4">Submitted Documents</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {app.documents && Object.entries(app.documents).map(([key, url]) => (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl group transition-all border border-slate-100"
                  >
                    <div className="flex items-center">
                      <FileBadge className="text-slate-400 group-hover:text-emerald-500 mr-4 shrink-0" size={20} />
                      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    <Eye size={16} className="text-slate-300 group-hover:text-emerald-500" />
                  </a>
                ))}
              </div>
            </div>

            {app.complianceRemarks && (
              <div className="mt-8">
                <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Compliance Remarks</label>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">{app.complianceRemarks}</p>
              </div>
            )}
          </section>

          {/* Section E: Commitment */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
              <FileSignature size={200} />
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-white/10 flex items-center">
                <ShieldCheck size={14} className="mr-2" /> SECTION E: Association Commitment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg font-medium leading-relaxed text-white/80 italic">
                    "By signing this form, I acknowledge that our hotel agrees to abide by the rules and regulations of the Sierra Leone Association of Hotels and commit to active participation in its activities."
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <CheckSquare size={20} className="text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Electronically Verified</span>
                  </div>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                  <p className="text-[8px] font-black uppercase text-emerald-400 mb-2 tracking-widest">Digitally Signed By</p>
                  <p className="text-2xl font-black uppercase tracking-tighter mb-1">{app.signeeName}</p>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                    {app.signeePosition} • {app.signeeDate}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section F: Property Showcase */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-50 flex items-center">
              <ImageIcon size={14} className="mr-2 text-emerald-500" /> SECTION F: Property Showcase
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {app.gallery?.map((url: string, idx: number) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square rounded-2xl overflow-hidden border border-slate-100 hover:border-emerald-500 transition-all shadow-sm">
                  <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye size={24} className="text-white transform scale-50 group-hover:scale-100 transition-transform" />
                  </div>
                </a>
              ))}
              {(!app.gallery || app.gallery.length === 0) && (
                <div className="col-span-full py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                  <ImageIcon size={48} className="text-slate-200 mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Property Images Provided</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t border-slate-50 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
            {app.status === 'pending' && (
              <>
                <button
                  disabled={isProcessing}
                  onClick={() => onReject(app.id)}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all border border-slate-200 hover:border-rose-200 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Deny Membership'}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => onApprove(app.id)}
                  className="w-full sm:w-auto px-12 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <CheckCircle size={16} className="mr-2" />
                  )}
                  {isProcessing ? 'Processing Approval...' : 'Approve Membership'}
                </button>
              </>
            )}
            {app.status === 'rejected' && (
              <>
                <button
                  disabled={isProcessing}
                  onClick={() => onMoveToPending(app.id)}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Restore to Pending'}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => onApprove(app.id)}
                  className="w-full sm:w-auto px-12 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center disabled:opacity-50"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve Application
                </button>
              </>
            )}
            {app.status === 'approved' && (
              <>
                <button
                  disabled={isProcessing}
                  onClick={() => onMoveToPending(app.id)}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Move to Pending'}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => onReject(app.id)}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all border border-slate-200 hover:border-rose-200 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Reject Application'}
                </button>
              </>
            )}
            <button
              disabled={isProcessing}
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
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
  const { hotels: rawHotels, refreshData, showNotification } = useAppContext();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [processing, setProcessing] = useState(false);

  const apps = useMemo(() => (rawHotels || []).map((m: any) => ({
    ...m,
    hotelName: m.hotel_name,
    date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    regNumber: m.reg_number,
    year: m.year_established?.toString(),
    manager: m.manager,
    employees: m.employees,
    rooms: m.rooms,
    roomTypes: m.room_types,
    facilities: m.facilities,
    otherAmenities: m.other_amenities,
    tin: m.tin,
    ntbLicense: m.ntb_license,
    complianceRemarks: m.compliance_remarks,
    signeeName: m.signee_name,
    signeePosition: m.signee_position,
    signeeDate: m.signee_date
  })), [rawHotels]);

  const handleMoveToPending = async (id: string) => {
    console.log('[DEBUG] handleMoveToPending started for ID:', id);
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Authentication session lost.');

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (!profile || (profile.role !== 'admin' && profile.role !== 'super-admin')) {
        throw new Error('Insufficient permissions.');
      }

      const { data, error } = await supabase.from('hotels').update({ status: 'pending' }).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Update failed.');

      await supabase.from('activities').insert({
        type: 'update',
        text: `Admin moved "${apps.find(a => a.id === id)?.hotelName}" back to Pending`,
        user_id: session.user.id
      });

      await refreshData();
      showNotification('Application moved back to Pending.', 'info');
      setSelectedApp(null);
    } catch (err: any) {
      console.error('Error moving to pending:', err);
      showNotification('Error: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (id: string) => {
    console.log('[DEBUG] handleApprove started for ID:', id);
    setProcessing(true);
    try {
      // 1. Verify Session & Permissions
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[DEBUG] Current session user:', session?.user?.id, session?.user?.email);

      if (!session) {
        throw new Error('Authentication session lost. Please log in again.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      console.log('[DEBUG] DB Profile Role:', profile?.role);

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super-admin')) {
        console.error('[DEBUG] Insufficient role in DB:', profile?.role);
        throw new Error('Your account permissions in the database do not allow this action.');
      }

      // 2. Perform Update
      const { data, error } = await supabase
        .from('hotels')
        .update({ status: 'approved' })
        .eq('id', id)
        .select();

      console.log('[DEBUG] Update response:', { data, error });

      if (error) {
        console.error('[DEBUG] Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('[DEBUG] No rows updated. Checking if record exists...');
        const { data: checkData } = await supabase.from('hotels').select('id, status').eq('id', id).single();
        console.log('[DEBUG] Existing record status:', checkData);
        throw new Error('Update failed. You may not have permission to modify this record or the record does not exist.');
      }

      // Log activity
      const activityResult = await supabase.from('activities').insert({
        type: 'approval',
        text: `Admin approved "${apps.find(a => a.id === id)?.hotelName || 'a hotel'}"`,
        user_id: session.user.id
      });
      console.log('Activity log response:', activityResult);

      await refreshData();
      showNotification('Membership Approved. Hotel profile is now live in the directory.', 'success');
      setSelectedApp(null); // Close modal on success
      setActiveTab('approved'); // Auto-switch to Approved tab
    } catch (err: any) {
      console.error('CRITICAL: Error approving application:', err);
      showNotification('Error updating application status: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    console.log('[DEBUG] handleReject started for ID:', id);
    setProcessing(true);
    try {
      // 1. Verify Session & Permissions
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication session lost. Please log in again.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      console.log('[DEBUG] DB Profile Role:', profile?.role);

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super-admin')) {
        console.error('[DEBUG] Insufficient role in DB:', profile?.role);
        throw new Error('Your account permissions in the database do not allow this action.');
      }

      // 2. Perform Update
      const { data, error } = await supabase
        .from('hotels')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select();

      console.log('[DEBUG] Update response:', { data, error });

      if (error) {
        console.error('[DEBUG] Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Update failed. You may not have permission to modify this record or the record does not exist.');
      }

      // Log activity
      const activityResult = await supabase.from('activities').insert({
        type: 'rejection',
        text: `Admin rejected application from "${apps.find(a => a.id === id)?.hotelName || 'a hotel'}"`,
        user_id: session.user.id
      });
      console.log('Activity log response:', activityResult);

      await refreshData();
      showNotification('Application Rejected.', 'info');
      setSelectedApp(null); // Close modal on success
      setActiveTab('rejected'); // Auto-switch to Rejected tab
    } catch (err: any) {
      console.error('CRITICAL: Error rejecting application:', err);
      showNotification('Error updating application status: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setProcessing(false);
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
                        {app.status === 'pending' ? 'Review & Approve' : app.status === 'rejected' ? 'Restore / Approve' : 'View Archive'}
                      </button>
                      {app.status === 'rejected' && (
                        <button
                          disabled={processing}
                          onClick={() => handleMoveToPending(app.id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Restore to Pending"
                        >
                          <History size={16} />
                        </button>
                      )}
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

      {selectedApp && <ApplicationModal app={selectedApp} onClose={() => setSelectedApp(null)} onApprove={handleApprove} onReject={handleReject} onMoveToPending={handleMoveToPending} isProcessing={processing} />}
    </div>
  );
};

const MembersManagement = () => {
  const { members: rawMembers } = useAppContext();

  const members = useMemo(() => (rawMembers || []).map((m: any) => ({
    ...m,
    hotelName: m.hotel_name
  })), [rawMembers]);

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
  const { profiles: users, loading, refreshData, showNotification } = useAppContext();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<any>(null);
  const [newForcedPassword, setNewForcedPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);
  const [roleTarget, setRoleTarget] = useState<any>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  const { user: currentUser } = useAppContext();

  // We no longer need fetchUsers locally

  const handleToggleSecurity = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to mark this account as ${currentStatus ? 'Pending Change' : 'Secure'} manually ? `)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password_changed: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        type: 'update',
        text: `Manually updated security status for ${users.find(u => u.id === userId)?.name || 'a user'}`
      });

      await refreshData();
      showNotification(`Account marked as ${currentStatus ? 'Pending' : 'Secure'}.`, 'success');
    } catch (err: any) {
      console.error('Error toggling security status:', err.message);
      showNotification('Error: ' + err.message, 'error');
    }
  };

  const handleAdminResetPassword = async (userEmail: string) => {
    if (!window.confirm(`Send a password reset link to ${userEmail}?`)) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      showNotification('Password reset link sent successfully.', 'success');
    } catch (err: any) {
      console.error('Admin reset error:', err);
      showNotification('Failed to send reset link: ' + err.message, 'error');
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

      // Log activity
      await supabase.from('activities').insert({
        type: 'user',
        text: `Created new user account: ${newUser.name} (${newUser.role})`
      });

      showNotification('User account created successfully!', 'success');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'admin' });
      await refreshData();
    } catch (err: any) {
      console.error('Error creating user:', err.message);
      showNotification('Error creating user: ' + err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleForcedPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTarget) return;
    if (newForcedPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'warning');
      return;
    }

    setSettingPassword(true);
    try {
      // 1. Call the edge function or admin api
      // Note: Since client-side anon key cannot update other users, 
      // we use an Edge Function "admin-change-password" (Vite Force Refresh Tag)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        showNotification('Your session has expired or is invalid. Please sign out and sign in again.', 'error');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-change-password', {
        body: { userId: passwordTarget.id, newPassword: newForcedPassword }
      });

      if (error) {
        // Handle specific error from Edge Function
        const errorMsg = error.message || 'Unknown error occurred';
        showNotification(`Error: ${errorMsg}`, 'error');
        return;
      }

      showNotification(`Password for ${passwordTarget.name || passwordTarget.email} updated successfully.`, 'success');

      // Log activity
      await supabase.from('activities').insert({
        type: 'user',
        text: `Forced password reset for ${passwordTarget.name || passwordTarget.email}`
      });

      setPasswordTarget(null);
      setNewForcedPassword('');
      await refreshData();
    } catch (err: any) {
      console.error('Error setting forced password:', err);
      showNotification('Error updating password. (Ensure Edge Function is deployed)', 'error');
    } finally {
      setSettingPassword(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingRole(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        type: 'user',
        text: `Updated role for ${users.find(u => u.id === userId)?.name || 'a user'} to ${newRole}`,
        user_id: currentUser?.id
      });

      showNotification(`Role updated to ${newRole} successfully.`, 'success');
      setRoleTarget(null);
      await refreshData();
    } catch (err: any) {
      console.error('Error updating role:', err.message);
      showNotification('Error updating role: ' + err.message, 'error');
    } finally {
      setUpdatingRole(false);
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
          <div className="overflow-x-auto min-h-[450px]">
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
                      <div className="flex justify-end relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {openMenuId === u.id && (
                          <>
                            <div
                              className="fixed inset-0 z-[60]"
                              onClick={() => setOpenMenuId(null)}
                            ></div>
                            <div className="absolute right-0 top-12 w-56 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-4 z-[70] animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-8 ring-white">
                              <div className="px-6 pb-3 border-b border-slate-50 mb-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">User Actions</p>
                              </div>
                              <button
                                onClick={() => {
                                  handleAdminResetPassword(u.email);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-6 py-4 text-left text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 flex items-center transition-all group"
                              >
                                <History size={16} className="mr-3 text-slate-400 group-hover:text-amber-500" /> Reset Password
                              </button>
                              <button
                                onClick={() => {
                                  setPasswordTarget(u);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-6 py-4 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center transition-all group"
                              >
                                <Lock size={16} className="mr-3 text-slate-400 group-hover:text-indigo-500" /> Set Forced Password
                              </button>
                              {currentUser?.role === 'super-admin' && (
                                <button
                                  onClick={() => {
                                    setRoleTarget(u);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-6 py-4 text-left text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center transition-all group"
                                >
                                  <Settings size={16} className="mr-3 text-slate-400 group-hover:text-emerald-500" /> Manage Permissions
                                </button>
                              )}
                              <div className="mt-2 px-4">
                                <button
                                  onClick={() => setOpenMenuId(null)}
                                  className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
                                >
                                  Close Menu
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Forced Password Modal */}
      {/* Forced Password Modal (Existing) */}
      {passwordTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPasswordTarget(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Lock size={24} />
              </div>
              <button
                onClick={() => setPasswordTarget(null)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
              >
                <X />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Set Forced Password</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium italic">
              Updating password for <span className="text-slate-900 font-bold">{passwordTarget.name || passwordTarget.email}</span>. The user will be required to change this upon login.
            </p>

            <form onSubmit={handleForcedPasswordReset} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">New Temporary Password</label>
                <input
                  required
                  type="text"
                  value={newForcedPassword}
                  onChange={e => setNewForcedPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  disabled={settingPassword}
                  type="submit"
                  className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {settingPassword ? 'Updating System...' : 'Enforce New Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordTarget(null)}
                  className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-slate-600"
                >
                  Cancel Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal (New) */}
      {roleTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRoleTarget(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <button
                onClick={() => setRoleTarget(null)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
              >
                <X />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Update User Role</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium italic">
              Changing permissions for <span className="text-slate-900 font-bold">{roleTarget.name || roleTarget.email}</span>.
            </p>

            <div className="space-y-4">
              {['member', 'admin', 'super-admin'].map((role) => (
                <button
                  key={role}
                  disabled={updatingRole}
                  onClick={() => handleUpdateRole(roleTarget.id, role)}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${roleTarget.role === role
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <div>
                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${roleTarget.role === role ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {role.replace('-', ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      {role === 'super-admin' && 'Full system access & user management'}
                      {role === 'admin' && 'Manage hotel directory & content'}
                      {role === 'member' && 'Limited hotel portal access'}
                    </div>
                  </div>
                  {roleTarget.role === role && (
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  )}
                  {roleTarget.role !== role && (
                    <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-slate-300"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setRoleTarget(null)}
                className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-slate-600"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EventsManagement = () => {
  const { events: contextEvents, refreshData, showNotification } = useAppContext();
  const [events, setEvents] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  // Synchronize local events state with context events
  useEffect(() => {
    setEvents(contextEvents);
  }, [contextEvents]);

  const initialFormState = {
    title: '',
    description: '',
    fullContent: '',
    full_content: '',
    location: '',
    category: 'Corporate',
    status: 'Draft',
    image: '',
    date: '',
    time: '',
    schedule: [{ date: '', time: '', agenda: [{ time: '', activity: '' }] }],
    speakers: [{ name: '', role: '', image: '' }]
  };

  const [formEvent, setFormEvent] = useState(initialFormState);

  useEffect(() => {
    // This useEffect is no longer needed as events are synced from context
    // const fetchEvents = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('events')
    //       .select('*')
    //       .order('date', { ascending: false });

    //     if (error) throw error;
    //     setEvents(data || []);
    //   } catch (err) {
    //     console.error('Error fetching events management:', err);
    //   }
    // };

    // fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Log activity
        await supabase.from('activities').insert({
          type: 'event',
          text: `Deleted event: "${events.find(e => e.id === id)?.title || 'an event'}"`
        });

        refreshData();
        showNotification('Event deleted successfully.', 'success');
      } catch (err: any) {
        console.error('Error deleting event:', err.message);
        showNotification('Error deleting event.', 'error');
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

      // Log activity
      await supabase.from('activities').insert({
        type: 'event',
        text: `Duplicated event: "${event.title}"`
      });

      refreshData();
      showNotification(`A copy of "${event.title}" has been created as a draft.`, 'success');
    } catch (err: any) {
      console.error('Error duplicating event:', err.message);
      showNotification('Error duplicating event.', 'error');
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

        // Log activity
        await supabase.from('activities').insert({
          type: 'event',
          text: `Published event: "${events.find(e => e.id === id)?.title || 'an event'}"`
        });

        refreshData();
        showNotification('Event published successfully!', 'success');
      } catch (err: any) {
        console.error('Error publishing event:', err.message);
        showNotification('Error publishing event.', 'error');
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

        // Log activity
        await supabase.from('activities').insert({
          type: 'event',
          text: `${editingEventId ? 'Updated' : 'Created'} event: "${eventPayload.title}"`
        });

        refreshData();
        showNotification(`Event ${editingEventId ? 'updated' : 'created'} successfully!`, 'success');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventPayload]);

        if (error) throw error;

        // Log activity
        await supabase.from('activities').insert({
          type: 'event',
          text: `Created new event: "${eventPayload.title}"`
        });

        refreshData();
        showNotification('New event created successfully!', 'success');
      }
      closeForm();
    } catch (err: any) {
      console.error('Error saving event:', err.message);
      showNotification('Error saving event.', 'error');
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
  const { news: contextNews, refreshData, showNotification } = useAppContext();
  const [news, setNews] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const featureImageRef = useRef<HTMLInputElement>(null);

  // Synchronize local news state with context news
  useEffect(() => {
    setNews(contextNews);
  }, [contextNews]);

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

        // Log activity
        await supabase.from('activities').insert({
          type: 'news',
          text: `Updated news article: "${entryToSave.title}"`
        });

        refreshData();
        showNotification('Article updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([entryToSave]);

        if (error) throw error;

        // Log activity
        await supabase.from('activities').insert({
          type: 'news',
          text: `Published new article: "${entryToSave.title}"`
        });

        refreshData();
        showNotification('Article published successfully!', 'success');
      }
      setShowAddForm(false);
      setEditingId(null);
      setFormNews(initialForm);
    } catch (err: any) {
      console.error('Error saving news:', err.message);
      showNotification('Error saving news.', 'error');
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

        // Log activity
        await supabase.from('activities').insert({
          type: 'news',
          text: `Deleted news article: "${news.find(n => n.id === id)?.title || 'an article'}"`
        });

        refreshData();
        showNotification('News article deleted.', 'success');
      } catch (err: any) {
        console.error('Error deleting news:', err.message);
        showNotification('Error deleting news.', 'error');
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

const ActivityLogs = () => {
  const { activities: initialActivities, showNotification } = useAppContext();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching logs:', err.message);
      showNotification('Error fetching activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'registration': return <FileText size={16} />;
      case 'approval': return <CheckCircle2 size={16} />;
      case 'update': return <Hotel size={16} />;
      case 'user': return <UserPlus size={16} />;
      case 'event': return <Calendar size={16} />;
      case 'news': return <Newspaper size={16} />;
      default: return <History size={16} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'registration': return 'text-amber-600 bg-amber-50';
      case 'approval': return 'text-emerald-600 bg-emerald-50';
      case 'update': return 'text-indigo-600 bg-indigo-50';
      case 'user': return 'text-rose-600 bg-rose-50';
      case 'event': return 'text-blue-600 bg-blue-50';
      case 'news': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const formatFullTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
              <History size={24} />
            </div>
            Recent Activity Logs
          </h2>
          <p className="text-slate-500 mt-1">Complete history of platform shifts and admin audits</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-slate-600"
        >
          <History size={16} className={loading ? 'animate-spin' : ''} />
          <span className="text-sm font-bold uppercase tracking-widest">Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search activity logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0">
            {['all', 'registration', 'approval', 'user', 'event', 'news'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${filter === type
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-medium">Loading audit trail...</p>
            </div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="group flex items-center gap-6 p-6 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className={`p-4 rounded-2xl ${getColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-bold text-lg group-hover:text-slate-900 transition-colors">{activity.text}</p>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-2 font-medium">
                    <Clock size={12} />
                    {formatFullTime(activity.created_at)}
                  </p>
                </div>
                <div className="hidden md:block">
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${getColor(activity.type).replace('bg-', 'border-').replace('-50', '-200')}`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <History size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-lg font-bold text-slate-400">No logs match your search</p>
              <button onClick={() => { setFilter('all'); setSearchTerm(''); }} className="mt-4 text-emerald-600 font-bold hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileEdit = ({ user }: { user: any }) => {
  const { hotels, loading, refreshData } = useAppContext();
  const [formData, setFormData] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<(string | File)[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || hotels.length === 0) return;

    // Try to find by ID first, then fallback to email for older mock accounts
    let hotel = hotels.find(h => h.id === user.id);
    if (!hotel) {
      hotel = hotels.find(h => h.email === user.email);
    }

    if (hotel) {
      setFormData({
        ...hotel,
        hotelName: hotel.hotel_name,
        year: hotel.year_established?.toString()
      });
      setGalleryImages(hotel.gallery || []);
      setGalleryPreviews(hotel.gallery || []);
    }
  }, [user, hotels]);



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
      refreshData();
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

  if (loading) {
    return (
      <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm African-accents">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Secure Data...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="max-w-3xl mx-auto py-12 African-accents">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <FileSignature size={240} />
          </div>

          <div className="relative z-10 text-center space-y-8">
            <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-amber-900/10 animate-bounce-slow">
              <AlertCircle size={48} />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Registration Required</h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                We couldn't find a hotel profile linked to your account. To access your member dashboard and public directory listing, please complete your official registration.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 transition-all flex items-center justify-center group"
              >
                <FileSignature size={18} className="mr-3 group-hover:scale-110 transition-transform" />
                Submit Registration
              </Link>
              <button
                onClick={() => refreshData()}
                className="w-full sm:w-auto bg-slate-50 text-slate-500 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center"
              >
                <History size={18} className="mr-3" />
                Check Status
              </button>
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-8 text-[9px] font-black text-slate-300 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Secure SSL</span>
              <span className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> Admin Verified</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { refreshData, showNotification, setUser } = useAppContext();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      const { user: authUser } = (await supabase.auth.getUser()).data;

      // Ensure password_changed flag is updated in profile
      if (authUser) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ password_changed: true })
          .eq('id', authUser.id);

        if (profileError) {
          console.warn('Profile security flag update failed:', profileError);
          showNotification('Password updated, but security flag update pending.', 'warning');
        } else {
          showNotification('Password updated successfully! Your account is now secure.', 'success');
        }

        // Optimistically update global state
        setUser({
          ...user,
          password_changed: true
        });
      }

      setNewPassword('');
      setConfirmPassword('');
      await refreshData();
    } catch (err: any) {
      console.error('Settings password update error:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

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

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center text-rose-600 text-xs font-bold uppercase tracking-widest">
            <AlertTriangle size={16} className="mr-3" /> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center text-emerald-700 text-xs font-bold uppercase tracking-widest">
            <CheckCircle size={16} className="mr-3" /> {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <button
            disabled={updating}
            type="submit"
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

export default function Dashboard() {
  const { user, refreshData } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const auth = localStorage.getItem('slah_auth');
      if (!auth) {
        navigate('/login');
      }
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('slah_auth');
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'super-admin';

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Applications', path: '/dashboard/applications', icon: <FileText size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Members', path: '/dashboard/members', icon: <Hotel size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Events', path: '/dashboard/events', icon: <Calendar size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'News', path: '/dashboard/news', icon: <Newspaper size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Users', path: '/dashboard/users', icon: <Users size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Logs', path: '/dashboard/logs', icon: <History size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'My Profile', path: '/dashboard/profile', icon: <Building2 size={20} />, roles: ['member'] },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} />, roles: ['super-admin', 'admin', 'member'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex African-accents">
      <aside className={`hidden lg:flex flex-col ${isCollapsed ? 'w-24' : 'w-80'} bg-slate-900 text-white fixed h-full z-50 transition-all duration-500 ease-in-out`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-12 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors z-[60]"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-8 border-b border-slate-800 flex ${isCollapsed ? 'justify-center items-center' : 'justify-start items-center'}`}>
          <Link to="/">
            <SLAHLogo variant="light" className={`${isCollapsed ? 'h-8 w-8' : 'h-16 w-auto'} transition-all duration-500`} />
          </Link>
        </div>
        <nav className="flex-grow p-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-4 rounded-2xl font-bold transition-all uppercase tracking-widest text-xs ${location.pathname === item.path
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center space-x-0' : 'justify-start space-x-3'}`}
              title={isCollapsed ? item.name : ''}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                {item.icon}
              </div>
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button onClick={handleLogout} className={`flex items-center p-4 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-900/10 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs ${isCollapsed ? 'justify-center space-x-0' : 'justify-start space-x-3'}`}>
            <div className="flex-shrink-0 flex items-center justify-center">
              <LogOut size={20} />
            </div>
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className={`flex-grow ${isCollapsed ? 'lg:ml-24' : 'lg:ml-80'} flex flex-col min-h-screen transition-all duration-500 ease-in-out`}>
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
            <Route path="/logs" element={<ActivityLogs />} />
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
