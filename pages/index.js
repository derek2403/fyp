import { motion } from "framer-motion";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { 
  Heart, 
  Star, 
  Shield, 
  Zap, 
  Users, 
  Store, 
  ArrowRight,
  Award,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">FoodChain</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/users/login" className="text-gray-600 hover:text-gray-900 font-medium">
                For Users
              </Link>
              <Link href="/merchant/create" className="text-gray-600 hover:text-gray-900 font-medium">
                For Restaurants
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            The Future of
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Food Reviews
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Experience blockchain-powered food reviews with NFT rewards, crypto payments, and authentic feedback from real customers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href="/users/login" className="btn-primary text-lg px-8 py-4 flex items-center justify-center">
              <Users className="w-5 h-5 mr-2" />
              Start Exploring
            </Link>
            <Link href="/merchant/create" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
              <Store className="w-5 h-5 mr-2" />
              List Your Restaurant
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center space-x-8 text-sm text-gray-500"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Blockchain</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Instant Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span>NFT Rewards</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose FoodChain?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the next generation of food reviews with blockchain technology and crypto payments.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Authentic Reviews",
              description: "Blockchain-verified reviews ensure authenticity and prevent fake feedback.",
              color: "text-green-600"
            },
            {
              icon: Zap,
              title: "Crypto Payments",
              description: "Pay with cryptocurrency for seamless, secure transactions worldwide.",
              color: "text-blue-600"
            },
            {
              icon: Award,
              title: "NFT Rewards",
              description: "Earn unique NFT badges for consistent reviews and community contributions.",
              color: "text-purple-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User vs Merchant Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join the FoodChain Community
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're a food lover or restaurant owner, FoodChain has something for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* For Users */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">For Food Lovers</h3>
              <p className="text-gray-600">Discover amazing restaurants and share your experiences</p>
            </div>
            
            <div className="space-y-4 mb-8">
              {[
                "Connect wallet and set food preferences",
                "Browse restaurants and view menus",
                "Order food with crypto payments",
                "Write reviews and earn NFT badges",
                "Track your review history and achievements"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/users/login" className="w-full btn-primary flex items-center justify-center">
              Start Exploring
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>

          {/* For Merchants */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">For Restaurants</h3>
              <p className="text-gray-600">List your restaurant and grow your business</p>
            </div>
            
            <div className="space-y-4 mb-8">
              {[
                "Create restaurant profile with wallet",
                "Add menu items and set prices",
                "Accept crypto payments from customers",
                "View customer reviews and analytics",
                "Manage your restaurant dashboard"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/merchant/create" className="w-full btn-secondary flex items-center justify-center">
              List Your Restaurant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Store, label: "Restaurants", value: "50+" },
              { icon: Users, label: "Users", value: "1,000+" },
              { icon: MessageSquare, label: "Reviews", value: "5,000+" },
              { icon: TrendingUp, label: "Growth", value: "200%" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-8 h-8 text-red-500" />
                <span className="text-xl font-bold">FoodChain</span>
              </div>
              <p className="text-gray-400">
                The future of food reviews powered by blockchain technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/users/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/users/menu" className="hover:text-white">Browse Restaurants</Link></li>
                <li><Link href="/users/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Restaurants</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/merchant/create" className="hover:text-white">Create Restaurant</Link></li>
                <li><Link href="/merchant/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/merchant/menu" className="hover:text-white">Manage Menu</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FoodChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
