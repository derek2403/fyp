import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { getContract } from "thirdweb";
import { motion } from "framer-motion";
import { 
  Star,
  Send,
  Calculator,
  TrendingUp
} from "lucide-react";
import Link from 'next/link';
import Header from '../../components/Header';
import toast from 'react-hot-toast';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";

// Create thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id",
});

export default function Review() {
  const router = useRouter();
  const account = useActiveAccount();
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
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [userData, setUserData] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const orderData = localStorage.getItem('completedOrder');
    if (orderData) {
      const orderObj = JSON.parse(orderData);
      setOrder(orderObj);
      
      // Only fetch data if account is available
      if (account?.address) {
        fetchUserAndRestaurantData(orderObj);
      }
    }
  }, [account?.address]); // Add dependency on account address

  const fetchUserAndRestaurantData = async (orderObj) => {
    console.log('Debug - fetchUserAndRestaurantData called');
    console.log('account?.address:', account?.address);
    console.log('orderObj.restaurantId:', orderObj.restaurantId);
    
    setDataLoading(true);
    
    try {
      // Fetch user data
      if (account?.address) {
        console.log('Fetching user data...');
        const userResponse = await fetch(`/api/users?address=${account.address}`);
        console.log('User response status:', userResponse.status);
        if (userResponse.ok) {
          const user = await userResponse.json();
          console.log('User data received:', user);
          setUserData(user);
        } else {
          console.error('Failed to fetch user data:', userResponse.status);
        }
      } else {
        console.error('No wallet address available');
      }

      // Fetch restaurant data
      if (orderObj.restaurantId) {
        console.log('Fetching restaurant data...');
        const restaurantResponse = await fetch(`/api/restaurants/${orderObj.restaurantId}`);
        console.log('Restaurant response status:', restaurantResponse.status);
        if (restaurantResponse.ok) {
          const restaurant = await restaurantResponse.json();
          console.log('Restaurant data received:', restaurant);
          setRestaurantData(restaurant);
        } else {
          console.error('Failed to fetch restaurant data:', restaurantResponse.status);
        }
      } else {
        console.error('No restaurant ID available');
      }
    } catch (error) {
      console.error('Error fetching user/restaurant data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRatingChange = (category, value) => {
    setReview(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const calculateConfidenceScore = async () => {
    // Debug logging
    console.log('Debug - calculateConfidenceScore called');
    console.log('review.review:', review.review);
    console.log('review.rating:', review.rating);
    console.log('order:', order);
    console.log('userData:', userData);
    console.log('restaurantData:', restaurantData);
    
    if (!review.review.trim() || !review.rating) {
      toast.error('Please complete the review text and rating');
      return;
    }
    
    if (!order) {
      toast.error('Order data not found');
      return;
    }
    
    if (!userData) {
      toast.error('User data not loaded. Please wait...');
      return;
    }
    
    if (!restaurantData) {
      toast.error('Restaurant data not loaded. Please wait...');
      return;
    }

    setCalculatingScore(true);
    
    try {
      const response = await fetch('/api/reviews/calculate-confidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewData: review,
          orderData: order,
          userData: userData,
          restaurantData: restaurantData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setConfidenceScore(result.confidenceScore);
        toast.success(`Confidence Score: ${result.confidenceScore}/100`);
        console.log('Confidence breakdown:', result.breakdown);
      } else {
        throw new Error('Failed to calculate confidence score');
      }
    } catch (error) {
      console.error('Error calculating confidence score:', error);
      toast.error('Failed to calculate confidence score');
    } finally {
      setCalculatingScore(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order || !account) return;
    
    setLoading(true);

    try {
      // Get the contract instance
      const contract = getContract({
        client,
        chain: baseSepolia,
        address: CONTRACT_ADDRESS,
      });

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
        confidenceScore: confidenceScore || 85,
        createdAt: new Date().toISOString(),
        foodQuality: review.foodQuality,
        service: review.service,
        atmosphere: review.atmosphere,
        value: review.value,
        orderId: order.orderId || `order_${Date.now()}`,
        orderTotal: Math.floor(order.total * 100), // Convert to wei-like format
        updatedAt: new Date().toISOString()
      };

      // Prepare the contract call
      const transaction = prepareContractCall({
        contract,
        method: "function addReview((string id, string userId, string merchantId, string username, string restaurantName, uint8 rating, string reviewText, string date, uint256 upvotes, uint256 downvotes, uint256 confidenceScore, string createdAt, uint8 foodQuality, uint8 service, uint8 atmosphere, uint8 value, string orderId, uint256 orderTotal, string updatedAt) data)",
        params: [reviewInput],
      });

      toast.success('Review submitted! Waiting for confirmation...');
      
      // Send and confirm the transaction
      const receipt = await sendAndConfirmTransaction({
        transaction,
        account,
      });
      
      toast.success('Review submitted successfully to blockchain!');
      console.log('Review submitted to blockchain:', receipt.transactionHash);
      
      // Clear completed order
      localStorage.removeItem('completedOrder');
      
      setTimeout(() => {
        router.push('/users/menu');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction was rejected by user');
      } else {
        toast.error(`Failed to submit review: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };


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
      <Header title="Back to Restaurants" backUrl="/users/menu" />

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

                {/* Confidence Score Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Review Confidence Score</h3>
                    {confidenceScore !== null && (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-lg font-bold text-green-600">{confidenceScore}/100</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Data Loading Status */}
                  {dataLoading && (
                    <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      Loading user and restaurant data...
                    </div>
                  )}
                  
                  {/* Missing Data Warning */}
                  {!dataLoading && (!userData || !restaurantData) && (
                    <div className="mb-3 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                      {!userData && !restaurantData && "Loading user and restaurant data..."}
                      {!userData && restaurantData && "Loading user data..."}
                      {userData && !restaurantData && "Loading restaurant data..."}
                      <button
                        type="button"
                        onClick={() => order && fetchUserAndRestaurantData(order)}
                        className="ml-2 text-blue-600 underline hover:text-blue-800"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={calculateConfidenceScore}
                    disabled={calculatingScore || !review.review.trim() || !review.rating || !userData || !restaurantData}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {calculatingScore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4" />
                        <span>Calculate Confidence Score</span>
                      </>
                    )}
                  </button>
                  
                  {confidenceScore !== null && (
                    <div className="text-xs text-gray-600 mt-2">
                      <p className="font-medium mb-1">AI Confidence Analysis:</p>
                      <div className="space-y-1">
                        <p>• <span className="font-medium">Core (100 pts):</span> Context matching (60%) + Detail level (40%)</p>
                        <p>• <span className="font-medium">Bonus:</span> Spending patterns + Preferences + Rating consistency</p>
                      </div>
                    </div>
                  )}
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