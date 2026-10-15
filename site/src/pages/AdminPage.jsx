import { useCallback, useEffect, useRef, useState } from 'react';
import AdminNotificationToast from '../components/AdminNotificationToast.jsx';
import config from '../config.js';
import { deleteConversation, getAdminMessages, replyToConversation, supabase } from '../lib/supabase.js';

function makeChime(context) {
  const now = context.currentTime;
  [880, 1174].forEach((frequency, index) => {
    const start = now + index * 0.19;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(0.17, start + 0.025);
    volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.25);
  });
}

function groupConversations(messages) {
  const conversations = new Map();
  messages.forEach(message => {
    const id = message.sender_id || `legacy-${message.id}`;
    if (!conversations.has(id)) conversations.set(id, []);
    conversations.get(id).push(message);
  });
  return [...conversations.entries()].map(([senderId, thread]) => ({
    senderId,
    isLegacy: senderId.startsWith('legacy-'),
    messages: thread.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
  }));
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState(config.adminEmail);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ text: '', type: '' });
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setStatus({ text: 'Authenticating…', type: '' });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (data.user?.email?.trim().toLowerCase() !== config.adminEmail.trim().toLowerCase()) {
        await supabase.auth.signOut();
        throw new Error('This account is not the configured admin account.');
      }
      onLogin(data.session);
    } catch (error) {
      console.error(error);
      setStatus({ text: 'Authentication failed. Check the email and password for the configured admin account.', type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return <div className="card reveal"><form className="form" style={{ maxWidth: 520 }} onSubmit={submit}>
    <div className="field"><label htmlFor="admin-email">Admin email</label><input id="admin-email" type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} /></div>
    <div className="field"><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></div>
    <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Authenticate'}</button>
    {status.text && <div className={`status ${status.type}`} role="status">{status.text}</div>}
  </form></div>;
}

function Conversation({ conversation, onRefresh, onError }) {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const first = conversation.messages.find(message => message.sender_type === 'visitor') || conversation.messages[0];

  const sendReply = async event => {
    event.preventDefault();
    if (!reply.trim() || conversation.isLegacy) return;
    setBusy(true);
    try {
      await replyToConversation(conversation.senderId, reply);
      setReply('');
      await onRefresh();
    } catch (error) {
      console.error(error);
      onError('Could not send the reply. Check the Supabase INSERT policy for admin replies.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this entire conversation?')) return;
    setBusy(true);
    try {
      if (conversation.isLegacy) {
        const { error } = await supabase.from('contact_messages').delete().eq('id', first.id);
        if (error) throw error;
      } else await deleteConversation(conversation.senderId);
      await onRefresh();
    } catch (error) {
      console.error(error);
      onError('Could not delete this conversation. Check the Supabase DELETE policy.');
    } finally {
      setBusy(false);
    }
  };

  return <article className="card inbox-thread">
    <div className="inbox-thread-head"><div><h3>{first.name || 'Visitor'}</h3>{first.email ? <a className="muted" href={`mailto:${first.email}`}>{first.email}</a> : <span className="muted">Anonymous visitor</span>}</div><button className="btn inbox-delete" type="button" onClick={remove} disabled={busy}>Delete chat</button></div>
    <div className="inbox-transcript">{conversation.messages.map(message => <div className={`inbox-message ${message.sender_type === 'admin' ? 'from-admin' : 'from-visitor'}`} key={message.id}><small>{message.sender_type === 'admin' ? 'You' : message.name || 'Visitor'} · {new Date(message.created_at).toLocaleString()}</small><p>{message.message}</p></div>)}</div>
    {!conversation.isLegacy && <form className="inbox-reply" onSubmit={sendReply}><textarea rows="2" maxLength="5000" required aria-label={`Reply to ${first.name || 'visitor'}`} placeholder="Write a reply…" value={reply} onChange={event => setReply(event.target.value)} /><button className="btn primary" type="submit" disabled={busy || !reply.trim()}>{busy ? 'Sending…' : 'Send reply'}</button></form>}
  </article>;
}

function AdminDashboard({ onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ text: '', type: '' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('nb-admin-notifications') === 'on');
  const [toast, setToast] = useState(null);
  const audioContext = useRef(null);
  const toastTimer = useRef(null);

  const refreshMessages = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const rows = await getAdminMessages();
    setMessages(rows);
    return rows;
  }, []);

  const playSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContext.current) audioContext.current = new AudioContextClass();
      if (audioContext.current.state === 'running') makeChime(audioContext.current);
    } catch (error) {
      console.warn('Message sound could not play.', error);
    }
  }, []);

  const announce = useCallback(message => {
    setToast(message);
    playSound();
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 9000);
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notice = new Notification('New portfolio inbox message', { body: 'A visitor sent a message. Open the admin inbox to reply.' });
        notice.onclick = () => { window.focus(); notice.close(); };
      } catch (error) {
        console.warn('Desktop notification could not be displayed.', error);
      }
    }
  }, [playSound]);

  useEffect(() => {
    if (!notificationsEnabled) return undefined;
    const unlockAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioContext.current) audioContext.current = new AudioContextClass();
        await audioContext.current.resume();
        if (audioContext.current.state === 'running') {
          window.removeEventListener('pointerdown', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
        }
      } catch (error) {
        console.warn('Message sound could not be unlocked.', error);
      }
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [notificationsEnabled]);

  useEffect(() => {
    let active = true;
    let channel;
    (async () => {
      try {
        channel = supabase.channel('admin-inbox-notifications')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, payload => {
            if (payload.new?.sender_type === 'visitor' && notificationsEnabled) announce(payload.new.message || 'A visitor sent a message.');
            refreshMessages().catch(error => {
              console.error(error);
              setStatus({ text: 'You are authenticated, but the database query was denied. Check the SELECT RLS policy.', type: 'error' });
            });
          })
          .subscribe(realtimeStatus => {
            if (realtimeStatus === 'CHANNEL_ERROR' || realtimeStatus === 'TIMED_OUT') {
              setStatus({ text: 'Live inbox updates are unavailable. Check that contact_messages is enabled in Supabase Realtime.', type: 'error' });
            }
          });
        await refreshMessages();
        if (!active) return;
        setStatus({ text: '', type: '' });
      } catch (error) {
        console.error(error);
        if (active) setStatus({ text: 'You are authenticated, but the database query was denied. Check the SELECT RLS policy.', type: 'error' });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      window.clearTimeout(toastTimer.current);
      if (channel) supabase?.removeChannel(channel);
    };
  }, [announce, notificationsEnabled, refreshMessages]);

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('nb-admin-notifications', 'off');
      setStatus({ text: 'In-app, desktop and sound notifications are off.', type: '' });
      return;
    }
    let desktopStatus = '';
    let audioReady = Promise.resolve();
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        if (!audioContext.current) audioContext.current = new AudioContextClass();
        audioReady = audioContext.current.resume();
      }
    } catch (error) {
      console.warn('Message sound could not be enabled.', error);
    }
    if (!window.isSecureContext) {
      desktopStatus = ' Desktop alerts require HTTPS or localhost; the on-page popup and sound will still work.';
    } else if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch (error) { console.warn(error); }
    }
    if ('Notification' in window && Notification.permission === 'denied') {
      desktopStatus = ' Desktop alerts are blocked in browser settings; the on-page popup and sound will still work.';
    } else if (!('Notification' in window)) {
      desktopStatus = ' This browser does not support desktop alerts; the on-page popup and sound will still work.';
    }
    try {
      await audioReady;
      if (audioContext.current?.state === 'running') makeChime(audioContext.current); // Preview from the user's click.
    } catch (error) {
      console.warn('Message sound could not be enabled.', error);
      desktopStatus += ' This browser blocked sound playback.';
    }
    setNotificationsEnabled(true);
    localStorage.setItem('nb-admin-notifications', 'on');
    setStatus({ text: `Notifications are on.${desktopStatus}`, type: desktopStatus ? 'error' : 'success' });
    if (window.isSecureContext && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('Notifications enabled', { body: 'Desktop inbox alerts are ready.' }); } catch (error) { console.warn(error); }
    }
  };

  const conversations = groupConversations(messages);
  return <>
    <section className="section admin-shell"><div className="container">
      <div className="section-head reveal"><div><span className="kicker">05 / Admin</span><h2>Message<br />control room.</h2></div><p className="lead">Private conversations protected by Supabase Auth and Row Level Security.</p></div>
      <div className="admin-toolbar"><div><strong>Inbox</strong> <span className="muted">({conversations.length} conversations)</span></div><div className="admin-actions">
        <button className={`notification-toggle${notificationsEnabled ? ' enabled' : ''}`} type="button" aria-pressed={notificationsEnabled} onClick={toggleNotifications} title="Desktop alerts require browser permission. Sound plays after you enable it."><span className="notification-switch" aria-hidden="true"><span /></span><span className="notification-label">{notificationsEnabled ? 'Notifications on' : 'Notifications off'}</span></button>
        <button className="btn" type="button" onClick={onLogout}>Log out</button>
      </div></div>
      {status.text && <div className={`status ${status.type}`} role="status" aria-live="polite" style={{ marginTop: 12 }}>{status.text}</div>}
      {loading ? <div className="card inbox-loading"><span className="loading-spinner" aria-hidden="true" /> Loading your inbox…</div> : <div className="inbox-list" aria-live="polite">{conversations.length ? conversations.map(conversation => <Conversation key={conversation.senderId} conversation={conversation} onRefresh={refreshMessages} onError={text => setStatus({ text, type: 'error' })} />) : <div className="card muted">No conversations yet.</div>}</div>}
    </div></section>
    <AdminNotificationToast message={toast} onClose={() => setToast(null)} />
  </>;
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    if (!supabase) { setChecking(false); return undefined; }
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      if (!active) return;
      const current = data.session;
      if (current?.user?.email?.trim().toLowerCase() === config.adminEmail.trim().toLowerCase()) setSession(current);
      else if (current) supabase.auth.signOut();
    }).catch(error => console.error(error)).finally(() => { if (active) setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, current) => {
      if (current?.user?.email?.trim().toLowerCase() === config.adminEmail.trim().toLowerCase()) setSession(current);
      else setSession(null);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const logout = async () => { await supabase.auth.signOut(); setSession(null); };
  const content = !supabase ? <div className="notice">Supabase is not configured.</div> : checking ? <div className="card inbox-loading"><span className="loading-spinner" aria-hidden="true" /> Checking admin session…</div> : session ? <AdminDashboard key={session.user.id} onLogout={logout} /> : <AdminLogin onLogin={setSession} />;
  return session ? content : <section className="section admin-shell"><div className="container"><div className="section-head reveal"><div><span className="kicker">05 / Admin</span><h2>Message<br />control room.</h2></div><p className="lead">This private inbox uses Supabase Auth and database access policies.</p></div>{content}</div></section>;
}
