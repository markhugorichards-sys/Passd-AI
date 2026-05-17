// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getLearnerProfile, getInstructorProfile } from './supabase.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session,     setSession]     = useState(undefined);
  const [learnerUser, setLearnerUser] = useState(null);
  const [instUser,    setInstUser]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  const loadProfile = async (session) => {
    if (!session?.user) {
      setLearnerUser(null);
      setInstUser(null);
      setLoading(false);
      return;
    }

    const role = session.user.user_metadata?.role;
    const uid  = session.user.id;

    if (role === 'instructor') {
      const profile = await getInstructorProfile(uid);
      if (profile) {
        setInstUser({
          ...profile,
          id:       profile.id,
          name:     `${profile.first_name} ${profile.last_name}`.trim(),
          email:    profile.email,
          area:     profile.base_postcode,
          post:     profile.base_postcode,
          rate:     profile.price_per_hour,
          passRate: profile.pass_rate_pct,
          verified: profile.dvsa_verified,
          dvsaRef:  profile.adi_pdi_number,
          bio:      profile.bio,
          tier:     profile.is_featured ? 'Premium' : 'Free',
          avail:    profile.listing_status === 'active' ? 'Available' : 'Pending',
          support: [
            profile.specialism_adhd            && 'ADHD Friendly',
            profile.specialism_autism          && 'Autism Friendly',
            profile.specialism_anxiety         && 'Anxious Drivers',
            profile.specialism_bsl_deaf        && 'BSL / Deaf Support',
            profile.specialism_adapted_vehicle && 'Adapted Vehicle',
          ].filter(Boolean),
          tx: [
            profile.transmission_type === 'manual'    && 'Manual',
            profile.transmission_type === 'automatic' && 'Automatic',
            profile.transmission_type === 'both'      && 'Manual',
            profile.transmission_type === 'both'      && 'Automatic',
          ].filter(Boolean),
          rating:  4.8,
          reviews: 0,
          rviews:  [],
          history: [],
          avatar:  profile.photo_url || `https://i.pravatar.cc/200?u=${uid}`,
          yrs:     profile.years_experience || 0,
          gender:  'Any',
          quals:   profile.adi_pdi_type ? [profile.adi_pdi_type] : ['ADI'],
          types:   ['Standard'],
          dist:    0,
        });
        setLearnerUser(null);
      }
    } else {
      const profile = await getLearnerProfile(uid);
      if (profile) {
        setLearnerUser({
          id:       profile.id,
          name:     profile.name,
          email:    profile.email,
          postcode: profile.postcode,
          emailVerified: session.user.email_confirmed_at != null,
        });
      } else {
        setLearnerUser({
          id:       uid,
          name:     session.user.user_metadata?.name || session.user.email,
          email:    session.user.email,
          postcode: '',
          emailVerified: session.user.email_confirmed_at != null,
        });
      }
      setInstUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    learnerUser,
    instUser,
    loading,
    isLoggedIn:   !!(learnerUser || instUser),
    isInstructor: !!instUser,
    isLearner:    !!learnerUser,
    setLearnerUser,
    setInstUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
