-- SEED DATA FOR SLAHOTELS
-- Run this in your Supabase SQL Editor

-- 1. SEED HOTELS (MEMBERS)
INSERT INTO hotels (
    hotel_name, email, contact, website, address, 
    city, district, owner, manager, reg_number, 
    year_established, employees, rooms, stars, 
    room_types, facilities, gallery, status,
    tin, ntb_license, signee_name, signee_position, signee_date
) VALUES 
(
    'Radisson Blu Mammy Yoko', 'info@radissonblu.sl', '+232 76 000 000', 'https://www.radissonhotels.com', 'Lumley Beach Road', 
    'Aberdeen', 'Western Area Urban', 'Mammy Yoko Hotel Ltd', 'John Doe', 'SL/HTL/001', 
    2012, 150, 172, 5, 
    ARRAY['Standard', 'Deluxe', 'Executive', 'Suite'], ARRAY['Restaurant', 'Bar', 'Pool', 'Conference Room', 'Spa', 'Wi-Fi'], 
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'], 'approved',
    'TIN-12345', 'NTB-98765', 'John Doe', 'General Manager', '2024-01-01'
),
(
    'The Country Lodge Complex', 'contact@countrylodge.sl', '+232 76 111 111', 'https://countrylodgesl.com', 'HS 51 Hill Station', 
    'Hill Station', 'Western Area Urban', 'Country Lodge Group', 'Jane Smith', 'SL/HTL/002', 
    2005, 80, 50, 4, 
    ARRAY['Standard', 'Executive', 'Suite'], ARRAY['Restaurant', 'Bar', 'Pool', 'Conference Room', 'Wi-Fi'], 
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200'], 'approved',
    'TIN-23456', 'NTB-87654', 'Jane Smith', 'Managing Director', '2024-01-01'
),
(
    'Bintumani Hotel', 'info@bintumani.sl', '+232 76 222 333', NULL, 'Aberdeen Road', 
    'Aberdeen', 'Western Area Urban', 'Li Wei', 'Li Wei', 'SL/HTL/003', 
    1980, 100, 120, 4, 
    ARRAY['Standard', 'Deluxe'], ARRAY['Restaurant', 'Pool', 'Conference Room', 'Tennis Court'], 
    ARRAY['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=1200'], 'approved',
    'TIN-34567', 'NTB-76543', 'Li Wei', 'Owner', '2024-01-01'
),
(
    'Home Suites Boutique Hotel', 'stay@homesuites.sl', '+232 76 444 555', 'https://homesuites.sl', '78 Aberdeen Rd', 
    'Aberdeen', 'Western Area Urban', 'Musa Bangura', 'Baindu Kamara', 'SL/HTL/004', 
    2016, 45, 35, 4, 
    ARRAY['Studio', 'Suite'], ARRAY['Wi-Fi', 'Gym', 'Restaurant', 'Concierge'], 
    ARRAY['https://images.unsplash.com/photo-1551882547-ff43c63fedfe?auto=format&fit=crop&q=80&w=1200'], 'approved',
    'TIN-45678', 'NTB-65432', 'Musa Bangura', 'Owner', '2024-01-01'
),
(
    'Lungi Airport Plaza', 'frontdesk@lungiplaza.sl', '+232 78 555 111', NULL, 'Airport Road', 
    'Lungi', 'Port Loko', 'Sahr Mattia', 'Alice Koroma', 'SL/HTL/LUN/098', 
    2021, 30, 45, 4, 
    ARRAY['Standard', 'Twin'], ARRAY['Wi-Fi', 'Restaurant', 'Airport Shuttle', 'Bar'], 
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'], 'pending',
    'TIN-56789', 'NTB-54321', 'Sahr Mattia', 'Manager', '2024-01-01'
),
(
    'Bonthe Seaside Lodge', 'info@bonthelodge.sl', '+232 30 444 222', NULL, 'Seafront Walk', 
    'Bonthe Island', 'Bonthe', 'Mariama Sheriff', 'Mariama Sheriff', 'SL/HTL/BON/012', 
    2018, 12, 15, 3, 
    ARRAY['Standard', 'Bungalow'], ARRAY['Restaurant', 'Beachfront', 'Laundry'], 
    ARRAY['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800'], 'pending',
    'TIN-67890', 'NTB-43210', 'Mariama Sheriff', 'Owner', '2024-01-01'
);

