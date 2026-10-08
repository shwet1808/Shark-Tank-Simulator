import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PitchPage from './pages/PitchPage';
import TankPage from './pages/TankPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pitch" element={<PitchPage />} />
      <Route path="/tank/:sessionId" element={<TankPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
