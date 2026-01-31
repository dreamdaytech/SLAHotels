
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Globe, ShieldCheck, TrendingUp, Users, Building2, LayoutDashboard, LogIn, LogOut, Calendar, ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import Home from './pages/Home';
import About from './pages/About';
import Members from './pages/Members';
import Advocacy from './pages/Advocacy';
import News from './pages/News';
import NewsDetails from './pages/NewsDetails';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Contact from './pages/Contact';
import Register from './pages/Register';
import MemberDetails from './pages/MemberDetails';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Secretariat from './pages/Secretariat';
import NotFound from './pages/NotFound';
import { SLAHLogo } from './Logo';
import { supabase } from './lib/supabase';

import { AppProvider, useAppContext } from './context/AppContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMediaOpen, setMobileMediaOpen] = useState(false);
  const { user } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    {
      name: 'About SLAH',
      submenu: [
        { name: 'Who We Are', path: '/about' },
        { name: 'The Secretariat', path: '/about/secretariat' },
      ]
    },
    { name: 'Members', path: '/members' },
    {
      name: 'Media',
      submenu: [
        { name: 'Events', path: '/events' },
        { name: 'News', path: '/news' },
        { name: 'Advocacy', path: '/advocacy' },
      ]
    },
    { name: 'Contact', path: '/contact' },
  ];

  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) return null;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 bg-white shadow-md py-1 border-b border-slate-100`}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <SLAHLogo variant="dark" className="h-14 md:h-20 w-auto transition-all" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.submenu ? (
                <div key={link.name} className="relative group py-4">
                  <button className="flex items-center text-xs font-bold transition-colors hover:text-emerald-600 uppercase tracking-widest text-slate-700">
                    {link.name} <ChevronDown size={14} className="ml-1 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute left-0 top-full mt-0 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                    {link.submenu.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className="block px-6 py-2.5 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors uppercase tracking-widest"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-xs font-bold transition-colors hover:text-emerald-600 uppercase tracking-widest text-slate-700"
                >
                  {link.name}
                </Link>
              )
            ))}
            <div className="h-6 w-px bg-slate-300 mx-2"></div>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="flex items-center text-emerald-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-700">
                  <LayoutDashboard size={16} className="mr-1" /> Portal
                </Link>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center text-xs font-bold uppercase tracking-widest hover:text-emerald-600 text-slate-700">
                <LogIn size={16} className="mr-1" /> Member Login
              </Link>
            )}
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-widest">
              Join SLAH
            </Link>
          </div>

          <button className="lg:hidden p-2 rounded-md text-slate-800" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`lg:hidden fixed inset-0 bg-white z-[60] transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Close Button Inside Mobile Menu */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 border border-slate-100 transition-all shadow-sm active:scale-95 z-[70]"
          aria-label="Close menu"
        >
          <X size={28} />
        </button>

        <div className="flex flex-col h-full p-8 pt-24 space-y-4 overflow-y-auto African-accents">
          <div className="mb-12 flex justify-center"><SLAHLogo variant="dark" className="h-24" /></div>
          {navLinks.map((link) => (
            link.submenu ? (
              <div key={link.name} className="flex flex-col">
                <button
                  onClick={() => setMobileMediaOpen(!mobileMediaOpen)}
                  className="flex items-center justify-between text-xl font-bold text-slate-800 hover:text-emerald-600 border-b border-slate-100 pb-2"
                >
                  {link.name}
                  <ChevronDown className={`transition-transform ${mobileMediaOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileMediaOpen && (
                  <div className="flex flex-col pl-6 space-y-4 pt-4 pb-2 border-l border-emerald-600 ml-2">
                    {link.submenu.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className="text-lg font-medium text-slate-600 hover:text-emerald-600"
                        onClick={() => setIsOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className="text-xl font-bold text-slate-800 hover:text-emerald-600 border-b border-slate-100 pb-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            )
          ))}
          {user ? (
            <Link to="/dashboard" className="text-xl font-bold text-emerald-600 pb-2" onClick={() => setIsOpen(false)}>Admin Portal</Link>
          ) : (
            <Link to="/login" className="text-xl font-bold text-emerald-600 pb-2" onClick={() => setIsOpen(false)}>Member Login</Link>
          )}
          <Link to="/register" className="mt-4 bg-emerald-600 text-white px-6 py-4 rounded-xl text-center font-bold text-xl shadow-lg" onClick={() => setIsOpen(false)}>Join Now</Link>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <SLAHLogo variant="light" className="h-20 mb-6" />
            <p className="text-slate-400 text-sm leading-relaxed">
              The official national umbrella body for hotels and hospitality stakeholders in Sierra Leone.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/about" className="hover:text-amber-500">About SLAH</Link></li>
              <li><Link to="/about/secretariat" className="hover:text-amber-500">The Secretariat</Link></li>
              <li><Link to="/members" className="hover:text-amber-500">Member Directory</Link></li>
              <li><Link to="/events" className="hover:text-amber-500">Events Calendar</Link></li>
              <li><Link to="/advocacy" className="hover:text-amber-500">Industry Advocacy</Link></li>
              <li><Link to="/news" className="hover:text-amber-500">News & Updates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-center"><MapPin size={16} className="mr-3 text-emerald-500" /> 12 Siaka Stevens Street, Freetown</li>
              <li className="flex items-center"><Phone size={16} className="mr-3 text-emerald-500" /> +232 76 123 456</li>
              <li className="flex items-center"><Mail size={16} className="mr-3 text-emerald-500" /> info@slah.org.sl</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
          © 2024 Sierra Leone Association of Hotels. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

const NotificationToast = () => {
  const { notification, clearNotification } = useAppContext();

  if (!notification) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-slate-50 border-slate-200 text-slate-800',
  };

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    info: <Info className="text-slate-500" size={20} />,
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-center space-x-4 p-4 pr-6 rounded-2xl border shadow-2xl ${styles[notification.type]} min-w-[320px] max-w-md`}>
        <div className="flex-shrink-0">
          {icons[notification.type]}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-semibold">{notification.message}</p>
        </div>
        <button
          onClick={clearNotification}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { hotels } = useAppContext();

  // Routes where navbar/footer should be hidden
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Detect 404: 
  // We check if the current path matches any of our defined routes
  const definedRoutes = [
    '/', '/about', '/about/secretariat', '/members', '/events',
    '/advocacy', '/news', '/contact', '/register', '/login'
  ];

  // Simple check for dynamic routes like /members/:id, /news/:id, /events/:id
  const isDynamicRoute =
    location.pathname.startsWith('/members/') ||
    location.pathname.startsWith('/news/') ||
    location.pathname.startsWith('/events/');

  const isNotFound = !isDashboard && !isDynamicRoute && !definedRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col african-accents">
      {!isDashboard && !isNotFound && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/about/secretariat" element={<Secretariat />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:id" element={<MemberDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/advocacy" element={<Advocacy />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isDashboard && !isNotFound && <Footer />}
      <NotificationToast />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppProvider>
        <ScrollToTop />
        <AppContent />
      </AppProvider>
    </Router>
  );
};

export default App;
