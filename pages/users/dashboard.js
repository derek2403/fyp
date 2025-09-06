import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";
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
  Filter,
  User,
  Shield
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";

// Create thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id",
});

export default function UserDashboard() {
  const router = useRouter();
  const account = useActiveAccount();
  const address = account?.address;
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [averageConfidenceScore, setAverageConfidenceScore] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Get contract instance
  const contract = getContract({
    client,
    chain: baseSepolia,
    address: CONTRACT_ADDRESS,
  });

  useEffect(() => {
    if (!address) {
      router.push('/users/login');
      return;
    }
    fetchUserData();
  }, [address, router]);

  const fetchUserData = async () => {
    try {
      // Fetch user data from API
      const userResponse = await fetch(`/api/users?address=${address}`);
      const user = await userResponse.json();
      setUserData(user);

      // Fetch all reviews from blockchain
      await fetchUserReviewsFromBlockchain();
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviewsFromBlockchain = async () => {
    setLoading(true);
    try {
      // Get all reviews from smart contract
      const allReviews = await readContract({
        contract,
        method: "function getAllReviews() view returns ((string id, string userId, string merchantId, string username, string restaurantName, uint8 rating, string reviewText, string date, uint256 upvotes, uint256 downvotes, uint256 confidenceScore, string createdAt, uint8 foodQuality, uint8 service, uint8 atmosphere, uint8 value, string orderId, uint256 orderTotal, string updatedAt)[])",
        params: [],
      });

      // Filter reviews for current user by wallet address
      const userReviews = allReviews.filter(review => 
        review.userId.toLowerCase() === address.toLowerCase() ||
        review.username.toLowerCase() === (userData?.username || '').toLowerCase()
      );

      // Convert blockchain data to readable format
      const formattedReviews = userReviews.map(review => ({
        id: review.id,
        userId: review.userId,
        merchantId: review.merchantId,
        username: review.username,
        restaurantName: review.restaurantName,
        rating: Number(review.rating),
        review: review.reviewText,
        date: review.date,
        upvotes: Number(review.upvotes),
        downvotes: Number(review.downvotes),
        confidenceScore: Number(review.confidenceScore),
        createdAt: review.createdAt,
        foodQuality: Number(review.foodQuality),
        service: Number(review.service),
        atmosphere: Number(review.atmosphere),
        value: Number(review.value),
        orderId: review.orderId,
        orderTotal: Number(review.orderTotal),
        updatedAt: review.updatedAt
      }));

      setReviews(formattedReviews);
      setTotalReviews(formattedReviews.length);
      
      // Calculate average confidence score
      if (formattedReviews.length > 0) {
        const totalConfidence = formattedReviews.reduce((sum, review) => sum + review.confidenceScore, 0);
        const avgConfidence = totalConfidence / formattedReviews.length;
        setAverageConfidenceScore(Math.round(avgConfidence));
      } else {
        setAverageConfidenceScore(0);
      }

      toast.success(`Loaded ${formattedReviews.length} reviews from blockchain`);
    } catch (error) {
      console.error('Error fetching reviews from blockchain:', error);
      toast.error('Failed to load reviews from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
    return matchesSearch && matchesRating;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to access your dashboard.</p>
          <Link href="/users/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we fetch your data</p>
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
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">FoodChain</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/users/menu" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Eye className="w-5 h-5" />
                <span>Browse Restaurants</span>
              </Link>
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
            Welcome back, {userData?.username || 'User'}!
          </h1>
          <p className="text-gray-600">
            Track your reviews, badges, and food journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
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
                <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
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
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">{averageConfidenceScore}%</p>
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
                <p className="text-2xl font-bold text-gray-900">{userData?.nftBadges?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* NFT Badges */}
        {userData?.nftBadges && userData.nftBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your NFT Badges</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {userData.nftBadges.map((badge) => (
                <div key={badge.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Reviews</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchUserReviewsFromBlockchain}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
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
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Reviews...</h3>
              <p className="text-gray-600">Fetching your reviews from the blockchain</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-4">
                {reviews.length === 0 
                  ? "You haven't written any reviews yet. Start exploring restaurants and share your experiences!"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {reviews.length === 0 && (
                <Link href="/users/menu" className="btn-primary">
                  Browse Restaurants
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
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
                        <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Confidence Score</div>
                      <div className="text-lg font-semibold text-green-600">{review.confidenceScore}%</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{review.review}</p>
                  
                  {/* Detailed Ratings */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Food Quality:</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.foodQuality ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Service:</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.service ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Atmosphere:</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.atmosphere ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Value:</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{review.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">{review.downvotes || 0}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Order Total: ${(review.orderTotal / 100).toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 