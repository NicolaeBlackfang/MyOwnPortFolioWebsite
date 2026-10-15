export default function AdminNotificationToast({ message, onClose }) {
  if (!message) return null;
  return <aside className="admin-toast" role="alert" aria-live="assertive">
    <span className="admin-toast-icon" aria-hidden="true">✦</span>
    <div><strong>New inbox message</strong><p>{message}</p></div>
    <button type="button" onClick={onClose} aria-label="Dismiss notification">×</button>
  </aside>;
}
