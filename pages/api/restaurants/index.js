import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Read the merchants.json file
    const dataPath = path.join(process.cwd(), 'data', 'merchants.json');
    const merchantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Transform merchants data to restaurant format for compatibility
    const restaurants = merchantsData.merchants.map(merchant => {
      // Get cuisine icon based on first cuisine type
      let cuisineIcon = '🍽️';
      if (merchant.selectedCuisines && merchant.selectedCuisines.length > 0) {
        const firstCuisine = merchant.selectedCuisines[0].toLowerCase();
        const cuisineIcons = {
          'italian': '🍝',
          'chinese': '🥢', 
          'japanese': '🍣',
          'thai': '🍜',
          'indian': '🍛',
          'mexican': '🌮',
          'korean': '🍲',
          'american': '🍔',
          'french': '🥐',
          'seafood': '🦐',
          'bbq': '🍖',
          'desserts': '🍰',
          'cafe': '☕',
          'bakery': '🥖',
          'vegetarian': '🥗',
          'vegan': '🌱',
          'mediterranean': '🥙'
        };
        cuisineIcon = cuisineIcons[firstCuisine] || '🍽️';
      }

      return {
        id: merchant.id,
        name: merchant.shopName,
        cuisine: merchant.selectedCuisines ? merchant.selectedCuisines.join(', ') : 'Various',
        rating: merchant.averageRating || 0,
        distance: '1.0km',
        priceRange: merchant.priceRange === 'budget' ? '$' : 
                   merchant.priceRange === 'moderate' ? '$$' :
                   merchant.priceRange === 'premium' ? '$$$' : '$$$$',
        image: cuisineIcon,
        address: merchant.businessAddress,
        phone: merchant.phone,
        description: merchant.description,
        website: merchant.website,
        email: merchant.email,
        openingHours: merchant.openingHours,
        menu: merchant.menu || []
      };
    });

    return res.status(200).json({
      restaurants: restaurants
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}