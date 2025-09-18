import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const normalizedAddress = address.toLowerCase();
    const db = await getDb();
    const merchant = await db.collection('merchants').findOne({
      $or: [{ address }, { addressLower: normalizedAddress }],
    });

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    if (merchant._id) {
      merchant._id = merchant._id.toString();
    }

    return res.status(200).json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
