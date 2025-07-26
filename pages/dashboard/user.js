import { useState, useEffect } from 'react';
import { useAddress } from "@thirdweb-dev/react";
import { motion } from "framer-motion";
import { 
  Star, 
  Award, 
  TrendingUp, 
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Heart,
  Search,
  Filter
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

// Mock user data - in real app, this would come from your backend
const mockUserData = {
  username: "FoodLover123",
  email: "foodlover@example.com",
  location: "Singapore",
  preferences: ["italian", "japanese", "thai"],
  dietaryRestriction: "none",
  spiceLevel: "medium",
  budget: "moderate",
  totalReviews: 47,
  averageRating: 4.2,
  reliabilityScore: 85,
  nftBadges: [
    { id: 1, name: "Review Master", icon: "🏆", description: "Posted 50+ reviews" },
    { id: 2, name: "Spice Lover", icon: "🌶️", description: "Consistent spicy food reviews" },
    { id: 3, name: "Authentic Reviewer", icon: "✅", description: "High reliability score" }
  ],
  recentReviews: [
    {
      id: 1,
      restaurantName: "Pizza Palace",
      rating: 4,
      review: "Amazing authentic Italian pizza! The crust was perfectly crispy and the toppings were fresh.",
      date: "2024-01-15",
      upvotes: 12,
      downvotes: 2,
      confidenceScore: 92
    },
    {
      id: 2,
      restaurantName: "Sushi Master",
      rating: 5,
      review: "Best sushi I've ever had! Fresh fish and creative rolls. Highly recommend the dragon roll.",
      date: "2024-01-10",
      upvotes: 8,
      downvotes: 1,
      confidenceScore: 88
    },
    {
      id: 3,
      restaurantName: "Thai Delight",
      rating: 4,
      review: "Authentic Thai flavors with perfect balance of sweet, sour, and spicy. The pad thai was exceptional!",
      date: "2024-01-08",
      upvotes: 15,
      downvotes: 0,
      confidenceScore: 95
    }
  ],
  recommendedRestaurants: [
    {
      id: 1,
      name: "Italian Villa",
      cuisine: "Italian",
      rating: 4.5,
      distance: "0.8km",
      priceRange: "$$",
      image: "🍝"
    },
    {
      id: 2,
      name: "Sakura Sushi",
      cuisine: "Japanese",
      rating: 4.3,
      distance: "1.2km",
      priceRange: "$$$",
      image: "🍣"
    },
    {
      id: 3,
      name: "Spice Garden",
      cuisine: "Thai",
      rating: 4.1,
      distance: "1.5km",
      priceRange: "$$",
      image: "🍜"
    }
  ]
};

export default function UserDashboard() {
  const address = useAddress();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(mockUserData);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, you would fetch user data based on the connected wallet
    if (address) {
      // Simulate API call to fetch user data
      setData(mockUserData);
    }
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to access your dashboard.</p>
          <Link href="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalReviews}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{data.averageRating}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reliability Score</p>
              <p className="text-2xl font-bold text-gray-900">{data.reliabilityScore}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NFT Badges</p>
              <p className="text-2xl font-bold text-gray-900">{data.nftBadges.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* NFT Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your NFT Badges</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {data.nftBadges.map((badge) => (
            <div key={badge.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommended Restaurants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
          <Link href="/restaurants" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {data.recommendedRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">{restaurant.image}</div>
                <div className="text-sm text-gray-500">{restaurant.distance}</div>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{restaurant.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium ml-1">{restaurant.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{restaurant.priceRange}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
          <Link href="/reviews" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {data.recentReviews.map((review) => (
            <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{review.restaurantName}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Confidence Score</div>
                  <div className="text-lg font-semibold text-green-600">{review.confidenceScore}%</div>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{review.review}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{review.upvotes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">{review.downvotes}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const ReviewsTab = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">All Reviews</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>
      <p className="text-gray-600">Review management interface coming soon...</p>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
      <p className="text-gray-600">Analytics dashboard coming soon...</p>
    </div>
  );

  const SettingsTab = () => (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
      <p className="text-gray-600">Settings page coming soon...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">FoodChain</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {data.username}!
          </h1>
          <p className="text-gray-600">
            Track your reviews, badges, and food journey.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'reviews', name: 'Reviews', icon: MessageSquare },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp },
                { id: 'settings', name: 'Settings', icon: Edit }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'reviews' && <ReviewsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
} 