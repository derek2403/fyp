import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAddress, useSDK } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Star,
  Send,
  User
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "components": [
          {"internalType": "string", "name": "id", "type": "string"},
          {"internalType": "string", "name": "userId", "type": "string"},
          {"internalType": "string", "name": "merchantId", "type": "string"},
          {"internalType": "string", "name": "username", "type": "string"},
          {"internalType": "string", "name": "restaurantName", "type": "string"},
          {"internalType": "uint8", "name": "rating", "type": "uint8"},
          {"internalType": "string", "name": "reviewText", "type": "string"},
          {"internalType": "string", "name": "date", "type": "string"},
          {"internalType": "uint256", "name": "upvotes", "type": "uint256"},
          {"internalType": "uint256", "name": "downvotes", "type": "uint256"},
          {"internalType": "uint256", "name": "confidenceScore", "type": "uint256"},
          {"internalType": "string", "name": "createdAt", "type": "string"},
          {"internalType": "uint8", "name": "foodQuality", "type": "uint8"},
          {"internalType": "uint8", "name": "service", "type": "uint8"},
          {"internalType": "uint8", "name": "atmosphere", "type": "uint8"},
          {"internalType": "uint8", "name": "value", "type": "uint8"},
          {"internalType": "string", "name": "orderId", "type": "string"},
          {"internalType": "uint256", "name": "orderTotal", "type": "uint256"},
          {"internalType": "string", "name": "updatedAt", "type": "string"}
        ],
        "internalType": "struct ReviewContract.ReviewInput",
        "name": "data",
        "type": "tuple"
      }
    ],
    "name": "addReview",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function Review() {
  const router = useRouter();
  const address = useAddress();
  const sdk = useSDK();
  const [order, setOrder] = useState(null);
  const [review, setReview] = useState({
    rating: 0,
    review: '',
    foodQuality: 0,
    service: 0,
    atmosphere: 0,
    value: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      router.push('/users/login');
      return;
    }
    
    const orderData = localStorage.getItem('completedOrder');
    if (!orderData) {
      router.push('/users/menu');
      return;
    }
    
    setOrder(JSON.parse(orderData));
  }, [address, router]);

  const handleRatingChange = (category, value) => {
    setReview(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order || !sdk) return;
    
    setLoading(true);

    try {
      // Get the signer from SDK
      const signer = await sdk.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Prepare review data for smart contract
      const reviewInput = {
        id: `review_${Date.now()}`,
        userId: order.userId || `user_${Date.now()}`,
        merchantId: order.merchantId || order.restaurantId || `restaurant_${Date.now()}`,
        username: order.username || "Anonymous",
        restaurantName: order.restaurantName,
        rating: review.rating,
        reviewText: review.review,
        date: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        confidenceScore: 85,
        createdAt: new Date().toISOString(),
        foodQuality: review.foodQuality,
        service: review.service,
        atmosphere: review.atmosphere,
        value: review.value,
        orderId: order.orderId || `order_${Date.now()}`,
        orderTotal: order.total,
        updatedAt: new Date().toISOString()
      };

      // Call smart contract to add review
      const tx = await contract.addReview(reviewInput);
      
      toast.success('Review submitted! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('Review submitted successfully to blockchain!');
        console.log('Review submitted to blockchain:', receipt.hash);
        
        // Clear completed order
        localStorage.removeItem('completedOrder');
        
        setTimeout(() => {
          router.push('/dashboard/user');
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.code === 4001) {
        toast.error('Transaction was rejected by user');
      } else {
        toast.error(`Failed to submit review: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to submit a review.</p>
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
          <p className="text-gray-600 mb-6">Please complete an order first.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
          <p className="text-gray-600">Share your experience with {order.restaurantName}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          </div>

          {/* Review Form */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Review</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange('rating', star)}
                        className={`p-1 rounded ${
                          review.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Ratings */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'foodQuality', label: 'Food Quality' },
                    { key: 'service', label: 'Service' },
                    { key: 'atmosphere', label: 'Atmosphere' },
                    { key: 'value', label: 'Value' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(key, star)}
                            className={`p-1 rounded ${
                              review[key] >= star ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={review.review}
                    onChange={(e) => setReview(prev => ({ ...prev, review: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !review.rating || !review.review.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 