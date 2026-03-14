export const isProfileComplete = (hotel: any) => {
    if (!hotel) return { complete: false, missing: ['No data found'] };

    const required = [
        { field: 'hotel_name', label: 'Hotel Name (Section A)' },
        { field: 'address', label: 'Address (Section A)' },
        { field: 'city', label: 'City (Section A)' },
        { field: 'district', label: 'District (Section A)' },
        { field: 'contact', label: 'Contact Number (Section A)' },
        { field: 'owner', label: 'Owner Name (Section B)' },
        { field: 'manager', label: 'Manager Name (Section B)' },
        { field: 'reg_number', label: 'Reg Number (Section B)' },
        { field: 'year_established', label: 'Year Established (Section B)' },
        { field: 'employees', label: 'Employees (Section B)' },
        { field: 'rooms', label: 'Total Rooms (Section C)' },
        { field: 'stars', label: 'Star Rating (Section C)' },
        { field: 'tin', label: 'TIN Number (Section D)' },
        { field: 'ntb_license', label: 'NTB License (Section D)' },
        { field: 'signee_name', label: 'Signee Name (Section E)' },
        { field: 'signee_position', label: 'Signee Position (Section E)' },
        { field: 'signee_date', label: 'Signee Date (Section E)' },
    ];

    const missing: string[] = [];
    required.forEach(req => {
        const val = hotel[req.field];
        if (val === undefined || val === null || val === '') {
            missing.push(req.label);
        }
    });

    // Check documents
    const docs = hotel.documents || {};
    if (!docs.certIncorporation) missing.push('Certificate of Incorporation (Section D)');
    if (!docs.bizRegCert) missing.push('Business Registration Cert (Section D)');

    // Check gallery
    if (!hotel.gallery || hotel.gallery.length === 0) {
        missing.push('At least one gallery image (Section F)');
    }
    return {
        complete: missing.length === 0,
        missing
    };
};

export const createSlug = (name: string) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

export const formatPhoneLink = (number: string) => {
    if (!number) return '';
    let digits = number.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '232' + digits.substring(1);
    else if (digits.length === 8) digits = '232' + digits;
    return `tel:+${digits}`;
};

export const formatPhoneDisplay = (number: string) => {
    if (!number) return '';
    let digits = number.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '232' + digits.substring(1);
    else if (digits.length === 8) digits = '232' + digits;

    if (digits.startsWith('232')) {
        return `+232 ${digits.substring(3, 5)} ${digits.substring(5)}`;
    }
    return `+${digits}`;
};

export const formatWhatsAppLink = (number: string) => {
    if (!number) return '';
    let digits = number.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '232' + digits.substring(1);
    else if (digits.length === 8) digits = '232' + digits;
    return `https://wa.me/${digits}`;
};

export const formatWhatsAppDisplay = (number: string) => formatPhoneDisplay(number);
