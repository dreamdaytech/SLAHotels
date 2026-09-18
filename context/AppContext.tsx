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
  members: any[];
  profiles: any[];
  news: any[];
  events: any[];
  activities: any[];
  promotions: any[];
  loading: boolean;
  notification: Notification | null;
  showNotification: (message: string, type: Notification['type']) => void;
  clearNotification: () => void;
  refreshData: () => Promise<void>;
  userHotel: any | null;
  userHotelLoading: boolean;
  newApplicationCount: number;
  clearNewApplicationCount: () => void;
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
  const [activities, setActivities] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHotel, setUserHotel] = useState<any | null>(null);
  const [userHotelLoading, setUserHotelLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [newApplicationCount, setNewApplicationCount] = useState(0);

  const clearNewApplicationCount = () => setNewApplicationCount(0);

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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuthenticated = !!session?.user;

      // Resolve the current user's database role only when signed in.
      // This is used to avoid requesting admin-only datasets from public/member sessions.
      let isAdmin = false;
      if (session?.user) {
        const { data: roleProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        isAdmin = roleProfile?.role === 'admin' || roleProfile?.role === 'super-admin';
      }

      // Public visitors only request public-facing rows. Authenticated sessions continue
      // to rely on RLS for their role-specific visibility.
      let newsQuery = supabase.from('news').select('*').order('date', { ascending: false });
      let eventsQuery = supabase.from('events').select('*').order('date', { ascending: true });
      let hotelsQuery = supabase.from('hotels').select('*').order('hotel_name', { ascending: true });
      let promotionsQuery = supabase.from('promotions').select('*').order('created_at', { ascending: false });

      if (!isAuthenticated) {
        newsQuery = newsQuery.eq('status', 'Published');
        eventsQuery = eventsQuery.eq('status', 'Published');
        hotelsQuery = hotelsQuery.eq('status', 'approved');
        promotionsQuery = promotionsQuery.eq('status', 'Active');
      }

      // Fetching sequentially to prevent Supabase lock contention (AbortError)
      const newsRes = await newsQuery;
      const eventsRes = await eventsQuery;
      const hotelsRes = await hotelsQuery;
      const promotionsRes = await promotionsQuery;

      // Profiles and activity logs are administrative datasets and should not even be
      // requested by anonymous visitors or ordinary members.
      const profilesRes = isAdmin
        ? await supabase.from('profiles').select('*')
        : { data: [] as any[], error: null };
      const activitiesRes = isAdmin
        ? await supabase.from('activities').select('*').order('created_at', { ascending: false })
        : { data: [] as any[], error: null };

      if (newsRes.data) setNews(newsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);

      if (hotelsRes.data) {
        setHotels(hotelsRes.data);
        // For public visibility, we only consider approved hotels as "members" in the directory
        const approvedHotels = hotelsRes.data.filter((h: any) => h.status === 'approved');
        setMembers(approvedHotels);
      } else if (hotelsRes.error) {
        console.warn('Warning fetching hotels:', hotelsRes.error);
      }

      setProfiles(profilesRes.data || []);
      setActivities(activitiesRes.data || []);
      if (promotionsRes.data) setPromotions(promotionsRes.data);

      // Update userHotel if user is logged in
      if (session?.user && hotelsRes.data) {
        const myHotel = hotelsRes.data.find((h: any) => h.user_id === session.user.id || h.email === session.user.email);
        setUserHotel(myHotel || null);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.warn('Network request aborted during app data fetch. Recovery should be automatic.');
      } else {
        console.error('Error fetching app data:', err);
      }
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
        // IMPORTANT: Do not await Supabase queries directly inside onAuthStateChange.
        // Returning immediately prevents signInWithPassword() from being blocked by
        // downstream profile/hotel queries, which previously left users on /login
        // until a full page refresh rehydrated the session.
        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;

          // Reflect the authenticated session immediately so route guards can render.
          if (session?.user) {
            setUserState(prev => ({
              ...session.user,
              name: prev?.name ?? session.user.user_metadata?.name,
              role: prev?.role ?? session.user.user_metadata?.role ?? 'member',
              password_changed: prev?.password_changed ?? session.user.user_metadata?.password_changed
            }));
          } else {
            setUserState(null);
            setProfile(null);
            setUserHotel(null);
            setUserHotelLoading(false);
          }

          // Defer database work until after the auth event callback has returned.
          setTimeout(() => {
            void (async () => {
              if (!mounted) return;

              if (session?.user) {
                setUserHotelLoading(true);

                const [profileRes, hotelRes] = await Promise.all([
                  supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single(),
                  supabase
                    .from('hotels')
                    .select('*')
                    .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
                    .maybeSingle()
                ]);

                if (!mounted) return;

                const profileData = profileRes.data;
                if (profileData) {
                  setProfile(profileData);
                  setUserState({
                    ...session.user,
                    name: profileData.name,
                    role: profileData.role,
                    password_changed: profileData.password_changed
                  });
                } else {
                  setProfile(null);
                }

                setUserHotel(hotelRes.data || null);
                setUserHotelLoading(false);

                // Refresh role-scoped app data after the authenticated JWT is active.
                await fetchAppData();
              } else {
                await fetchAppData();
              }
            })().catch((error) => {
              if (!mounted) return;
              setUserHotelLoading(false);
              console.error('Error processing auth state change:', error);
            });
          }, 0);
        });

        subscription = authSub;

        // 3. Fetch initial public data (runs as anon before auth listener fires)
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

    // ── Supabase Realtime: auto-refresh when hotels table changes ──────────
    const hotelChannel = supabase
      .channel('hotels-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hotels' },
        (payload) => {
          // A new hotel application just came in
          if (payload.new?.status === 'pending') {
            setNewApplicationCount(prev => prev + 1);
          }
          fetchAppData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'hotels' },
        () => { fetchAppData(); }
      )
      .subscribe();

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
      supabase.removeChannel(hotelChannel);
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
        promotions,
        loading,
        userHotel,
        userHotelLoading,
        notification,
        showNotification,
        clearNotification,
        refreshData,
        newApplicationCount,
        clearNewApplicationCount,
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