-- 2. SEED NEWS
INSERT INTO news (
    title, excerpt, content, author, image, category, status, date
) VALUES 
(
    'SLAH Partnership with National Tourist Board Strengthens Marketing Reach', 
    'A new joint venture aimed at marketing Sierra Leone as a luxury destination was signed at the Ministry today...', 
    'A new joint venture aimed at marketing Sierra Leone as a luxury destination was signed at the Ministry today. This partnership will focus on international trade fairs and digital marketing campaigns to promote the hidden gems of our coastline and highlands.', 
    'Admin', 'https://picsum.photos/seed/n1/800/500', 'Policy', 'Published', '2024-10-15'
),
(
    'Workshop: Implementing Sustainable Green Energy in Modern Hotels', 
    'Over 30 general managers attended the two-day workshop focused on reducing carbon footprints and operational costs...', 
    'Over 30 general managers attended the two-day workshop focused on reducing carbon footprints and operational costs. The sessions covered solar integration, waste management systems, and community-led conservation efforts near resort areas.', 
    'Education Dept', 'https://picsum.photos/seed/n2/800/500', 'Training', 'Published', '2024-10-02'
),
(
    'Sierra Leone Association of Hotels Welcomes 5 New Boutique Members', 
    'We are proud to announce the certification and inclusion of five new members into the SLAH directory...', 
    'We are proud to announce the certification and inclusion of five new members into the SLAH directory. This brings our total active membership to an all-time high, representing the growing diversity of our national hospitality sector.', 
    'Membership', 'https://picsum.photos/seed/n3/800/500', 'Community', 'Published', '2024-09-20'
);

-- 3. SEED EVENTS
INSERT INTO events (
    title, description, location, date, time, category, image, status, schedule, speakers
) VALUES 
(
    'West African Hospitality Expo 2025', 
    'The premier national gathering for stakeholders to discuss the roadmap for 2025.', 
    'Bintumani Hotel, Freetown', '2025-01-20', '09:00 AM', 'Summit', 
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200', 'Published',
    '[{"date": "2025-01-20", "time": "09:00 AM", "agenda": [{"time": "09:00 AM", "activity": "Registration"}, {"time": "10:00 AM", "activity": "Keynote"}]}]'::JSONB,
    '[{"name": "Hon. Tamba Lamina", "role": "Minister of Tourism", "image": "https://i.pravatar.cc/150?u=1"}]'::JSONB
),
(
    'SLAH Excellence Awards 2024', 
    'Celebrating achievements in Sierra Leonean hospitality standards.', 
    'Radisson Blu, Freetown', '2024-11-15', '07:00 PM', 'Corporate', 
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200', 'Published',
    '[{"date": "2024-11-15", "time": "07:00 PM", "agenda": [{"time": "07:00 PM", "activity": "Red Carpet"}]}]'::JSONB,
    '[{"name": "Mariama Conteh", "role": "SLAH President", "image": "https://i.pravatar.cc/150?u=2"}]'::JSONB
),
(
    'SLAH Regional Tourism Forum: Bo', 
    'Discussing decentralized tourism development for the southern region.', 
    'Bo Hotel, Bo City', '2025-05-12', '10:00 AM', 'Summit', 
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200', 'Published',
    '[{"date": "2025-05-12", "time": "10:00 AM", "agenda": [{"time": "10:00 AM", "activity": "Registration"}]}]'::JSONB,
    '[{"name": "Fatmata Bangura", "role": "Secretary", "image": "https://i.pravatar.cc/150?u=3"}]'::JSONB
),
(
    'Tourism Investment Forum', 
    'Exploring venture opportunities in the coastal tourism zone.', 
    'The Country Lodge, Freetown', '2025-06-22', '10:00 AM', 'Summit', 
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200', 'Published',
    '[{"date": "2025-06-22", "time": "10:00 AM", "agenda": [{"time": "10:00 AM", "activity": "Investor Pitch"}]}]'::JSONB,
    '[{"name": "Kelvin Cole", "role": "Investment Analyst", "image": "https://i.pravatar.cc/150?u=4"}]'::JSONB
),
(
    'Hospitality Staff Training Workshop', 
    'Intensive customer service training for front-desk and concierge teams.', 
    'Home Suites Boutique, Aberdeen', '2024-09-05', '08:30 AM', 'Training', 
    'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&q=80&w=1200', 'Published',
    '[{"date": "2024-09-05", "time": "08:30 AM", "agenda": [{"time": "09:00 AM", "activity": "Soft Skills Training"}]}]'::JSONB,
    '[{"name": "Sarah Kamara", "role": "HR Consultant", "image": "https://i.pravatar.cc/150?u=5"}]'::JSONB
);
