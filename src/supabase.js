// src/supabase.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signUp = async (email, password) => {
  const { user, error } = await supabase.auth.signUp({ email, password });
  return { user, error };
};

export const signIn = async (email, password) => {
  const { user, error } = await supabase.auth.signIn({ email, password });
  return { user, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Data operations
export const fetchData = async (table) => {
  const { data, error } = await supabase.from(table).select('*');
  return { data, error };
};

export const createData = async (table, payload) => {
  const { data, error } = await supabase.from(table).insert(payload);
  return { data, error };
};

export const updateData = async (table, id, payload) => {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id);
  return { data, error };
};

export const deleteData = async (table, id) => {
  const { data, error } = await supabase.from(table).delete().eq('id', id);
  return { data, error };
};