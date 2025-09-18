import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { merchantId, menuItems } = req.body || {};

    if (!merchantId || !Array.isArray(menuItems)) {
      return res.status(400).json({ message: 'Merchant id and menu items are required' });
    }

    const db = await getDb();
    const merchantsCollection = db.collection('merchants');

    const merchant = await merchantsCollection.findOne({ id: merchantId });

    if (!merchant) {
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

    await merchantsCollection.updateOne(
      { id: merchantId },
      {
        $set: {
          menu: sanitizedMenu,
          updatedAt,
        },
      },
    );

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
