import { useState } from 'react';
import VisitorInbox from '../components/VisitorInbox.jsx';
import { isSupabaseConfigured, sendContactMessage } from '../lib/supabase.js';

export default function ContactPage() {
  const [status, setStatus] = useState({ text: '', type: '' });
  const [sending, setSending] = useState(false);

  const submit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
    };
    setSending(true);
    setStatus({ text: 'Sending…', type: '' });
    try {
      await sendContactMessage(payload);
      form.reset();
      setStatus({ text: 'Message sent successfully.', type: 'success' });
    } catch (error) {
      console.error(error);
      const message = String(error.message || '').toLowerCase();
      setStatus({
        text: message.includes('daily message limit')
          ? 'You have reached today’s message limit. Please try again later.'
          : message.includes('too many messages')
            ? 'You’re sending messages too quickly. Please wait a few minutes and try again.'
            : 'Could not send the message. Check the Supabase configuration and access policies.',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return <section className="section"><div className="container">
    <div className="section-head reveal"><div><span className="kicker">04 / Contact</span><h2>Have an idea?<br />Send the signal.</h2></div><p className="lead">Messages are stored in Supabase through a Row Level Security protected table.</p></div>
    {!isSupabaseConfigured && <div className="notice">Add the Supabase URL and public anon key in your local environment before sending messages.</div>}
    <div className="grid grid-2">
      <div className="card reveal"><form className="form" style={{ maxWidth: 520 }} onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" required minLength="2" maxLength="100" autoComplete="name" /></div>
        <div className="field"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" required maxLength="254" autoComplete="email" /></div>
        <div className="field"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" required minLength="5" maxLength="5000" /></div>
        <button className="btn primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send Message ↗'}</button>
        {status.text && <div className={`status ${status.type}`} role="status" aria-live="polite">{status.text}</div>}
      </form></div>
      <aside className="card reveal"><span className="kicker">Before you send</span><h3>Keep it clear.</h3><p className="muted">Tell me what you are building, what you need help with, and any useful constraints. The form validates input in the browser and Supabase RLS protects database permissions.</p><div className="tags"><span className="tag">Frontend</span><span className="tag">Minecraft</span><span className="tag">AI</span><span className="tag">Backend</span></div></aside>
    </div>
    <VisitorInbox />
  </div></section>;
}
