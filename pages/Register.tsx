
import React, { useState, useRef } from 'react';
import { ShieldCheck, CheckCircle2, Star, Hotel, FileCheck, Landmark, ClipboardList, Image as ImageIcon, X, UploadCloud, Plus, Globe, Users, Building2, Scale, FileBadge, FileSignature, CheckSquare } from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';

const Register: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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

      // 3. Insert into Hotels table
      const { data, error } = await supabase
        .from('hotels')
        .insert([{
          hotel_name: hotelName,
          address,
          city,
          district,
          email,
          contact,
          website,
          owner,
          manager,
          reg_number: regNumber,
          year_established: parseInt(year),
          employees: parseInt(employees),
          rooms: parseInt(rooms),
          stars,
          room_types: roomTypes,
          facilities,
          other_amenities: otherAmenities,
          tin,
          ntb_license: ntbLicense,
          compliance_remarks: complianceRemarks,
          documents: documentUrls,
          signee_name: signeeName,
          signee_position: signeePosition,
          signee_date: signeeDate,
          status: 'pending',
          gallery: galleryUrls
        }]);

      if (error) throw error;

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error submitting form:', err.message);
      alert('Error submitting registration. Please try again later.');
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

  if (submitted) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-xl w-full mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-emerald-100">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Registration Received!</h1>
            <p className="text-slate-500 text-lg mb-8">
              Thank you for applying to join the Sierra Leone Association of Hotels. Your application has been sent to the Secretariat for review.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              A copy of your submission has been sent to your email. You will be contacted by our membership officer within 5 working days.
            </p>
            <button
              onClick={() => window.location.href = '#/'}
              className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors"
            >
              Return Home
            </button>
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* SECTION A: Hotel Information */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
              <Hotel className="text-emerald-600 mr-3" size={28} />
              <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION A: Hotel Information</h3>
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
                <label className="block text-sm font-bold text-slate-600 mb-2">Contact Number *</label>
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
                <label className="block text-sm font-bold text-slate-600 mb-2">Number of Employees *</label>
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
                <label className="block text-sm font-bold text-slate-600 mb-2">Total Number of Rooms *</label>
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
                <label className="block text-sm font-bold text-slate-600 mb-2">Other Amenities</label>
                <textarea
                  placeholder="List any other facilities or services..."
                  value={otherAmenities}
                  onChange={(e) => setOtherAmenities(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 h-32"
                />
              </div>
            </div>
          </section>

          {/* SECTION D: Legal & Compliance Information */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex items-center mb-4 border-b border-slate-100 pb-4">
              <Scale className="text-emerald-600 mr-3" size={28} />
              <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION D: Legal & Compliance Info</h3>
            </div>
            <p className="text-slate-500 text-sm mb-8 italic">Please provide compliance details and upload digital copies of your certificates below.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Tax Identification Number (TIN) *</label>
                <input required type="text" value={tin} onChange={(e) => setTin(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">National Tourist Board License Number *</label>
                <input required type="text" value={ntbLicense} onChange={(e) => setNtbLicense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-600">Certificate of Incorporation *</label>
                <div className="flex items-center space-x-4">
                  <button type="button" onClick={() => document.getElementById('certIncorporation')?.click()} className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors font-bold text-sm">
                    <UploadCloud size={16} />
                    <span>{documentStatus.certIncorporation ? 'Uploaded' : 'Upload Document'}</span>
                  </button>
                  <input type="file" id="certIncorporation" className="hidden" onChange={(e) => handleDocUpload(e, 'certIncorporation')} accept=".pdf,image/*" />
                  {documentStatus.certIncorporation && <CheckCircle2 size={20} className="text-emerald-500" />}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-600">Business Registration Certificate *</label>
                <div className="flex items-center space-x-4">
                  <button type="button" onClick={() => document.getElementById('bizRegCert')?.click()} className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors font-bold text-sm">
                    <UploadCloud size={16} />
                    <span>{documentStatus.bizRegCert ? 'Uploaded' : 'Upload Document'}</span>
                  </button>
                  <input type="file" id="bizRegCert" className="hidden" onChange={(e) => handleDocUpload(e, 'bizRegCert')} accept=".pdf,image/*" />
                  {documentStatus.bizRegCert && <CheckCircle2 size={20} className="text-emerald-500" />}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="block text-sm font-bold text-slate-600">Other Compliance Certificates</label>
                <div className="flex items-center space-x-4">
                  <button type="button" onClick={() => document.getElementById('otherCerts')?.click()} className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors font-bold text-sm">
                    <Plus size={16} />
                    <span>{documentStatus.otherCerts ? 'Uploaded Additional' : 'Upload Additional'}</span>
                  </button>
                  <input type="file" id="otherCerts" className="hidden" onChange={(e) => handleDocUpload(e, 'otherCerts')} accept=".pdf,image/*" />
                  {documentStatus.otherCerts && <CheckCircle2 size={20} className="text-emerald-500" />}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-600 mb-2">Additional Compliance Remarks</label>
                <textarea
                  placeholder="e.g. Health & Safety certification status..."
                  value={complianceRemarks}
                  onChange={(e) => setComplianceRemarks(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 h-24"
                />
              </div>
            </div>
          </section>

          {/* SECTION E: Association Commitment */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
              <FileSignature className="text-emerald-600 mr-3" size={28} />
              <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION E: Association Commitment</h3>
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed font-medium">
              By signing this form, I acknowledge that our hotel agrees to abide by the rules and regulations of the Sierra Leone Association of Hotels and commit to active participation in its activities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Name *</label>
                <input required type="text" value={signeeName} onChange={(e) => setSigneeName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Position *</label>
                <input required type="text" value={signeePosition} onChange={(e) => setSigneePosition(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Date *</label>
                <input required type="date" value={signeeDate} onChange={(e) => setSigneeDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50" />
              </div>
            </div>
          </section>

          {/* SECTION F: Hotel Gallery */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
              <ImageIcon className="text-emerald-600 mr-3" size={28} />
              <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">SECTION F: Hotel Gallery</h3>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-600 mb-1">Property Images (Public Display)</h4>
                  <p className="text-xs text-slate-500">Upload high-quality images of your rooms, lobby, and amenities. Maximum 10 images.</p>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                  {galleryImages.length} / 10 Images
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {galleryPreviews.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {galleryImages.length < 10 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all group">
                    <div className="bg-slate-50 p-3 rounded-full group-hover:bg-emerald-100 transition-colors mb-2">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Add Image</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
            </div>
          </section>

          <button type="submit" className="w-full bg-emerald-700 text-white py-5 rounded-2xl font-bold text-xl shadow-2xl hover:bg-emerald-800 transition-all transform hover:-translate-y-1 flex items-center justify-center">
            <FileCheck size={24} className="mr-3" /> Submit Official Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
