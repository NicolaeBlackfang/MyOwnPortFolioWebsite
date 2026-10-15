import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Link, Navigate, RouterProvider } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.jsx';
import VisualEffects from './components/VisualEffects.jsx';
import '../styles/styles.css';
import './styles/react-app.css';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const SkillsPage = lazy(() => import('./pages/SkillsPage.jsx'));
const MinecraftPage = lazy(() => import('./pages/MinecraftPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

function Page({ component: Component }) {
  return <Suspense fallback={<div className="section route-loading" role="status"><span className="loading-spinner" aria-hidden="true" /> Loading page…</div>}><Component /></Suspense>;
}

function NotFoundPage() {
  return <section className="section"><div className="container card"><span className="kicker">404 / Lost signal</span><h1>That page is not here.</h1><p className="lead">Head back to the home page and choose another path.</p><Link className="btn primary" to="/">Back home ↗</Link></div></section>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <><VisualEffects /><SiteLayout /></>,
    children: [
      { index: true, element: <Page component={HomePage} /> },
      { path: 'skills', element: <Page component={SkillsPage} /> },
      { path: 'minecraft', element: <Page component={MinecraftPage} /> },
      { path: 'contact', element: <Page component={ContactPage} /> },
      { path: 'admin/*', element: <Page component={AdminPage} /> },
      { path: 'skills.html', element: <Navigate to="/skills" replace /> },
      { path: 'minecraft.html', element: <Navigate to="/minecraft" replace /> },
      { path: 'contact.html', element: <Navigate to="/contact" replace /> },
      { path: 'admin.html', element: <Navigate to="/admin" replace /> },
      { path: 'inspect-error', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function AppRoot() {
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><AppRoot /></React.StrictMode>);
