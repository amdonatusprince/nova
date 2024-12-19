import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import React, { useEffect, useState } from 'react';
import { Address, isAddress, parseAbi } from 'viem';

import { BalanceList } from '@/components/BalanceList';
import { PositionItem } from '@/components/PositionItem';
import { client } from '@/constants/chain';
import { getToken } from '@/constants/tokens';

// Uniswap V3 NonfungiblePositionManager ABI (only the functions we need)
const positionManagerAbi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
]);

const POSITION_MANAGER_ADDRESS =
  '0xB0cF94c1D32B57Fc05F8F199a8577EfcB3F62Ed8' as const;

interface Position {
  tokenId: bigint;
  token0: Address;
  token1: Address;
  pool: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  amount0: string;
  amount1: string;
}

function getTokenAmounts(
  tickLower: number,
  tickUpper: number,
  liquidity: JSBI,
): { amount0: string; amount1: string } {
  const sqrtRatioA = TickMath.getSqrtRatioAtTick(tickLower);
  const sqrtRatioB = TickMath.getSqrtRatioAtTick(tickUpper);

  const amount0 = SqrtPriceMath.getAmount0Delta(
    sqrtRatioA,
    sqrtRatioB,
    liquidity,
    false,
  );
  const amount1 = SqrtPriceMath.getAmount1Delta(
    sqrtRatioA,
    sqrtRatioB,
    liquidity,
    false,
  );

  return {
    amount0: amount0.toString(),
    amount1: amount1.toString(),
  };
}

type V3PositionListProps = {
  address?: Address;
};

// Add this mock data
const MOCK_POSITIONS: Position[] = [
  {
    tokenId: 1n,
    token0: '0x31a721837d8964772142e1136B8878b6608549F2', // BTC
    token1: '0xE03639b06Be343BC0898FAaA8463EcF6E5c14869', // BNB
    pool: '0x80Aa65dd6f1Cf24Ded2C183cF94d5854112FA69E',
    fee: 500,
    tickLower: -887272,
    tickUpper: 887272,
    liquidity: 1000000n,
    amount0: '0.05',  // 0.05 BTC
    amount1: '7.5',   // 7.5 BNB
  },
  {
    tokenId: 2n,
    token0: '0x719C9B9CF384E73Ff7D149f237D5cb9004F0d97f', // DAI
    token1: '0xE03639b06Be343BC0898FAaA8463EcF6E5c14869', // BNB
    pool: '0xEA7f07Fd60186600d8C5117E2858db5B3302214f',
    fee: 500,
    tickLower: -887272,
    tickUpper: 887272,
    liquidity: 2000000n,
    amount0: '1000',  // 1000 DAI
    amount1: '3.2',   // 3.2 BNB
  },
  {
    tokenId: 3n,
    token0: '0xA3142213778e757B2AacAdCEe143B03AacFe7bE9', // USDT
    token1: '0x188E24768794fA1f126aB97ff5F06D4c5B4bda42', // USDC
    pool: '0x85B1C77BA933190B01Cc31C48c2C84c8979e3E5d',
    fee: 100,
    tickLower: -887272,
    tickUpper: 887272,
    liquidity: 5000000n,
    amount0: '5000',  // 5000 USDT
    amount1: '5000',  // 5000 USDC
  },
  {
    tokenId: 4n,
    token0: '0x188E24768794fA1f126aB97ff5F06D4c5B4bda42', // USDC
    token1: '0x57a2825c2e54F90b92580b3C690A24EAC55C1702', // GOLD
    pool: '0x6d6D2f29EF83cb617Dbfb498D52A5686672D3A62',
    fee: 500,
    tickLower: -887272,
    tickUpper: 887272,
    liquidity: 3000000n,
    amount0: '10000',  // 10000 USDC
    amount1: '5.2',    // 5.2 GOLD
  }
];

export const V3PositionList: React.FC<V3PositionListProps> = ({ address }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, just set the mock data
    setPositions(MOCK_POSITIONS);
  }, [address]);

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {positions.length > 0 && (
        <BalanceList>
          {positions.map((position) => {
            const token0 = getToken(position.token0)!;
            const token1 = getToken(position.token1)!;

            return (
              <PositionItem
                key={position.tokenId.toString()}
                token0={token0}
                token1={token1}
                amount0={BigInt(parseFloat(position.amount0) * 10 ** token0.decimals)}
                amount1={BigInt(parseFloat(position.amount1) * 10 ** token1.decimals)}
              />
            );
          })}
        </BalanceList>
      )}
    </>
  );
};
