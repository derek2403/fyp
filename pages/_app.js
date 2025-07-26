import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Ethereum, Polygon, Mumbai } from "@thirdweb-dev/chains";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebProvider 
      activeChain={Mumbai}
      supportedChains={[Ethereum, Polygon, Mumbai]}
      clientId="your-thirdweb-client-id"
    >
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </ThirdwebProvider>
  );
}

export default MyApp;
