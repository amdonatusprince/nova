import { useEffect, useState } from 'react';
import { Address, createPublicClient, erc20Abi, http, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import { opBNBTestnet } from '@/constants/chain';
import {
  HARDCODED_TOKEN_PRICES,
  tBNB,
  TOKENS,
  TokenInfo,
  sNOVA,
} from '@/constants/tokens';

export type TokenBalanceData = TokenInfo & {
  balance: bigint;
  price: number;
  priceDiff24h: number;
};

const client = createPublicClient({
  chain: opBNBTestnet,
  transport: http(),
});

export function useWalletTokens(address?: Address) {
  const publicClient = usePublicClient();
  const [tokenData, setTokenData] = useState<Record<string, TokenBalanceData>>(
    {},
  );

  useEffect(() => {
    if (!address) return;

    const fetchTokenData = async () => {
      const allTokens = [...TOKENS, sNOVA];
      try {
        const calls = allTokens.flatMap((token) => [
          {
            address: token.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
          },
        ]);

        const [results, tBNBBalance] = await Promise.all([
          client.multicall({
            contracts: calls,
          }),
          publicClient?.getBalance({ address }).catch(() => 0n) || 0n,
        ]);

        const newTokenData: Record<string, TokenBalanceData> = {};
        allTokens.forEach((token, index) => {
          // @ts-ignore
          const balance = results[index].result as bigint;
          if (balance === 0n) {
            return;
          }
          newTokenData[token.address] = {
            ...token,
            balance,
            price:
              token.address in HARDCODED_TOKEN_PRICES
                ? // @ts-ignore
                  HARDCODED_TOKEN_PRICES[token.address]
                : 0,
            priceDiff24h: 0,
          };
        });


        setTokenData({
          ...newTokenData,
          [zeroAddress]: {
            ...tBNB,
            balance: tBNBBalance || 0n,
            price: HARDCODED_TOKEN_PRICES[tBNB.address],
            priceDiff24h: 0,
          },
        });
      } catch (error) {
        console.error('Failed to fetch token data:', error);
      }
    };

    fetchTokenData();
  }, [address, publicClient]);

  return tokenData;
}
