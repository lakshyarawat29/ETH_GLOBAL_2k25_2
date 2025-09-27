import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <WalletProvider>
      <Router>
        {/* Global toaster for notifications */}
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 9999 }}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              color: '#111827',
              border: '1px solid #F3F4F6',
              borderRadius: '12px',
              boxShadow:
                '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
            },
          }}
        />
        <ScrollToTop />
        <Routes>
          {/* Landing page outside of layout */}
          <Route path="/" element={<Landing />} />
          
          {/* All other routes use the layout */}
          <Route path="/" element={<Layout />}>
            <Route path="auth" element={<Auth />} />
            <Route path="setup" element={<Setup />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;