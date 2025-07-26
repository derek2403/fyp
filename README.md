# FoodChain - Blockchain-Powered Food Review Platform

A modern, decentralized food review platform built with Next.js, ThirdWeb, and blockchain technology. Users can connect their wallets, share authentic reviews, earn NFT badges, and discover amazing restaurants.

## 🚀 Features

### For Users
- **Wallet Connection**: Secure authentication using ThirdWeb and WalletConnect
- **Food Preferences**: Set cuisine preferences, dietary restrictions, and spice levels
- **Review System**: Write and read authentic reviews with confidence scoring
- **NFT Rewards**: Earn badges for consistent and reliable reviews
- **Smart Recommendations**: AI-powered food suggestions based on preferences
- **Voting System**: Upvote/downvote reviews to maintain quality

### For Merchants
- **Restaurant Registration**: Complete setup with shop details and menu management
- **Review Management**: View and respond to customer feedback
- **Analytics Dashboard**: Track performance metrics and customer insights
- **Crypto Payments**: Accept blockchain-based payments
- **Menu Management**: Add, edit, and organize menu items

### System Features
- **World ID Integration**: Bot-free platform with human verification
- **Confidence Scoring**: AI-powered review reliability assessment
- **Dynamic Voting Algorithm**: Fair and unbiased review scoring
- **Blockchain Storage**: Immutable review data on the blockchain

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Blockchain**: ThirdWeb SDK, Ethereum/Polygon/Mumbai networks
- **UI Components**: Lucide React icons, Framer Motion animations
- **Forms**: React Hook Form with validation
- **Notifications**: React Hot Toast
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom components

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or any Web3 wallet
- ThirdWeb account (for client ID)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fyp
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
```

### 4. Get ThirdWeb Credentials

1. Go to [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
2. Create a new project
3. Copy your Client ID and Secret Key
4. Add them to your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
fyp/
├── pages/
│   ├── index.js              # Landing page
│   ├── _app.js               # App wrapper with ThirdWeb provider
│   ├── dashboard.js          # User/Merchant dashboard
│   └── register/
│       ├── user.js           # User registration
│       └── merchant.js       # Merchant registration
├── styles/
│   └── globals.css           # Global styles and Tailwind config
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🔧 Configuration

### ThirdWeb Setup

1. **Client ID**: Required for wallet connection
2. **Supported Chains**: Currently configured for Ethereum, Polygon, and Mumbai testnet
3. **Active Chain**: Set to Mumbai testnet for development

### Tailwind CSS

The project uses Tailwind CSS v4 with custom components:

- `.btn-primary`: Primary button styling
- `.btn-secondary`: Secondary button styling
- `.card`: Card component styling
- `.input-field`: Form input styling

## 🎯 Usage Guide

### For Users

1. **Connect Wallet**: Click "Connect Wallet" on the homepage
2. **Register**: Choose "For Food Lovers" and complete the registration process
3. **Set Preferences**: Select your favorite cuisines, dietary restrictions, and preferences
4. **Start Reviewing**: Browse restaurants and write reviews
5. **Earn Badges**: Gain NFT badges for consistent reviews

### For Merchants

1. **Connect Wallet**: Click "Connect Wallet" on the homepage
2. **Register**: Choose "For Restaurants" and complete the merchant registration
3. **Add Details**: Enter restaurant information, cuisines, and pricing
4. **Manage Menu**: Add menu items with descriptions and prices
5. **Monitor Reviews**: View customer feedback and analytics

## 🔒 Security Features

- **Wallet Authentication**: Secure blockchain-based identity verification
- **World ID Integration**: Human verification to prevent bot attacks
- **Confidence Scoring**: AI-powered review reliability assessment
- **Immutable Data**: Blockchain storage for review integrity

## 🚧 Development Roadmap

### Phase 1 (Current)
- ✅ User and Merchant Registration
- ✅ Dashboard Implementation
- ✅ Basic Review System
- ✅ Wallet Integration

### Phase 2 (Next)
- [ ] Smart Contract Development
- [ ] NFT Badge System
- [ ] Review Voting Algorithm
- [ ] World ID Integration

### Phase 3 (Future)
- [ ] AI Recommendation Engine
- [ ] Crypto Payment System
- [ ] Advanced Analytics
- [ ] Mobile App

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- [ThirdWeb](https://thirdweb.com/) for blockchain infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

---

**Built with ❤️ for the future of food reviews**
