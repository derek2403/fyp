import { useState, useEffect } from 'react';
import { useAddress } from "@thirdweb-dev/react";
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

// Mock merchant data - in real app, this would come from your backend
const mockMerchantData = {
  shopName: "Pizza Palace",
  description: "Authentic Italian pizza made with fresh ingredients and traditional recipes.",
  address: "123 Main Street, Singapore",
  phone: "+65 9123 4567",
  website: "https://pizzapalace.sg",
  email: "info@pizzapalace.sg",
  cuisines: ["italian", "pizza"],
  priceRange: "moderate",
  totalReviews: 156,
  averageRating: 4.3,
  totalRevenue: 12500,
  monthlyRevenue: 3200,
  totalCustomers: 89,
  menu: [
    { id: 1, name: "Margherita Pizza", price: 18, category: "main-course", description: "Classic tomato and mozzarella", sales: 45 },
    { id: 2, name: "Pepperoni Pizza", price: 22, category: "main-course", description: "Spicy pepperoni with cheese", sales: 38 },
    { id: 3, name: "Garlic Bread", price: 8, category: "appetizers", description: "Fresh baked garlic bread", sales: 67 },
    { id: 4, name: "Caesar Salad", price: 12, category: "appetizers", description: "Fresh romaine with caesar dressing", sales: 23 },
    { id: 5, name: "Tiramisu", price: 10, category: "desserts", description: "Classic Italian dessert", sales: 29 }
  ],
  recentReviews: [
    {
      id: 1,
      username: "FoodLover123",
      rating: 4,
      review: "Amazing authentic Italian pizza! The crust was perfectly crispy and the toppings were fresh.",
      date: "2024-01-15",
      upvotes: 12,
      downvotes: 2,
      confidenceScore: 92
    },
    {
      id: 2,
      username: "SpiceHunter",
      rating: 5,
      review: "Best pizza in town! The pepperoni is perfectly spicy and the cheese is gooey.",
      date: "2024-01-14",
      upvotes: 15,
      downvotes: 0,
      confidenceScore: 95
    },
    {
      id: 3,
      username: "PizzaConnoisseur",
      rating: 4,
      review: "Great authentic flavors. The margherita is a must-try. Will definitely come back!",
      date: "2024-01-13",
      upvotes: 8,
      downvotes: 1,
      confidenceScore: 87
    }
  ],
  openingHours: {
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  }
};

export default function MerchantDashboard() {
  const address = useAddress();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(mockMerchantData);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, you would fetch merchant data based on the connected wallet
    if (address) {
      // Simulate API call to fetch merchant data
      setData(mockMerchantData);
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
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${data.monthlyRevenue}</p>
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
              <p className="text-2xl font-bold text-gray-900">{data.totalCustomers}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Restaurant Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
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
            <h4 className="font-medium text-gray-900 mb-2">{data.shopName}</h4>
            <p className="text-gray-600 mb-4">{data.description}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {data.address}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {data.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2" />
                {data.website}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Opening Hours</h4>
            <div className="space-y-1">
              {Object.entries(data.openingHours).map(([day, hours]) => (
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Menu Items</h3>
          <Link href="/menu" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Manage Menu
          </Link>
        </div>
        <div className="space-y-3">
          {data.menu.slice(0, 3).map((item) => (
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
                  <span className="text-xs text-gray-500 ml-2">{item.sales} orders</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Customer Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Customer Reviews</h3>
          <Link href="/reviews" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {data.recentReviews.map((review) => (
            <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
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
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Reply</button>
                  <button className="text-red-600 hover:text-red-700 text-sm">Flag</button>
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
        <h3 className="text-lg font-semibold text-gray-900">All Customer Reviews</h3>
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Insights</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">Revenue Trends</h4>
          </div>
          <p className="text-sm text-gray-600">Revenue analytics coming soon...</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Customer Insights</h4>
          </div>
          <p className="text-sm text-gray-600">Customer analytics coming soon...</p>
        </div>
      </div>
    </div>
  );

  const MenuTab = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Menu Management</h3>
        <button className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>
      <div className="space-y-4">
        {data.menu.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                <span className="text-xs text-gray-500 ml-2">{item.sales} orders</span>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button className="text-blue-600 hover:text-blue-700">
                <Edit className="w-4 h-4" />
              </button>
              <button className="text-red-600 hover:text-red-700">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Settings</h3>
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
              <Store className="w-8 h-8 text-green-500" />
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
            Welcome back, {data.shopName}!
          </h1>
          <p className="text-gray-600">
            Monitor your restaurant performance and customer feedback.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'reviews', name: 'Reviews', icon: MessageSquare },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'menu', name: 'Menu', icon: Plus },
                { id: 'settings', name: 'Settings', icon: Edit }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
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
        {activeTab === 'menu' && <MenuTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
} 