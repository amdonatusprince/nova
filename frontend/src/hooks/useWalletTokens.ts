import { useEffect, useState } from 'react';
import { Address, createPublicClient, erc20Abi, http, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import { opBNBTestnet } from '@/constants/chain';
import {
  HARDCODED_TOKEN_PRICES,
  KII,
  TOKENS,
  TokenInfo,
  sKII,
} from '@/constants/tokens';

export type TokenBalanceData = TokenInfo & {
  balance: bigint;
  price: number;
  priceDiff24h: number;
};

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

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
      const allTokens = [...TOKENS, sKII];
      try {
        const calls = allTokens.flatMap((token) => [
          {
            address: token.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
          },
        ]);

        const [results, kiiBalance] = await Promise.all([
          client.multicall({
            contracts: calls,
          }),
          publicClient?.getBalance({ address }).catch(() => 0n) || 0n,
        ]);

        // CoinGecko API에서 가격 정보 가져오기
        // const ids = tokens.map((token) => token.symbol.toLowerCase()).join(',');
        // const priceResponse = await fetch(
        //   `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        // );
        // const priceData: CoinGeckoPrice = await priceResponse.json();

        const newTokenData: Record<string, TokenBalanceData> = {};
        allTokens.forEach((token, index) => {
          // @ts-ignore
          const balance = results[index].result as bigint;
          // const priceInfo = priceData[token.symbol.toLowerCase()];
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
            // price: priceInfo?.usd || 0,
            // priceDiff24h: priceInfo?.usd_24h_change || 0,
          };
        });

        console.log(results);

        setTokenData({
          ...newTokenData,
          [zeroAddress]: {
            ...KII,
            balance: kiiBalance || 0n,
            price: HARDCODED_TOKEN_PRICES[KII.address],
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
