import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PitchPage from './pages/PitchPage';
import TankPage from './pages/TankPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  const location = useLocation();
  const isTankPage = location.pathname.startsWith('/tank/');

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-200 font-sans selection:bg-orange-500/30"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {!isTankPage && <Navbar />}
      <main className={isTankPage ? "flex-1 w-full h-full" : "flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 pb-20"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pitch" element={<PitchPage />} />
          <Route path="/tank/:sessionId" element={<TankPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isTankPage && <Footer />}
    </div>
  );
}
