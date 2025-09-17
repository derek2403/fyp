import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { merchantId, menuItems } = req.body || {};

    if (!merchantId || !Array.isArray(menuItems)) {
      return res.status(400).json({ message: 'Merchant id and menu items are required' });
    }

    const dataPath = path.join(process.cwd(), 'data', 'merchants.json');
    const merchantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const merchantIndex = merchantsData.merchants.findIndex((merchant) => merchant.id === merchantId);

    if (merchantIndex === -1) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    const sanitizedMenu = menuItems.map((item) => ({
      id: item.id ?? Date.now() + Math.floor(Math.random() * 1000),
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image: item.image ?? null,
    }));

    const updatedAt = new Date().toISOString();

    merchantsData.merchants[merchantIndex] = {
      ...merchantsData.merchants[merchantIndex],
      menu: sanitizedMenu,
      updatedAt,
    };

    fs.writeFileSync(dataPath, JSON.stringify(merchantsData, null, 2));

    return res.status(200).json({
      message: 'Menu updated successfully',
      menuItems: sanitizedMenu,
      updatedAt,
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
