import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Heart, 
  Star, 
  MapPin, 
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  User,
  MessageSquare,
  Calendar,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";

// Create thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id",
});

export default function RestaurantMenu() {
  const router = useRouter();
  const { id } = router.query;
  const account = useActiveAccount();
  const address = account?.address;
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

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
    if (id) {
      fetchRestaurantData();
    }
  }, [address, router, id]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant details
      const restaurantResponse = await fetch(`/api/restaurants/${id}`);
      const restaurantData = await restaurantResponse.json();
      setRestaurant(restaurantData);

      // Use menu data directly from restaurant object
      setMenuItems(restaurantData.menu || []);
      
      // Fetch reviews for this restaurant
      fetchRestaurantReviews(id);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for specific restaurant from smart contract
  const fetchRestaurantReviews = async (merchantId) => {
    setReviewsLoading(true);
    try {
      // Get all reviews from contract
      const allReviews = await readContract({
        contract,
        method: "function getAllReviews() view returns ((string id, string userId, string merchantId, string username, string restaurantName, uint8 rating, string reviewText, string date, uint256 upvotes, uint256 downvotes, uint256 confidenceScore, string createdAt, uint8 foodQuality, uint8 service, uint8 atmosphere, uint8 value, string orderId, uint256 orderTotal, string updatedAt)[])",
        params: [],
      });

      // Filter reviews for this specific merchant
      const restaurantReviews = allReviews.filter(review => 
        review.merchantId === merchantId
      );

      setReviews(restaurantReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  // Helper function to render star ratings
  const renderStars = (rating, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart!`);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Store cart data for checkout
    localStorage.setItem('checkoutCart', JSON.stringify({
      items: cart,
      restaurant: restaurant,
      total: getTotalPrice()
    }));
    
    router.push('/users/checkout');
  };

  // Get unique categories from menu items
  const categories = [...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to access the menu.</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Restaurant...</h2>
          <p className="text-gray-600">Please wait while we fetch the menu</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">The restaurant you're looking for doesn't exist.</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-6xl">{restaurant.image}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium">{restaurant.rating}</span>
                    <span className="text-gray-500">({reviews.length} reviews)</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{restaurant.cuisine}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{restaurant.priceRange}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{restaurant.distance}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Items
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No menu items found</h3>
                  <p className="text-gray-600">Try selecting a different category</p>
                </div>
              ) : (
                filteredMenuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <span className="text-lg font-bold text-green-600">${item.price}</span>
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-500">{item.sales || 0} orders</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="ml-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Cart</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add some items to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">${item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-green-600">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{cart.length} items</p>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
              
              {/* View Reviews Button */}
              <div className="mt-4">
                <button
                  onClick={() => setShowReviewsModal(true)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>View Reviews ({reviews.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                Customer Reviews ({reviews.length})
              </h2>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to leave a review for this restaurant!
                  </p>
                  <Link 
                    href="/users/review" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write a Review
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.username}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {renderStars(Number(review.rating))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {Number(review.rating)}/5
                              </span>
                              <span className="text-sm text-gray-400">•</span>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(review.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Confidence Score</div>
                          <div className="text-lg font-semibold text-green-600">
                            {Number(review.confidenceScore)}%
                          </div>
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {review.reviewText}
                      </p>

                      {/* Detailed Ratings */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Food Quality</div>
                          <div className="flex items-center justify-center space-x-1">
                            {renderStars(Number(review.foodQuality))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Number(review.foodQuality)}/5
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Service</div>
                          <div className="flex items-center justify-center space-x-1">
                            {renderStars(Number(review.service))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Number(review.service)}/5
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Atmosphere</div>
                          <div className="flex items-center justify-center space-x-1">
                            {renderStars(Number(review.atmosphere))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Number(review.atmosphere)}/5
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Value</div>
                          <div className="flex items-center justify-center space-x-1">
                            {renderStars(Number(review.value))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Number(review.value)}/5
                          </div>
                        </div>
                      </div>

                      {/* Review Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Order Total: ${(Number(review.orderTotal) / 100).toFixed(2)}</span>
                          <span>Order ID: {review.orderId}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{Number(review.upvotes)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <ThumbsDown className="w-4 h-4" />
                            <span>{Number(review.downvotes)}</span>
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
      )}
    </div>
  );
}