import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id, updates } = req.body || {};

    if (!id || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Merchant id and updates are required' });
    }

    const db = await getDb();
    const merchantsCollection = db.collection('merchants');

    const existingMerchant = await merchantsCollection.findOne({ id });

    if (!existingMerchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    const updatedAt = new Date().toISOString();
    const mergedOpeningHours = updates?.openingHours
      ? { ...existingMerchant.openingHours, ...updates.openingHours }
      : existingMerchant.openingHours;

    const updatedFields = {
      ...updates,
      openingHours: mergedOpeningHours,
      updatedAt,
    };

    await merchantsCollection.updateOne(
      { id },
      {
        $set: updatedFields,
      },
    );

    const updatedMerchant = { ...existingMerchant, ...updatedFields };

    if (updatedMerchant._id) {
      updatedMerchant._id = updatedMerchant._id.toString();
    }

    return res.status(200).json({
      message: 'Merchant updated successfully',
      merchant: updatedMerchant,
    });
  } catch (error) {
    console.error('Error updating merchant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
