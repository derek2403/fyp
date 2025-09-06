// Simple test script to verify confidence score API with new scoring system
// Run with: node test-confidence-api.js
// 
// NEW SCORING SYSTEM:
// - Core (100 pts): Context Matching (60%) + Detail Level (40%)
// - Bonus: Spending Context (0-15) + Preference Match (0-10) + Rating Consistency (0-10)

const testData = {
  reviewData: {
    rating: 4,
    review: "Good pizza, love it",
    foodQuality: 4,
    service: 3,
    atmosphere: 3,
    value: 2
  },
  orderData: {
    restaurantName: "Italian Villa",
    restaurantId: "restaurant_1",
    total: 18.00,
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 18.00 }
    ]
  },
  userData: {
    id: "user_1",
    address: "0x1234567890123456789012345678901234567890",
    username: "FoodLover123",
    selectedCategories: ["italian", "japanese", "thai"],
    preferences: ["italian", "japanese", "thai"]
  },
  restaurantData: {
    id: "restaurant_1",
    name: "Italian Villa",
    cuisine: "Italian",
    priceRange: "$$"
  }
};

async function testConfidenceAPI() {
  try {
    console.log('Testing confidence score API...');
    
    const response = await fetch('http://localhost:3000/api/reviews/calculate-confidence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Response:', result);
    } else {
      const error = await response.json();
      console.log('❌ API Error:', error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testConfidenceAPI();
}

module.exports = { testConfidenceAPI, testData };
