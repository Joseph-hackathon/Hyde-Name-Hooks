import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import VerifyPage from './pages/VerifyPage';
import PoolsPage from './pages/PoolsPage';
import { WalletProvider } from './contexts/WalletContext';
import { config } from './config/wagmi';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <Router>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="app" element={<AppPage />} />
                <Route path="verify" element={<VerifyPage />} />
                <Route path="pools" element={<PoolsPage />} />
              </Route>
            </Routes>
          </Router>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
