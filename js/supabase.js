(function () {
  const cfg = window.CHUBUT_SUPABASE || {};
  const configured = Boolean(cfg.url && cfg.anonKey && !cfg.url.includes('YOUR_PROJECT') && !cfg.anonKey.includes('YOUR_SUPABASE'));
  let client = null;

  if (configured && window.supabase?.createClient) {
    client = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  async function currentUserId() {
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data?.user?.id || null;
  }

  const api = {
    configured,
    client,
    async loadHomeContent() {
      if (!client) return null;
      const { data, error } = await client.from('site_content').select('payload,updated_at').eq('slug', 'home').maybeSingle();
      if (error) throw error;
      if (!data?.payload || Object.keys(data.payload).length === 0) return null;
      return data.payload;
    },
    async saveHomeContent(payload, note = 'Manual save') {
      if (!client) throw new Error('Supabase is not configured');
      const updated_by = await currentUserId();
      const { error } = await client.from('site_content').upsert({ slug: 'home', payload, updated_by }, { onConflict: 'slug' });
      if (error) throw error;
      const { error: revisionError } = await client.from('content_revisions').insert({ slug: 'home', payload, note, created_by: updated_by });
      if (revisionError && revisionError.code !== '42P01') console.warn(revisionError);
    },
    async listRevisions(limit = 30) {
      if (!client) return [];
      const { data, error } = await client.from('content_revisions').select('id,slug,note,created_at,created_by').eq('slug', 'home').order('created_at', { ascending: false }).limit(limit);
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return data || [];
    },
    async getRevision(id) {
      if (!client) throw new Error('Supabase is not configured');
      const { data, error } = await client.from('content_revisions').select('payload').eq('id', id).single();
      if (error) throw error;
      return data.payload;
    },
    async saveLead(lead) {
      if (!client) throw new Error('Supabase is not configured');
      const { error } = await client.from('trip_leads').insert(lead);
      if (error) throw error;
    },
    async listLeads(limit = 100) {
      if (!client) return [];
      const { data, error } = await client.from('trip_leads').select('*').order('created_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data || [];
    },
    async uploadMedia(file) {
      if (!client) throw new Error('Supabase is not configured');
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'asset';
      const path = `site/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${base}.${ext}`;
      const { error } = await client.storage.from('chubut-media').upload(path, file, { upsert: false, cacheControl: '3600', contentType: file.type || undefined });
      if (error) throw error;
      const { data } = client.storage.from('chubut-media').getPublicUrl(path);
      const url = data.publicUrl;
      const created_by = await currentUserId();
      const record = { name: file.name, path, url, mime_type: file.type || null, size_bytes: file.size || null, created_by };
      const { data: saved, error: dbError } = await client.from('media_assets').insert(record).select().single();
      if (dbError && dbError.code !== '42P01') throw dbError;
      return saved || record;
    },
    async listMedia(limit = 250) {
      if (!client) return [];
      const { data, error } = await client.from('media_assets').select('*').order('created_at', { ascending: false }).limit(limit);
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return data || [];
    },
    async deleteMedia(asset) {
      if (!client) throw new Error('Supabase is not configured');
      if (asset?.path) {
        const { error } = await client.storage.from('chubut-media').remove([asset.path]);
        if (error) throw error;
      }
      if (asset?.id) {
        const { error } = await client.from('media_assets').delete().eq('id', asset.id);
        if (error && error.code !== '42P01') throw error;
      }
    }
  };

  window.ChubutDB = api;
})();
