import { createContext, useContext, useState, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";

// Create the wallet context
const WalletContext = createContext();

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Wallet provider component
export const WalletProvider = ({ children }) => {
  const account = useActiveAccount();
  const [walletData, setWalletData] = useState({
    address: null,
    isConnected: false,
    userData: null
  });

  useEffect(() => {
    if (account?.address) {
      // Update wallet data when account changes
      setWalletData(prev => ({
        ...prev,
        address: account.address,
        isConnected: true
      }));

      // Try to get user data from localStorage or API
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        // Only use stored data if it matches the current address
        if (userData.address === account.address) {
          setWalletData(prev => ({
            ...prev,
            userData
          }));
        } else {
          // Clear old data and fetch new data for current address
          localStorage.removeItem('userData');
          fetchUserData(account.address);
        }
      } else {
        // Fetch user data from API
        fetchUserData(account.address);
      }
    } else {
      // Reset wallet data when disconnected
      setWalletData({
        address: null,
        isConnected: false,
        userData: null
      });
      // Clear stored data when disconnected
      localStorage.removeItem('userData');
    }
  }, [account]);

  const fetchUserData = async (address) => {
    try {
      const response = await fetch(`/api/users?address=${address}`);
      if (response.ok) {
        const userData = await response.json();
        setWalletData(prev => ({
          ...prev,
          userData
        }));
        // Store in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateUserData = (userData) => {
    setWalletData(prev => ({
      ...prev,
      userData
    }));
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const clearWalletData = () => {
    setWalletData({
      address: null,
      isConnected: false,
      userData: null
    });
    localStorage.removeItem('userData');
  };

  const value = {
    ...walletData,
    updateUserData,
    clearWalletData,
    fetchUserData
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};