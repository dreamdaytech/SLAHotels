
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface AppContextType {
    hotels: any[];
    members: any[];
    news: any[];
    events: any[];
    profiles: any[];
    activities: any[];
    loading: boolean;
    refreshData: () => Promise<void>;
    user: any;
    setUser: (user: any) => void;
    notification: Notification | null;
    showNotification: (message: string, type?: NotificationType) => void;
    clearNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hotels, setHotels] = useState<any[]>([]);
    const [news, setNews] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [notification, setNotification] = useState<Notification | null>(null);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotification({ id, message, type });

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setNotification(prev => prev?.id === id ? null : prev);
        }, 5000);
    }, []);

    const clearNotification = useCallback(() => setNotification(null), []);

    const members = React.useMemo(() => hotels.filter(h => h.status === 'approved'), [hotels]);

    const fetchAllData = useCallback(async () => {
        try {
            // Fetch concurrently for performance
            const [
                { data: hotelsData },
                { data: newsData },
                { data: eventsData },
                { data: profilesData },
                { data: activitiesData }
            ] = await Promise.all([
                supabase.from('hotels').select('*').order('created_at', { ascending: false }),
                supabase.from('news').select('*').eq('status', 'Published').order('date', { ascending: false }),
                supabase.from('events').select('*').eq('status', 'Published'),
                supabase.from('profiles').select('*'),
                supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(20)
            ]);

            if (hotelsData) setHotels(hotelsData);
            if (newsData) setNews(newsData);
            if (eventsData) setEvents(eventsData);
            if (profilesData) setProfiles(profilesData);
            if (activitiesData) setActivities(activitiesData);
        } catch (err) {
            console.error('Error fetching global data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();

        // Set up auth listener here to have it in one place
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                // Fetch detailed profile for the session user
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUser({
                        ...session.user,
                        name: profile.name,
                        role: profile.role,
                        password_changed: profile.password_changed
                    });
                } else {
                    setUser(session.user);
                }
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchAllData]);

    return (
        <AppContext.Provider value={{
            hotels,
            members,
            news,
            events,
            profiles,
            activities,
            loading,
            refreshData: fetchAllData,
            user,
            setUser,
            notification,
            showNotification,
            clearNotification
        }}>
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
