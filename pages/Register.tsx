import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Star, Hotel, FileCheck, Landmark, ClipboardList, Image as ImageIcon, X, UploadCloud, Plus, Globe, Users, Building2, Scale, FileBadge, FileSignature, CheckSquare, Lock, Mail, UserPlus, ArrowRight, Loader2, AlertTriangle, LogIn, Clock, LogOut, FileText, Eye, Trash2, Check, Phone } from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { isProfileComplete } from '../lib/utils';

// All 16 districts of Sierra Leone
const SIERRA_LEONE_DISTRICTS = [
  'Western Area Urban',
  'Western Area Rural',
  'Bo',
  'Bonthe',
  'Bombali',
  'Falaba',
  'Kailahun',
  'Kambia',
  'Karene',
  'Kenema',
  'Koinadugu',
  'Kono',
  'Moyamba',
  'Port Loko',
  'Pujehun',
  'Tonkolili',
];

const FORM_STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Section A' },
  { id: 3, label: 'Section B' },
  { id: 4, label: 'Section C' },
  { id: 5, label: 'Section D' },
  { id: 6, label: 'Section E' },
  { id: 7, label: 'Section F' },
];

const Register: React.FC = () => {
  const { user, userHotel, userHotelLoading, refreshData, showNotification } = useAppContext();
  const navigate = useNavigate();
  const [submittedSuccess, setSubmittedSuccess] = useState<'success' | 'account_created_needs_login' | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [hotelEmail, setHotelEmail] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [countryCode, setCountryCode] = useState('+232');
  const [contactLocal, setContactLocal] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
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

  // UI state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeStep, setActiveStep] = useState(1);

  // Anti-Spam state
  const [honeypot, setHoneypot] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaNums, setCaptchaNums] = useState({ num1: 0, num2: 0 });

  useEffect(() => {
    setCaptchaNums({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1
    });
  }, []);

  // Validate required fields and return true if valid
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Anti-spam validation
    if (honeypot) {
      return false; // Silently fail for bots
    }
    if (parseInt(captchaAnswer) !== captchaNums.num1 + captchaNums.num2) {
      newErrors.captcha = 'Incorrect math answer. Please try again.';
      setCaptchaNums({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1 });
      setCaptchaAnswer('');
    }

    // Account fields (only for new users)
    if (!user) {
      if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
      if (!accountEmail.trim()) newErrors.accountEmail = 'Email is required.';
      if (!accountPassword || accountPassword.length < 8) newErrors.accountPassword = 'Password must be at least 8 characters.';
    }
    // Hotel fields — always required (for both new users and logged-in members)
    if (!hotelName.trim()) newErrors.hotelName = 'Hotel name is required.';
    if (!address.trim()) newErrors.address = 'Address is required.';
    if (!city.trim()) newErrors.city = 'City/Town is required.';
    if (!district) newErrors.district = 'Please select a district.';
    if (!contactLocal.trim()) newErrors.contactLocal = 'Contact number is required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

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
      setHotelEmail(userHotel.email || '');
      if (userHotel.contact) {
        setContact(userHotel.contact);
        const parts = userHotel.contact.split(' ');
        if (parts.length > 1 && parts[0].startsWith('+')) {
          setCountryCode(parts[0]);
          setContactLocal(parts.slice(1).join(' '));
        } else {
          setContactLocal(userHotel.contact);
        }
      } else {
        setContact('');
        setContactLocal('');
      }
      setWhatsapp(userHotel.whatsapp || '');
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
    if (loading) return;
    if (!validate()) return;
    setLoading(true);

    try {
      let currentUserId: string = user?.id || '';

      // ── NEW USER: create account + hotel in one flow ───────────────────────
      if (!user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: accountEmail,
          password: accountPassword,
          options: { data: { name: fullName, role: 'member', password_changed: true } }
        });

        if (signUpError) {
          throw new Error('Could not create account: ' + signUpError.message);
        }
        if (!signUpData.user) {
          throw new Error('Failed to create account (no user data returned). Please try again.');
        }

        currentUserId = signUpData.user.id;

        // If Supabase email confirmation is enabled, signUp won't return a session.
        // Sign in immediately so we have a valid session for the hotel insert.
        if (!signUpData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: accountEmail,
            password: accountPassword,
          });
          if (signInError) {
            setSubmittedSuccess('account_created_needs_login');
            // Allow state to flush before returning
            setTimeout(() => setLoading(false), 100);
            return;
          }
        }

        // Set password_changed flag after DB trigger creates the profile
        setTimeout(async () => {
          try {
            await supabase.from('profiles').update({ password_changed: true }).eq('id', currentUserId);
          } catch (err) { /* ignore */ }
        }, 2000);
      }

      // 1. Upload Gallery Images (Sequential with Retry for AbortError)
      let galleryUrls: string[] = [];
      try {
        for (const file of galleryImages) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `gallery/${fileName}`;

          let uploadSuccess = false;
          let retries = 0;
          const maxRetries = 2;

          while (!uploadSuccess && retries <= maxRetries) {
            try {
              const { error: uploadError } = await supabase.storage
                .from('hotel-gallery')
                .upload(filePath, file as File);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage.from('hotel-gallery').getPublicUrl(filePath);
              galleryUrls.push(publicUrl);
              uploadSuccess = true;
            } catch (err: any) {
              const isAbortError = err.name === 'AbortError' || err.message?.toLowerCase().includes('abort');
              if (isAbortError && retries < maxRetries) {
                console.warn(`Gallery image upload aborted. Retrying... (Attempt ${retries + 1})`);
                await new Promise(resolve => setTimeout(resolve, 500));
                retries++;
              } else {
                throw err;
              }
            }
          }
        }
      } catch (imgError: any) {
        throw new Error('Failed to upload gallery images: ' + (imgError.message || 'Unknown error'));
      }

      // 2. Upload Documents
      const documentUrls: { [key: string]: string } = {};
      try {
        for (const [key, file] of Object.entries(documents)) {
          const fileExt = (file as File).name.split('.').pop();
          const fileName = `${key}-${Math.random()}.${fileExt}`;
          const filePath = `documents/${fileName}`;

          const { error: docError } = await supabase.storage
            .from('hotel-documents')
            .upload(filePath, file as File);

          if (docError) throw docError;
          const { data: { publicUrl } } = supabase.storage.from('hotel-documents').getPublicUrl(filePath);
          documentUrls[key] = publicUrl;
        }
      } catch (docErr: any) {
        throw new Error('Failed to upload compliance documents: ' + (docErr.message || 'Unknown error'));
      }

      // 3. Upsert into Hotels table
      const hotelPayload = {
        hotel_name: hotelName,
        address,
        city,
        district,
        email: hotelEmail || email || user?.email || accountEmail,
        contact,
        whatsapp,
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
          const base: Record<string, string> = {};
          if (userHotel && userHotel.documents) {
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
        status: userHotel ? userHotel.status : 'pending',
        gallery: galleryUrls.length > 0 ? [...(userHotel?.gallery || []), ...galleryUrls] : userHotel?.gallery
      };

      try {
        const { error: insertError } = userHotel
          ? await supabase.from('hotels').update(hotelPayload).eq('id', userHotel.id).select()
          : await supabase.from('hotels').insert([hotelPayload]).select();

        if (insertError) throw insertError;
      } catch (dbErr: any) {
        throw new Error('Failed to save hotel application: ' + (dbErr.message || 'Unknown database error'));
      }

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

      // Success
      setLoading(false);
      try { await refreshData(); } catch (_) { /* silent */ }

      if (userHotel) {
        showNotification(`"${hotelName}" updated successfully.`, 'success');
        navigate('/dashboard');
      } else {
        setSubmittedSuccess('success');
      }

    } catch (err: any) {
      console.error('Error submitting form:', err);
      // Give UI thread a tiny moment to breathe properly before rendering error
      setTimeout(() => setLoading(false), 50);
      showNotification(err.message || 'An unexpected error occurred during submission.', 'error');
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
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading...</p>
        </div>
      </div>
    );
  }



  if (submittedSuccess === 'account_created_needs_login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 african-accents">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 md:p-16 shadow-2xl border border-slate-100 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-28 h-28 bg-amber-50 text-amber-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-amber-900/10 mb-4">
            <Mail size={56} className="animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">Account Created</h1>
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-left">
            <p className="text-amber-800 font-bold mb-3 flex items-center gap-2"><AlertTriangle size={18} /> Action Required</p>
            <p className="text-amber-700 text-sm leading-relaxed mb-4">
              Your member account was created successfully, but your hotel details could not be saved yet because <strong>your email address requires verification</strong>.
            </p>
            <ol className="list-decimal list-inside text-amber-700 text-sm space-y-2 font-medium">
              <li>Check your email inbox and click the verification link.</li>
              <li>Log in to your new dashboard.</li>
              <li>Return exactly to this form to save your hotel details.</li>
            </ol>
          </div>
          <div className="pt-6">
            <Link to="/login" className="inline-flex items-center justify-center bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-700 transition-all shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1 w-full sm:w-auto">
              Go to Login <LogIn className="ml-3" size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submittedSuccess === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 african-accents">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl border border-slate-100 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-900/10 mb-8">
            <CheckCircle2 size={64} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">Registration Successful!</h1>
          <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto leading-relaxed">
            Your Official Hotel Registration Form and Member Account have been successfully created.
          </p>
          <div className="pt-8">
            <Link to="/dashboard" className="inline-flex items-center justify-center bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1 w-full sm:w-auto">
              Go to Member Dashboard <ArrowRight className="ml-3" size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* ── Multi-step Progress Bar ── */}
        <div className="mb-8 sticky top-20 z-30">
          <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl shadow-md px-4 py-3">
            <div className="flex items-center justify-between gap-1 overflow-x-auto">
              {FORM_STEPS.filter(s => s.id !== 1).map((step, idx, arr) => {
                const stepDone =
                  step.id === 2 ? !!(hotelName && address && city && district && contactLocal) :
                    step.id === 3 ? !!(owner && manager && regNumber && year && employees) :
                      step.id === 4 ? !!(rooms) :
                        step.id === 5 ? !!(tin && ntbLicense) :
                          step.id === 6 ? !!(signeeName && signeePosition) :
                            step.id === 7 ? (galleryImages.length > 0 || (userHotel?.gallery?.length || 0) > 0) :
                              false;
                const isActive = activeStep === step.id;
                return (
                  <div key={step.id} className="flex items-center min-w-0 flex-1">
                    <div className="flex flex-col items-center min-w-0 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all
                          ${stepDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-emerald-700 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                        {stepDone ? <Check size={14} /> : step.id - 1}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider mt-1 whitespace-nowrap
                          ${stepDone ? 'text-emerald-600' : isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 rounded transition-all ${stepDone ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* STEP 1: Account Authentication (Visible only if not logged in) */}
          {!user && (
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border-2 border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>
              <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                <UserPlus className="text-emerald-600 mr-3" size={28} />
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Step 1: Create Your Account</h3>
              </div>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Create your SLAH member account below. Once you submit this form, your account will be created, your hotel application submitted, and you will be automatically logged in to your dashboard.</p>

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

          {/* SECTION A: Hotel Identity */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div className="flex items-center">
                <Hotel className="text-emerald-600 mr-3" size={28} />
                <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION A: Hotel Identity</h3>
              </div>
              {hotelName && address && city && district && contactLocal && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  <Check size={12} /> Complete
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2" id="field-hotelName">
                <label className="block text-sm font-bold text-slate-600 mb-2">Hotel Name *</label>
                <input required type="text" value={hotelName}
                  onChange={(e) => { setHotelName(e.target.value); if (e.target.value.trim()) setErrors(prev => ({ ...prev, hotelName: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 ${errors.hotelName ? 'border-rose-400' : 'border-slate-200'}`} />
                {errors.hotelName && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.hotelName}</p>}
              </div>
              <div className="md:col-span-2" id="field-address">
                <label className="block text-sm font-bold text-slate-600 mb-2">Address *</label>
                <input required type="text" value={address}
                  onChange={(e) => { setAddress(e.target.value); if (e.target.value.trim()) setErrors(prev => ({ ...prev, address: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 ${errors.address ? 'border-rose-400' : 'border-slate-200'}`} />
                {errors.address && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.address}</p>}
              </div>
              <div id="field-city">
                <label className="block text-sm font-bold text-slate-600 mb-2">City/Town *</label>
                <input required type="text" value={city}
                  onChange={(e) => { setCity(e.target.value); if (e.target.value.trim()) setErrors(prev => ({ ...prev, city: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 ${errors.city ? 'border-rose-400' : 'border-slate-200'}`} />
                {errors.city && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.city}</p>}
              </div>
              <div id="field-district">
                <label className="block text-sm font-bold text-slate-600 mb-2">District *</label>
                <select required value={district}
                  onChange={(e) => { setDistrict(e.target.value); if (e.target.value) setErrors(prev => ({ ...prev, district: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 ${errors.district ? 'border-rose-400' : 'border-slate-200'}`}>
                  <option value="">— Select District —</option>
                  {SIERRA_LEONE_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.district && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.district}</p>}
              </div>
              <div className="md:col-span-2" id="field-contactLocal">
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
                      if (e.target.value.trim()) setErrors(prev => ({ ...prev, contactLocal: '' }));
                    }}
                    pattern="[0-9 \-]{5,15}"
                    title="Enter between 5 and 15 digits (spaces and hyphens allowed)"
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-800 placeholder-slate-400 text-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Digits only · 5–15 characters · e.g. {countryCode} 76 123456</p>
                {errors.contactLocal && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.contactLocal}</p>}
              </div>

              <div className="md:col-span-2" id="field-whatsapp">
                <label className="block text-sm font-bold text-slate-600 mb-2">WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. +232 76 123456"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">Please include the international format (e.g., +232 76 123 456).</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-600 mb-2">Hotel Public Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" placeholder="e.g. info@yourhotel.sl" value={hotelEmail}
                    onChange={(e) => setHotelEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">This is the public-facing contact email displayed for your hotel listing. Defaults to your account email if left blank.</p>
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

          {/* SECTIONS B-F: Always visible — members fill all sections together */}
          <div className="space-y-10">
            {/* SECTION B: Ownership & Management */}
            <section id="section-b" className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center">
                  <ClipboardList className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION B: Ownership &amp; Management</h3>
                </div>
                {owner && manager && regNumber && year && employees && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Check size={12} /> Complete
                  </span>
                )}
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
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center">
                  <Star className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION C: Facilities &amp; Classification</h3>
                </div>
                {rooms && stars && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Check size={12} /> Complete
                  </span>
                )}
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
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div className="flex items-center">
                  <Scale className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION D: Compliance &amp; Documentation</h3>
                </div>
                {tin && ntbLicense && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Check size={12} /> Complete
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mb-8 italic font-medium">Upload official PDF documents for verification. Accepted format: PDF only.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">TIN Number *</label>
                  <input required type="text" value={tin} onChange={(e) => setTin(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">National Tourist Board License Number *</label>
                  <input required type="text" value={ntbLicense} onChange={(e) => setNtbLicense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>

                {([
                  { key: 'certIncorporation', label: 'Certificate of Incorporation' },
                  { key: 'bizRegCert', label: 'Business Registration Certificate' },
                  { key: 'ntbCert', label: 'National Tourist Board License Certificate' },
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
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center">
                  <FileSignature className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION E: Commitment</h3>
                </div>
                {signeeName && signeePosition && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Check size={12} /> Complete
                  </span>
                )}
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

          {/* ANTI-SPAM: Honeypot (Hidden) */}
          <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
            <label>Leave this field blank if you are human</label>
            <input type="text" name="work_fax" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>

          {/* ANTI-SPAM: Math CAPTCHA */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200" id="field-captcha">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-slate-800 mb-1 flex items-center justify-center md:justify-start"><ShieldCheck size={20} className="text-emerald-600 mr-2" /> Security Check</h4>
                <p className="text-sm text-slate-500">Please solve this simple math problem to prove you are human before submitting.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-700 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                  {captchaNums.num1} + {captchaNums.num2} =
                </span>
                <input
                  type="number"
                  required
                  value={captchaAnswer}
                  onChange={(e) => {
                    setCaptchaAnswer(e.target.value);
                    if (e.target.value) setErrors(prev => ({ ...prev, captcha: '' }));
                  }}
                  className={`w-28 px-4 py-3 text-xl font-bold text-center rounded-2xl border-2 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all ${errors.captcha ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white'}`}
                />
              </div>
            </div>
            {errors.captcha && <p className="text-rose-500 text-sm mt-4 font-bold text-center md:text-right">{errors.captcha}</p>}
          </section>

          {/* Submit button — label and visibility depend on auth + email-confirmation state */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-emerald-800 transition-all transform hover:-translate-y-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={24} className="animate-spin mr-3" /> : <FileCheck size={24} className="mr-3" />}
            {loading ? 'Submitting Application...' : (!user ? 'Register & Submit Application' : 'Update Registration Profile')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
