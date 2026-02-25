import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Star, Hotel, FileCheck, Landmark, ClipboardList, Image as ImageIcon, X, UploadCloud, Plus, Globe, Users, Building2, Scale, FileBadge, FileSignature, CheckSquare, Lock, Mail, UserPlus, ArrowRight, Loader2, AlertTriangle, LogIn, Clock, LogOut, FileText, Eye, Trash2 } from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { isProfileComplete } from '../lib/utils';

const Register: React.FC = () => {
  const { user, userHotel, userHotelLoading, refreshData, showNotification } = useAppContext();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Account Creation (if not logged in)
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Comprehensive form state for Admin Review
  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [countryCode, setCountryCode] = useState('+232');
  const [contactLocal, setContactLocal] = useState('');
  const [website, setWebsite] = useState('');
  const [owner, setOwner] = useState('');
  const [manager, setManager] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [year, setYear] = useState('');
  const [employees, setEmployees] = useState('');
  const [rooms, setRooms] = useState('');
  const [stars, setStars] = useState(4);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [otherAmenities, setOtherAmenities] = useState('');

  // Section D: Legal & Compliance
  const [tin, setTin] = useState('');
  const [ntbLicense, setNtbLicense] = useState('');
  const [complianceRemarks, setComplianceRemarks] = useState('');
  const [documents, setDocuments] = useState<{ [key: string]: File }>({});
  const [documentStatus, setDocumentStatus] = useState<{ [key: string]: boolean }>({});
  const [removedDocKeys, setRemovedDocKeys] = useState<Set<string>>(new Set());

  // Section E: Commitment
  const [signeeName, setSigneeName] = useState('');
  const [signeePosition, setSigneePosition] = useState('');
  const [signeeDate, setSigneeDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleFacility = (f: string) => {
    setFacilities(prev => prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]);
  };

  const toggleRoomType = (type: string) => {
    setRoomTypes(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocuments(prev => ({ ...prev, [key]: file }));
    setDocumentStatus(prev => ({ ...prev, [key]: true }));
    // Unmark as removed if user re-uploads after removing
    setRemovedDocKeys(prev => { const next = new Set(prev); next.delete(key); return next; });
  };

  const removeDocument = (key: string) => {
    if (!window.confirm('Remove this document? You will need to re-upload it if needed.')) return;
    setRemovedDocKeys(prev => new Set(prev).add(key));
    setDocuments(prev => { const next = { ...prev }; delete next[key]; return next; });
    setDocumentStatus(prev => { const next = { ...prev }; delete next[key]; return next; });
    const input = document.getElementById(key) as HTMLInputElement | null;
    if (input) input.value = '';
  };

  // Sync existing hotel data if available
  useEffect(() => {
    if (userHotel) {
      setHotelName(userHotel.hotel_name || '');
      setAddress(userHotel.address || '');
      setCity(userHotel.city || '');
      setDistrict(userHotel.district || '');
      setEmail(userHotel.email || user?.email || '');
      setContact(userHotel.contact || '');
      setWebsite(userHotel.website || '');
      setOwner(userHotel.owner || '');
      setManager(userHotel.manager || '');
      setRegNumber(userHotel.reg_number || '');
      setYear(userHotel.year_established?.toString() || '');
      setEmployees(userHotel.employees?.toString() || '');
      setRooms(userHotel.rooms?.toString() || '');
      setStars(userHotel.stars || 4);
      setRoomTypes(userHotel.room_types || []);
      setFacilities(userHotel.facilities || []);
      setOtherAmenities(userHotel.other_amenities || '');
      setTin(userHotel.tin || '');
      setNtbLicense(userHotel.ntb_license || '');
      setComplianceRemarks(userHotel.compliance_remarks || '');
      setSigneeName(userHotel.signee_name || '');
      setSigneePosition(userHotel.signee_position || '');
      if (userHotel.signee_date) setSigneeDate(new Date(userHotel.signee_date).toISOString().split('T')[0]);
    }
  }, [userHotel, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ── STEP 1: New account creation (not yet logged in) ──────────────────
      if (!user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: accountEmail,
          password: accountPassword,
          options: {
            data: {
              name: fullName,
              role: 'member',
              password_changed: true
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error('Failed to create account.');

        // Explicitly set password_changed flag once DB trigger creates the profile
        setTimeout(async () => {
          await supabase
            .from('profiles')
            .update({ password_changed: true })
            .eq('id', signUpData.user!.id);
        }, 1500);

        // Show the email-confirmation waiting screen and stop here.
        // The hotel form is only accessible after the email is confirmed.
        setConfirmEmail(accountEmail);
        setAwaitingConfirmation(true);
        setLoading(false);
        window.scrollTo(0, 0);
        return; // ← do NOT proceed to hotel insert yet
      }

      // ── STEP 2+ : User is already logged in (email confirmed) ─────────────
      const currentUserId = user.id;

      // 1. Upload Gallery Images
      const galleryUrls = await Promise.all(
        galleryImages.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `gallery/${fileName}`;

          const { data, error } = await supabase.storage
            .from('hotel-gallery')
            .upload(filePath, file as File);

          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('hotel-gallery').getPublicUrl(filePath);
          return publicUrl;
        })
      );

      // 2. Upload Documents
      const documentUrls: { [key: string]: string } = {};
      for (const [key, file] of Object.entries(documents)) {
        const fileExt = (file as File).name.split('.').pop();
        const fileName = `${key}-${Math.random()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { data, error } = await supabase.storage
          .from('hotel-documents')
          .upload(filePath, file as File);

        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('hotel-documents').getPublicUrl(filePath);
        documentUrls[key] = publicUrl;
      }

      // 3. Upsert into Hotels table
      const hotelPayload = {
        hotel_name: hotelName,
        address,
        city,
        district,
        email: email || user?.email || accountEmail,
        contact,
        website,
        owner,
        manager,
        reg_number: regNumber,
        year_established: year ? parseInt(year) : null,
        employees: employees ? parseInt(employees) : null,
        rooms: rooms ? parseInt(rooms) : null,
        stars,
        room_types: roomTypes,
        facilities,
        other_amenities: otherAmenities,
        tin,
        ntb_license: ntbLicense,
        compliance_remarks: complianceRemarks,
        documents: (() => {
          // Start from existing docs, remove any the user explicitly removed
          const base: Record<string, string> = {};
          if (userHotel?.documents) {
            for (const [k, v] of Object.entries(userHotel.documents as Record<string, string>)) {
              if (!removedDocKeys.has(k)) base[k] = v;
            }
          }
          return { ...base, ...documentUrls };
        })(),
        signee_name: signeeName,
        signee_position: signeePosition,
        signee_date: signeeDate,
        user_id: currentUserId,
        status: 'pending', // Default to pending
        gallery: galleryUrls.length > 0 ? [...(userHotel?.gallery || []), ...galleryUrls] : userHotel?.gallery
      };

      // On update: always preserve the existing status (never downgrade an approved hotel).
      // On new registration: default to 'pending' for admin review.
      if (userHotel) {
        hotelPayload.status = userHotel.status;
      } else {
        hotelPayload.status = 'pending';
      }

      const { data, error } = userHotel
        ? await supabase.from('hotels').update(hotelPayload).eq('id', userHotel.id).select()
        : await supabase.from('hotels').insert([hotelPayload]).select();

      if (error) throw error;

      // 4. Log Activity
      try {
        await supabase.from('activities').insert({
          type: userHotel ? 'update' : 'registration',
          text: userHotel
            ? `Hotel "${hotelName}" updated their registration details.`
            : `New membership application submitted for "${hotelName}".`,
          user_id: currentUserId
        });
      } catch (_) { /* non-critical */ }

      // ── Always unblock the button first, THEN refresh in the background ──
      setSubmitted(true);
      setLoading(false);
      window.scrollTo(0, 0);

      // Background data refresh — errors here must NOT re-block the UI
      try { await refreshData(); } catch (_) { /* silent */ }

    } catch (err: any) {
      console.error('Error submitting form:', err.message);
      showNotification('Error: ' + err.message, 'error');
    } finally {
      // Safety net: ensure loading is always cleared
      setLoading(false);
    }
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

    const currentCount = galleryImages.length;
    const remainingSlots = 10 - currentCount;

    if (remainingSlots <= 0) {
      showNotification('You have already reached the limit of 10 images.', 'error');
      return;
    }

    const newFiles = validFiles.slice(0, remainingSlots) as File[];
    setGalleryImages(prev => [...prev, ...newFiles].slice(0, 10));

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  if (userHotelLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading status...</p>
        </div>
      </div>
    );
  }

  // ── Email confirmation waiting screen ──────────────────────────────────────
  // Shown (a) right after a fresh signup, or (b) if the user is logged in
  // but their email is not yet confirmed.
  const emailNotConfirmed = user && !user.email_confirmed_at;
  if (awaitingConfirmation || emailNotConfirmed) {
    const emailToShow = confirmEmail || user?.email || '';
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-xl w-full mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-emerald-100">
            {/* Icon */}
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Mail size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Confirm Your Email</h1>
            <p className="text-slate-500 text-base mb-2">
              We've sent a confirmation link to:
            </p>
            <p className="text-emerald-700 font-black text-lg mb-8 break-all">{emailToShow}</p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-6 text-left">
              <h4 className="text-emerald-800 font-bold text-sm mb-2 flex items-center gap-2">
                <ShieldCheck size={16} /> What to do next
              </h4>
              <ol className="text-emerald-700 text-xs leading-relaxed space-y-1 list-decimal list-inside">
                <li>Open the email we just sent you.</li>
                <li>Click the <strong>"Confirm your email"</strong> link.</li>
                <li>Return to this page — Section A will unlock automatically.</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 text-left">
              <p className="text-amber-700 text-xs font-medium leading-relaxed">
                <strong>Can't find it?</strong> Check your spam/junk folder. The link expires in 24 hours.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.resend({ type: 'signup', email: emailToShow });
                    showNotification('Confirmation email resent!', 'success');
                  } catch {
                    showNotification('Could not resend. Please try again shortly.', 'error');
                  }
                }}
                className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20"
              >
                Resend Confirmation Email
              </button>
              <button
                onClick={() => { setAwaitingConfirmation(false); supabase.auth.signOut(); }}
                className="text-slate-400 text-xs font-bold hover:text-rose-500 transition-colors"
              >
                Use a different email — Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const isApproved = userHotel?.status === 'approved';
    const isPending = userHotel?.status === 'pending';
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-xl w-full mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-emerald-100">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {isApproved ? 'Profile Updated!' : 'Section A Submitted!'}
            </h1>
            <p className="text-slate-500 text-lg mb-8">
              {isApproved
                ? `Your updates for "${hotelName}" have been saved successfully.`
                : `Thank you! Your hotel identity for "${hotelName}" has been received by the SLAH Secretariat.`}
            </p>

            {/* Pending: strong CTA to complete the rest of the form */}
            {isPending && (
              <div className="bg-emerald-700 rounded-2xl p-6 mb-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 p-4"><ClipboardList size={80} /></div>
                <h4 className="text-white font-black text-base mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-black">!</span>
                  Action Required: Complete Your Application
                </h4>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                  To help our membership committee process your application quickly, please complete <strong>Sections B through F</strong> of the registration form now. A more complete application speeds up approval.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-white text-emerald-700 font-black py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
                >
                  Continue → Complete Sections B–F Now
                </button>
              </div>
            )}

            {!isApproved && !isPending && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 text-left">
                <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center">
                  <Clock size={16} className="mr-2" /> What happens next?
                </h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Our membership committee will review your application. You will be notified once a decision has been made.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = isApproved ? '#/dashboard' : '#/'}
                className={`px-8 py-3 rounded-xl font-bold transition-colors shadow-lg ${isPending
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none text-sm'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-900/20'
                  }`}
              >
                {isApproved ? 'Go to Dashboard' : 'Return Home'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // NOTE: Pending members now fall through to the main form below.
  // The form shows a notification banner and Sections B-F are unlocked for them.



  return (
    <div className="pt-24 lg:pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">

        {/* Form Header */}
        <div className="text-center mb-12">
          <SLAHLogo variant="dark" className="h-32 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sierra Leone Association of Hotels (SLAH)</h1>
          <h2 className="text-2xl font-medium text-emerald-800">Official Hotel Registration Form</h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-6"></div>

          {user && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Logged in as {user.name || user.email}</span>
              </div>
              <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center">
                <LogOut size={12} className="mr-1" /> Logout
              </button>
            </div>
          )}
        </div>

        {/* ── Pending: Action-required notification banner ───────────────────── */}
        {userHotel?.status === 'pending' && (
          <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-emerald-700 to-emerald-800 p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-2xl shadow-emerald-900/30 relative overflow-hidden">
            {/* Decorative bg icon */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
              <ClipboardList size={120} />
            </div>
            {/* Status badge */}
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <CheckCircle2 size={30} className="text-white" />
            </div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Section A Received</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Under Review</span>
              </div>
              <h3 className="text-white font-black text-xl mb-1">Complete your application to speed up approval</h3>
              <p className="text-emerald-200 text-sm leading-relaxed">
                Your hotel identity (Section A) has been received. Fill in <strong className="text-white">Sections B – F</strong> below so our membership committee has everything they need to approve your application quickly.
              </p>
            </div>
            <div className="shrink-0 relative z-10">
              <a href="#section-b" className="flex items-center gap-2 bg-white text-emerald-700 font-black text-sm px-5 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
                Start Sections B–F <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* STEP 1: Account Authentication (Visible only if not logged in) */}
          {!user && (
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border-2 border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>
              <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                <UserPlus className="text-emerald-600 mr-3" size={28} />
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Step 1: Security & Identity</h3>
              </div>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">To begin the official registration, please create your association member account below. This will allow you to track your application status and access the portal later.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name of Lead Representative *</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" placeholder="e.g. John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Login Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="email" placeholder="hotel@example.sl" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Secure Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="password" placeholder="••••••••" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/50" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Minimum 8 characters with at least one number.</p>
                </div>
              </div>

              <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                  <LogIn size={20} />
                </div>
                <p className="text-xs text-slate-500 font-medium">Already have an account? <Link to="/login" className="text-emerald-700 font-black hover:underline">Sign in here</Link> and complete registration.</p>
              </div>
            </section>
          )}

          {/* SECTION A: Hotel Identity — only visible once email is confirmed */}
          {user && user.email_confirmed_at && (
            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                <Hotel className="text-emerald-600 mr-3" size={28} />
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION A: Hotel Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-2">Hotel Name *</label>
                  <input required type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-2">Address *</label>
                  <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">City/Town *</label>
                  <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">District *</label>
                  <input required type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-2">Official Contact Number *</label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-slate-50 transition-all">
                    {/* Country code selector */}
                    <select
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setContact(e.target.value + ' ' + contactLocal);
                      }}
                      className="shrink-0 bg-slate-100 border-r border-slate-200 text-slate-700 font-bold text-sm px-3 py-3 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                    >
                      <option value="+232">🇸🇱 +232</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+233">🇬🇭 +233</option>
                      <option value="+225">🇨🇮 +225</option>
                      <option value="+221">🇸🇳 +221</option>
                      <option value="+224">🇬🇳 +224</option>
                      <option value="+245">🇬🇼 +245</option>
                      <option value="+231">🇱🇷 +231</option>
                      <option value="+223">🇲🇱 +223</option>
                      <option value="+226">🇧🇫 +226</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+86">🇨🇳 +86</option>
                    </select>
                    {/* Local number */}
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 76 123456"
                      value={contactLocal}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9 \-]/g, '');
                        setContactLocal(digits);
                        setContact(countryCode + ' ' + digits);
                      }}
                      pattern="[0-9 \-]{5,15}"
                      title="Enter between 5 and 15 digits (spaces and hyphens allowed)"
                      className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-800 placeholder-slate-400 text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Digits only · 5–15 characters · e.g. {countryCode} 76 123456</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-2">Website (If Any)</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="e.g. www.yourhotel.sl or https://yourhotel.sl" pattern="(https?:\/\/)?(www\.)?[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,}).*" title="Enter a valid URL (e.g. www.hotel.sl, http://hotel.sl, https://hotel.sl)" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* GATED SECTIONS B-F (Only for authenticated participants with approved or pending status) */}
          {userHotel?.status === 'approved' || userHotel?.status === 'pending' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* SECTION B: Ownership & Management */}
              <section id="section-b" className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                  <ClipboardList className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION B: Ownership & Management</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Owner/Proprietor Name *</label>
                    <input required type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Managing Director / GM *</label>
                    <input required type="text" value={manager} onChange={(e) => setManager(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Business Registration Number *</label>
                    <input required type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Year Established *</label>
                    <input required type="number" min="1900" max={new Date().getFullYear()} value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Total Number of Employees *</label>
                    <input required type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                </div>
              </section>

              {/* SECTION C: Hotel Facilities & Classification */}
              <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                  <Star className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION C: Facilities & Classification</h3>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-4">Hotel Classification (★ rating) *</label>
                    <div className="flex flex-wrap gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} className="flex items-center space-x-2 cursor-pointer group">
                          <input type="radio" name="rating" checked={stars === star} onChange={() => setStars(star)} className="w-5 h-5 accent-amber-500" />
                          <span className="text-slate-700 font-medium group-hover:text-amber-600 transition-colors">{star} ★</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Total Number of Guest Rooms *</label>
                    <input required type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-4">Room Types Available</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Single', 'Double', 'Suite', 'Deluxe'].map((type) => (
                        <label key={type} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <input type="checkbox" checked={roomTypes.includes(type)} onChange={() => toggleRoomType(type)} className="w-5 h-5 accent-emerald-600" />
                          <span className="text-slate-700 text-sm font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-4">In-House Facilities</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Restaurant', 'Bar', 'Pool', 'Conference Room', 'Spa', 'Wi-Fi'].map((facility) => (
                        <label key={facility} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <input type="checkbox" checked={facilities.includes(facility)} onChange={() => toggleFacility(facility)} className="w-5 h-5 accent-emerald-600" />
                          <span className="text-slate-700 text-sm font-medium">{facility}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Other Amenities & Services</label>
                    <textarea
                      placeholder="List any other facilities or services..."
                      value={otherAmenities}
                      onChange={(e) => setOtherAmenities(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 h-32"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION D: Legal & Compliance */}
              <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center mb-4 border-b border-slate-100 pb-4">
                  <Scale className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION D: Compliance &amp; Documentation</h3>
                </div>
                <p className="text-slate-400 text-xs mb-8 italic font-medium">Upload official PDF documents for verification. Accepted format: PDF only.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">TIN Number *</label>
                    <input required type="text" value={tin} onChange={(e) => setTin(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">NTB License Number *</label>
                    <input required type="text" value={ntbLicense} onChange={(e) => setNtbLicense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>

                  {([
                    { key: 'certIncorporation', label: 'Certificate of Incorporation' },
                    { key: 'bizRegCert', label: 'Business Registration Certificate' },
                    { key: 'ntbCert', label: 'NTB License Certificate' },
                    { key: 'taxClearance', label: 'Tax Clearance Certificate' },
                  ] as { key: string; label: string }[]).map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600">{label}</label>
                      <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${(documentStatus as any)[key] ? 'border-emerald-400 bg-emerald-50' : ((userHotel?.documents as any)?.[key] && !removedDocKeys.has(key)) ? 'border-slate-200 bg-slate-50' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${(documentStatus as any)[key] || ((userHotel?.documents as any)?.[key] && !removedDocKeys.has(key)) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">
                              {(documentStatus as any)[key] ? 'New file selected' : ((userHotel?.documents as any)?.[key] && !removedDocKeys.has(key)) ? 'Document uploaded' : 'No file selected'}
                            </p>
                            <p className="text-[10px] text-slate-400">PDF only</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          {(userHotel?.documents as any)?.[key] && !removedDocKeys.has(key) && !(documentStatus as any)[key] && (
                            <a href={(userHotel?.documents as any)[key]} target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all" title="View document">
                              <Eye size={14} />
                            </a>
                          )}
                          {((documentStatus as any)[key] || ((userHotel?.documents as any)?.[key] && !removedDocKeys.has(key))) && (
                            <button type="button" onClick={() => removeDocument(key)} className="p-2 bg-white border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 transition-all" title="Remove document">
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button type="button" onClick={() => document.getElementById(key)?.click()} className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
                            <UploadCloud size={14} /><span>{(documentStatus as any)[key] || ((userHotel?.documents as any)?.[key] && !removedDocKeys.has(key)) ? 'Replace' : 'Upload'}</span>
                          </button>
                        </div>
                      </div>
                      <input type="file" id={key} className="hidden" accept=".pdf" onChange={(e) => handleDocUpload(e, key)} />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Compliance Remarks</label>
                    <textarea value={complianceRemarks} onChange={(e) => setComplianceRemarks(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 h-24" />
                  </div>
                </div>
              </section>

              {/* SECTION E: Commitment */}
              <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                  <FileSignature className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION E: Commitment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Signee Name *</label>
                    <input required type="text" value={signeeName} onChange={(e) => setSigneeName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Position *</label>
                    <input required type="text" value={signeePosition} onChange={(e) => setSigneePosition(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Date</label>
                    <input type="date" value={signeeDate} onChange={(e) => setSigneeDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                </div>
              </section>

              {/* SECTION F: Gallery */}
              <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <div className="flex items-center">
                    <ImageIcon className="text-emerald-600 mr-3" size={28} />
                    <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION F: Media Gallery</h3>
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${(galleryImages.length + (userHotel?.gallery?.length || 0)) >= 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    {galleryImages.length + (userHotel?.gallery?.length || 0)} / 10 photos
                  </span>
                </div>
                {(galleryImages.length + (userHotel?.gallery?.length || 0)) === 0 && (
                  <div className="py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center mb-6">
                    <ImageIcon size={40} className="text-slate-200 mb-3" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No photos yet — add up to 10 images</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {userHotel?.gallery?.map((img: string, idx: number) => (
                    <div key={`existing-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      <span className="absolute bottom-2 left-2 text-[8px] font-black bg-black/50 text-white px-2 py-0.5 rounded-full uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Saved</span>
                    </div>
                  ))}
                  {galleryPreviews.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-200 group">
                      <img src={img} alt="New Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600">
                        <X size={12} />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[8px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                    </div>
                  ))}
                  {galleryImages.length + (userHotel?.gallery?.length || 0) < 10 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <UploadCloud size={24} className="mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Add Media</span>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/webp,image/jpeg,image/jpg,image/png,.webp,.jpg,.jpeg,.png" multiple className="hidden" />
              </section>

            </div>
          ) : (
            <div className="bg-emerald-900 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <ShieldCheck size={180} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
                  {userHotel?.status === 'pending' ? 'Membership Approval Required' : 'Access Restricted'}
                </h3>
                <p className="text-emerald-100/70 max-w-xl mx-auto mb-10 leading-relaxed">
                  {userHotel?.status === 'pending'
                    ? 'Sections B through F represent the full association compliance data. These sections will become available once your initial hotel identity (Section A) is verified and approved by our membership committee.'
                    : `Your membership status is currently "${userHotel?.status}". Access to full registration sections is restricted. Please contact the Secretariat for assistance.`}
                </p>
                <div className={`w-16 h-1 mx-auto rounded-full ${userHotel?.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
              </div>
            </div>
          )}

          {/* Submit button — label and visibility depend on auth + email-confirmation state */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-emerald-800 transition-all transform hover:-translate-y-1 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 size={24} className="animate-spin mr-3" /> : <FileCheck size={24} className="mr-3" />}
            {!user
              ? 'Create Account & Begin'
              : userHotel?.status === 'approved'
                ? 'Update Final Registration'
                : userHotel
                  ? 'Submit for Review'
                  : 'Submit Section A for Review'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
