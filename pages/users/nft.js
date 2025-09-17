import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient, getContract, prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { Sparkles, ShieldCheck, Wallet, CheckCircle, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';
import Header from '../../components/Header';

const NFT_CONTRACT_ADDRESS = '0xc7a0342341004B1b97aDd3ea7347e45d10d2ca95';

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || 'your-thirdweb-client-id',
});

const NFT_NAME = 'Pro Reviewer';
const NFT_DESCRIPTION = 'Awarded to trusted voices whose reviews uplift the FoodChain community.';

const getRandomImageUrl = () =>
  `https://source.unsplash.com/600x600/?food,reviewer,award&sig=${Math.floor(Math.random() * 10_000)}`;

export default function ProReviewerNftPage() {
  const account = useActiveAccount();
  const [minting, setMinting] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [lastImage, setLastImage] = useState('');

  const isContractConfigured = /^0x[a-fA-F0-9]{40}$/.test(NFT_CONTRACT_ADDRESS);

  const handleMint = async () => {
    if (!account?.address) {
      toast.error('Connect your wallet to mint the NFT');
      return;
    }

    if (!isContractConfigured) {
      toast.error('NFT contract address is not configured');
      return;
    }

    setMinting(true);
    setTransactionHash('');

    try {
      const imageUrl = getRandomImageUrl();
      setLastImage(imageUrl);

      const contract = getContract({
        client,
        chain: baseSepolia,
        address: NFT_CONTRACT_ADDRESS,
      });

      const metadata = {
        name: NFT_NAME,
        description: NFT_DESCRIPTION,
        image: imageUrl,
        attributes: [
          { trait_type: 'Badge', value: 'Pro Reviewer' },
          { trait_type: 'Network', value: 'Base Sepolia' },
          { trait_type: 'Minted At', value: new Date().toISOString() },
        ],
      };

      const encodedMetadata = `data:application/json;base64,${btoa(
        unescape(encodeURIComponent(JSON.stringify(metadata)))
      )}`;

      const transaction = await prepareContractCall({
        contract,
        method: "function mintProReviewer(string tokenURI)",
        params: [encodedMetadata],
      });

      const { transactionHash: hash } = await sendAndConfirmTransaction({
        account,
        transaction,
      });

      setTransactionHash(hash);
      toast.success('Pro Reviewer NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error(error?.message || 'Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  const renderWalletState = () => {
    if (account?.address) {
      return (
        <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-600">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </span>
          </div>
          <span className="hidden text-xs text-emerald-500 sm:block">Ready to mint</span>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        <div className="flex items-center space-x-3">
          <Wallet className="w-5 h-5" />
          <span className="font-medium">Connect a wallet or sign in to mint your badge</span>
        </div>
        <div className="mt-4 flex justify-center">
          <ConnectButton
            client={client}
            chains={[baseSepolia]}
            connectModal={{ size: 'wide' }}
            wallets={[
              createWallet('io.metamask'),
              createWallet('com.coinbase.wallet'),
              inAppWallet({
                auth: {
                  mode: 'popup',
                  options: ['google', 'email', 'passkey'],
                  redirectUrl: typeof window !== 'undefined' ? window.location.href : undefined,
                },
              }),
            ]}
          />
        </div>
        <p className="mt-2 text-xs text-red-500">
          We support MetaMask, Coinbase Wallet, Google sign-in, email, and passkeys via Thirdweb.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Header title="Back to Dashboard" backUrl="/users/dashboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/users/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Pro Reviewer NFT</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Celebrate your contribution to the FoodChain community with a unique on-chain badge. Minting takes place on
            Base Sepolia and mints directly to your connected wallet.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Mint your badge</h2>
                <p className="text-sm text-gray-500">
                  {NFT_NAME} • Base Sepolia • ERC-721
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-3 text-slate-700">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-sm">Verified FoodChain recognition</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-700">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm">Randomized commemorative artwork</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-700">
                <Wallet className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Minted straight to your connected wallet</span>
              </div>
            </div>

            <div>{renderWalletState()}</div>

            {!isContractConfigured && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
                Set <code className="font-mono text-xs">NEXT_PUBLIC_REVIEWER_NFT_CONTRACT</code> with your ERC-721
                contract address on Base Sepolia before minting.
              </div>
            )}

            <button
              onClick={handleMint}
              disabled={minting || !account?.address || !isContractConfigured}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-60"
            >
              {minting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Mint Pro Reviewer NFT
                </>
              )}
            </button>

            {transactionHash && (
              <div className="text-sm text-emerald-600">
                Mint successful! Tx Hash:{' '}
                <a
                  href={`https://sepolia-explorer.base.org/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  {transactionHash.slice(0, 10)}...
                </a>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-xs aspect-square rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 overflow-hidden shadow-lg">
                {lastImage ? (
                  <img src={lastImage} alt="Pro Reviewer NFT" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full text-white flex flex-col items-center justify-center text-center px-6">
                    <Sparkles className="w-10 h-10 mb-3" />
                    <p className="text-lg font-semibold">Mint to reveal your artwork</p>
                  </div>
                )}
              </div>
              <div className="mt-6 text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{NFT_NAME}</h3>
                <p className="text-sm text-gray-600">{NFT_DESCRIPTION}</p>
                <p className="text-xs text-gray-400">Artwork generated randomly with each mint</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
