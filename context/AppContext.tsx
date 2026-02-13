import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  user: any | null;
  setUser: (user: any) => void;
  profile: any | null;
  hotels: any[];
  members: any[]; // Used in Home.tsx
  profiles: any[];
  news: any[];
  events: any[];
  activities: any[]; // Added activities
  loading: boolean;
  notification: Notification | null;
  showNotification: (message: string, type: Notification['type']) => void;
  clearNotification: () => void;
  refreshData: () => Promise<void>;
  userHotel: any | null;
  userHotelLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]); // Added activities
  const [loading, setLoading] = useState(true);
  const [userHotel, setUserHotel] = useState<any | null>(null);
  const [userHotelLoading, setUserHotelLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: Notification['type'] = 'info') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const setUser = (userData: any) => {
    setUserState(userData);
  };

  const fetchAppData = async () => {
    const [newsRes, eventsRes, hotelsRes, profilesRes, activitiesRes] = await Promise.all([
      supabase.from('news').select('*').order('date', { ascending: false }),
      supabase.from('events').select('*').order('date', { ascending: true }),
      supabase.from('hotels').select('*').order('hotel_name', { ascending: true }),
      supabase.from('profiles').select('*'),
      supabase.from('activities').select('*').order('created_at', { ascending: false }) // Added activities
    ]);

    if (newsRes.data) setNews(newsRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);

    if (hotelsRes.data) {
      setHotels(hotelsRes.data);
      // For public visibility, we only consider approved hotels as "members" in the directory
      const approvedHotels = hotelsRes.data.filter((h: any) => h.status === 'approved');
      setMembers(approvedHotels);
    } else if (hotelsRes.error) {
      console.error('Error fetching hotels:', hotelsRes.error);
    }

    if (profilesRes.data) setProfiles(profilesRes.data);
    if (activitiesRes.data) setActivities(activitiesRes.data);

    // Update userHotel if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && hotelsRes.data) {
      const myHotel = hotelsRes.data.find((h: any) => h.user_id === session.user.id || h.email === session.user.email);
      setUserHotel(myHotel || null);
    }
  };

  const refreshData = async () => {
    try {
      await fetchAppData();
    } catch (error: any) {
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.warn('Data refresh aborted (likely due to rapid navigation).');
      } else {
        console.error('Error refreshing data:', error);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const initApp = async () => {
      try {
        setLoading(true);

        // 1. Initial session check
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!mounted) return;

          if (profileData) {
            setProfile(profileData);
            setUserState({
              ...session.user,
              name: profileData.name,
              role: profileData.role,
              password_changed: profileData.password_changed
            });
          } else {
            setUserState(session.user);
          }
        }

        // 2. Set up Auth Listener
        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          if (session?.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!mounted) return;

            if (profileData) {
              setProfile(profileData);
              setUserState({
                ...session.user,
                name: profileData.name,
                role: profileData.role,
                password_changed: profileData.password_changed
              });
            } else {
              setUserState(session.user);
              setProfile(null);
            }

            // Also fetch user specific hotel
            setUserHotelLoading(true);
            const { data: hotelData } = await supabase
              .from('hotels')
              .select('*')
              .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
              .maybeSingle();

            if (!mounted) return;
            setUserHotel(hotelData || null);
            setUserHotelLoading(false);
          } else {
            setUserState(null);
            setProfile(null);
            setUserHotel(null);
          }
        });

        subscription = authSub;

        // 3. Fetch collective data
        await fetchAppData();

      } catch (error: any) {
        if (mounted) {
          // Check for AbortError (often caused by browser extensions like QuillBot)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            // Silently ignore or warn - don't crash the app initialization
            console.warn('Network request aborted during app init (likely due to environment update or extension). Recovery should be automatic.');
          } else {
            console.error('Error initializing app:', error);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initApp();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        profile,
        hotels,
        members,
        profiles,
        news,
        events,
        activities,
        loading,
        userHotel,
        userHotelLoading,
        notification,
        showNotification,
        clearNotification,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
