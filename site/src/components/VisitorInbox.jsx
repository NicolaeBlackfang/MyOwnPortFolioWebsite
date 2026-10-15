import { useCallback, useEffect, useState } from 'react';
import { ensureVisitorSession, getVisitorMessages, sendVisitorMessage, supabase } from '../lib/supabase.js';

export default function VisitorInbox() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Loading your private inbox…');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async senderId => {
    const rows = await getVisitorMessages(senderId);
    setMessages(rows);
    setStatus(rows.length ? '' : 'Your inbox is ready. Send a message using the form above to start a private conversation.');
  }, []);

  useEffect(() => {
    let active = true;
    let channel;
    (async () => {
      try {
        if (!supabase) throw new Error('Supabase is not configured.');
        const session = await ensureVisitorSession();
        if (!active) return;
        await refresh(session.user.id);
        channel = supabase.channel(`visitor-inbox-${session.user.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages', filter: `sender_id=eq.${session.user.id}` }, () => refresh(session.user.id))
          .subscribe();
      } catch (cause) {
        console.error(cause);
        if (active) {
          setError('The private inbox could not connect. Check that anonymous sign-ins are enabled in Supabase.');
          setStatus('');
        }
      }
    })();
    return () => { active = false; if (channel) supabase?.removeChannel(channel); };
  }, [refresh]);

  const send = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = form.elements.message.value.trim();
    if (!message) return;
    setSending(true);
    setError('');
    try {
      await sendVisitorMessage(message);
      form.reset();
      const session = await ensureVisitorSession();
      await refresh(session.user.id);
    } catch (cause) {
      console.error(cause);
      setError(cause.message?.toLowerCase().includes('too many messages')
        ? 'You’re sending messages too quickly. Please wait a few minutes and try again.'
        : cause.message?.toLowerCase().includes('daily message limit')
          ? 'You have reached today’s message limit. Please try again later.'
          : 'Could not send the message. Check the Supabase configuration and access policies.');
    } finally {
      setSending(false);
    }
  };

  return <section className="inbox-section" aria-labelledby="inboxTitle">
    <div className="section-head inbox-section-head"><div><span className="kicker">Private conversation</span><h2 id="inboxTitle">Your inbox.</h2></div><p className="lead">Only this browser’s visitor account and the site admin can read this conversation.</p></div>
    <div className="card">
      <div className="inbox-transcript visitor-inbox" aria-live="polite">{messages.map(message => <article className={`inbox-message ${message.sender_type === 'admin' ? 'from-admin' : 'from-visitor'}`} key={message.id}><small>{message.sender_type === 'admin' ? 'Nicolae' : 'You'} · {new Date(message.created_at).toLocaleString()}</small><p>{message.message}</p></article>)}{status && <p className="muted">{status}</p>}</div>
      <form className="inbox-reply" onSubmit={send}><textarea name="message" rows="3" maxLength="5000" required aria-label="Message in your private inbox" placeholder="Send a follow-up message…" /><button className="btn primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send to inbox'}</button></form>
      {error && <div className="status error" role="alert">{error}</div>}
    </div>
  </section>;
}
