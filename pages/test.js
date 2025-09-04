import { useState, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";
import { Search, Star, User, Store, Calendar, DollarSign } from "lucide-react";
import Header from '../components/Header';
import toast from 'react-hot-toast';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";

// Create thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id",
});

export default function Test() {
  const account = useActiveAccount();
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('shop'); // 'shop' or 'user'
  const [searchValue, setSearchValue] = useState('');
  const [totalReviews, setTotalReviews] = useState(0);

  // Get contract instance
  const contract = getContract({
    client,
    chain: baseSepolia,
    address: CONTRACT_ADDRESS,
  });

  // Fetch all reviews from the contract
  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      // Get total reviews count
      const total = await readContract({
        contract,
        method: "function totalReviews() view returns (uint256)",
        params: [],
      });
      setTotalReviews(Number(total));

      // Get all reviews
      const reviews = await readContract({
        contract,
        method: "function getAllReviews() view returns ((string id, string userId, string merchantId, string username, string restaurantName, uint8 rating, string reviewText, string date, uint256 upvotes, uint256 downvotes, uint256 confidenceScore, string createdAt, uint8 foodQuality, uint8 service, uint8 atmosphere, uint8 value, string orderId, uint256 orderTotal, string updatedAt)[])",
        params: [],
      });

      setAllReviews(reviews);
      setFilteredReviews(reviews);
      toast.success(`Loaded ${reviews.length} reviews from blockchain`);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(`Failed to fetch reviews: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews by shop (merchantId)
  const getReviewsByShop = (merchantId) => {
    if (!merchantId.trim()) {
      setFilteredReviews(allReviews);
      return;
    }
    
    const shopReviews = allReviews.filter(review => 
      review.merchantId.toLowerCase().includes(merchantId.toLowerCase()) ||
      review.restaurantName.toLowerCase().includes(merchantId.toLowerCase())
    );
    setFilteredReviews(shopReviews);
    toast.success(`Found ${shopReviews.length} reviews for shop: ${merchantId}`);
  };

  // Filter reviews by user (userId)
  const getReviewsByUser = (userId) => {
    if (!userId.trim()) {
      setFilteredReviews(allReviews);
      return;
    }
    
    const userReviews = allReviews.filter(review => 
      review.userId.toLowerCase().includes(userId.toLowerCase()) ||
      review.username.toLowerCase().includes(userId.toLowerCase())
    );
    setFilteredReviews(userReviews);
    toast.success(`Found ${userReviews.length} reviews for user: ${userId}`);
  };

  // Handle search
  const handleSearch = () => {
    if (searchType === 'shop') {
      getReviewsByShop(searchValue);
    } else {
      getReviewsByUser(searchValue);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchValue('');
    setFilteredReviews(allReviews);
  };

  // Format rating stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Load reviews on component mount
  useEffect(() => {
    fetchAllReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Review Contract Test" backUrl="/" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Contract Reviews</h1>
          <p className="text-gray-600">
            Test page to fetch and filter reviews from the blockchain contract
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Contract: {CONTRACT_ADDRESS}</span>
            <span>Total Reviews: {totalReviews}</span>
            <span>Loaded: {allReviews.length}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Type Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Search by:</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setSearchType('shop')}
                  className={`px-4 py-2 text-sm font-medium ${
                    searchType === 'shop'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4 inline mr-2" />
                  Shop
                </button>
                <button
                  onClick={() => setSearchType('user')}
                  className={`px-4 py-2 text-sm font-medium ${
                    searchType === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  User
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === 'shop'
                      ? 'Enter shop name or merchant ID...'
                      : 'Enter username or user ID...'
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchAllReviews}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredReviews.length} of {allReviews.length} reviews
            {searchValue && (
              <span className="ml-2 text-blue-600">
                for {searchType}: "{searchValue}"
              </span>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reviews from blockchain...</span>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((review, index) => (
              <div
                key={review.id || index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {review.restaurantName}
                    </h3>
                    <p className="text-sm text-gray-600">by {review.username}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(Number(review.rating))}
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {review.reviewText}
                </p>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Food:</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(Number(review.foodQuality))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service:</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(Number(review.service))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Atmosphere:</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(Number(review.atmosphere))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Value:</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(Number(review.value))}
                    </div>
                  </div>
                </div>

                {/* Review Meta */}
                <div className="border-t border-gray-200 pt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>User ID:</span>
                    <span className="font-mono">{review.userId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Merchant ID:</span>
                    <span className="font-mono">{review.merchantId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Order Total:</span>
                    <span>${(Number(review.orderTotal) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence:</span>
                    <span>{Number(review.confidenceScore)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredReviews.length === 0 && allReviews.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600 mb-4">
              No reviews match your search criteria for {searchType}: "{searchValue}"
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* No Data */}
        {!loading && allReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Store className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews available</h3>
            <p className="text-gray-600 mb-4">
              No reviews have been submitted to the smart contract yet.
            </p>
            <button
              onClick={fetchAllReviews}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}