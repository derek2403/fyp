import { useState } from 'react';
import { useRouter } from 'next/router';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Store, 
  CheckCircle, 
  Plus,
  X,
  Upload,
  MapPin,
  Phone,
  Globe,
  Clock,
  Utensils
} from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';

const cuisineTypes = [
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
  { id: 'seafood', name: 'Seafood', icon: '🦐' },
  { id: 'bbq', name: 'BBQ', icon: '🍖' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'cafe', name: 'Cafe', icon: '☕' },
  { id: 'bakery', name: 'Bakery', icon: '🥖' }
];

const priceRanges = [
  { id: 'budget', name: 'Budget-Friendly', range: '$', description: 'Under $10 per person' },
  { id: 'moderate', name: 'Moderate', range: '$$', description: '$10-$25 per person' },
  { id: 'premium', name: 'Premium', range: '$$$', description: '$25-$50 per person' },
  { id: 'luxury', name: 'Luxury', range: '$$$$', description: '$50+ per person' }
];

export default function MerchantRegistration() {
  const router = useRouter();
  const address = useAddress();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    selectedCuisines: [],
    priceRange: 'moderate',
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    menu: []
  });

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null
  });

  const handleCuisineToggle = (cuisineId) => {
    setFormData(prev => ({
      ...prev,
      selectedCuisines: prev.selectedCuisines.includes(cuisineId)
        ? prev.selectedCuisines.filter(id => id !== cuisineId)
        : [...prev.selectedCuisines, cuisineId]
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const addMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.category) {
      toast.error('Please fill in all required fields for the menu item');
      return;
    }

    setFormData(prev => ({
      ...prev,
      menu: [...prev.menu, { ...newMenuItem, id: Date.now() }]
    }));

    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null
    });

    toast.success('Menu item added successfully!');
  };

  const removeMenuItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      menu: prev.menu.filter(item => item.id !== itemId)
    }));
  };

  const handleSubmit = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (formData.selectedCuisines.length === 0) {
      toast.error('Please select at least one cuisine type');
      return;
    }

    if (formData.menu.length === 0) {
      toast.error('Please add at least one menu item');
      return;
    }

    try {
      // Here you would typically save to your backend/database
      const merchantData = {
        address,
        ...formData,
        registrationDate: new Date().toISOString(),
        userType: 'merchant'
      };

      console.log('Merchant registration data:', merchantData);
      
      // Set user type in localStorage for dashboard routing
      localStorage.setItem('userType', 'merchant');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Registration successful! Welcome to FoodChain!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const canProceed = () => {
    if (step === 1) return address;
    if (step === 2) return formData.shopName && formData.address && formData.phone;
    if (step === 3) return formData.selectedCuisines.length > 0;
    if (step === 4) return formData.menu.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Store className="w-8 h-8 text-green-500" />
              <span className="text-xl font-bold text-gray-900">Merchant Registration</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </div>
                {stepNumber < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Step {step} of 5: {
                step === 1 ? 'Connect Wallet' :
                step === 2 ? 'Shop Details' :
                step === 3 ? 'Cuisine & Pricing' :
                step === 4 ? 'Menu Setup' :
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
              <Store className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your blockchain wallet to register your restaurant. This ensures secure transactions and authentic reviews.
              </p>
              <ConnectWallet className="btn-primary text-lg px-8 py-3" />
              <div className="mt-6 text-sm text-gray-500">
                <p>Your wallet address will be used to:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Verify your restaurant ownership</li>
                  <li>• Process crypto payments</li>
                  <li>• Manage your restaurant profile</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Shop Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    className="input-field"
                    placeholder="Enter your restaurant name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="input-field"
                    rows="4"
                    placeholder="Tell customers about your restaurant..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter your restaurant address"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input-field pl-10"
                        placeholder="Enter phone number"
                      />
                    </div>
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
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="input-field pl-10"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Cuisine & Pricing
              </h2>
              
              {/* Cuisine Types */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What cuisines do you serve? (Select all that apply)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cuisineTypes.map((cuisine) => (
                    <button
                      key={cuisine.id}
                      onClick={() => handleCuisineToggle(cuisine.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.selectedCuisines.includes(cuisine.id)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cuisine.icon}</div>
                      <div className="text-sm font-medium">{cuisine.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Price Range
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => handleInputChange('priceRange', range.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.priceRange === range.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{range.range}</div>
                      <div className="font-medium">{range.name}</div>
                      <div className="text-xs text-gray-500">{range.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opening Hours */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Opening Hours
                </h3>
                <div className="space-y-3">
                  {Object.entries(formData.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-20 font-medium capitalize">{day}</div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                          className="mr-2"
                        />
                        Open
                      </label>
                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                            className="input-field w-32"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                            className="input-field w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Menu Setup
              </h2>
              
              {/* Add Menu Item */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Menu Item</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Margherita Pizza"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newMenuItem.category}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      <option value="appetizers">Appetizers</option>
                      <option value="main-course">Main Course</option>
                      <option value="desserts">Desserts</option>
                      <option value="beverages">Beverages</option>
                      <option value="sides">Sides</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image (Optional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, image: e.target.files[0] }))}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows="3"
                    placeholder="Describe the dish..."
                  />
                </div>
                <button
                  onClick={addMenuItem}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </button>
              </div>

              {/* Menu Items List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Menu Items ({formData.menu.length})
                </h3>
                {formData.menu.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No menu items added yet. Add your first item above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.menu.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <p className="text-sm font-medium text-green-600 mt-1">${item.price}</p>
                        </div>
                        <button
                          onClick={() => removeMenuItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Review Your Information
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Restaurant Info</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Name:</strong> {formData.shopName}</p>
                      <p><strong>Address:</strong> {formData.address}</p>
                      <p><strong>Phone:</strong> {formData.phone}</p>
                      <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
                      <p><strong>Website:</strong> {formData.website || 'Not provided'}</p>
                      <p><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Cuisines:</strong> {formData.selectedCuisines.length} selected</p>
                      <p><strong>Price Range:</strong> {priceRanges.find(p => p.id === formData.priceRange)?.name}</p>
                      <p><strong>Menu Items:</strong> {formData.menu.length} items</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">What's Next?</h4>
                  <ul className="text-green-800 space-y-1 text-sm">
                    <li>• Start receiving customer reviews and ratings</li>
                    <li>• Manage your menu and update offerings</li>
                    <li>• View analytics and customer insights</li>
                    <li>• Accept crypto payments from customers</li>
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
            
            {step < 5 ? (
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