import { createClient } from '@supabase/supabase-js';
import config from '../config.js';

export const supabase = config.supabaseUrl && config.supabaseAnonKey && !config.supabaseAnonKey.includes('replace-with-your')
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const isSupabaseConfigured = Boolean(supabase);

export async function ensureVisitorSession() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (session) return session;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function getVisitorMessages(senderId) {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id,sender_id,sender_type,name,email,message,created_at')
    .eq('sender_id', senderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendVisitorMessage(message) {
  const session = await ensureVisitorSession();
  const { error } = await supabase.from('contact_messages').insert({
    sender_id: session.user.id,
    sender_type: 'visitor',
    message: message.trim(),
  });
  if (error) throw error;
}

export async function sendContactMessage(payload) {
  const session = await ensureVisitorSession();
  const senderType = session.user.email?.trim().toLowerCase() === config.adminEmail.trim().toLowerCase()
    ? 'admin'
    : 'visitor';
  const { error } = await supabase.from('contact_messages').insert({
    ...payload,
    sender_id: session.user.id,
    sender_type: senderType,
  });
  if (error) throw error;
}

export async function getAdminMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id,sender_id,sender_type,name,email,message,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function replyToConversation(senderId, message) {
  const { error } = await supabase.from('contact_messages').insert({
    sender_id: senderId,
    sender_type: 'admin',
    message: message.trim(),
  });
  if (error) throw error;
}

export async function deleteConversation(senderId) {
  const { error } = await supabase.from('contact_messages').delete().eq('sender_id', senderId);
  if (error) throw error;
}
