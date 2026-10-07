import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LMSProvider } from './context/LMSContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ValuePacks from './pages/ValuePacks';
import Checkout from './pages/Checkout';
import StudentDashboard from './pages/StudentDashboard';
import CoursePlayer from './pages/CoursePlayer';
import CertificateVerify from './pages/CertificateVerify';
import AboutFounder from './pages/AboutFounder';
import FAQPage from './pages/FAQPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';

// Error Boundary — catches React runtime crashes and shows the error on screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('THYNK LMS Runtime Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: 'white', padding: '32px', fontFamily: 'monospace' }}>
          <div style={{ maxWidth: '820px', width: '100%' }}>
            <div style={{ background: '#DC2626', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
              ⚠️ THYNK LMS — Runtime Error Caught
            </div>
            <div style={{ background: '#1E293B', padding: '20px', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ color: '#F87171', fontWeight: 'bold', marginBottom: '8px' }}>Error Message:</p>
              <p style={{ color: '#FCD34D', wordBreak: 'break-all' }}>{this.state.error?.message}</p>
            </div>
            {this.state.error?.stack && (
              <div style={{ background: '#1E293B', padding: '20px', borderRadius: '8px', marginBottom: '16px', overflow: 'auto', maxHeight: '300px' }}>
                <p style={{ color: '#94A3B8', fontWeight: 'bold', marginBottom: '8px' }}>Stack Trace:</p>
                <pre style={{ color: '#CBD5E1', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
              </div>
            )}
            {this.state.info?.componentStack && (
              <div style={{ background: '#1E293B', padding: '20px', borderRadius: '8px', marginBottom: '16px', overflow: 'auto', maxHeight: '200px' }}>
                <p style={{ color: '#94A3B8', fontWeight: 'bold', marginBottom: '8px' }}>Component Stack:</p>
                <pre style={{ color: '#CBD5E1', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{this.state.info.componentStack}</pre>
              </div>
            )}
            <button
              onClick={() => { this.setState({ hasError: false, error: null, info: null }); window.location.reload(); }}
              style={{ marginTop: '8px', background: '#2563EB', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              🔄 Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Layout() {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith('/player');
  const isAuthPage = location.pathname.startsWith('/auth');

  return (
    <div className="flex flex-col min-h-screen">
      {!isPlayer && !isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/value-packs" element={<ValuePacks />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/player/:id" element={<CoursePlayer />} />
          <Route path="/verify-certificate" element={<CertificateVerify />} />
          <Route path="/about" element={<AboutFounder />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
      {!isPlayer && !isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <LMSProvider>
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        </LMSProvider>
      </Router>
    </ErrorBoundary>
  );
}
