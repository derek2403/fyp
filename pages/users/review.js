import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAddress } from "@thirdweb-dev/react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Star,
  Send,
  User,
  CheckCircle
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Review() {
  const router = useRouter();
  const address = useAddress();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState({
    rating: 5,
    review: '',
    foodQuality: 5,
    service: 5,
    atmosphere: 5,
    value: 5
  });

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

  const handleSubmit = async () => {
    if (!order || !review.review.trim()) {
      toast.error('Please write a review before submitting');
      return;
    }

    setLoading(true);

    try {
      // Get user data
      const userResponse = await fetch(`/api/users?address=${address}`);
      const userData = await userResponse.json();

      const reviewData = {
        userId: userData.id,
        merchantId: order.restaurantId,
        username: userData.username,
        restaurantName: order.restaurantName,
        rating: review.rating,
        review: review.review,
        foodQuality: review.foodQuality,
        service: review.service,
        atmosphere: review.atmosphere,
        value: review.value,
        orderId: order.orderId || `order_${Date.now()}`,
        orderTotal: order.total,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        // Clear completed order
        localStorage.removeItem('completedOrder');
        
        toast.success('Review submitted successfully!');
        
        setTimeout(() => {
          router.push('/users/menu');
        }, 2000);
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to write a review.</p>
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
          <p className="text-gray-600 mb-6">Please complete a purchase to write a review.</p>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{order.restaurantName}</h3>
                <p className="text-sm text-gray-600">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Payment: {order.paymentMethod === 'crypto' ? 'Crypto' : 'Fiat'}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1">
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
                  <span className="text-xl font-bold text-green-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Payment Successful</h3>
              </div>
              <p className="text-sm text-green-800">
                Your order has been completed successfully. Now share your experience to help other customers!
              </p>
            </div>
          </div>

          {/* Review Form */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Review</h2>
              
              {/* Overall Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange('rating', star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {review.rating} out of 5
                  </span>
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-gray-900">Rate by Category</h3>
                
                {[
                  { key: 'foodQuality', label: 'Food Quality' },
                  { key: 'service', label: 'Service' },
                  { key: 'atmosphere', label: 'Atmosphere' },
                  { key: 'value', label: 'Value for Money' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(key, star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= review[key]
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {review[key]} out of 5
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={review.review}
                  onChange={(e) => setReview(prev => ({ ...prev, review: e.target.value }))}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with this restaurant. What did you like? What could be improved?"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {review.review.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !review.review.trim()}
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
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Review Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be honest and constructive in your feedback</li>
                <li>• Focus on your personal experience</li>
                <li>• Avoid offensive or inappropriate language</li>
                <li>• Your review helps other customers make informed decisions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 