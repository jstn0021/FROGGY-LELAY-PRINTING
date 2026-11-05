import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Headline from '../components/Headline.jsx';
import { DEFAULT_COVER, fetchCover } from '../lib/cover.js';
import { supabase } from '../lib/supabase.js';

export default function CoverPanel() {
  const [form, setForm] = useState(DEFAULT_COVER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    let alive = true;
    fetchCover().then((c) => {
      if (alive) {
        setForm(c);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setFact = (i, field) => (e) =>
    setForm((f) => ({
      ...f,
      facts: f.facts.map((x, idx) => (idx === i ? { ...x, [field]: e.target.value } : x)),
    }));

  const highlightMissing = form.highlight && !form.headline.includes(form.highlight);

  async function save(e) {
    e.preventDefault();
    if (!form.headline.trim()) {
      setMsg({ type: 'error', text: 'The headline cannot be empty.' });
      return;
    }
    setSaving(true);
    setMsg({ type: '', text: '' });
    const value = {
      eyebrow: form.eyebrow.trim(),
      headline: form.headline.trim(),
      highlight: form.highlight.trim(),
      subtext: form.subtext.trim(),
      banner_on: Boolean(form.banner_on),
      banner_text: form.banner_text.trim(),
      facts: form.facts.map((f) => ({ title: f.title.trim(), text: f.text.trim() })),
    };
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'cover', value, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) setMsg({ type: 'error', text: error.message });
    else setMsg({ type: 'ok', text: 'Saved. The home page now shows your changes.' });
  }

  if (loading) return <p className="help">Loading…</p>;

  return (
    <form className="cover-grid" onSubmit={save}>
      <div className="card form">
        <h2 className="panel-title">Cover page</h2>

        <div className="field">
          <label htmlFor="c-eyebrow">Small label above the headline</label>
          <input id="c-eyebrow" maxLength={80} value={form.eyebrow} onChange={set('eyebrow')} />
        </div>
        <div className="field">
          <label htmlFor="c-headline">Headline</label>
          <input id="c-headline" maxLength={120} value={form.headline} onChange={set('headline')} />
        </div>
        <div className="field">
          <label htmlFor="c-highlight">Highlighted words (shown in pink)</label>
          <input id="c-highlight" maxLength={60} value={form.highlight} onChange={set('highlight')} />
          {highlightMissing ? (
            <span className="help warn-text">These words are not in the headline, so nothing will be highlighted.</span>
          ) : (
            <span className="help">Must match part of the headline exactly. Leave empty for none.</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="c-sub">Description under the headline</label>
          <textarea id="c-sub" maxLength={300} value={form.subtext} onChange={set('subtext')} />
        </div>

        <h3 className="sub-title">New offer banner</h3>
        <label className="check-line" htmlFor="c-banner-on">
          <input id="c-banner-on" type="checkbox" checked={Boolean(form.banner_on)} onChange={(e) => setForm((f) => ({ ...f, banner_on: e.target.checked }))} />
          Show a banner at the top of the home page
        </label>
        <div className="field">
          <label htmlFor="c-banner">Banner text</label>
          <input id="c-banner" maxLength={140} placeholder="Example: Mura ang A4 glossy this week, ₱30 lang!" value={form.banner_text} onChange={set('banner_text')} />
        </div>

        <h3 className="sub-title">Three highlight boxes</h3>
        {form.facts.map((f, i) => (
          <div className="form-grid" key={i}>
            <div className="field">
              <label htmlFor={`f-t-${i}`}>Box {i + 1} title</label>
              <input id={`f-t-${i}`} maxLength={40} value={f.title} onChange={setFact(i, 'title')} />
            </div>
            <div className="field">
              <label htmlFor={`f-x-${i}`}>Box {i + 1} text</label>
              <input id={`f-x-${i}`} maxLength={80} value={f.text} onChange={setFact(i, 'text')} />
            </div>
          </div>
        ))}

        {msg.text ? <p className={`notice ${msg.type === 'error' ? 'error' : 'okmsg'}`} role="status">{msg.text}</p> : null}

        <div className="actions">
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button className="btn" type="button" onClick={() => setForm(DEFAULT_COVER)}>
            Reset to default text
          </button>
          <Link className="btn" to="/" target="_blank" rel="noopener noreferrer">
            Open home page
          </Link>
        </div>
      </div>

      <aside className="card preview" aria-label="Preview">
        <p className="eyebrow">Preview</p>
        {form.banner_on && form.banner_text ? (
          <div className="banner small">
            <span className="banner-tag">New</span>
            <span>{form.banner_text}</span>
          </div>
        ) : null}
        <div className="hero mini">
          <p className="eyebrow">{form.eyebrow}</p>
          <h1>
            <Headline text={form.headline} highlight={form.highlight} />
          </h1>
          <p className="lede">{form.subtext}</p>
        </div>
        <div className="facts mini">
          {form.facts.map((f, i) => (
            <p key={i}>
              <b>{f.title}</b>
              {f.text}
            </p>
          ))}
        </div>
      </aside>
    </form>
  );
}
