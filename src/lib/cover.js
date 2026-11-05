import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

// What the home page shows until the admin edits it (or if Supabase is not connected).
export const DEFAULT_COVER = {
  eyebrow: 'Lelay Store · Ink & Crafts',
  headline: 'Print na malinaw. Kahit last minute.',
  highlight: 'malinaw.',
  subtext:
    'Photocopy, printing, E-Gov ID at glossy photo prints. Fill out the order form and we will email you when it is ready for pickup.',
  banner_on: false,
  banner_text: '',
  facts: [
    { title: '₱3 lang', text: 'B&W photocopy, short or A4' },
    { title: '₱5', text: 'E-Gov ID print & resize' },
    { title: 'A4 glossy', text: 'Certificates, photos, passport IDs' },
  ],
};

function merge(stored) {
  const value = stored && typeof stored === 'object' ? stored : {};
  const facts = Array.isArray(value.facts) ? value.facts : [];
  return {
    ...DEFAULT_COVER,
    ...value,
    facts: DEFAULT_COVER.facts.map((f, i) => ({ ...f, ...(facts[i] || {}) })),
  };
}

export async function fetchCover() {
  if (!supabase) return DEFAULT_COVER;
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'cover')
    .maybeSingle();
  if (error || !data) return DEFAULT_COVER;
  return merge(data.value);
}

export function useCover() {
  const [cover, setCover] = useState(DEFAULT_COVER);
  useEffect(() => {
    let alive = true;
    fetchCover().then((c) => alive && setCover(c));
    return () => {
      alive = false;
    };
  }, []);
  return cover;
}
