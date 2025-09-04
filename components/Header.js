import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useActiveAccount } from "thirdweb/react";
import { useAddress } from "@thirdweb-dev/react";
import { ArrowLeft, User } from "lucide-react";
import Link from 'next/link';

const Header = ({ title = "Back to Restaurants", backUrl = "/users/menu", showDashboard = true }) => {
  const router = useRouter();
  const accountV5 = useActiveAccount();
  const addressV4 = useAddress();
  const [userData, setUserData] = useState(null);
  
  // Use whichever wallet connection is available
  const address = accountV5?.address || addressV4;
  const isConnected = !!(accountV5?.address || addressV4);

  useEffect(() => {
    if (address) {
      // Try to get user data from localStorage first
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.address === address) {
          setUserData(userData);
          return;
        }
      }
      
      // Fetch user data from API
      fetchUserData(address);
    } else {
      setUserData(null);
      localStorage.removeItem('userData');
    }
  }, [address]);

  const fetchUserData = async (walletAddress) => {
    try {
      const response = await fetch(`/api/users?address=${walletAddress}`);
      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          address: walletAddress
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={backUrl} className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">{title}</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {showDashboard && (
              <Link href="/users/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <User className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            )}
            
            {isConnected && address ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                {userData && (
                  <span className="text-sm text-gray-500">
                    ({userData.username})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-400">Not Connected</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;