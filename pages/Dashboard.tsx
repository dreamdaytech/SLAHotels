import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link, Routes, Route, useLocation, useParams } from 'react-router-dom';
import {
  Users, Building2, FileText, BarChart3, Settings, LogOut,
  CheckCircle2, XCircle, Clock, Search, Plus, UserPlus,
  Menu, X, Bell, LayoutDashboard, Hotel, Star, MapPin,
  Lock, Eye, Trash2, Edit3, Calendar, UploadCloud, Info,
  Briefcase, Send, Target, Trash, ListTodo, Camera,
  User as UserIcon, Copy, AlertTriangle, CheckCircle, Newspaper,
  Image as ImageIcon, Globe, Award, ChevronRight, FileCheck, Check, ChevronUp, ChevronDown,
  MoreHorizontal, MoreVertical, History, Filter, Phone, Scale, FileBadge, FileSignature, CheckSquare,
  ShieldCheck, AlertCircle, ChevronLeft, Loader2, ClipboardList, ArrowRight, ArrowUp, ArrowDown, Save, RotateCcw
} from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { isProfileComplete } from '../lib/utils';

// --- Dashboard Sub-Components ---

const Stats = ({ user }: { user: any }) => {
  const { hotels, profiles } = useAppContext();
  const navigate = useNavigate();

  const approvedCount = hotels.filter(h => h.status === 'approved').length;
  const pendingCount = hotels.filter(h => h.status === 'pending').length;
  const suspendedCount = hotels.filter(h => h.status === 'suspended').length;
  const rejectedCount = hotels.filter(h => h.status === 'rejected').length;
  const totalHotels = hotels.length;
  const usersCount = profiles.length;

  const cards = [
    {
      label: 'Approved Members',
      value: approvedCount,
      sub: `of ${totalHotels} total`,
      icon: <CheckCircle2 size={22} />,
      gradient: 'from-emerald-500 to-teal-400',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      bar: Math.round((approvedCount / Math.max(totalHotels, 1)) * 100),
      barColor: 'bg-emerald-400',
      link: '/dashboard/members',
    },
    {
      label: 'Pending Applications',
      value: pendingCount,
      sub: 'awaiting review',
      icon: <Clock size={22} />,
      gradient: 'from-amber-500 to-orange-400',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      bar: Math.round((pendingCount / Math.max(totalHotels, 1)) * 100),
      barColor: 'bg-amber-400',
      link: '/dashboard/applications',
    },
    {
      label: 'System Users',
      value: usersCount,
      sub: 'registered accounts',
      icon: <Users size={22} />,
      gradient: 'from-indigo-500 to-violet-400',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      bar: null,
      barColor: '',
      link: '/dashboard/users',
    },
    {
      label: 'Inactive / Rejected',
      value: suspendedCount + rejectedCount,
      sub: `${suspendedCount} suspended · ${rejectedCount} rejected`,
      icon: <XCircle size={22} />,
      gradient: 'from-rose-500 to-pink-400',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      bar: Math.round(((suspendedCount + rejectedCount) / Math.max(totalHotels, 1)) * 100),
      barColor: 'bg-rose-400',
      link: '/dashboard/applications',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      {cards.map((c, i) => (
        <button key={i} onClick={() => navigate(c.link)}
          className="group text-left bg-white rounded-[1.75rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          {/* Gradient top strip */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${c.gradient}`} />
          <div className="p-6">
            {/* Icon + value row */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${c.bg}`}>
                <span className={c.text}>{c.icon}</span>
              </div>
              <span className={`text-4xl font-black tracking-tighter ${c.text}`}>{c.value}</span>
            </div>
            {/* Label */}
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">{c.label}</p>
            <p className="text-[10px] text-slate-400 font-medium">{c.sub}</p>
            {/* Progress bar */}
            {c.bar !== null && (
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.barColor}`} style={{ width: `${c.bar}%` }} />
              </div>
            )}
          </div>
        </button>
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
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const typeMap: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
    registration: { icon: <FileText size={13} />, bg: 'bg-amber-50', text: 'text-amber-600', label: 'Registration' },
    approval: { icon: <CheckCircle2 size={13} />, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Approval' },
    update: { icon: <Hotel size={13} />, bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Update' },
    user: { icon: <UserPlus size={13} />, bg: 'bg-rose-50', text: 'text-rose-600', label: 'User' },
    event: { icon: <Calendar size={13} />, bg: 'bg-violet-50', text: 'text-violet-600', label: 'Event' },
    news: { icon: <Newspaper size={13} />, bg: 'bg-sky-50', text: 'text-sky-600', label: 'News' },
  };

  const displayActivities = activities.slice(0, 7);

  return (
    <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-50 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live Feed</p>
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Recent Activity</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {displayActivities.length > 0 ? (
          <div className="space-y-0">
            {displayActivities.map((activity, idx) => {
              const t = typeMap[activity.type] ?? { icon: <Clock size={13} />, bg: 'bg-slate-50', text: 'text-slate-500', label: 'System' };
              const isLast = idx === displayActivities.length - 1;
              return (
                <div key={activity.id} className="flex gap-3 group">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center pt-1">
                    <div className={`p-2 rounded-xl ${t.bg} ${t.text} shrink-0 z-10`}>{t.icon}</div>
                    {!isLast && <div className="w-px flex-1 bg-slate-100 my-1" />}
                  </div>
                  {/* Content */}
                  <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <p className="text-[11px] font-bold text-slate-800 leading-snug group-hover:text-slate-900 transition-colors flex-1">{activity.text}</p>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap shrink-0">{formatRelativeTime(activity.created_at)}</span>
                    </div>
                    <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.bg} ${t.text}`}>{t.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Clock size={20} className="text-slate-300" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-slate-200 animate-ping opacity-30" />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No recent activity</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <button
        onClick={() => navigate('/dashboard/logs')}
        className="flex items-center justify-center gap-2 w-full py-4 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 hover:bg-emerald-50 transition-all"
      >
        View Full Log <ArrowRight size={12} />
      </button>
    </div>
  );
};


const ApplicationModal = ({ app, onClose, onApprove, onReject, onSuspend, onMoveToPending, isProcessing }: {
  app: any,
  onClose: () => void,
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onSuspend: (id: string) => void,
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
              {app.documents && Object.keys(app.documents).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(app.documents).map(([key, url]) => {
                    const docLabels: Record<string, string> = {
                      certIncorporation: 'Certificate of Incorporation',
                      bizRegCert: 'Business Registration Certificate',
                      ntbCert: 'NTB License Certificate',
                      taxClearance: 'Tax Clearance Certificate',
                    };
                    const label = docLabels[key] || key.replace(/([A-Z])/g, ' $1').trim();
                    return (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 bg-slate-50 hover:bg-emerald-50 rounded-2xl group transition-all border border-slate-100 hover:border-emerald-200"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="p-3 bg-rose-50 group-hover:bg-emerald-100 rounded-xl shrink-0 transition-colors">
                            <FileText className="text-rose-500 group-hover:text-emerald-600 transition-colors" size={20} />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">{label}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">PDF Document</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                          <Eye size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                  <FileText size={32} className="text-slate-200 mb-3" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Documents Submitted</p>
                </div>
              )}
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
                <button
                  disabled={isProcessing}
                  onClick={() => onSuspend(app.id)}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-amber-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-50 transition-all border border-slate-200 hover:border-amber-200 disabled:opacity-50 flex items-center justify-center"
                >
                  <AlertTriangle size={14} className="mr-2" />
                  Suspend
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
                <button
                  disabled={isProcessing}
                  onClick={() => onSuspend(app.id)}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-amber-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-50 transition-all border border-slate-200 hover:border-amber-200 disabled:opacity-50 flex items-center justify-center"
                >
                  <AlertTriangle size={14} className="mr-2" />
                  Suspend
                </button>
              </>
            )}
            {app.status === 'suspended' && (
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
                  Re-Approve & Activate
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

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hotels: rawHotels, refreshData, showNotification } = useAppContext();
  const [processing, setProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; variant: 'danger' | 'warning' | 'info' | 'success';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { }, variant: 'warning' });

  const askConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  };

  const raw = (rawHotels || []).find((h: any) => h.id === id);
  const app = raw ? {
    ...raw,
    hotelName: raw.hotel_name,
    date: new Date(raw.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    regNumber: raw.reg_number,
    year: raw.year_established?.toString(),
    roomTypes: raw.room_types,
    otherAmenities: raw.other_amenities,
    ntbLicense: raw.ntb_license,
    complianceRemarks: raw.compliance_remarks,
    signeeName: raw.signee_name,
    signeePosition: raw.signee_position,
    signeeDate: raw.signee_date,
  } : null;

  const runAction = async (statusValue: string, activityType: string, activityText: string) => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Authentication session lost.');
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (!profile || (profile.role !== 'admin' && profile.role !== 'super-admin')) throw new Error('Insufficient permissions.');
      const { data, error } = await supabase.from('hotels').update({ status: statusValue }).eq('id', id!).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Update failed. Record may not exist.');
      await supabase.from('activities').insert({ type: activityType, text: activityText, user_id: session.user.id });
      await refreshData();
      showNotification(`Status updated to ${statusValue}.`, 'success');
      navigate('/dashboard/applications');
    } catch (err: any) {
      showNotification('Error: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = () => askConfirm('Approve Membership?', `Approve "${app?.hotelName}" and publish to the live member directory?`, () => runAction('approved', 'approval', `Admin approved "${app?.hotelName}"`), 'success');
  const handleReject = () => askConfirm('Decline Registration?', `Decline the registration for "${app?.hotelName}"?`, () => runAction('rejected', 'rejection', `Admin rejected "${app?.hotelName}"`), 'danger');
  const handleSuspend = () => askConfirm('Suspend Membership?', `Suspend "${app?.hotelName}"? They will be hidden from the public directory.`, () => runAction('suspended', 'suspension', `Admin suspended "${app?.hotelName}"`), 'warning');
  const handleMoveToPending = () => askConfirm('Move to Pending?', `Move "${app?.hotelName}" back to Pending review?`, () => runAction('pending', 'update', `Admin moved "${app?.hotelName}" back to pending`), 'warning');

  const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
    pending: { label: 'Pending Review', dot: 'bg-amber-400', badge: 'bg-amber-50  text-amber-700  border-amber-200' },
    approved: { label: 'Approved', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', dot: 'bg-rose-500', badge: 'bg-rose-50   text-rose-700   border-rose-200' },
    suspended: { label: 'Suspended', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600  border-slate-200' },
  };
  const sc = STATUS_CONFIG[app?.status] || STATUS_CONFIG['pending'];

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5">
        <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <Hotel size={48} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Application not found</p>
        <button onClick={() => navigate('/dashboard/applications')} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg">
          <ChevronLeft size={14} /> Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 -mt-2">

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <div className="relative rounded-[2rem] overflow-hidden mb-8 bg-slate-900 shadow-2xl shadow-slate-900/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative z-10 p-8 md:p-10">
          {/* Breadcrumb */}
          <button onClick={() => navigate('/dashboard/applications')} className="flex items-center gap-1.5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest mb-8 group transition-colors">
            <ChevronLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Applications
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sc.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${app.status === 'pending' ? 'animate-pulse' : ''}`} />
                  {sc.label}
                </span>
                <span className="text-white/20 hidden md:block">·</span>
                <span className="text-white/35 text-[10px] font-bold uppercase tracking-widest">{app.date}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none mb-3">{app.hotelName}</h2>
              <p className="text-white/45 text-sm font-medium">
                {[app.address, app.city, app.district].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              {app.status !== 'approved' && (
                <button disabled={processing} onClick={handleApprove}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50">
                  {processing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={13} />}
                  {processing ? 'Processing…' : 'Approve'}
                </button>
              )}
              {app.status !== 'rejected' && (
                <button disabled={processing} onClick={handleReject}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-rose-900/40 disabled:opacity-50">
                  <XCircle size={13} />
                  {processing ? '…' : 'Decline'}
                </button>
              )}
              {app.status === 'approved' && (
                <button disabled={processing} onClick={handleSuspend}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-amber-900/40 disabled:opacity-50">
                  <AlertTriangle size={13} />
                  {processing ? '…' : 'Suspend'}
                </button>
              )}
              {(app.status === 'approved' || app.status === 'rejected' || app.status === 'suspended') && (
                <button disabled={processing} onClick={handleMoveToPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-sky-900/40 disabled:opacity-50">
                  <RotateCcw size={13} />
                  {processing ? '…' : 'Pending'}
                </button>
              )}
            </div>
          </div>

          {/* Quick-stat row */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
            {[
              { icon: <Star size={12} fill="currentColor" />, label: 'Rating', value: app.stars ? `${app.stars} Star` : '—' },
              { icon: <Building2 size={12} />, label: 'Rooms', value: app.rooms || '—' },
              { icon: <Users size={12} />, label: 'Staff', value: app.employees || '—' },
              { icon: <Clock size={12} />, label: 'Est.', value: app.year || '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
                <span className="text-emerald-400/80">{icon}</span>
                <div>
                  <p className="text-[8px] font-black text-white/25 uppercase tracking-widest leading-none">{label}</p>
                  <p className="text-[11px] font-black text-white mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Sections A, C, D, F */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─── SECTION A ─── Hotel Information */}
          <div className="rounded-[1.75rem] overflow-hidden shadow-md border border-emerald-100">
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-6 flex items-center justify-between overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 select-none pointer-events-none">
                <span className="block text-[9rem] font-black text-white leading-none -translate-y-4 translate-x-4">A</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Info size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-100/70 uppercase tracking-widest">Section A</p>
                  <p className="text-lg font-black text-white uppercase tracking-tight">Hotel Information</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div className="sm:col-span-2 pb-5 border-b border-slate-50">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Address</p>
                <p className="text-base font-bold text-slate-900">{app.address || '—'}</p>
              </div>
              {[
                { label: 'City', v: app.city },
                { label: 'District', v: app.district },
                { label: 'Email', v: app.email },
                { label: 'Contact', v: app.contact },
              ].map(({ label, v }) => (
                <div key={label} className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-slate-900">{v || '—'}</p>
                </div>
              ))}
              {app.website && (
                <div className="sm:col-span-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Website</p>
                  <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-700 hover:underline break-all">{app.website}</a>
                </div>
              )}
            </div>
          </div>

          {/* ─── SECTION C ─── Facilities & Classification */}
          <div className="rounded-[1.75rem] overflow-hidden shadow-md border border-amber-100">
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-400 px-8 py-6 flex items-center justify-between overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 select-none pointer-events-none">
                <span className="block text-[9rem] font-black text-white leading-none -translate-y-4 translate-x-4">C</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Star size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-amber-100/70 uppercase tracking-widest">Section C</p>
                  <p className="text-lg font-black text-white uppercase tracking-tight">Facilities &amp; Classification</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-3">Star Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={22}
                        fill={i <= parseInt(app.stars || 0) ? '#f59e0b' : 'none'}
                        stroke={i <= parseInt(app.stars || 0) ? '#f59e0b' : '#fde68a'} />
                    ))}
                  </div>
                </div>
                <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                  <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-1">Total Rooms</p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">{app.rooms || '—'}</p>
                </div>
              </div>
              {app.roomTypes && app.roomTypes.length > 0 && (
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Room Types</p>
                  <div className="flex flex-wrap gap-2">
                    {app.roomTypes.map((t: string) => (
                      <span key={t} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-black uppercase tracking-widest">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {app.facilities && app.facilities.length > 0 && (
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">In-House Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {app.facilities.map((f: string) => (
                      <span key={f} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {app.otherAmenities && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Other Amenities</p>
                  <p className="text-sm text-slate-600 leading-relaxed italic">{app.otherAmenities}</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── SECTION D ─── Legal & Compliance */}
          <div className="rounded-[1.75rem] overflow-hidden shadow-md border border-violet-100">
            <div className="relative bg-gradient-to-r from-violet-600 to-purple-500 px-8 py-6 flex items-center justify-between overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 select-none pointer-events-none">
                <span className="block text-[9rem] font-black text-white leading-none -translate-y-4 translate-x-4">D</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Scale size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-violet-100/70 uppercase tracking-widest">Section D</p>
                  <p className="text-lg font-black text-white uppercase tracking-tight">Legal &amp; Compliance</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-violet-50 border border-violet-100 rounded-2xl">
                  <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest mb-2">Tax ID (TIN)</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight">{app.tin || '—'}</p>
                </div>
                <div className="p-5 bg-purple-50 border border-purple-100 rounded-2xl">
                  <p className="text-[8px] font-black text-purple-500 uppercase tracking-widest mb-2">NTB License</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight">{app.ntbLicense || '—'}</p>
                </div>
              </div>
              {app.documents && Object.keys(app.documents).length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Submitted Documents</p>
                  {Object.entries(app.documents).map(([key, url]) => {
                    const labels: Record<string, string> = {
                      certIncorporation: 'Certificate of Incorporation',
                      bizRegCert: 'Business Registration',
                      ntbCert: 'NTB License Certificate',
                      taxClearance: 'Tax Clearance Certificate',
                    };
                    const label = labels[key] || key.replace(/([A-Z])/g, ' $1').trim();
                    return (
                      <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white hover:bg-violet-50 border border-slate-100 hover:border-violet-200 rounded-2xl group transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-violet-50 group-hover:bg-violet-100 rounded-xl transition-colors">
                            <FileText size={16} className="text-violet-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-wide">{label}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">PDF Document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">Open</span>
                          <Eye size={14} className="text-violet-500" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2">
                  <FileText size={28} className="text-slate-200" />
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Documents Submitted</p>
                </div>
              )}
              {app.complianceRemarks && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-2">Compliance Remarks</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{app.complianceRemarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── SECTION F ─── Gallery */}
          <div className="rounded-[1.75rem] overflow-hidden shadow-md border border-rose-100">
            <div className="relative bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-6 flex items-center justify-between overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 select-none pointer-events-none">
                <span className="block text-[9rem] font-black text-white leading-none -translate-y-4 translate-x-4">F</span>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <ImageIcon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-rose-100/70 uppercase tracking-widest">Section F</p>
                  <p className="text-lg font-black text-white uppercase tracking-tight">Property Gallery</p>
                </div>
              </div>
              {app.gallery && app.gallery.length > 0 && (
                <span className="relative z-10 text-[10px] font-black text-rose-100/80 uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                  {app.gallery.length} photo{app.gallery.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="bg-white p-6">
              {app.gallery && app.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {app.gallery.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                      className="group relative block aspect-video rounded-2xl overflow-hidden border border-slate-100 hover:border-rose-400 transition-all shadow-sm">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-3">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">View</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-14 flex flex-col items-center justify-center gap-3">
                  <ImageIcon size={40} className="text-slate-200" />
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No images provided</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Sections B, E, Meta */}
        <div className="space-y-6">

          {/* ─── SECTION B ─── Ownership */}
          <div className="rounded-[1.75rem] overflow-hidden shadow-md border border-blue-100">
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-5 flex items-center overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 select-none pointer-events-none">
                <span className="block text-[7rem] font-black text-white leading-none -translate-y-3 translate-x-3">B</span>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <Users size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-100/70 uppercase tracking-widest">Section B</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight">Ownership</p>
                </div>
              </div>
            </div>
            <div className="bg-white divide-y divide-slate-50">
              {[
                { label: 'Owner / Proprietor', value: app.owner },
                { label: 'Managing Director / GM', value: app.manager },
                { label: 'Business Reg #', value: app.regNumber },
                { label: 'Year Established', value: app.year },
                { label: 'Total Employees', value: app.employees },
              ].map(({ label, value }) => (
                <div key={label} className="px-6 py-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-slate-900">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION E ─── Commitment / Signature (dark) */}
          <div className="relative rounded-[1.75rem] overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute inset-0 bg-slate-900" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
            <div className="relative z-10">
              {/* Coloured top bar */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-1.5 flex items-center gap-2">
                <ShieldCheck size={10} className="text-white/70" />
                <p className="text-[8px] font-black text-white/70 uppercase tracking-widest">Section E · Association Commitment</p>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-sm text-white/40 leading-relaxed italic">
                  "I acknowledge and agree to abide by the rules and regulations of the Sierra Leone Association of Hotels."
                </p>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <CheckSquare size={12} className="text-emerald-400" />
                  </div>
                  <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">Electronically Verified</span>
                </div>
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest mb-3">Digitally Signed By</p>
                  <p className="text-xl font-black text-white uppercase tracking-tight leading-snug">{app.signeeName || '—'}</p>
                  <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mt-1">{app.signeePosition || ''}</p>
                  <div className="pt-3 mt-2 border-t border-white/10">
                    <p className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Date Signed</p>
                    <p className="text-xs font-bold text-white/50">{app.signeeDate || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Meta */}
          <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Application Info</p>
            </div>
            <div className="divide-y divide-slate-50">
              <div className="px-6 py-4">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                <p className="text-sm font-bold text-slate-900">{app.date}</p>
              </div>
              <div className="px-6 py-4">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sc.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(c => ({ ...c, isOpen: false }))}
        onConfirm={() => { confirmModal.onConfirm(); setConfirmModal(c => ({ ...c, isOpen: false })); }}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
    </div>
  );
};


const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}: {
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  title: string,
  message: string,
  confirmText?: string,
  cancelText?: string,
  variant?: 'danger' | 'warning' | 'info' | 'success'
}) => {
  if (!isOpen) return null;

  const themes = {
    danger: {
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20',
      border: 'border-rose-100'
    },
    warning: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20',
      border: 'border-amber-100'
    },
    info: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20',
      border: 'border-blue-100'
    },
    success: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20',
      border: 'border-emerald-100'
    }
  };

  const theme = themes[variant];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className={`p-10 ${theme.bg} border-b ${theme.border} flex flex-col items-center text-center`}>
          <div className={`p-5 ${theme.iconBg} ${theme.iconText} rounded-3xl mb-6 shadow-sm border ${theme.border}`}>
            {variant === 'danger' ? <Trash2 size={32} /> :
              variant === 'warning' ? <AlertTriangle size={32} /> :
                variant === 'success' ? <CheckCircle size={32} /> :
                  <Info size={32} />}
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-3">{title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed font-bold">{message}</p>
        </div>
        <div className="p-8 bg-white flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-8 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${theme.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionDropdown = ({
  actions,
  align = 'right',
  label = 'Actions'
}: {
  actions: {
    label: string,
    icon?: React.ReactNode,
    onClick: () => void,
    variant?: 'default' | 'danger' | 'success' | 'warning',
    disabled?: boolean
  }[],
  align?: 'left' | 'right',
  label?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 224; // w-56
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 280;

    setMenuStyle({
      position: 'fixed',
      width: menuWidth,
      ...(align === 'right'
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 })
    });
    setIsOpen(true);
  };

  const variantClass = (variant?: string) => {
    if (variant === 'danger') return 'text-rose-600 hover:bg-rose-50 hover:text-rose-700';
    if (variant === 'success') return 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700';
    if (variant === 'warning') return 'text-amber-600 hover:bg-amber-50 hover:text-amber-700';
    return 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
  };

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={openMenu}
        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          {/* Panel */}
          <div
            style={menuStyle}
            className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-4 z-[70] animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-8 ring-white"
          >
            <div className="px-6 pb-3 border-b border-slate-50 mb-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>

            {actions.map((action, idx) => (
              <button
                key={idx}
                disabled={action.disabled}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-4 text-left text-xs font-bold flex items-center transition-all group disabled:opacity-40 disabled:cursor-not-allowed ${variantClass(action.variant)}`}
              >
                {action.icon && (
                  <span className="mr-3 shrink-0">{action.icon}</span>
                )}
                {action.label}
              </button>
            ))}

            <div className="mt-2 px-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
              >
                Close Menu
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


const Applications = () => {
  const { hotels: rawHotels, refreshData, showNotification } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'suspended'>('pending');
  const [processing, setProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning'
  });

  const askConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  };

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
    } catch (err: any) {
      console.error('Error moving to pending:', err);
      showNotification('Error: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (id: string) => {
    console.log('[DEBUG] handleApprove started for ID:', id);

    // Enforce completeness check
    const hotel = rawHotels.find(h => h.id === id);
    const { complete, missing } = isProfileComplete(hotel);

    const doApprove = async () => {
      setProcessing(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Authentication session lost. Please log in again.');

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (!profile || (profile.role !== 'admin' && profile.role !== 'super-admin')) {
          throw new Error('Your account permissions do not allow this action.');
        }

        const { data, error } = await supabase.from('hotels').update({ status: 'approved' }).eq('id', id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Update failed. The record may not exist.');

        await supabase.from('activities').insert({
          type: 'approval',
          text: `Admin approved "${apps.find(a => a.id === id)?.hotelName || 'a hotel'}"`,
          user_id: session.user.id
        });

        await refreshData();
        showNotification('Membership Approved. Hotel profile is now live in the directory.', 'success');
        setActiveTab('approved');
      } catch (err: any) {
        showNotification('Error approving application: ' + (err.message || 'Unknown error'), 'error');
      } finally {
        setProcessing(false);
      }
    };

    if (!complete) {
      askConfirm(
        'Incomplete Registration — Approve Anyway?',
        `Warning: This registration is missing the following fields:\n\n• ${missing.join('\n• ')}\n\nYou can still approve, but the profile may appear incomplete in the directory. Proceed?`,
        doApprove,
        'warning'
      );
      return;
    }

    doApprove();
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
      setActiveTab('rejected');
    } catch (err: any) {
      console.error('CRITICAL: Error rejecting application:', err);
      showNotification('Error updating application status: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async (id: string) => {
    askConfirm(
      'Suspend Membership?',
      `Are you sure you want to suspend the membership for "${apps.find(a => a.id === id)?.hotelName || 'this hotel'}"? This will hide them from the public directory.`,
      async () => {
        setProcessing(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Auth session lost');

          const { error } = await supabase.from('hotels').update({ status: 'suspended' }).eq('id', id);
          if (error) throw error;

          await supabase.from('activities').insert({
            type: 'update',
            text: `Admin suspended membership for "${apps.find(a => a.id === id)?.hotelName}"`,
            user_id: session.user.id
          });

          await refreshData();
          showNotification('Membership suspended.', 'warning');
          setActiveTab('suspended');
        } catch (err: any) {
          showNotification('Error: ' + err.message, 'error');
        } finally {
          setProcessing(false);
        }
      },
      'warning'
    );
  };

  const filteredApps = apps.filter(app => app.status === activeTab);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full">
        <div className="p-4 md:p-10 border-b border-slate-50">
          <div className="mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Membership Applications</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">Reviewing and archiving joining requests.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl w-full overflow-x-auto no-scrollbar mb-0">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center justify-center px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-fit flex-1 ${activeTab === 'pending' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Clock size={14} className="mr-2" /> Pending ({apps.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex items-center justify-center px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-fit flex-1 ${activeTab === 'approved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FileCheck size={14} className="mr-2" /> Approved ({apps.filter(a => a.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex items-center justify-center px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-fit flex-1 ${activeTab === 'rejected' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <History size={14} className="mr-2" /> Rejected ({apps.filter(a => a.status === 'rejected').length})
            </button>
            <button
              onClick={() => setActiveTab('suspended')}
              className={`flex items-center justify-center px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-fit flex-1 ${activeTab === 'suspended' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <AlertTriangle size={14} className="mr-2" /> Suspended ({apps.filter(a => a.status === 'suspended').length})
            </button>
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
                <th className="px-10 py-5">Completeness</th>
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
                  <td className="px-10 py-6">
                    {(() => {
                      const { complete } = isProfileComplete(app);
                      return (
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {complete ? 'Complete' : 'Incomplete'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <ActionDropdown
                      label="Application Actions"
                      actions={[
                        {
                          label: app.status === 'pending' ? 'Review & Approve' : app.status === 'rejected' ? 'Restore / Approve' : 'View Details',
                          icon: <Eye size={14} />,
                          onClick: () => navigate('/dashboard/applications/' + app.id)
                        },
                        {
                          label: 'Approve Membership',
                          icon: <CheckCircle2 size={14} />,
                          variant: 'success',
                          disabled: app.status === 'approved',
                          onClick: () => askConfirm('Approve Membership?', `Are you sure you want to approve "${app.hotelName}"?`, () => handleApprove(app.id), 'success')
                        },
                        {
                          label: 'Unapprove — Move to Pending',
                          icon: <RotateCcw size={14} />,
                          disabled: app.status !== 'approved',
                          onClick: () => askConfirm('Unapprove Membership?', `This will move "${app.hotelName}" back to Pending and remove them from the live directory. Continue?`, () => handleMoveToPending(app.id), 'warning')
                        },
                        {
                          label: 'Decline Registration',
                          icon: <XCircle size={14} />,
                          variant: 'danger',
                          disabled: app.status === 'rejected',
                          onClick: () => askConfirm('Decline Registration?', `Are you sure you want to decline the registration for "${app.hotelName}"?`, () => handleReject(app.id), 'danger')
                        },
                        {
                          label: 'Suspend Application',
                          icon: <AlertTriangle size={14} />,
                          variant: 'warning',
                          disabled: app.status === 'suspended',
                          onClick: () => handleSuspend(app.id)
                        }
                      ]}
                    />
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



      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
    </div>
  );
};

const MembersManagement = () => {
  const { hotels: rawHotels, refreshData, showNotification, user } = useAppContext();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'hotelName',
    direction: 'asc'
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning'
  });

  const askConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  };

  const logActivity = async (text: string) => {
    if (!user) return;
    await supabase.from('activities').insert({
      type: 'update',
      text,
      user_id: user.id
    });
  };

  const handleApproveMember = async (id: string, hotelName: string) => {
    // Enforce completeness check
    const hotel = rawHotels.find(h => h.id === id);
    const { complete, missing } = isProfileComplete(hotel);

    if (!complete) {
      showNotification('error', `Cannot approve "${hotelName}": Registration incomplete.`);
      askConfirm(
        'Incomplete Profile',
        `The profile for "${hotelName}" is incomplete. Missing fields: \n\n• ${missing.join('\n• ')}`,
        () => { },
        'info'
      );
      return;
    }

    askConfirm(
      'Approve Membership?',
      `Confirm approval for "${hotelName}"? This will mark them as active in the directory.`,
      async () => {
        setProcessing(true);
        const { error } = await supabase
          .from('hotels')
          .update({ status: 'approved' })
          .eq('id', id);

        if (error) {
          showNotification('error', `Failed to approve: ${error.message}`);
        } else {
          await logActivity(`Approved membership for "${hotelName}"`);
          showNotification('success', `${hotelName} is now an active member.`);
          refreshData();
        }
        setProcessing(false);
      },
      'success'
    );
  };

  const handleRejectMember = async (id: string, hotelName: string) => {
    askConfirm(
      'Decline Membership?',
      `Are you sure you want to decline "${hotelName}"? They will be moved to the rejected list.`,
      async () => {
        setProcessing(true);
        const { error } = await supabase
          .from('hotels')
          .update({ status: 'rejected' })
          .eq('id', id);

        if (error) {
          showNotification('error', `Failed to decline: ${error.message}`);
        } else {
          await logActivity(`Declined membership for "${hotelName}"`);
          showNotification('warning', `${hotelName} membership has been declined.`);
          refreshData();
        }
        setProcessing(false);
      },
      'danger'
    );
  };

  const handleSuspendMember = async (id: string, hotelName: string) => {
    askConfirm(
      'Suspend Membership?',
      `Are you sure you want to suspend "${hotelName}"? They will lose dashboard access immediately.`,
      async () => {
        setProcessing(true);
        const { error } = await supabase
          .from('hotels')
          .update({ status: 'suspended' })
          .eq('id', id);

        if (error) {
          showNotification('error', `Failed to suspend: ${error.message}`);
        } else {
          await logActivity(`Suspended membership for "${hotelName}"`);
          showNotification('success', `${hotelName} has been suspended.`);
          refreshData();
        }
        setProcessing(false);
      },
      'danger'
    );
  };

  const handleDeleteMember = async (id: string, hotelName: string) => {
    askConfirm(
      'Delete Member Record?',
      `This will permanently remove "${hotelName}" from the official directory. This action is irreversible.`,
      async () => {
        setProcessing(true);
        const { error } = await supabase
          .from('hotels')
          .delete()
          .eq('id', id);

        if (error) {
          showNotification('error', `Failed to delete: ${error.message}`);
        } else {
          await logActivity(`Deleted member record for "${hotelName}"`);
          showNotification('success', `${hotelName} has been removed from directory.`);
          refreshData();
        }
        setProcessing(false);
      },
      'danger'
    );
  };

  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set((rawHotels || []).map((m: any) => m.city).filter(Boolean)));
    return ['all', ...uniqueCities.sort()];
  }, [rawHotels]);

  const members = useMemo(() => {
    let list = (rawHotels || []).map((m: any) => ({
      ...m,
      hotelName: m.hotel_name
    }));

    // Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(m => m.status === statusFilter);
    }

    // City Filter
    if (selectedCity !== 'all') {
      list = list.filter(m => m.city === selectedCity);
    }

    // Search Filter
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      list = list.filter(m =>
        m.hotelName?.toLowerCase().includes(lowSearch) ||
        m.city?.toLowerCase().includes(lowSearch) ||
        m.id?.toLowerCase().includes(lowSearch)
      );
    }

    // Sorting
    list.sort((a: any, b: any) => {
      const field = sortConfig.field;
      let valA = a[field] || '';
      let valB = b[field] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [rawHotels, statusFilter, searchTerm, selectedCity, sortConfig]);

  const toggleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortConfig.field !== field) return <ChevronDown size={12} className="opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-emerald-500" /> : <ChevronDown size={12} className="text-emerald-500" />;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
      <div className="p-4 md:p-8 border-b border-slate-50">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Official Member Directory</h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">Active certified members</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4 w-full items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by hotel, city, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
          <div className="relative flex-1 sm:w-40">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none appearance-none font-bold text-slate-600"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city === 'all' ? 'All Cities' : city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
          <button className="px-3 md:px-4 py-2 border border-slate-200 rounded-xl font-bold text-[10px] md:text-sm text-slate-600 hover:bg-slate-50">Export</button>
          <Link to="/register" className="bg-emerald-600 text-white px-3 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-sm hover:bg-emerald-700 text-center">Add Member</Link>
        </div>
      </div>

      <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-slate-50 p-1 rounded-2xl w-full md:w-auto">
          {['all', 'approved', 'pending', 'suspended', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Showing {members.length} {statusFilter === 'all' ? 'total' : statusFilter} records
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th
                className="px-4 md:px-8 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group"
                onClick={() => toggleSort('hotelName')}
              >
                <div className="flex items-center space-x-2">
                  <span>Hotel Name</span>
                  <SortIcon field="hotelName" />
                </div>
              </th>
              <th
                className="px-4 md:px-8 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group"
                onClick={() => toggleSort('city')}
              >
                <div className="flex items-center space-x-2">
                  <span>Location</span>
                  <SortIcon field="city" />
                </div>
              </th>
              <th
                className="px-4 md:px-8 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group"
                onClick={() => toggleSort('stars')}
              >
                <div className="flex items-center space-x-2">
                  <span>Rating</span>
                  <SortIcon field="stars" />
                </div>
              </th>
              <th
                className="px-4 md:px-8 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group"
                onClick={() => toggleSort('status')}
              >
                <div className="flex items-center space-x-2">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-4 md:px-8 py-4">Completeness</th>
              <th className="px-4 md:px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 md:px-8 py-4 md:py-5">
                  <div className="font-bold text-slate-900 text-sm">{member.hotelName}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">ID: {member.id}</div>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-5 text-slate-500 text-sm">{member.city}</td>
                <td className="px-4 md:px-8 py-4 md:py-5">
                  <div className="flex text-amber-400">
                    {[...Array(parseInt(member.stars || 4))].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                  </div>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest African-accents Africa-badge Africans-Badges ${member.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    member.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                      member.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        member.status === 'pending' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-500'
                    }`}>
                    {member.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-5">
                  {(() => {
                    const hotel = rawHotels?.find((h: any) => h.id === member.id);
                    const { complete } = isProfileComplete(hotel);
                    return (
                      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {complete ? 'Complete' : 'Incomplete'}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 md:px-8 py-4 md:py-5 text-right">
                  <ActionDropdown
                    label="Member Actions"
                    actions={[
                      {
                        label: 'View Profile',
                        icon: <Eye size={14} />,
                        onClick: () => navigate(`/members/${member.id}`)
                      },
                      {
                        label: member.status === 'pending' ? 'Approve Membership' : 'Mark as Approved',
                        icon: <CheckCircle2 size={14} />,
                        variant: 'success',
                        disabled: member.status === 'approved' || processing,
                        onClick: () => handleApproveMember(member.id, member.hotelName)
                      },
                      {
                        label: 'Decline Membership',
                        icon: <XCircle size={14} />,
                        variant: 'danger',
                        disabled: member.status === 'rejected' || processing,
                        onClick: () => handleRejectMember(member.id, member.hotelName)
                      },
                      {
                        label: 'Suspend Member',
                        icon: <AlertTriangle size={14} />,
                        variant: 'warning',
                        disabled: member.status === 'suspended' || processing,
                        onClick: () => handleSuspendMember(member.id, member.hotelName)
                      },
                      {
                        label: 'Permanent Delete',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        disabled: processing,
                        onClick: () => handleDeleteMember(member.id, member.hotelName)
                      }
                    ]}
                  />
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Search size={48} className="mb-4 opacity-10" />
                    <p className="italic font-medium">No members found matching your search or filters.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCity('all');
                        setStatusFilter('all');
                      }}
                      className="mt-4 text-emerald-600 font-bold hover:underline text-xs uppercase tracking-widest"
                    >
                      Clear all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
    </div>
  );
};

const UserManagement = () => {
  const { profiles: users, loading, refreshData, showNotification } = useAppContext();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [autoApprove, setAutoApprove] = useState(false);
  const [creating, setCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<any>(null);
  const [newForcedPassword, setNewForcedPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);
  const [roleTarget, setRoleTarget] = useState<any>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning'
  });

  const askConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  };

  const { user: currentUser } = useAppContext();

  // We no longer need fetchUsers locally

  const handleToggleSecurity = async (userId: string, currentStatus: boolean) => {
    askConfirm(
      currentStatus ? 'Update Security Status' : 'Verify Account Security',
      `Are you sure you want to mark this account as ${currentStatus ? 'Pending Change' : 'Secure'}?`,
      async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ security_verified: !currentStatus })
            .eq('id', userId);

          if (error) throw error;
          await refreshData();
          showNotification('User security status updated.', 'success');
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
      'info'
    );
  };

  const handleAdminResetPassword = async (userEmail: string) => {
    askConfirm(
      'Reset Password?',
      `Are you sure you want to send a secure password reset link to ${userEmail}?`,
      async () => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
            redirectTo: `${window.location.origin}/#/login?type=recovery`,
          });
          if (error) throw error;
          showNotification('Password reset link sent to user email.', 'success');
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
      'warning'
    );
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

      // If Auto-Approve is checked, create an empty approved hotel record
      if (autoApprove && data.user) {
        const { error: hotelError } = await supabase
          .from('hotels')
          .insert([{
            user_id: data.user.id,
            hotel_name: newUser.name + " (Pending Setup)",
            email: newUser.email,
            status: 'approved',
            created_at: new Date().toISOString()
          }]);

        if (hotelError) {
          console.error('Error auto-approving hotel:', hotelError);
          showNotification('User created, but failed to create hotel record.', 'warning');
        }
      }

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

  const handleDeleteUser = async (user: any) => {
    askConfirm(
      'Permanent Deletion',
      `CRITICAL: Are you sure you want to PERMANENTLY delete the account for "${user.name || user.email}"? This will also delete their hotel record and all activity logs. This action cannot be undone.`,
      async () => {
        setDeleting(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Session lost');

          const response = await fetch('https://mvduiyvpjkmigvkelnzv.supabase.co/functions/v1/admin-delete-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ userId: user.id })
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Failed to delete user');

          await supabase.from('activities').insert({
            type: 'admin_action',
            text: `Super Admin deleted account for ${user.email}`,
            user_id: session.user.id
          });

          showNotification('User and associated data permanently deleted.', 'success');
          await refreshData();
        } catch (err: any) {
          console.error('Deletion error:', err);
          showNotification('Error deleting user: ' + err.message, 'error');
        } finally {
          setDeleting(false);
        }
      },
      'danger'
    );
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

                              <div className="h-px bg-slate-50 my-1"></div>

                              <button
                                disabled={deleting}
                                onClick={() => {
                                  handleDeleteUser(u);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-6 py-4 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center transition-all group disabled:opacity-50"
                              >
                                {deleting ? (
                                  <div className="w-4 h-4 border-2 border-rose-600/20 border-t-rose-600 rounded-full animate-spin mr-3"></div>
                                ) : (
                                  <Trash2 size={16} className="mr-3 text-rose-400 group-hover:text-rose-600" />
                                )}
                                {deleting ? 'Deleting...' : 'Delete Account'}
                              </button>

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

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
    </div>
  );
};

const EventsManagement = () => {
  const { user, events: contextEvents, refreshData, showNotification } = useAppContext();
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  const events = useMemo(() => {
    if (isAdmin) return contextEvents;
    return contextEvents.filter(e => e.user_id === user?.id);
  }, [contextEvents, isAdmin, user]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning'
  });

  const askConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  };

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
  const [expandedDays, setExpandedDays] = useState<number[]>([0]);

  const toggleDayExpanded = (index: number) => {
    setExpandedDays(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

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
    askConfirm(
      'Delete Event?',
      'Are you sure you want to delete this event? This action cannot be undone and will remove it from the website.',
      async () => {
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
          showNotification('Event permanently deleted.', 'success');
        } catch (err: any) {
          console.error('Error deleting event:', err.message);
          showNotification('Error deleting event.', 'error');
        }
      },
      'danger'
    );
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
      status: isAdmin ? 'Draft' : 'Pending',
      user_id: user?.id,
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    const actionLabel = newStatus === 'Approved' ? 'Approve' : newStatus === 'Declined' ? 'Decline' : newStatus === 'Suspended' ? 'Suspend' : 'Update';

    askConfirm(
      `${actionLabel} Event?`,
      `Are you sure you want to set this event to "${newStatus}"?`,
      async () => {
        try {
          const { error } = await supabase
            .from('events')
            .update({ status: newStatus })
            .eq('id', id);

          if (error) throw error;

          // Log activity
          await supabase.from('activities').insert({
            type: 'event',
            text: `${newStatus} event: "${events.find(e => e.id === id)?.title || 'an event'}"`
          });

          refreshData();
          showNotification(`Event ${newStatus.toLowerCase()} successfully!`, 'success');
        } catch (err: any) {
          console.error(`Error changing event status:`, err.message);
          showNotification(`Error updating event status.`, 'error');
        }
      },
      newStatus === 'Approved' ? 'success' : newStatus === 'Declined' ? 'danger' : 'warning'
    );
  };

  const handlePublish = async (id: string) => {
    handleStatusChange(id, 'Approved');
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
    const schedule = Array.isArray(event.schedule) && event.schedule.length > 0
      ? event.schedule
      : [{ date: event.date || '', time: event.time || '', agenda: Array.isArray(event.agenda) ? event.agenda : [] }];

    setFormEvent({
      ...event,
      fullContent: event.full_content || event.fullContent || '',
      schedule,
      speakers: Array.isArray(event.speakers) && event.speakers.length > 0
        ? event.speakers
        : [{ name: '', role: '', image: '' }]
    });
    setExpandedDays([0]); // Expand the first day by default
    setShowAddForm(true);
  };

  const handleAddScheduleItem = () => {
    const newSchedule = [...(formEvent.schedule || []), { date: '', time: '', agenda: [{ time: '', activity: '' }] }];
    setFormEvent({
      ...formEvent,
      schedule: newSchedule
    });
    setExpandedDays(prev => [...prev, newSchedule.length - 1]);
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

  const handleMoveScheduleItem = (index: number, direction: 'up' | 'down') => {
    const updated = [...(formEvent.schedule || [])];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx >= 0 && newIdx < updated.length) {
      [updated[index], updated[newIdx]] = [updated[newIdx], updated[index]];
      setFormEvent({ ...formEvent, schedule: updated });
      // Update expanded states accordingly
      setExpandedDays(prev => prev.map(i => {
        if (i === index) return newIdx;
        if (i === newIdx) return index;
        return i;
      }));
    }
  };

  const handleMoveDailyAgendaItem = (scheduleIdx: number, agendaIdx: number, direction: 'up' | 'down') => {
    const updated = [...(formEvent.schedule || [])];
    if (updated[scheduleIdx]) {
      const agenda = [...(updated[scheduleIdx].agenda || [])];
      const newIdx = direction === 'up' ? agendaIdx - 1 : agendaIdx + 1;
      if (newIdx >= 0 && newIdx < agenda.length) {
        [agenda[agendaIdx], agenda[newIdx]] = [agenda[newIdx], agenda[agendaIdx]];
        updated[scheduleIdx].agenda = agenda;
        setFormEvent({ ...formEvent, schedule: updated });
      }
    }
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

  const handleSaveEvent = async (e: React.FormEvent, forcedStatus?: 'Draft' | 'Pending') => {
    if (e && e.preventDefault) e.preventDefault();
    const primarySchedule = (formEvent.schedule && formEvent.schedule.length > 0)
      ? formEvent.schedule[0]
      : { date: '', time: '' };

    const finalImage = formEvent.image || 'https://picsum.photos/seed/event' + Math.floor(Math.random() * 1000) + '/1200/800';

    const eventPayload = {
      title: formEvent.title,
      location: formEvent.location,
      description: formEvent.description,
      full_content: formEvent.fullContent || formEvent.full_content || '',
      category: formEvent.category,
      status: forcedStatus || (editingEventId ? formEvent.status : (isAdmin ? 'Approved' : 'Pending')),
      user_id: user?.id,
      image: finalImage,
      schedule: (formEvent.schedule || []).filter(s => s.date || s.time || (s.agenda && s.agenda.some((a: any) => a.time || a.activity))),
      speakers: (formEvent.speakers || []).filter(s => s.name || s.role),
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
    setExpandedDays([0]);
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
            {(event.status === 'Draft' || (isAdmin && event.status === 'Pending')) ? (
              <button
                onClick={() => handlePublish(event.id)}
                className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs flex items-center shadow-lg"
              >
                <CheckCircle size={18} className="mr-2" /> {event.status === 'Draft' ? 'Publish Live' : 'Approve & Publish'}
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
                    <div className="absolute -top-4 -left-4 flex items-center gap-2">
                      <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                        {scheduleIdx + 1}
                      </div>
                      <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                        <button type="button" disabled={scheduleIdx === 0} onClick={() => handleMoveScheduleItem(scheduleIdx, 'up')} className="p-1.5 text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all"><ArrowUp size={16} /></button>
                        <button type="button" disabled={scheduleIdx === (formEvent.schedule || []).length - 1} onClick={() => handleMoveScheduleItem(scheduleIdx, 'down')} className="p-1.5 text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all"><ArrowDown size={16} /></button>
                      </div>
                    </div>

                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      <button type="button" onClick={() => toggleDayExpanded(scheduleIdx)} className="p-3 bg-white text-emerald-600 hover:bg-emerald-50 border border-slate-100 rounded-xl transition-all shadow-sm flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                        {expandedDays.includes(scheduleIdx) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        {expandedDays.includes(scheduleIdx) ? 'Collapse' : 'Expand Details'}
                      </button>
                      {(formEvent.schedule || []).length > 1 && (
                        <button type="button" onClick={() => handleRemoveScheduleItem(scheduleIdx)} className="p-3 bg-white text-rose-300 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-xl transition-all shadow-sm">
                          <Trash size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pt-4">
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

                    {expandedDays.includes(scheduleIdx) && (
                      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
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
                            <div key={agendaIdx} className="flex gap-4 items-center animate-in slide-in-from-top-2 h-10 group/agenda">
                              <div className="flex flex-col opacity-0 group-hover/agenda:opacity-100 transition-opacity">
                                <button type="button" disabled={agendaIdx === 0} onClick={() => handleMoveDailyAgendaItem(scheduleIdx, agendaIdx, 'up')} className="text-slate-300 hover:text-emerald-600 disabled:opacity-0 transition-all"><ChevronUp size={14} /></button>
                                <button type="button" disabled={agendaIdx === (item.agenda || []).length - 1} onClick={() => handleMoveDailyAgendaItem(scheduleIdx, agendaIdx, 'down')} className="text-slate-300 hover:text-emerald-600 disabled:opacity-0 transition-all"><ChevronDown size={14} /></button>
                              </div>
                              <div className="w-32">
                                <input type="text" placeholder="Time" value={agendaItem.time} onChange={e => {
                                  const updated = [...(formEvent.schedule || [])];
                                  updated[scheduleIdx].agenda[agendaIdx].time = e.target.value;
                                  setFormEvent({ ...formEvent, schedule: updated });
                                }} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="flex-grow">
                                <input type="text" placeholder="Activity Title" value={agendaItem.activity} onChange={e => {
                                  const updated = [...(formEvent.schedule || [])];
                                  updated[scheduleIdx].agenda[agendaIdx].activity = e.target.value;
                                  setFormEvent({ ...formEvent, schedule: updated });
                                }} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-medium" />
                              </div>
                              <div className="flex items-center gap-1">
                                {(item.agenda || []).length > 1 && (
                                  <button type="button" onClick={() => handleRemoveDailyAgendaItem(scheduleIdx, agendaIdx)} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                    <Trash size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                        <input type="text" placeholder="Full Name" value={speaker.name} onChange={e => {
                          const updated = [...(formEvent.speakers || [])];
                          updated[idx].name = e.target.value;
                          setFormEvent({ ...formEvent, speakers: updated });
                        }} className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Professional Role</label>
                        <input type="text" placeholder="e.g. CEO, Radisson Blu" value={speaker.role} onChange={e => {
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

            <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={(e) => handleSaveEvent(e as any, 'Draft')}
                className="w-full bg-slate-100 text-slate-600 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-200 transition-all flex items-center justify-center border border-slate-200"
              >
                <Save size={20} className="mr-4" />
                Save as Draft
              </button>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-emerald-900/20 hover:bg-slate-900 transition-all flex items-center justify-center"
              >
                <Send size={20} className="mr-4" />
                {editingEventId ? (formEvent.status === 'Draft' ? 'Submit for Review' : 'Update Event') : (isAdmin ? 'Publish Live Event' : 'Submit for Review')}
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
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-center ${event.status === 'Approved' || event.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                            event.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
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

                          {isAdmin && event.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusChange(event.id, 'Approved')}
                              title="Approve Event"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {isAdmin && event.status === 'Approved' && (
                            <button
                              onClick={() => handleStatusChange(event.id, 'Suspended')}
                              title="Suspend Event"
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            >
                              <AlertTriangle size={16} />
                            </button>
                          )}

                          {isAdmin && event.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusChange(event.id, 'Declined')}
                              title="Decline Event"
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          {(isDraft || event.status === 'Published') && (
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
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
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
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning'
  });

  const askConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  };

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
    askConfirm(
      'Delete News Article?',
      `Are you sure you want to delete "${news.find(n => n.id === id)?.title || 'this article'}"? This will remove it from the website permanently.`,
      async () => {
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
      },
      'danger'
    );
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
          <div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 md:px-8 py-4">Article</th>
                  <th className="hidden md:table-cell px-4 md:px-8 py-4">Author</th>
                  <th className="hidden md:table-cell px-4 md:px-8 py-4">Date</th>
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
                    <td className="hidden md:table-cell px-8 py-5 text-sm text-slate-500">{article.author}</td>
                    <td className="hidden md:table-cell px-8 py-5 text-sm text-slate-400">{article.date}</td>
                    <td className="px-4 md:px-8 py-4 md:py-5">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {article.status || 'Published'}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-5 text-right">
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
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
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
  const { userHotel, userHotelLoading, refreshData, showNotification } = useAppContext();
  const loading = userHotelLoading;
  const [saving, setSaving] = useState(false);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [status, setStatus] = useState('pending');

  // Section A: Identity
  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');

  // Section B: Ownership
  const [owner, setOwner] = useState('');
  const [manager, setManager] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [year, setYear] = useState('');
  const [employees, setEmployees] = useState('');

  // Section C: Facilities
  const [rooms, setRooms] = useState('');
  const [stars, setStars] = useState(4);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [otherAmenities, setOtherAmenities] = useState('');

  // Section D: Compliance
  const [tin, setTin] = useState('');
  const [ntbLicense, setNtbLicense] = useState('');
  const [complianceRemarks, setComplianceRemarks] = useState('');
  const [newDocuments, setNewDocuments] = useState<{ [key: string]: File }>({});
  const [existingDocuments, setExistingDocuments] = useState<{ [key: string]: any }>({});

  // Section E: Commitment
  const [signeeName, setSigneeName] = useState('');
  const [signeePosition, setSigneePosition] = useState('');
  const [signeeDate, setSigneeDate] = useState('');

  // Section F: Gallery
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !userHotel) return;

    const hotel = userHotel;

    setHotelId(hotel.id);
    setHotelName(hotel.hotel_name || '');
    setAddress(hotel.address || '');
    setCity(hotel.city || '');
    setDistrict(hotel.district || '');
    setEmail(hotel.email || '');
    setContact(hotel.contact || '');
    setWebsite(hotel.website || '');
    setOwner(hotel.owner || '');
    setManager(hotel.manager || '');
    setRegNumber(hotel.reg_number || '');
    setYear(hotel.year_established?.toString() || '');
    setEmployees(hotel.employees?.toString() || '');
    setRooms(hotel.rooms?.toString() || '');
    setStars(hotel.stars || 4);
    setRoomTypes(hotel.room_types || []);
    setFacilities(hotel.facilities || []);
    setOtherAmenities(hotel.other_amenities || '');
    setTin(hotel.tin || '');
    setNtbLicense(hotel.ntb_license || '');
    setComplianceRemarks(hotel.compliance_remarks || '');
    setExistingDocuments(hotel.documents || {});
    setSigneeName(hotel.signee_name || '');
    setSigneePosition(hotel.signee_position || '');
    if (hotel.signee_date) setSigneeDate(new Date(hotel.signee_date).toISOString().split('T')[0]);
    setExistingGallery(hotel.gallery || []);
    setGalleryPreviews(hotel.gallery || []);
    setStatus(hotel.status || 'pending');
  }, [user, userHotel]);

  const toggleFacility = (f: string) => {
    setFacilities(prev => prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]);
  };

  const toggleRoomType = (type: string) => {
    setRoomTypes(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewDocuments(prev => ({ ...prev, [key]: file }));
  };

  const removeDocument = (key: string) => {
    if (!window.confirm('Remove this document? You will need to re-upload it if needed.')) return;
    setExistingDocuments(prev => { const next = { ...prev }; delete next[key]; return next; });
    setNewDocuments(prev => { const next = { ...prev }; delete next[key]; return next; });
    // reset the hidden file input so the same file can be re-selected if needed
    const input = document.getElementById(key) as HTMLInputElement | null;
    if (input) input.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
    const validFiles = (Array.from(files) as File[]).filter(f => allowedTypes.includes(f.type));
    if (validFiles.length !== files.length) {
      showNotification('Only WebP, JPEG/JPG, and PNG images are allowed.', 'error');
    }
    if (validFiles.length === 0) return;

    const currentCount = galleryImages.length + existingGallery.length;
    const remainingSlots = 10 - currentCount;

    if (remainingSlots <= 0) return;

    const newFiles = validFiles.slice(0, remainingSlots) as File[];
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
    if (index < existingGallery.length) {
      setExistingGallery(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const relativeIdx = index - existingGallery.length;
      setGalleryImages(prev => prev.filter((_, i) => i !== relativeIdx));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!hotelId) return;
    setSaving(true);

    try {
      const uploadedGalleryUrls = await Promise.all(
        galleryImages.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${hotelId}-${Math.random()}.${fileExt}`;
          const filePath = `gallery/${fileName}`;
          const { error } = await supabase.storage.from('hotel-gallery').upload(filePath, file);
          if (error) throw error;
          return supabase.storage.from('hotel-gallery').getPublicUrl(filePath).data.publicUrl;
        })
      );

      const uploadedDocumentUrls: { [key: string]: string } = {};
      for (const [key, file] of Object.entries(newDocuments)) {
        const fileExt = (file as File).name.split('.').pop();
        const fileName = `${key}-${hotelId}-${Math.random()}.${fileExt}`;
        const filePath = `documents/${fileName}`;
        const { error } = await supabase.storage.from('hotel-documents').upload(filePath, file as File);
        if (error) throw error;
        uploadedDocumentUrls[key] = supabase.storage.from('hotel-documents').getPublicUrl(filePath).data.publicUrl;
      }

      const payload = {
        hotel_name: hotelName,
        address, city, district, email, contact, website,
        owner, manager, reg_number: regNumber,
        year_established: year ? parseInt(year) : null,
        employees: employees ? parseInt(employees) : null,
        rooms: rooms ? parseInt(rooms) : null,
        stars, room_types: roomTypes, facilities,
        other_amenities: otherAmenities, tin, ntb_license: ntbLicense,
        compliance_remarks: complianceRemarks,
        documents: { ...existingDocuments, ...uploadedDocumentUrls },
        signee_name: signeeName, signee_position: signeePosition, signee_date: signeeDate || null,
        gallery: [...existingGallery, ...uploadedGalleryUrls]
      };

      // Ensure status is 'pending' if completeness is missing
      const { complete } = isProfileComplete(payload);
      const finalStatus = complete ? status : 'pending';

      const { error } = await supabase.from('hotels').update({ ...payload, status: finalStatus }).eq('id', hotelId);

      if (!error && !complete && status === 'approved') {
        showNotification('Profile updated, but stays PENDING due to missing fields.', 'warning');
      }
      if (error) throw error;

      // Fire-and-forget: do not await activity log to avoid hanging the save operation
      void (async () => {
        try {
          await supabase.from('activities').insert({
            type: 'update',
            text: `Member updated their property profile for "${hotelName}".`,
            user_id: user.id
          });
        } catch (e: any) {
          console.warn('Activity log failed:', e);
        }
      })();

      showNotification('Profile updated successfully!', 'success');
      setGalleryImages([]);
      setNewDocuments({});
      // Fire-and-forget: do not await refreshData to avoid hanging the save operation
      refreshData().catch((e) => console.warn('Background refresh failed:', e));
    } catch (err: any) {
      console.error('Error saving profile:', err.message);
      showNotification('Error updating profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 animate-pulse">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Profile...</p>
    </div>
  );

  if (!hotelId) return (
    <div className="max-w-3xl mx-auto py-12 African-accents">
      <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-2xl text-center space-y-8">
        <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-amber-900/10">
          <AlertCircle size={48} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Registration Required</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">Please complete your official registration to access your profile.</p>
        </div>
        <Link to="/register" className="inline-flex bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all">Submit Registration</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 african-accents">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">My Membership Profile</h1>
            <p className="text-slate-500 font-medium italic">Manage your official association details.</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
            status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
              status === 'suspended' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
            {status}
          </span>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center">
          {saving ? <Loader2 size={16} className="animate-spin mr-3" /> : <CheckCircle size={16} className="mr-3" />}
          {saving ? 'Updating...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-10">
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <div className="flex items-center mb-8 border-b border-slate-100 pb-4"><Hotel className="text-emerald-600 mr-3" size={28} /><h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION A: Hotel Identity</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Hotel Name *</label><input required type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Address *</label><input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2">City/Town *</label><input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2">District *</label><input required type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-2">Official Contact Number *</label><input required type="tel" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Website (If Any)</label><div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="url" placeholder="www.yourhotel.sl" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div></div>
          </div>
        </section>

        {status === 'approved' || status === 'pending' ? (
          <>
            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center mb-8 border-b border-slate-100 pb-4"><ClipboardList className="text-emerald-600 mr-3" size={28} /><h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION B: Ownership & Management</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Owner/Proprietor Name *</label><input required type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Managing Director / GM *</label><input required type="text" value={manager} onChange={(e) => setManager(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">Business Registration Number *</label><input required type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">Year Established *</label><input required type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">Total Number of Employees *</label><input required type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center mb-8 border-b border-slate-100 pb-4"><Star className="text-emerald-600 mr-3" size={28} /><h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION C: Facilities & Classification</h3></div>
              <div className="space-y-8">
                <div><label className="block text-sm font-bold text-slate-600 mb-4">Hotel Classification (★ rating) *</label><div className="flex gap-4">{[1, 2, 3, 4, 5].map(s => (<label key={s} className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={stars === s} onChange={() => setStars(s)} className="w-5 h-5 accent-amber-500" /><span>{s} ★</span></label>))}</div></div>
                <div className="w-1/3"><label className="block text-sm font-bold text-slate-600 mb-2">Total Guest Rooms *</label><input required type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-4">Room Types Available</label><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{['Single', 'Double', 'Suite', 'Deluxe'].map(t => (<label key={t} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl cursor-pointer"><input type="checkbox" checked={roomTypes.includes(t)} onChange={() => toggleRoomType(t)} className="w-5 h-5 accent-emerald-600" /><span>{t}</span></label>))}</div></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-4">In-House Facilities</label><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{['Restaurant', 'Bar', 'Pool', 'Conference Room', 'Spa', 'Wi-Fi', 'Gym', 'Laundry', 'Beachfront', 'Airport Shuttle', 'Security'].map(f => (<label key={f} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl cursor-pointer"><input type="checkbox" checked={facilities.includes(f)} onChange={() => toggleFacility(f)} className="w-5 h-5 accent-emerald-600" /><span>{f}</span></label>))}</div></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">Other Amenities</label><textarea placeholder="List other features..." value={otherAmenities} onChange={(e) => setOtherAmenities(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 h-32" /></div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center mb-4 border-b border-slate-100 pb-4"><Scale className="text-emerald-600 mr-3" size={28} /><h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION D: Compliance &amp; Documentation</h3></div>
              <p className="text-slate-400 text-xs mb-8 italic font-medium">Upload official PDF documents for verification. Accepted format: PDF only.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><label className="block text-sm font-bold text-slate-600 mb-2">TIN Number *</label><input required type="text" value={tin} onChange={(e) => setTin(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">NTB License Number *</label><input required type="text" value={ntbLicense} onChange={(e) => setNtbLicense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>

                {([
                  { key: 'certIncorporation', label: 'Certificate of Incorporation' },
                  { key: 'bizRegCert', label: 'Business Registration Certificate' },
                  { key: 'ntbCert', label: 'NTB License Certificate' },
                  { key: 'taxClearance', label: 'Tax Clearance Certificate' },
                ] as { key: string; label: string }[]).map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">{label}</label>
                    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${(newDocuments as any)[key] ? 'border-emerald-400 bg-emerald-50' : (existingDocuments as any)[key] ? 'border-slate-200 bg-slate-50' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${(newDocuments as any)[key] || (existingDocuments as any)[key] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">
                            {(newDocuments as any)[key] ? (newDocuments as any)[key].name : (existingDocuments as any)[key] ? 'Document uploaded' : 'No file selected'}
                          </p>
                          <p className="text-[10px] text-slate-400">PDF only</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        {(existingDocuments as any)[key] && !(newDocuments as any)[key] && (
                          <a href={(existingDocuments as any)[key]} target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all" title="View document">
                            <Eye size={14} />
                          </a>
                        )}
                        {((existingDocuments as any)[key] || (newDocuments as any)[key]) && (
                          <button type="button" onClick={() => removeDocument(key)} className="p-2 bg-white border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 transition-all" title="Remove document">
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button type="button" onClick={() => document.getElementById(key)?.click()} className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
                          <UploadCloud size={14} /><span>{(newDocuments as any)[key] || (existingDocuments as any)[key] ? 'Replace' : 'Upload'}</span>
                        </button>
                      </div>
                    </div>
                    <input type="file" id={key} className="hidden" accept=".pdf" onChange={(e) => handleDocUpload(e, key)} />
                  </div>
                ))}

                <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Compliance Remarks</label><textarea value={complianceRemarks} onChange={(e) => setComplianceRemarks(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none h-24 bg-slate-50" /></div>
              </div>
            </section>


            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center mb-8 border-b border-slate-100 pb-4"><FileSignature className="text-emerald-600 mr-3" size={28} /><h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION E: Commitment</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><label className="block text-sm font-bold text-slate-600 mb-2">Signee Name *</label><input required type="text" value={signeeName} onChange={(e) => setSigneeName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">Position *</label><input required type="text" value={signeePosition} onChange={(e) => setSigneePosition(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">Date</label><input type="date" value={signeeDate} onChange={(e) => setSigneeDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50" /></div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center"><ImageIcon className="text-emerald-600 mr-3" size={28} /><h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION F: Media Gallery</h3></div>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${galleryPreviews.length >= 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {galleryPreviews.length} / 10 photos
                </span>
              </div>
              {galleryPreviews.length === 0 && (
                <div className="py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center mb-6">
                  <ImageIcon size={40} className="text-slate-200 mb-3" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No photos yet — add up to 10 images</p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {galleryPreviews.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100">
                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600">
                      <X size={12} />
                    </button>
                    {idx < existingGallery.length && (
                      <span className="absolute bottom-2 left-2 text-[8px] font-black bg-black/50 text-white px-2 py-0.5 rounded-full uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Saved</span>
                    )}
                  </div>
                ))}
                {galleryPreviews.length < 10 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <Plus size={24} className="mb-2" /><span className="text-[10px] font-bold uppercase">Add Photo</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/webp,image/jpeg,image/jpg,image/png,.webp,.jpg,.jpeg,.png" className="hidden" />
            </section>

          </>
        ) : (
          <div className="bg-emerald-900 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <ShieldCheck size={180} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">
                {status === 'pending' ? 'Membership Approval Required' : 'Access Restricted'}
              </h3>
              <p className="text-emerald-100/70 max-w-2xl mx-auto mb-10 text-lg leading-relaxed font-medium">
                {status === 'pending'
                  ? 'Your application is currently under review. Sections B through F will be unlocked once your membership is approved by the SLAH Secretariat.'
                  : `Your current membership status is "${status}". Access to full property details and gallery management is restricted. Please contact the Secretariat for more information.`}
              </p>
              <div className={`w-20 h-1.5 mx-auto rounded-full ${status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-emerald-800 transition-all flex items-center justify-center disabled:opacity-50">
          {saving ? <Loader2 size={24} className="animate-spin mr-3" /> : <FileCheck size={24} className="mr-3" />}
          {saving ? 'Updating...' : 'Update Registration Profile'}
        </button>
      </div>
    </div>
  );
};


function MemberOverview({ user }: { user: any }) {
  const { userHotel, userHotelLoading, activities } = useAppContext();
  const navigate = useNavigate();

  if (userHotelLoading) return (
    <div className="p-20 text-center animate-pulse">
      <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Overview...</p>
    </div>
  );

  const { complete, missing } = isProfileComplete(userHotel);
  const status = userHotel?.status || 'unregistered';

  const statusConfig: { [key: string]: { icon: any, color: string, bg: string, text: string, sub: string } } = {
    approved: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Official Member', sub: 'Your property is fully active and listed.' },
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', text: 'Under Review', sub: 'The Secretariat is currently vetting your details.' },
    rejected: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', text: 'Action Required', sub: 'Please contact the Secretariat for details.' },
    suspended: { icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-100', text: 'Suspended', sub: 'Membership privileges are temporarily paused.' },
    unregistered: { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50', text: 'Not Registered', sub: 'Complete the association registration form.' }
  };

  const currentStatus = statusConfig[status] || statusConfig.unregistered;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              Welcome Back,
            </h1>
            <p className="text-emerald-700 text-xl font-bold italic">
              {userHotel?.hotel_name || user.name || user.email}
            </p>
          </div>
          <Link to="/dashboard/profile" className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10">
            Edit Full Profile <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Complete Application Banner (pending members only) ─────────────── */}
      {status === 'pending' && (
        <div className="rounded-[2rem] bg-gradient-to-r from-emerald-700 to-emerald-800 p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-2xl shadow-emerald-900/30 relative overflow-hidden">
          {/* Decorative background icon */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <ClipboardList size={120} />
          </div>
          {/* Left: status icon */}
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <CheckCircle2 size={30} className="text-white" />
          </div>
          {/* Centre: copy */}
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Section A Received</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Under Review</span>
            </div>
            <h3 className="text-white font-black text-xl mb-1">Complete your application to speed up approval</h3>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Your hotel identity (Section A) has been received. Fill in <strong className="text-white">Sections B – F</strong> of the registration form so our membership committee has everything they need to approve your application quickly.
            </p>
          </div>
          {/* Right: CTA */}
          <div className="shrink-0 relative z-10">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white text-emerald-700 font-black text-sm px-5 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg whitespace-nowrap"
            >
              Complete Sections B–F <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className={`w-20 h-20 ${currentStatus.bg} ${currentStatus.color} rounded-3xl flex items-center justify-center mb-6 shadow-sm`}>
            <currentStatus.icon size={40} />
          </div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Membership Status</h3>
          <p className={`text-2xl font-black uppercase tracking-tighter ${currentStatus.color} mb-4`}>{currentStatus.text}</p>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">{currentStatus.sub}</p>

          {userHotel?.id && (
            <div className="mt-8 pt-6 border-t border-slate-50 w-full">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Property ID</span>
              <code className="text-[10px] text-slate-400 font-mono bg-slate-50 px-3 py-1 rounded-lg">#{userHotel.id.substring(0, 8)}</code>
            </div>
          )}
        </div>

        {/* Completeness Tracker */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Profile Integrity</h3>
              <p className="text-slate-400 text-xs font-medium">Mandatory registration requirements</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${complete ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
              {complete ? 'Complete' : 'Action Required'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'A', name: 'Hotel Identity' },
              { id: 'B', name: 'Ownership & Mgmt' },
              { id: 'C', name: 'Facilities & Class' },
              { id: 'D', name: 'Compliance Docs' },
              { id: 'E', name: 'Association Commitment' },
              { id: 'F', name: 'Hotel Gallery' }
            ].map(section => {
              const sectionMissing = missing.some(m => m.includes(`Section ${section.id}`));
              // Gallery check is specific in missing array
              const isMissing = section.id === 'F' ? missing.some(m => m.includes('gallery')) : sectionMissing;

              return (
                <div key={section.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isMissing ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isMissing ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {section.id}
                    </div>
                    <span className={`text-xs font-bold ${isMissing ? 'text-amber-800' : 'text-slate-600'}`}>{section.name}</span>
                  </div>
                  {isMissing ? (
                    <AlertTriangle size={14} className="text-amber-500" />
                  ) : (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  )}
                </div>
              );
            })}
          </div>

          {!complete && (
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <Info size={18} className="text-amber-600 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Please complete the missing sections to ensure your property remains active on the public directory. Only fully documented members are publicly visible.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Quick Navigation</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'My Profile', icon: Building2, path: '/dashboard/profile', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { name: 'Association Events', icon: Calendar, path: '/dashboard/events', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { name: 'Public Directory', icon: Hotel, path: '/members', color: 'text-amber-600', bg: 'bg-amber-50', external: true },
              { name: 'Account Settings', icon: Settings, path: '/dashboard/settings', color: 'text-slate-600', bg: 'bg-slate-50' }
            ].map(action => (
              <button
                key={action.name}
                onClick={() => action.external ? navigate(action.path) : navigate(action.path)}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group text-left"
              >
                <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon size={24} />
                </div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight block">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center italic font-black">!</div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Recent Updates</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Association Activity</p>
            </div>
          </div>

          <div className="flex-grow space-y-6">
            {activities.length > 0 ? activities.slice(0, 3).map((act, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                  {i !== 2 && <div className="w-px flex-grow bg-slate-100 my-1"></div>}
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                    {act.text}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                    {new Date(act.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
                No recent activity to show.
              </div>
            )}
          </div>

          <Link to="/dashboard/settings" className="mt-8 text-center text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">
            View Association Logs
          </Link>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ user }: { user: any }) {
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

      // Update password_changed flag in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ password_changed: true })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating password_changed flag:', profileError);
      } else {
        showNotification('Password updated successfully', 'success');
        setSuccess('Password updated successfully');

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
  const { user, refreshData, newApplicationCount, clearNewApplicationCount } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Clear badge whenever admin navigates to the Applications page
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/applications') || location.pathname === '/dashboard/applications') {
      clearNewApplicationCount();
    }
  }, [location.pathname]);

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
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['super-admin', 'admin', 'member'] },
    { name: 'My Profile', path: '/dashboard/profile', icon: <Building2 size={20} />, roles: ['member'] },
    {
      name: 'Applications', path: '/dashboard/applications',
      icon: <FileText size={20} />,
      roles: ['super-admin', 'admin'],
      badge: isAdmin && newApplicationCount > 0 ? newApplicationCount : 0
    },
    { name: 'Members', path: '/dashboard/members', icon: <Hotel size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Events', path: '/dashboard/events', icon: <Calendar size={20} />, roles: ['super-admin', 'admin', 'member'] },
    { name: 'News', path: '/dashboard/news', icon: <Newspaper size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Users', path: '/dashboard/users', icon: <Users size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Logs', path: '/dashboard/logs', icon: <History size={20} />, roles: ['super-admin', 'admin'] },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} />, roles: ['super-admin', 'admin', 'member'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex African-accents">
      <aside className={`hidden lg:flex flex-col ${isCollapsed ? 'w-24' : 'w-72'} bg-slate-900 text-white fixed h-full z-50 transition-all duration-500 ease-in-out`}>
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
              {/* Icon with optional badge dot when collapsed */}
              <div className="flex-shrink-0 flex items-center justify-center relative">
                {item.icon}
                {(item as any).badge > 0 && isCollapsed && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 border-2 border-slate-900">
                    {(item as any).badge > 9 ? '9+' : (item as any).badge}
                  </span>
                )}
              </div>
              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
              {/* Badge pill on right when expanded */}
              {!isCollapsed && (item as any).badge > 0 && (
                <span className="ml-auto min-w-[20px] h-[20px] bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1 animate-pulse">
                  {(item as any).badge > 9 ? '9+' : (item as any).badge}
                </span>
              )}
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

      <div className={`flex-grow ${isCollapsed ? 'lg:ml-24' : 'lg:ml-72'} flex flex-col min-h-screen transition-all duration-500 ease-in-out`}>
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40 p-4 md:p-6 flex items-center justify-between shadow-sm African-accents">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-3 md:mr-4 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <Menu size={22} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 capitalize truncate max-w-[150px] md:max-w-none">
              {location.pathname === '/dashboard'
                ? 'Overview'
                : location.pathname.includes('/applications/')
                  ? 'Application Review'
                  : location.pathname.split('/').pop()?.replace(/-/g, ' ')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Quick search..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 w-64 transition-all" />
            </div>
            <button
              className="p-2 text-slate-400 hover:text-emerald-600 relative transition-colors"
              onClick={() => { navigate('/dashboard/applications'); clearNewApplicationCount(); }}
              title={isAdmin && newApplicationCount > 0 ? `${newApplicationCount} new application${newApplicationCount !== 1 ? 's' : ''}` : 'Notifications'}
            >
              <Bell size={20} />
              {isAdmin && newApplicationCount > 0 ? (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 border-2 border-white animate-bounce">
                  {newApplicationCount > 9 ? '9+' : newApplicationCount}
                </span>
              ) : (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name || user?.email}</p>
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{user?.role || 'User'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm ring-2 ring-emerald-50">
                {(user?.name || user?.email || 'U').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-10 flex-grow">
          <Routes>
            <Route path="/" element={
              isAdmin ? (
                <div className="space-y-6">
                  {/* Welcome banner */}
                  <div className="relative rounded-[1.75rem] overflow-hidden bg-slate-900 shadow-xl">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-indigo-400/10 blur-3xl" />
                      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                    </div>
                    <div className="relative z-10 px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest mb-1">Sierra Leone Association of Hotels</p>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {(user?.name || user?.email || '').split(' ')[0]} 👋
                        </h2>
                        <p className="text-white/35 text-xs font-medium mt-1">Here's what's happening across the SLAH platform today.</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                        </div>
                        <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <Stats user={user} />

                  {/* Main content grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Applications />
                    </div>
                    <div>
                      <RecentActivity />
                    </div>
                  </div>

                  {/* System Performance (super-admin only) */}
                  {user.role === 'super-admin' && (
                    <div className="relative rounded-[1.75rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-violet-400/10 blur-3xl" />
                      </div>
                      <div className="relative z-10 px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Infrastructure</p>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">System Performance</h3>
                          <p className="text-slate-500 text-xs font-medium mt-1">Real-time health check of SLAH databases and portals.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { label: 'Database', value: 'Operational', color: 'emerald' },
                            { label: 'Uptime', value: '99.9%', color: 'indigo' },
                            { label: 'Auth', value: 'Active', color: 'teal' },
                            { label: 'Storage', value: 'OK', color: 'violet' },
                          ].map(s => (
                            <div key={s.label} className={`flex items-center gap-2 px-4 py-2 bg-${s.color}-500/10 border border-${s.color}-500/20 rounded-2xl`}>
                              <span className={`w-1.5 h-1.5 rounded-full bg-${s.color}-400`} />
                              <div>
                                <p className={`text-[8px] font-black text-${s.color}-400/60 uppercase tracking-widest`}>{s.label}</p>
                                <p className={`text-xs font-black text-${s.color}-400`}>{s.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <MemberOverview user={user} />
              )
            } />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
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
