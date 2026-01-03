import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VictimDashboard from './pages/VictimDashboard';
import DonorDashboard from './pages/DonorDashboard';
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<VictimDashboard />} />
          <Route path="/donor" element={<DonorDashboard />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
