import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useActiveAccount } from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";
import { prepareTransaction, sendAndConfirmTransaction, createThirdwebClient } from "thirdweb";
import { toWei } from "thirdweb/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  CreditCard,
  CheckCircle,
  ShoppingCart,
  User,
  AlertCircle
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

// Exchange rate: 1 USD = 0.00026 ETH
const USD_TO_ETH_RATE = 0.00026;

// Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id",
});

export default function Checkout() {
  const router = useRouter();
  const account = useActiveAccount();
  const address = account?.address;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [ethAmount, setEthAmount] = useState(0);

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
    
    const orderObj = JSON.parse(orderData);
    setOrder(orderObj);
    
    // Calculate ETH equivalent
    const ethEquivalent = orderObj.total * USD_TO_ETH_RATE;
    setEthAmount(ethEquivalent);
  }, [address, router]);

  const handlePayment = async () => {
    if (!order || !account) {
      toast.error('No connected wallet. Please connect first.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare native transfer on Base Sepolia per Thirdweb v5 docs
      const transaction = prepareTransaction({
        to: "0xf1a7b4b4B16fc24650D3dC96d5112b5c1F309092",
        value: toWei(ethAmount.toFixed(6)),
        chain: baseSepolia,
        client,
      });

      const receipt = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      const txHash = receipt.transactionHash;
      toast.success('Payment successful!');
      
      // Get user data
      const userResponse = await fetch(`/api/users?address=${address}`);
      const userData = await userResponse.json();
      
      // Store order in localStorage for review page with all required data
      localStorage.setItem('completedOrder', JSON.stringify({
        ...order,
        userId: userData.id,
        merchantId: order.restaurantId,
        username: userData.username,
        orderId: `order_${Date.now()}`,
        paymentMethod,
        paymentStatus: 'completed',
        paymentDate: new Date().toISOString(),
        transactionHash: txHash,
        ethAmount: ethAmount,
        gasUsed: '0',
        gasPrice: '0'
      }));
      
      // Clear current order
      localStorage.removeItem('currentOrder');
      
      setTimeout(() => {
        router.push('/users/review');
      }, 800);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatEthAmount = (amount) => {
    return parseFloat(amount).toFixed(6);
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
      <div className="min-h-screen bg-gray-50 flex items_center justify-center">
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
              <h2 className="text-xl font-bold text_gray-900 mb-4">Order Summary</h2>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{order.restaurantName}</h3>
                <p className="text-sm text-gray-600">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify_between items-center py-2 border-b border-gray-100">
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
                  <span className="text-lg font-bold text_gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text_gray-900 mb-4">Payment Method</h2>
              
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
                    <span className="font-medium">Crypto Payment (ETH)</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="fiat"
                    checked={paymentMethod === 'fiat'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                    disabled
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
              <h2 className="text-xl font-bold text_gray-900 mb-4">Payment Details</h2>
              
              {paymentMethod === 'crypto' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">ETH Payment</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Pay with ETH on Base Sepolia testnet.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify_between">
                        <span className="text_gray-600">USD Amount:</span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify_between">
                        <span className="text_gray-600">Exchange Rate:</span>
                        <span className="font-medium">1 USD = {USD_TO_ETH_RATE} ETH</span>
                      </div>
                      <div className="flex justify_between">
                        <span className="text_gray-600">ETH Amount:</span>
                        <span className="font-medium font-mono">{formatEthAmount(ethAmount)} ETH</span>
                      </div>
                      <div className="flex justify_between">
                        <span className="text_gray-600">Wallet:</span>
                        <span className="font-mono text-xs">{address}</span>
                      </div>
                      <div className="flex justify_between">
                        <span className="text_gray-600">Network:</span>
                        <span className="font-medium">Base Sepolia</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Ensure you have sufficient ETH in your wallet</li>
                          <li>• Gas fees will be added to the total amount</li>
                          <li>• Payment is processed on Base Sepolia testnet</li>
                          <li>• Orders are non-refundable</li>
                          <li>• You'll need to sign the transaction in your wallet</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text_gray-900 mb-2">Fiat Payment</h3>
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
                    <span>Pay {formatEthAmount(ethAmount)} ETH</span>
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