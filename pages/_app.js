import { ThirdwebProvider as ThirdwebProviderV4 } from "@thirdweb-dev/react";
import { ThirdwebProvider as ThirdwebProviderV5 } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

// Define Base Sepolia chain configuration for v4 provider
const BaseSepoliaV4 = {
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

// Create Thirdweb v5 client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id",
});

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebProviderV5 client={client} activeChain={baseSepolia}>
      <ThirdwebProviderV4 activeChain={BaseSepoliaV4} clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-thirdweb-client-id"}>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </ThirdwebProviderV4>
    </ThirdwebProviderV5>
  );
}

export default MyApp;
