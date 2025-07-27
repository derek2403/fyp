import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  CheckCircle, 
  Utensils,
  Users,
  Award,
  Shield
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

const foodCategories = [
  { id: 'italian', name: 'Italian', icon: '🍝' },
  { id: 'chinese', name: 'Chinese', icon: '🥢' },
  { id: 'japanese', name: 'Japanese', icon: '🍣' },
  { id: 'indian', name: 'Indian', icon: '🍛' },
  { id: 'mexican', name: 'Mexican', icon: '🌮' },
  { id: 'thai', name: 'Thai', icon: '🍜' },
  { id: 'korean', name: 'Korean', icon: '🍲' },
  { id: 'mediterranean', name: 'Mediterranean', icon: '🥙' },
  { id: 'american', name: 'American', icon: '🍔' },
  { id: 'french', name: 'French', icon: '🥐' },
  { id: 'vietnamese', name: 'Vietnamese', icon: '🍜' },
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥗' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'seafood', name: 'Seafood', icon: '🦐' },
  { id: 'bbq', name: 'BBQ', icon: '🍖' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' }
];

const dietaryRestrictions = [
  { id: 'none', name: 'No Restrictions' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'gluten-free', name: 'Gluten-Free' },
  { id: 'dairy-free', name: 'Dairy-Free' },
  { id: 'nut-free', name: 'Nut-Free' },
  { id: 'halal', name: 'Halal' },
  { id: 'kosher', name: 'Kosher' }
];

const spiceLevels = [
  { id: 'mild', name: 'Mild', description: 'No spice preference' },
  { id: 'medium', name: 'Medium', description: 'Some spice is okay' },
  { id: 'hot', name: 'Hot', description: 'I love spicy food' },
  { id: 'extreme', name: 'Extreme', description: 'The spicier the better' }
];

export default function UserLogin() {
  const router = useRouter();
  const address = useAddress();
  const [step, setStep] = useState(1);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    selectedCategories: [],
    dietaryRestriction: 'none',
    spiceLevel: 'medium',
    budget: 'medium',
    location: ''
  });

  useEffect(() => {
    if (address) {
      checkUserExists();
    }
  }, [address]);

  const checkUserExists = async () => {
    try {
      const response = await fetch('/api/users/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      
      if (data.exists) {
        setIsExistingUser(true);
        setFormData(data.user);
        toast.success('Welcome back! Redirecting to menu...');
        setTimeout(() => {
          router.push('/users/menu');
        }, 1500);
      } else {
        setIsExistingUser(false);
        setStep(2);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setIsExistingUser(false);
      setStep(2);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (formData.selectedCategories.length === 0) {
      toast.error('Please select at least one food category');
      return;
    }

    try {
      const userData = {
        address,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast.success('Registration successful! Welcome to FoodChain!');
        router.push('/users/menu');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const canProceed = () => {
    if (step === 1) return address;
    if (step === 2) return formData.username && formData.email;
    if (step === 3) return formData.selectedCategories.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">User Login</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Step {step} of 4: {
                step === 1 ? 'Connect Wallet' :
                step === 2 ? 'Basic Information' :
                step === 3 ? 'Food Preferences' :
                'Review & Complete'
              }
            </p>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="card"
        >
          {step === 1 && (
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your blockchain wallet to get started. This ensures secure and authentic reviews.
              </p>
              <ConnectWallet className="btn-primary text-lg px-8 py-3" />
              <div className="mt-6 text-sm text-gray-500">
                <p>Your wallet address will be used to:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Verify your identity</li>
                  <li>• Store your NFT rewards</li>
                  <li>• Track your review history</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Basic Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="input-field"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input-field"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Food Preferences
              </h2>
              
              {/* Food Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What cuisines do you enjoy? (Select all that apply)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {foodCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.selectedCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-sm font-medium">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dietary Restrictions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dietaryRestrictions.map((restriction) => (
                    <button
                      key={restriction.id}
                      onClick={() => handleInputChange('dietaryRestriction', restriction.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.dietaryRestriction === restriction.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {restriction.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Spice Preference
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {spiceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleInputChange('spiceLevel', level.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.spiceLevel === level.id
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{level.name}</div>
                      <div className="text-xs text-gray-500">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Budget Preference
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'low', name: 'Budget-Friendly', icon: '💰' },
                    { id: 'medium', name: 'Moderate', icon: '💳' },
                    { id: 'high', name: 'Premium', icon: '💎' }
                  ].map((budget) => (
                    <button
                      key={budget.id}
                      onClick={() => handleInputChange('budget', budget.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.budget === budget.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{budget.icon}</div>
                      <div className="font-medium">{budget.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Review Your Information
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Info</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Username:</strong> {formData.username}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Location:</strong> {formData.location || 'Not specified'}</p>
                      <p><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferences</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Cuisines:</strong> {formData.selectedCategories.length} selected</p>
                      <p><strong>Dietary:</strong> {dietaryRestrictions.find(r => r.id === formData.dietaryRestriction)?.name}</p>
                      <p><strong>Spice Level:</strong> {spiceLevels.find(s => s.id === formData.spiceLevel)?.name}</p>
                      <p><strong>Budget:</strong> {formData.budget.charAt(0).toUpperCase() + formData.budget.slice(1)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Start exploring restaurants and writing reviews</li>
                    <li>• Earn NFT badges for consistent reviews</li>
                    <li>• Get personalized food recommendations</li>
                    <li>• Connect with other food enthusiasts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                Complete Registration
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}