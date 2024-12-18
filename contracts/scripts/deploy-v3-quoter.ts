import { Route, encodeRouteToPath } from '@uniswap/v3-sdk';
import { encodeBytes32String } from 'ethers';
import hre, { ethers } from 'hardhat';
import { parseUnits } from 'viem';

import { QuoterV2__factory } from '../typechain-types';

// Bitcoin (BTC) deployed to: 0x31a721837d8964772142e1136B8878b6608549F2
// Binance Coin (BNB) deployed to: 0xE03639b06Be343BC0898FAaA8463EcF6E5c14869
// Tether (USDT) deployed to: 0xA3142213778e757B2AacAdCEe143B03AacFe7bE9
// USD Coin (USDC) deployed to: 0x188E24768794fA1f126aB97ff5F06D4c5B4bda42
// Dai (DAI) deployed to: 0x719C9B9CF384E73Ff7D149f237D5cb9004F0d97f
// RWA Gold (GOLD) deployed to: 0x57a2825c2e54F90b92580b3C690A24EAC55C1702


const TOKENS = {
  BTC: '0x31a721837d8964772142e1136B8878b6608549F2',
  BNB: '0xE03639b06Be343BC0898FAaA8463EcF6E5c14869',
  USDT: '0xA3142213778e757B2AacAdCEe143B03AacFe7bE9',
  USDC: '0x188E24768794fA1f126aB97ff5F06D4c5B4bda42',
};

export const deployV3Quoter = async () => {
  const WBNB = '0x3ED1e9de39B7f84AF898bc1Be16109022ec9d1BB';
  const UniswapV3Factory = '0x7fD493E18f52178485d34A1500a7Fa16e8c1a2b4';

  const Quoter = await (
    (await ethers.getContractFactory('QuoterV2')) as QuoterV2__factory
  ).deploy(UniswapV3Factory, WBNB);
  await Quoter.waitForDeployment();
  console.log('Quoter deployed to:', await Quoter.getAddress());

  try {
    // First check if pool exists
    const factory = await ethers.getContractAt('IUniswapV3Factory', UniswapV3Factory);
    const pool = await factory.getPool(TOKENS.BTC, TOKENS.BNB, 500);
    console.log('Pool address:', pool);

    // Try to get quote
    const res = await Quoter.quoteExactInputSingle.staticCall({
      tokenIn: TOKENS.BTC,
      tokenOut: TOKENS.BNB,
      fee: 500,
      amountIn: parseUnits('0.001', 8), // Reduced amount to 0.001 BTC
      sqrtPriceLimitX96: 0n,
    });
    console.log('Quote result:', res.toString());
  } catch (error) {
    console.error('Error getting quote:', error);
  }
};

if (require.main === module) {
  deployV3Quoter().catch(console.error);
}
