import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Ethereum, Polygon } from "@thirdweb-dev/chains";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

// Define Base Sepolia chain configuration
const BaseSepolia = {
  chainId: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: ["https://sepolia.base.org"],
  blockExplorers: [
    {
      name: "Base Sepolia Explorer",
      url: "https://sepolia.basescan.org",
    },
  ],
  testnet: true,
};

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebProvider 
      activeChain={BaseSepolia}
      supportedChains={[Ethereum, Polygon, BaseSepolia]}
      clientId="your-thirdweb-client-id"
    >
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </ThirdwebProvider>
  );
}

export default MyApp;
