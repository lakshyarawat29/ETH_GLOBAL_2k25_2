import React, { useEffect, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

const ConnectWalletButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useAccount();

  // Track previous connection state to detect first transition to connected
  const prevConnectedRef = useRef<boolean>(isConnected);
  // Ensure we only redirect once after a connect action
  const hasRedirectedRef = useRef<boolean>(false);

  useEffect(() => {
    const justConnected = !prevConnectedRef.current && isConnected;

    // Only redirect when the user has just connected, and only from specific routes
    // to avoid forcing navigation when browsing the app (e.g., from navbar)
    const shouldRedirectFromPath = location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/setup';

    if (justConnected && shouldRedirectFromPath && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      navigate('/profile');
    }

    // Update previous state reference
    prevConnectedRef.current = isConnected;
  }, [isConnected, location.pathname, navigate]);

  return (
    <ConnectButton
      showBalance={false}
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
      
    />
  );
};

export default ConnectWalletButton;
