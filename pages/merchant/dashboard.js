import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";
import { motion } from "framer-motion";
import { 
  Star, 
  Store, 
  TrendingUp, 
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Edit,
  MapPin,
  Phone,
  Globe,
  Clock,
  Plus,
  DollarSign,
  Users,
  Search,
  Filter,
  BarChart3
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";

// Create thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id",
});

export default function MerchantDashboard() {
  const router = useRouter();
  const account = useActiveAccount();
  const address = account?.address;
  const [merchantData, setMerchantData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [averageConfidenceScore, setAverageConfidenceScore] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const hasFetchedRef = useRef(false);
  const currentAddressRef = useRef(null);

  // Get contract instance
  const contract = getContract({
    client,
    chain: baseSepolia,
    address: CONTRACT_ADDRESS,
  });

  useEffect(() => {
    // Reset ref when address changes
    if (address !== currentAddressRef.current) {
      hasFetchedRef.current = false;
      currentAddressRef.current = address;
    }

    if (!address) {
      router.push('/merchant/create');
      return;
    }
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchMerchantData();
    }
  }, [address, router]);

  const fetchMerchantData = async () => {
    try {
      // Fetch merchant data
      const merchantResponse = await fetch(`/api/merchants?address=${address}`);
      
      if (merchantResponse.status === 404) {
        // Merchant not found, redirect to create
        router.replace('/merchant/create');
        return;
      }
      
      const merchant = await merchantResponse.json();
      
      if (!merchant || !merchant.id) {
        // Merchant not found, redirect to create
        router.replace('/merchant/create');
        return;
      }
      
      setMerchantData(merchant);

      // Fetch reviews from blockchain for this merchant
      await fetchMerchantReviewsFromBlockchain(merchant.id);

      // Fetch menu items
      const menuResponse = await fetch(`/api/menu?merchantId=${merchant.id}`);
      const menuData = await menuResponse.json();
      setMenuItems(menuData.menuItems || []);
    } catch (error) {
      console.error('Error fetching merchant data:', error);
      toast.error('Failed to load merchant data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchantReviewsFromBlockchain = async (merchantId) => {
    setLoading(true);
    try {
      // Get all reviews from smart contract
      const allReviews = await readContract({
        contract,
        method: "function getAllReviews() view returns ((string id, string userId, string merchantId, string username, string restaurantName, uint8 rating, string reviewText, string date, uint256 upvotes, uint256 downvotes, uint256 confidenceScore, string createdAt, uint8 foodQuality, uint8 service, uint8 atmosphere, uint8 value, string orderId, uint256 orderTotal, string updatedAt)[])",
        params: [],
      });

      // Filter reviews for current merchant
      const merchantReviews = allReviews.filter(review => 
        review.merchantId === merchantId
      );

      // Convert blockchain data to readable format
      const formattedReviews = merchantReviews.map(review => ({
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
        const avgConfidence = formattedReviews.reduce((acc, review) => acc + review.confidenceScore, 0) / formattedReviews.length;
        setAverageConfidenceScore(Math.round(avgConfidence));
      } else {
        setAverageConfidenceScore(0);
      }
    } catch (error) {
      console.error('Error fetching reviews from blockchain:', error);
      toast.error('Failed to load reviews from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <Link href="/merchant/create" className="btn-primary">
            Create Restaurant
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">You haven't created a restaurant yet.</p>
          <Link href="/merchant/create" className="btn-primary">
            Create Restaurant
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
            <Link href="/" className="flex items-center space-x-2">
              <Store className="w-8 h-8 text-green-500" />
              <span className="text-xl font-bold text-gray-900">FoodChain</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/merchant/menu" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Plus className="w-5 h-5" />
                <span>Manage Menu</span>
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
            Welcome back, {merchantData.shopName}!
          </h1>
          <p className="text-gray-600">
            Monitor your restaurant performance and customer feedback.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
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
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${merchantData.monthlyRevenue || 0}</p>
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
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{merchantData.totalCustomers || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">{averageConfidenceScore}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Restaurant Information</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Edit className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{merchantData.shopName}</h4>
              <p className="text-gray-600 mb-4">{merchantData.description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {merchantData.businessAddress}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {merchantData.phone}
                </div>
                {merchantData.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    {merchantData.website}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Opening Hours</h4>
              <div className="space-y-1">
                {Object.entries(merchantData.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="capitalize">{day}</span>
                    <span className="text-gray-600">
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Menu Items */}
        {menuItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Menu Items</h3>
              <Link href="/merchant/menu" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage Menu
              </Link>
            </div>
            <div className="space-y-3">
              {menuItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className="text-sm font-medium text-green-600">${item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{item.sales || 0} orders</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Customer Reviews */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-4">
                {reviews.length === 0 
                  ? "You haven't received any reviews yet. Start serving customers to get feedback!"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {reviews.length === 0 && (
                <Link href="/merchant/menu" className="btn-primary">
                  Manage Menu
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
                      <h4 className="font-medium text-gray-900">{review.username}</h4>
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
                        <span className="text-sm text-gray-500">{review.rating}/5</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Confidence Score</div>
                      <div className="text-lg font-semibold text-green-600">{review.confidenceScore}%</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{review.review}</p>
                  
                  {/* Detailed Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Food Quality</div>
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.foodQuality ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {review.foodQuality}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Service</div>
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.service ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {review.service}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Atmosphere</div>
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.atmosphere ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {review.atmosphere}/5
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Value</div>
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {review.value}/5
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Order Total: ${(review.orderTotal / 100).toFixed(2)}</span>
                      <span>Order ID: {review.orderId}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{review.downvotes}</span>
                      </div>
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