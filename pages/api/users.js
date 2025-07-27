import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'users.json');

function readData() {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    return { users: [] };
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
        const { address, id } = req.query;
        
        if (address) {
          const user = data.users.find(u => u.address === address);
          return res.status(200).json(user || null);
        }
        
        if (id) {
          const user = data.users.find(u => u.id === id);
          return res.status(200).json(user || null);
        }
        
        return res.status(200).json(data.users);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to read users' });
      }

    case 'POST':
      try {
        const data = readData();
        const newUser = {
          id: `user_${Date.now()}`,
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.users.push(newUser);
        writeData(data);
        
        return res.status(201).json(newUser);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

    case 'PUT':
      try {
        const data = readData();
        const { id } = req.query;
        const userIndex = data.users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        data.users[userIndex] = {
          ...data.users[userIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        writeData(data);
        return res.status(200).json(data.users[userIndex]);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update user' });
      }

    case 'DELETE':
      try {
        const data = readData();
        const { id } = req.query;
        const userIndex = data.users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        data.users.splice(userIndex, 1);
        writeData(data);
        
        return res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}