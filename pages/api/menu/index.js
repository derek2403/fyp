import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { merchantId } = req.query;

    if (!merchantId) {
      return res.status(400).json({ message: 'Merchant ID is required' });
    }

    const db = await getDb();
    const merchant = await db.collection('merchants').findOne({ id: merchantId });

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    return res.status(200).json({
      menuItems: merchant.menu || [],
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
