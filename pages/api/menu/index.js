import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { merchantId } = req.query;

    if (!merchantId) {
      return res.status(400).json({ message: 'Merchant ID is required' });
    }

    // Read the menu.json file
    const dataPath = path.join(process.cwd(), 'data', 'menu.json');
    const menuData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Filter menu items by merchant ID
    const menuItems = menuData.menuItems.filter(item => item.merchantId === merchantId);

    return res.status(200).json({
      menuItems: menuItems || []
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 