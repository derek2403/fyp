import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import {
  createThirdwebClient,
  getContract,
  getContractEvents,
  prepareEvent,
  readContract,
} from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import {
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  Wallet,
} from "lucide-react";
import Header from '../../components/Header';
import toast from 'react-hot-toast';

const NFT_CONTRACT_ADDRESS = '0xc7a0342341004B1b97aDd3ea7347e45d10d2ca95';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || 'your-thirdweb-client-id',
});

const FALLBACK_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/500px-Good_Food_Display_-_NCI_Visuals_Online.jpg';

const decodeMetadata = (tokenURI) => {
  if (!tokenURI) return null;

  const prefix = 'data:application/json;base64,';
  try {
    if (!tokenURI.startsWith(prefix)) {
      return null;
    }

    const base64 = tokenURI.slice(prefix.length);
    let jsonString;

    if (typeof window === 'undefined' && typeof globalThis.Buffer !== 'undefined') {
      jsonString = globalThis.Buffer.from(base64, 'base64').toString('utf-8');
    } else if (typeof window !== 'undefined') {
      const binary = window.atob(base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      jsonString = new TextDecoder().decode(bytes);
    } else {
      return null;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decode token metadata:', error);
    return null;
  }
};

const formatTokenId = (tokenId) => {
  try {
    const asBigInt = BigInt(tokenId);
    return asBigInt.toString();
  } catch {
    return tokenId?.toString?.() ?? tokenId;
  }
};

const WalletConnectPrompt = () => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
    <div className="flex items-center space-x-3">
      <Wallet className="w-5 h-5" />
      <span className="font-medium">Connect a wallet or sign in to view your badge</span>
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
              redirectUrl:
                typeof window !== 'undefined' ? window.location.href : undefined,
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

export default function ShowNftPage() {
  const account = useActiveAccount();
  const address = account?.address;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokens, setTokens] = useState([]);

  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: baseSepolia,
        address: NFT_CONTRACT_ADDRESS,
      }),
    [],
  );

  useEffect(() => {
    if (!address) {
      setTokens([]);
      setError('');
      return;
    }

    const fetchTokens = async () => {
      setLoading(true);
      setError('');

      try {
        const balance = await readContract({
          contract,
          method: 'function balanceOf(address owner) view returns (uint256)',
          params: [address],
        });

        if (!balance || BigInt(balance) === 0n) {
          setTokens([]);
          return;
        }

        const transferEvent = prepareEvent({
          signature:
            'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
          filters: {
            from: ZERO_ADDRESS,
            to: address,
          },
        });

        const events = await getContractEvents({
          contract,
          events: [transferEvent],
          fromBlock: 0n,
          useIndexer: false,
        });

        const mintedTokenIds = Array.from(
          new Set(
            events
              .map((log) => log?.data?.tokenId)
              .filter((tokenId) => tokenId !== undefined && tokenId !== null)
              .map((tokenId) => {
                try {
                  return BigInt(tokenId);
                } catch {
                  return null;
                }
              })
              .filter((tokenId) => tokenId !== null),
          ),
        );

        let tokenIdsToCheck = mintedTokenIds;

        if (tokenIdsToCheck.length === 0) {
          // Fallback: try sequential lookup for first N ids
          tokenIdsToCheck = Array.from({ length: Number(balance) }, (_, idx) => BigInt(idx + 1));
        }

      const tokenDetails = await Promise.all(
        tokenIdsToCheck.map(async (tokenId) => {
          try {
            const owner = await readContract({
              contract,
              method: 'function ownerOf(uint256 tokenId) view returns (address)',
                params: [tokenId],
              });

              if (owner.toLowerCase() !== address.toLowerCase()) {
                return null;
              }

              const uri = await readContract({
                contract,
                method: 'function tokenURI(uint256 tokenId) view returns (string)',
                params: [tokenId],
              });

            const metadata = decodeMetadata(uri) || {
              name: 'Pro Reviewer Badge',
              description: 'Exclusive recognition for top community reviewers.',
              image: FALLBACK_IMAGE_URL,
            };
              return {
                tokenId: formatTokenId(tokenId),
                tokenURI: uri,
                metadata,
              };
            } catch (innerError) {
              console.error('Failed to load token data:', innerError);
              return null;
            }
          }),
        );

        const filteredTokens = tokenDetails.filter(Boolean);

        if (filteredTokens.length === 0) {
          setTokens([]);
          return;
        }

        setTokens(filteredTokens);
      } catch (fetchError) {
        console.error('Error fetching NFTs:', fetchError);
        setError(fetchError?.message || 'Failed to load NFTs');
        toast.error('Unable to load your NFT details');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [address, contract]);

  const renderContent = () => {
    if (!address) {
      return <WalletConnectPrompt />;
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 py-16 text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Fetching your Pro Reviewer badge…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p className="font-medium">{error}</p>
          <p className="mt-2">
            Try refreshing the page or minting a badge first.
          </p>
        </div>
      );
    }

    if (tokens.length === 0) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-amber-700">
          <ImageIcon className="mx-auto mb-3 h-8 w-8" />
          <h3 className="text-lg font-semibold">No Pro Reviewer badge found</h3>
          <p className="mt-2 text-sm">
            You haven’t minted your badge yet. Head over to the mint page to claim it!
          </p>
          <Link
            href="/users/nft"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Mint Pro Reviewer NFT
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {tokens.map((token) => (
          <div
            key={token.tokenId}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="mx-auto w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg">
                <img
                  src={token?.metadata?.image || FALLBACK_IMAGE_URL}
                  alt={token?.metadata?.name || 'Pro Reviewer NFT'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-purple-500">Token ID #{token.tokenId}</p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {token?.metadata?.name || 'Pro Reviewer Badge'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {token?.metadata?.description ||
                      'Exclusive recognition for top community reviewers.'}
                  </p>
                </div>
                {Array.isArray(token?.metadata?.attributes) &&
                  token.metadata.attributes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Attributes</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {token.metadata.attributes.map((attr, index) => (
                        <span
                          key={`${token.tokenId}-${attr?.trait_type || 'trait'}-${index}`}
                          className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                        >
                          {(attr?.trait_type || 'Trait')}: {attr?.value || 'N/A'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <p className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Owned by {address.slice(0, 6)}...{address.slice(-4)}</span>
                  </p>
                  <p className="mt-2 break-words text-xs text-gray-400">
                    Token URI: {token.tokenURI}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Header title="Back to Dashboard" backUrl="/users/dashboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/users/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Pro Reviewer NFT</h1>
          <p className="mt-2 text-gray-600">
            View the badge you’ve earned on Base Sepolia. Each badge includes unique artwork and metadata tied to your wallet.
          </p>
        </div>

        <div className="card space-y-6">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-600">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {address
                    ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
                    : 'Wallet not connected'}
                </span>
              </div>
              <Link href="/users/nft" className="text-xs font-medium text-purple-600 hover:text-purple-700">
                Mint another badge
              </Link>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}
