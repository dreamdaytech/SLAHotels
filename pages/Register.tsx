import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Star, Hotel, FileCheck, Landmark, ClipboardList, Image as ImageIcon, X, UploadCloud, Plus, Globe, Users, Building2, Scale, FileBadge, FileSignature, CheckSquare, Lock, Mail, UserPlus, ArrowRight, Loader2, AlertTriangle, LogIn, Clock, LogOut } from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { isProfileComplete } from '../lib/utils';

const Register: React.FC = () => {
  const { user, userHotel, userHotelLoading, refreshData, showNotification } = useAppContext();
  const [submitted, setSubmitted] = useState(false);
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
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
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
      let currentUserId = user?.id;

      // 0. Handle account creation first if not logged in
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
        currentUserId = signUpData.user.id;

        // 0.1 Explicitly set password_changed: true for frontend registrations
        // We add a small delay to ensure the DB trigger has finished creating the profile
        setTimeout(async () => {
          await supabase
            .from('profiles')
            .update({ password_changed: true })
            .eq('id', currentUserId);
        }, 1000);

        // Add a small delay for session propagation
        await new Promise(resolve => setTimeout(resolve, 500));
        await refreshData();
      }

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
        documents: documentStatus.certIncorporation || documentStatus.bizRegCert ? { ...userHotel?.documents, ...documentUrls } : userHotel?.documents,
        signee_name: signeeName,
        signee_position: signeePosition,
        signee_date: signeeDate,
        user_id: currentUserId,
        status: 'pending', // Default to pending
        gallery: galleryUrls.length > 0 ? [...(userHotel?.gallery || []), ...galleryUrls] : userHotel?.gallery
      };

      // Ensure status is 'pending' if completeness is missing
      const { complete } = isProfileComplete(hotelPayload);
      if (complete && userHotel?.status === 'approved') {
        hotelPayload.status = 'approved';
      } else {
        hotelPayload.status = 'pending';
      }

      const { data, error } = userHotel
        ? await supabase.from('hotels').update(hotelPayload).eq('id', userHotel.id).select()
        : await supabase.from('hotels').insert([hotelPayload]).select();

      if (error) throw error;

      // 4. Log Activity
      await supabase.from('activities').insert({
        type: userHotel ? 'update' : 'registration',
        text: userHotel
          ? `Hotel "${hotelName}" updated their registration details.`
          : `New membership application submitted for "${hotelName}".`,
        user_id: currentUserId
      });

      setSubmitted(true);
      window.scrollTo(0, 0);
      await refreshData();
    } catch (err: any) {
      console.error('Error submitting form:', err.message);
      showNotification('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentCount = galleryImages.length;
    const remainingSlots = 10 - currentCount;

    if (remainingSlots <= 0) {
      alert("You have already reached the limit of 10 images.");
      return;
    }

    const newFiles = Array.from(files).slice(0, remainingSlots) as File[];
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

  if (submitted) {
    const isApproved = userHotel?.status === 'approved';
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-xl w-full mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-emerald-100">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {isApproved ? 'Profile Updated!' : 'Registration Submitted!'}
            </h1>
            <p className="text-slate-500 text-lg mb-8">
              {isApproved
                ? `Your updates for "${hotelName}" have been saved successfully.`
                : `Thank you for registering "${hotelName}" with the Sierra Leone Association of Hotels.`}
            </p>

            {!isApproved && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8 text-left">
                <h4 className="text-emerald-800 font-bold text-sm mb-2 flex items-center">
                  <Mail size={16} className="mr-2" /> Check Your Email
                </h4>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  We've sent a verification link to your email. Please click the link to confirm your account and complete your registration profile.
                </p>
              </div>
            )}

            {!isApproved && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 text-left">
                <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center">
                  <Clock size={16} className="mr-2" /> What happens next?
                </h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Our membership committee will review your initial application (Section A). Once approved, you'll be granted access to complete the full official registration (Sections B-F).
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = isApproved ? '#/dashboard' : '#/'}
                className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20"
              >
                {isApproved ? 'Go to Dashboard' : 'Return Home'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending Review Screen
  if (user && userHotel?.status === 'pending' && !submitted) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-xl w-full mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-emerald-100">
            <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Clock size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Application Pending</h1>
            <p className="text-slate-500 text-lg mb-8">
              Your initial hotel registration for <span className="text-slate-900 font-bold">{userHotel.hotel_name}</span> is currently being reviewed by the SLAH Secretariat.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 text-left">
              <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center">
                <ShieldCheck size={16} className="mr-2" /> Next Steps
              </h4>
              <p className="text-amber-700 text-xs leading-relaxed">
                Once your application is approved, you will be granted access to complete the full Official Hotel Registration form (Sections B-F) and gain access to the member portal.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => window.location.href = '#/'} className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors">Return Home</button>
              <button onClick={() => supabase.auth.signOut()} className="text-slate-400 text-xs font-bold hover:text-rose-500 transition-colors">Sign out from {user.email}</button>
            </div>
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

          {/* SECTION A: Hotel Information (Always visible or gated by auth) */}
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
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Official Contact Number *</label>
                <input required type="tel" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-600 mb-2">Website (If Any)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="url" placeholder="www.yourhotel.sl" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                </div>
              </div>
            </div>
          </section>

          {/* GATED SECTIONS B-F (Only for authenticated participants with approved or pending status) */}
          {userHotel?.status === 'approved' || userHotel?.status === 'pending' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* SECTION B: Ownership & Management */}
              <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
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
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION D: Compliance & Documentation</h3>
                </div>
                <p className="text-slate-500 text-sm mb-8 italic">Attach digital copies of your official certificates for verification.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">TIN Number *</label>
                    <input required type="text" value={tin} onChange={(e) => setTin(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">NTB License Number *</label>
                    <input required type="text" value={ntbLicense} onChange={(e) => setNtbLicense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-600">Certificate of Incorporation *</label>
                    <div className="flex items-center space-x-4">
                      <button type="button" onClick={() => document.getElementById('certIncorporation')?.click()} className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors font-bold text-sm">
                        <UploadCloud size={16} />
                        <span>{documentStatus.certIncorporation || userHotel?.documents?.certIncorporation ? 'Document Attached' : 'Attach Document'}</span>
                      </button>
                      <input type="file" id="certIncorporation" className="hidden" onChange={(e) => handleDocUpload(e, 'certIncorporation')} accept=".pdf,image/*" />
                      {(documentStatus.certIncorporation || userHotel?.documents?.certIncorporation) && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-600">Business Registration Cert *</label>
                    <div className="flex items-center space-x-4">
                      <button type="button" onClick={() => document.getElementById('bizRegCert')?.click()} className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors font-bold text-sm">
                        <UploadCloud size={16} />
                        <span>{documentStatus.bizRegCert || userHotel?.documents?.bizRegCert ? 'Document Attached' : 'Attach Document'}</span>
                      </button>
                      <input type="file" id="bizRegCert" className="hidden" onChange={(e) => handleDocUpload(e, 'bizRegCert')} accept=".pdf,image/*" />
                      {(documentStatus.bizRegCert || userHotel?.documents?.bizRegCert) && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                  </div>

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
                </div>
              </section>

              {/* SECTION F: Gallery */}
              <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                  <ImageIcon className="text-emerald-600 mr-3" size={28} />
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION F: Media Gallery</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {userHotel?.gallery?.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {galleryPreviews.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-100">
                      <img src={img} alt="New Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={12} /></button>
                    </div>
                  ))}
                  {galleryImages.length + (userHotel?.gallery?.length || 0) < 10 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <UploadCloud size={24} className="mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Add Media</span>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
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

          <button disabled={loading} type="submit" className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-emerald-800 transition-all transform hover:-translate-y-1 flex items-center justify-center disabled:opacity-50">
            {loading ? <Loader2 size={24} className="animate-spin mr-3" /> : <FileCheck size={24} className="mr-3" />}
            {user ? (userHotel?.status === 'approved' ? 'Update Final Registration' : 'Submit for Review') : 'Create Account & Begin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
