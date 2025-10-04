import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import PlayBoard from './pages/PlayBoard';
import Recommendations from './pages/Recommendations';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/onboarding" replace />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="playboard" element={<PlayBoard />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
