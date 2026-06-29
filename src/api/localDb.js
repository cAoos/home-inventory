import { supabase } from './supabase';

// Supabase rejects empty strings for date/numeric columns — convert to null
const sanitize = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v])
  );

export function createStore(tableName) {
  return {
    list: async (filters = {}) => {
      let query = supabase.from(tableName).select('*').order('created_date', { ascending: false });
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query = query.eq(key, val);
        }
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    get: async (id) => {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },

    create: async (item) => {
      const { data, error } = await supabase.from(tableName).insert(sanitize(item)).select().single();
      if (error) throw error;
      return data;
    },

    update: async (id, item) => {
      const { data, error } = await supabase.from(tableName).update(sanitize(item)).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    },

    filter: async (filterFn) => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return (data || []).filter(filterFn);
    },
  };
}
