import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const merchantData = req.body;

    if (!merchantData.address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Read the merchants.json file
    const dataPath = path.join(process.cwd(), 'data', 'merchants.json');
    const merchantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Check if merchant already exists
    const existingMerchant = merchantsData.merchants.find(merchant => merchant.address === merchantData.address);
    if (existingMerchant) {
      return res.status(400).json({ message: 'Merchant already exists' });
    }

    // Create new merchant with ID
    const newMerchant = {
      id: `merchant_${Date.now()}`,
      ...merchantData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      monthlyRevenue: 0,
      totalCustomers: 0,
      averageRating: 0,
      totalReviews: 0
    };

    // Add merchant to the array
    merchantsData.merchants.push(newMerchant);

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(merchantsData, null, 2));

    return res.status(201).json({
      message: 'Merchant created successfully',
      merchant: newMerchant
    });
  } catch (error) {
    console.error('Error creating merchant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 