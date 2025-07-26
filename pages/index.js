import { useState } from 'react';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { motion } from "framer-motion";
import { 
  Utensils, 
  Star, 
  Users, 
  Store, 
  ArrowRight, 
  Shield, 
  Award,
  Search,
  Heart
} from "lucide-react";
import Link from 'next/link';

export default function Home() {
  const address = useAddress();
  const [activeTab, setActiveTab] = useState('user');

  const features = [
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Authentic Reviews",
      description: "Get real reviews from verified users with blockchain-backed credibility"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "World ID Verification",
      description: "Bot-free platform with World ID integration for genuine users"
    },
    {
      icon: <Award className="w-8 h-8 text-purple-500" />,
      title: "NFT Rewards",
      description: "Earn NFT badges for consistent and reliable reviews"
    },
    {
      icon: <Search className="w-8 h-8 text-blue-500" />,
      title: "Smart Recommendations",
      description: "AI-powered food recommendations based on your preferences"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Utensils className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">FoodChain</span>
            </div>
            <div className="flex items-center space-x-4">
              {address ? (
                <Link href="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <ConnectWallet />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Discover Amazing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"> Food</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              The first blockchain-powered food review platform. Connect your wallet, share authentic reviews, and earn NFT rewards.
            </motion.p>
            
            {!address && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <ConnectWallet className="btn-primary text-lg px-8 py-3" />
                <p className="text-gray-500">or</p>
                <Link href="/register" className="btn-secondary text-lg px-8 py-3">
                  Learn More
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FoodChain?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of food reviews with blockchain technology and AI-powered recommendations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join FoodChain Today
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're a food lover or a restaurant owner, we have the perfect experience for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* User Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="card hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setActiveTab('user')}
            >
              <div className="text-center">
                <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">For Food Lovers</h3>
                <p className="text-gray-600 mb-6">
                  Connect your wallet, set your food preferences, and start discovering amazing restaurants.
                </p>
                <ul className="text-left text-gray-600 mb-6 space-y-2">
                  <li className="flex items-center">
                    <Heart className="w-4 h-4 text-red-500 mr-2" />
                    Set food preferences
                  </li>
                  <li className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    Write and read reviews
                  </li>
                  <li className="flex items-center">
                    <Award className="w-4 h-4 text-purple-500 mr-2" />
                    Earn NFT rewards
                  </li>
                </ul>
                <Link href="/register/user" className="btn-primary w-full">
                  Register as User
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Merchant Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="card hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setActiveTab('merchant')}
            >
              <div className="text-center">
                <Store className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">For Restaurants</h3>
                <p className="text-gray-600 mb-6">
                  List your restaurant, manage your menu, and engage with your customers.
                </p>
                <ul className="text-left text-gray-600 mb-6 space-y-2">
                  <li className="flex items-center">
                    <Store className="w-4 h-4 text-green-500 mr-2" />
                    List your restaurant
                  </li>
                  <li className="flex items-center">
                    <Utensils className="w-4 h-4 text-orange-500 mr-2" />
                    Manage your menu
                  </li>
                  <li className="flex items-center">
                    <Users className="w-4 h-4 text-blue-500 mr-2" />
                    View customer reviews
                  </li>
                </ul>
                <Link href="/register/merchant" className="btn-primary w-full">
                  Register as Merchant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Utensils className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold">FoodChain</span>
            </div>
            <p className="text-gray-400 mb-4">
              The future of food reviews powered by blockchain technology
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
