import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Read the restaurants.json file
    const dataPath = path.join(process.cwd(), 'data', 'restaurants.json');
    const restaurantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Find restaurant by ID
    const restaurant = restaurantsData.restaurants.find(restaurant => restaurant.id === id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    return res.status(200).json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 