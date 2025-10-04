import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PlayBoard from './pages/PlayBoard';
import Recommendations from './pages/Recommendations';
import Shop from './pages/Shop';
import FindPros from './pages/FindPros';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="playboard" element={<PlayBoard />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="shop" element={<Shop />} />
          <Route path="find-pros" element={<FindPros />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
