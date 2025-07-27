import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'menu.json');

function readData() {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    return { menuItems: [] };
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
        const { merchantId, id } = req.query;
        
        if (merchantId) {
          const menuItems = data.menuItems.filter(item => item.merchantId === merchantId);
          return res.status(200).json(menuItems);
        }
        
        if (id) {
          const menuItem = data.menuItems.find(item => item.id === id);
          return res.status(200).json(menuItem || null);
        }
        
        return res.status(200).json(data.menuItems);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to read menu items' });
      }

    case 'POST':
      try {
        const data = readData();
        const newMenuItem = {
          id: `menu_${Date.now()}`,
          ...req.body,
          sales: 0,
          available: true,
          createdAt: new Date().toISOString()
        };
        
        data.menuItems.push(newMenuItem);
        writeData(data);
        
        return res.status(201).json(newMenuItem);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create menu item' });
      }

    case 'PUT':
      try {
        const data = readData();
        const { id } = req.query;
        const itemIndex = data.menuItems.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        data.menuItems[itemIndex] = {
          ...data.menuItems[itemIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        writeData(data);
        return res.status(200).json(data.menuItems[itemIndex]);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update menu item' });
      }

    case 'DELETE':
      try {
        const data = readData();
        const { id } = req.query;
        const itemIndex = data.menuItems.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        data.menuItems.splice(itemIndex, 1);
        writeData(data);
        
        return res.status(200).json({ message: 'Menu item deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete menu item' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}