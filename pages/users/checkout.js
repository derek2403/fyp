import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAddress } from "@thirdweb-dev/react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  CreditCard,
  CheckCircle,
  ShoppingCart,
  User
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Checkout() {
  const router = useRouter();
  const address = useAddress();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('crypto');

  useEffect(() => {
    if (!address) {
      router.push('/users/login');
      return;
    }
    
    const orderData = localStorage.getItem('currentOrder');
    if (!orderData) {
      router.push('/users/menu');
      return;
    }
    
    setOrder(JSON.parse(orderData));
  }, [address, router]);

  const handlePayment = async () => {
    if (!order) return;
    
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store order in localStorage for review page
      localStorage.setItem('completedOrder', JSON.stringify({
        ...order,
        paymentMethod,
        paymentStatus: 'completed',
        paymentDate: new Date().toISOString()
      }));
      
      // Clear current order
      localStorage.removeItem('currentOrder');
      
      toast.success('Payment successful! Redirecting to review...');
      
      setTimeout(() => {
        router.push('/users/review');
      }, 1500);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to proceed with checkout.</p>
          <Link href="/users/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Order Found</h2>
          <p className="text-gray-600 mb-6">Please add items to your cart first.</p>
          <Link href="/users/menu" className="btn-primary">
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/users/menu" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">Back to Restaurants</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/users/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <User className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <span className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order and payment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{order.restaurantName}</h3>
                <p className="text-sm text-gray-600">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="crypto"
                    checked={paymentMethod === 'crypto'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Crypto Payment</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="fiat"
                    checked={paymentMethod === 'fiat'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Fiat Payment (Coming Soon)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
              
              {paymentMethod === 'crypto' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Crypto Payment</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Pay with your connected wallet using cryptocurrency.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wallet:</span>
                        <span className="font-mono text-xs">{address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Network:</span>
                        <span className="font-medium">Polygon (Mumbai)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Ensure you have sufficient funds in your wallet</li>
                      <li>• Transaction fees may apply</li>
                      <li>• Payment is processed on the blockchain</li>
                      <li>• Orders are non-refundable</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Fiat Payment</h3>
                  <p className="text-sm text-gray-600">
                    Traditional payment methods will be available soon. For now, please use crypto payment.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handlePayment}
                disabled={loading || paymentMethod === 'fiat'}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
              
              <Link
                href="/users/menu"
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                Cancel Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 