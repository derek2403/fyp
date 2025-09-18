import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const merchantData = req.body;

    if (!merchantData.address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const normalizedAddress = merchantData.address.toLowerCase();
    const db = await getDb();
    const merchantsCollection = db.collection('merchants');

    const existingMerchant = await merchantsCollection.findOne({
      $or: [{ address: merchantData.address }, { addressLower: normalizedAddress }],
    });

    if (existingMerchant) {
      return res.status(400).json({ message: 'Merchant already exists' });
    }

    const newMerchant = {
      id: `merchant_${Date.now()}`,
      ...merchantData,
      addressLower: normalizedAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      monthlyRevenue: 0,
      totalCustomers: 0,
      averageRating: 0,
      totalReviews: 0,
    };

    await merchantsCollection.insertOne(newMerchant);

    return res.status(201).json({
      message: 'Merchant created successfully',
      merchant: newMerchant,
    });
  } catch (error) {
    console.error('Error creating merchant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
