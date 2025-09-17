import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id, updates } = req.body || {};

    if (!id || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Merchant id and updates are required' });
    }

    const dataPath = path.join(process.cwd(), 'data', 'merchants.json');
    const merchantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const merchantIndex = merchantsData.merchants.findIndex((merchant) => merchant.id === id);

    if (merchantIndex === -1) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    const existingMerchant = merchantsData.merchants[merchantIndex];

    const updatedMerchant = {
      ...existingMerchant,
      ...updates,
      openingHours: updates?.openingHours ? { ...existingMerchant.openingHours, ...updates.openingHours } : existingMerchant.openingHours,
      updatedAt: new Date().toISOString(),
    };

    merchantsData.merchants[merchantIndex] = updatedMerchant;

    fs.writeFileSync(dataPath, JSON.stringify(merchantsData, null, 2));

    return res.status(200).json({
      message: 'Merchant updated successfully',
      merchant: updatedMerchant,
    });
  } catch (error) {
    console.error('Error updating merchant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
