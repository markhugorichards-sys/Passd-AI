// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Passd-AI] Missing Supabase env vars.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const signUpLearner = async ({ name, email, password, postcode }) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { role: 'learner', name, postcode },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
  if (data.user) {
    const { error: pe } = await supabase.from('learner_profiles').insert({
      user_id: data.user.id, name, email, postcode,
      gdpr_consent: true, gdpr_consent_at: new Date().toISOString(),
    });
    if (pe) console.error('[Passd] learner_profiles insert:', pe);
  }
  return data;
};

export const signUpInstructor = async ({ name, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { role: 'instructor', name },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
  if (data.user) {
    const { error: ie } = await supabase.from('instructors').insert({
      user_id: data.user.id,
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' ') || '',
      email,
      listing_status: 'pending',
      listing_consent: true,
      listing_consent_at: new Date().toISOString(),
      terms_accepted_version: '1.0',
      terms_accepted_at: new Date().toISOString(),
    });
    if (ie) console.error('[Passd] instructors insert:', ie);
  }
  return data;
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getLearnerProfile = async (userId) => {
  const { data, error } = await supabase
    .from('learner_profiles').select('*').eq('user_id', userId).single();
  if (error) return null;
  return data;
};

export const getInstructorProfile = async (userId) => {
  const { data, error } = await supabase
    .from('instructors').select('*').eq('user_id', userId).single();
  if (error) return null;
  return data;
};

export const getInstructorsNear = async (lat, lng, radiusMiles = 15) => {
  const { data, error } = await supabase.rpc('instructors_near_location', {
    search_lat: lat, search_lng: lng, radius_miles: radiusMiles,
  });
  if (error) throw error;
  return data;
};

export const submitEnquiry = async ({ instructorId, learnerId, learnerName, learnerEmail, learnerPhone, learnerPostcode, message, gdprConsent }) => {
  const { data: conv, error: ce } = await supabase
    .from('conversations')
    .insert({ learner_id: learnerId, instructor_id: instructorId })
    .select().single();
  if (ce) throw ce;
  const { error: me } = await supabase.from('messages').insert({
    conversation_id: conv.id, sender_id: learnerId, sender_type: 'learner', body: message,
  });
  if (me) throw me;
  const { error: ee } = await supabase.from('learner_enquiries').insert({
    learner_name: learnerName, learner_email: learnerEmail,
    learner_phone: learnerPhone || null, learner_postcode: learnerPostcode,
    instructor_id: instructorId, message, conversation_id: conv.id,
    gdpr_consent_given: gdprConsent, gdpr_consent_at: new Date().toISOString(),
    gdpr_consent_ip: null, status: 'new',
  });
  if (ee) throw ee;
  return conv;
};

export const getInstructorConversations = async (instructorId) => {
  const { data, error } = await supabase.from('conversations')
    .select('*, learner_profiles ( name, email, postcode ), messages ( body, created_at, sender_type, read_at )')
    .eq('instructor_id', instructorId).order('last_message_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getLearnerConversations = async (learnerId) => {
  const { data, error } = await supabase.from('conversations')
    .select('*, instructors ( first_name, last_name, photo_url, base_postcode ), messages ( body, created_at, sender_type, read_at )')
    .eq('learner_id', learnerId).order('last_message_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getMessages = async (conversationId) => {
  const { data, error } = await supabase.from('messages')
    .select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const sendMessage = async ({ conversationId, senderId, senderType, body }) => {
  const { data, error } = await supabase.from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, sender_type: senderType, body })
    .select().single();
  if (error) throw error;
  await supabase.from('conversations')
    .update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
  return data;
};

export const markMessagesRead = async (conversationId, readerType) => {
  await supabase.from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_type', readerType).is('read_at', null);
};

export const subscribeToMessages = (conversationId, onMessage) => {
  return supabase.channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, payload => onMessage(payload.new)).subscribe();
};

export const updateInstructorProfile = async (userId, updates) => {
  const { error } = await supabase.from('instructors')
    .update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', userId);
  if (error) throw error;
};

export const getInstructorBilling = async (instructorId) => {
  const { data, error } = await supabase.from('instructor_billing')
    .select('*').eq('instructor_id', instructorId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
