import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'restaurants.json');

function readData() {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    return { restaurants: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const data = readData();
        const { id, cuisine, priceRange } = req.query;
        
        let restaurants = data.restaurants;
        
        if (id) {
          const restaurant = restaurants.find(r => r.id === id);
          return res.status(200).json(restaurant || null);
        }
        
        if (cuisine) {
          restaurants = restaurants.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
        }
        
        if (priceRange) {
          restaurants = restaurants.filter(r => r.priceRange === priceRange);
        }
        
        return res.status(200).json(restaurants);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to read restaurants' });
      }

    case 'POST':
      try {
        const data = readData();
        const newRestaurant = {
          id: `restaurant_${Date.now()}`,
          ...req.body,
          createdAt: new Date().toISOString()
        };
        
        data.restaurants.push(newRestaurant);
        writeData(data);
        
        return res.status(201).json(newRestaurant);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create restaurant' });
      }

    case 'PUT':
      try {
        const data = readData();
        const { id } = req.query;
        const restaurantIndex = data.restaurants.findIndex(r => r.id === id);
        
        if (restaurantIndex === -1) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        data.restaurants[restaurantIndex] = {
          ...data.restaurants[restaurantIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        writeData(data);
        return res.status(200).json(data.restaurants[restaurantIndex]);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update restaurant' });
      }

    case 'DELETE':
      try {
        const data = readData();
        const { id } = req.query;
        const restaurantIndex = data.restaurants.findIndex(r => r.id === id);
        
        if (restaurantIndex === -1) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        data.restaurants.splice(restaurantIndex, 1);
        writeData(data);
        
        return res.status(200).json({ message: 'Restaurant deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete restaurant' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}