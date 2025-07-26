import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAddress } from "@thirdweb-dev/react";

export default function Dashboard() {
  const router = useRouter();
  const address = useAddress();

  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }
    const userType = localStorage.getItem('userType') || 'user';
    
    if (userType === 'merchant') {
      router.push('/dashboard/merchant');
    } else {
      router.push('/dashboard/user');
    }
  }, [address, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
        <p className="text-gray-600">Redirecting you to your dashboard</p>
      </div>
    </div>
  );
} 