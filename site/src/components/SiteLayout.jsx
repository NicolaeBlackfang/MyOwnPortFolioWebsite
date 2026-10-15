import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import config from '../config.js';
import logoMark from '../../assets/nb-mark.svg';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/skills', label: 'Skills' },
  { to: '/minecraft', label: 'Minecraft' },
  { to: '/contact', label: 'Contact' },
];

function SocialIcon({ name }) {
  const paths = {
    github: 'M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.62 1.21 3.26.93.1-.73.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.3-2.61 5.25-5.1 5.52.4.35.75 1.03.75 2.08V22c0 .29.2.63.77.52A11.1 11.1 0 0 0 12 .9',
    linkedin: 'M20.45 2H3.55C2.69 2 2 2.68 2 3.53v16.94c0 .85.69 1.53 1.55 1.53h16.9c.86 0 1.55-.68 1.55-1.53V3.53C22 2.68 21.31 2 20.45 2ZM8 18H5V9h3v9ZM6.5 7.77a1.74 1.74 0 1 1 0-3.48 1.74 1.74 0 0 1 0 3.48ZM19 18h-3v-4.37c0-1.04-.02-2.38-1.45-2.38-1.45 0-1.67 1.13-1.67 2.3V18h-3V9h2.88v1.23h.04a3.16 3.16 0 0 1 2.84-1.56c3.04 0 3.6 2 3.6 4.6V18Z',
    instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm5 2.3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2.2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm5.7-3.5a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z',
    email: 'M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.3l9 5.8 9-5.8V7H3Zm18 10V9.7l-8.46 5.46a1 1 0 0 1-1.08 0L3 9.7V17h18Z',
  };
  return <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('nb-theme') === 'light');
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('light', lightMode);
    localStorage.setItem('nb-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const updateScroll = () => document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 12);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" to="/" aria-label="Nicolae Blackfang home">
          <span className="brand-mark"><img src={logoMark} alt="" width="42" height="42" /></span>
          <span className="brand-copy"><strong>NICOLAE</strong><small>BLACKFANG <b>·</b> LIGHT / SHADOW</small></span>
        </Link>
        <button className={`nav-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
          <span className="nav-toggle-lines" aria-hidden="true"><i /><i /></span><span className="sr-only">Toggle navigation</span>
        </button>
        <nav id="primary-navigation" className={`nav-links${menuOpen ? ' open' : ''}`} aria-label="Primary navigation">
          {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span>{item.label}</span><i aria-hidden="true" /></NavLink>)}
          <button className="theme-toggle" type="button" aria-label={`Switch to ${lightMode ? 'dark' : 'light'} theme`} aria-pressed={lightMode} onClick={() => setLightMode(mode => !mode)}><span className="theme-toggle-icon" aria-hidden="true">◐</span><span>{lightMode ? 'Dark mode' : 'Light mode'}</span></button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const links = [
    ['github', config.socialLinks.github, 'GitHub'],
    ['linkedin', config.socialLinks.linkedin, 'LinkedIn'],
    ['instagram', config.socialLinks.instagram, 'Instagram'],
    ['email', `mailto:${config.contactEmail}`, 'Send an email'],
  ];
  return (
    <footer className="site-footer vibrant-footer nb-footer" id="site-footer">
      <div className="nb-footer-glow nb-footer-glow--angel" aria-hidden="true" />
      <div className="nb-footer-glow nb-footer-glow--devil" aria-hidden="true" />
      <div className="container nb-footer-inner">
        <div className="nb-footer-brand"><span className="nb-footer-eyebrow">NICOLAE BLACKFANG</span><h2 className="nb-footer-title">Vibe coding <span>the future.</span></h2><p className="nb-footer-description">Engineering ideas into interactive experiences — somewhere between the angel and the devil.</p></div>
        <div className="nb-footer-social"><span className="nb-footer-eyebrow">LET’S CONNECT</span><p>Find me across the digital world.</p><div className="nb-social-grid" aria-label="Social links">{links.map(([name, href, label]) => <a className={`nb-social-icon ${name}`} key={name} href={href} target={name === 'email' ? undefined : '_blank'} rel={name === 'email' ? undefined : 'noopener noreferrer'} aria-label={label}><SocialIcon name={name} /></a>)}</div></div>
      </div>
      <div className="container nb-footer-bottom"><p>© {new Date().getFullYear()} Nicolae Blackfang. All rights reserved.</p></div>
    </footer>
  );
}

export default function SiteLayout() {
  const location = useLocation();
  const admin = location.pathname.startsWith('/admin');
  useEffect(() => {
    document.title = location.pathname.startsWith('/admin') ? 'Admin | Nicolae Blackfang' : `${({ '/': 'Home', '/skills': 'Skills', '/minecraft': 'Minecraft', '/contact': 'Contact' })[location.pathname] || 'Nicolae Blackfang'} | Nicolae Blackfang`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);
  return <><SiteHeader /><main><Outlet /></main>{!admin && <SiteFooter />}</>;
}
