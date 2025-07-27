import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Read the restaurants.json file
    const dataPath = path.join(process.cwd(), 'data', 'restaurants.json');
    const restaurantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    return res.status(200).json({
      restaurants: restaurantsData.restaurants || []
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 