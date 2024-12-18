import { TICK_SPACINGS, TickMath, nearestUsableTick } from '@uniswap/v3-sdk';
import axios from 'axios';
import { Contract, parseUnits } from 'ethers';
import hre, { ethers } from 'hardhat';
import JSBI from 'jsbi';

import {
  INonfungiblePositionManager,
  INonfungiblePositionManager__factory,
  IUniswapV3Factory,
  IUniswapV3Factory__factory,
  IUniswapV3Pool,
  MockERC20__factory,
  UniswapV3Pool__factory,
} from '../typechain-types';
import { deployTokens } from './deploy-tokens';
import { deployV3 } from './deploy-v3';

// Uniswap V3 addresses
let FACTORY_ADDRESS = '0x7fD493E18f52178485d34A1500a7Fa16e8c1a2b4';
let NONFUNGIBLE_POSITION_MANAGER_ADDRESS =
  '0xB0cF94c1D32B57Fc05F8F199a8577EfcB3F62Ed8';


// Token addresses
let BTC_ADDRESS = '0x31a721837d8964772142e1136B8878b6608549F2';
let BNB_ADDRESS = '0xE03639b06Be343BC0898FAaA8463EcF6E5c14869';
let USDT_ADDRESS = '0xA3142213778e757B2AacAdCEe143B03AacFe7bE9';
let USDC_ADDRESS = '0x188E24768794fA1f126aB97ff5F06D4c5B4bda42';
let DAI_ADDRESS = '0x719C9B9CF384E73Ff7D149f237D5cb9004F0d97f';
let RWA_GOLD_ADDRESS = '0x57a2825c2e54F90b92580b3C690A24EAC55C1702';

type PoolInfo = {
  name: string;
  address: string;
  fee: number;
};

function encodePriceSqrt(
  reserve1: number,
  reserve0: number,
  decimals1: number,
  decimals0: number,
): bigint {
  // Adjust for decimals
  const adjustedReserve1 = BigInt(
    Math.floor(reserve1 * 10 ** (18 - decimals1)),
  );
  const adjustedReserve0 = BigInt(
    Math.floor(reserve0 * 10 ** (18 - decimals0)),
  );

  const numerator = adjustedReserve1 * (BigInt(1) << BigInt(192));
  const denominator = adjustedReserve0;

  const ratioX192 = numerator / denominator;

  // Calculate square root using BigInt
  let y = ratioX192;
  let z = (y + BigInt(1)) >> BigInt(1);
  while (z < y) {
    y = z;
    z = (ratioX192 / z + z) >> BigInt(1);
  }

  return y;
}

async function getExchangeRates(): Promise<{ [key: string]: number }> {
  return { BTC: 107000, BNB: 710, USDT: 1, USDC: 1, DAI: 1, GOLD: 1900 };
}

async function createPool(
  factoryContract: IUniswapV3Factory,
  token0: string,
  token1: string,
  fee: number,
  sqrtPriceX96: bigint,
): Promise<string> {
  // Get pool name first
  const poolName = getPoolName(token0, token1);
  
  // Check if pool exists
  const existingPool = await factoryContract.getPool(token0, token1, fee);
  if (existingPool !== '0x0000000000000000000000000000000000000000') {
    console.log(`Existing ${poolName} Pool found at: ${existingPool}`);
    return existingPool;
  }

  // If pool doesn't exist, create it
  try {
    const tx = await factoryContract.createPool(token0, token1, fee);
    await tx.wait();
    const poolAddress = await factoryContract.getPool(token0, token1, fee);
    console.log(`New ${poolName} Pool created at: ${poolAddress}`);
    return poolAddress;
  } catch (err) {
    console.error(`Error creating ${poolName} Pool:`, err);
    throw err;
  }
}

function getPoolName(token0: string, token1: string): string {
  const tokenMap: { [key: string]: string } = {
    [BTC_ADDRESS]: 'BTC',
    [BNB_ADDRESS]: 'BNB',
    [USDT_ADDRESS]: 'USDT',
    [USDC_ADDRESS]: 'USDC',
    [DAI_ADDRESS]: 'DAI',
    [RWA_GOLD_ADDRESS]: 'GOLD',
  };
  return `${tokenMap[token0]}-${tokenMap[token1]}`;
}

async function addLiquidity(
  positionManagerContract: INonfungiblePositionManager,
  token0: string,
  token1: string,
  fee: number,
  amount0Desired: bigint,
  amount1Desired: bigint,
  sqrtPriceX96: bigint,
) {
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  // Ensure token0 < token1
  const [tokenA, tokenB] =
    token0.toLowerCase() < token1.toLowerCase()
      ? [token0, token1]
      : [token1, token0];
  const [amount0, amount1] =
    token0.toLowerCase() < token1.toLowerCase()
      ? [amount0Desired, amount1Desired]
      : [amount1Desired, amount0Desired];

  const tickSpacing = TICK_SPACINGS[fee as keyof typeof TICK_SPACINGS];
  const currentTick = TickMath.getTickAtSqrtRatio(
    JSBI.BigInt(sqrtPriceX96.toString()),
  );
  
  // Make tick range even smaller and centered around current price
  const tickLower = nearestUsableTick(
    currentTick - tickSpacing * 50, // Reduced range
    tickSpacing,
  );
  const tickUpper = nearestUsableTick(
    currentTick + tickSpacing * 50, // Reduced range
    tickSpacing,
  );

  // Add debug logging
  console.log('\nDetailed Position Information:');
  console.log('Token0:', tokenA);
  console.log('Token1:', tokenB);
  console.log('Current Price (in ticks):', currentTick);
  console.log('Amount0:', amount0.toString());
  console.log('Amount1:', amount1.toString());
  console.log('Price Range:', {
    lower: tickToPrice(tickLower),
    current: tickToPrice(currentTick),
    upper: tickToPrice(tickUpper),
    tickLower,
    tickUpper,
    currentTick,
    tickSpacing
  });

  const mintParams = {
    token0: tokenA,
    token1: tokenB,
    fee: fee,
    tickLower: tickLower,
    tickUpper: tickUpper,
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: 0,
    amount1Min: 0,
    recipient: await (await ethers.provider.getSigner()).getAddress(),
    deadline: deadline,
  };

  // Initialize pool if necessary
  try {
    const pool = await positionManagerContract.createAndInitializePoolIfNecessary(
      tokenA,
      tokenB,
      fee,
      sqrtPriceX96,
    );
    console.log('Pool initialization successful:', pool);
  } catch (err: any) {
    if (!err.message.includes('AlreadyInitialized')) {
      console.error('Pool initialization failed:', err);
      throw err;
    }
  }

  // Add liquidity with more error handling
  try {
    console.log('\nAdding liquidity with params:', mintParams);
    
    // First check if we can estimate the gas
    const gasEstimate = await positionManagerContract.mint.estimateGas(mintParams);
    console.log('Estimated gas:', gasEstimate.toString());
    
    // If gas estimation succeeds, proceed with the transaction
    const tx = await positionManagerContract.mint(mintParams, {
      gasLimit: gasEstimate * 120n / 100n // Using bigint arithmetic
    });
    console.log('Mint transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Mint transaction confirmed:', receipt);
    return receipt;
  } catch (error: any) {
    console.error('\nMint transaction failed:');
    console.error('Error:', error);
    
    // Try to decode common Uniswap V3 errors
    if (error.data) {
      try {
        const iface = new ethers.Interface([
          'error InvalidTickRange(int24 tickLower, int24 tickUpper)',
          'error InsufficientInputAmount()',
          'error PriceSlippageCheck(uint256 amount0, uint256 amount1)',
          'error LOK()',
          'error TLU()',
          'error TLM()',
          'error TUM()',
          'error M0()',
          'error M1()'
        ]);
        const decoded = iface.parseError(error.data);
        console.error('Decoded error:', decoded);
      } catch (e) {
        console.error('Raw error data:', error.data);
      }
    }
    throw error;
  }
}

// Helper function to convert tick to price
function tickToPrice(tick: number): number {
  const price = 1.0001 ** tick;
  return price;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating pools with the account:', await deployer.getAddress());

  const exchangeRates = await getExchangeRates();
  console.log('Fetched exchange rates:', exchangeRates);

  const factory = IUniswapV3Factory__factory.connect(FACTORY_ADDRESS, deployer);
  const positionManager = INonfungiblePositionManager__factory.connect(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    deployer,
  );

  const poolInfo: PoolInfo[] = [];

  // Create BTC-BNB pool
  const btcBnbSqrtPriceX96 = encodePriceSqrt(
    exchangeRates.BTC,
    exchangeRates.BNB,
    8,
    18,
  );
  const btcBnbPoolAddress = await createPool(
    factory,
    BTC_ADDRESS,
    BNB_ADDRESS,
    500,
    btcBnbSqrtPriceX96,
  );
  poolInfo.push({
    name: 'BTC-BNB',
    address: btcBnbPoolAddress,
    fee: 500,
  });

  // Create DAI-BNB pool
  const daiBnbSqrtPriceX96 = encodePriceSqrt(1, exchangeRates.BNB, 18, 18);
  const daiBnbPoolAddress = await createPool(
    factory,
    DAI_ADDRESS,
    BNB_ADDRESS,
    500,
    daiBnbSqrtPriceX96,
  );
  poolInfo.push({
    name: 'DAI-BNB',
    address: daiBnbPoolAddress,
    fee: 500,
  });

   // Create USDT-USDC pool
   const usdtUsdcPrice = exchangeRates.USDT / exchangeRates.USDC;
   console.log({ usdtUsdcPrice });
   const usdtUsdcSqrtPriceX96 = encodePriceSqrt(
     exchangeRates.USDT,
     exchangeRates.USDC,
     6,
     6,
   );
   const usdtUsdcPoolAddress = await createPool(
     factory,
     USDT_ADDRESS,
     USDC_ADDRESS,
     500,
     usdtUsdcSqrtPriceX96,
   );
   poolInfo.push({
     name: 'USDT-USDC',
     address: usdtUsdcPoolAddress,
     fee: 500,
   });

  // Create USDC-RWA(GOLD) pool
  const usdcGoldSqrtPriceX96 = encodePriceSqrt(1, 1900, 6, 18); // Assuming 1 GOLD = $1900
  const usdcGoldPoolAddress = await createPool(
    factory,
    USDC_ADDRESS,
    RWA_GOLD_ADDRESS,
    500,
    usdcGoldSqrtPriceX96,
  );
  poolInfo.push({
    name: 'USDC-GOLD',
    address: usdcGoldPoolAddress,
    fee: 500,
  });

  // Create USDC-BNB pool
  const usdcBnbSqrtPriceX96 = encodePriceSqrt(1, exchangeRates.BNB, 6, 18);
  const usdcBnbPoolAddress = await createPool(
    factory,
    USDC_ADDRESS,
    BNB_ADDRESS,
    500,
    usdcBnbSqrtPriceX96,
  );
  poolInfo.push({
    name: 'USDC-BNB',
    address: usdcBnbPoolAddress,
    fee: 500,
  });

  // Create USDT-BNB pool
  const usdtBnbSqrtPriceX96 = encodePriceSqrt(1, exchangeRates.BNB, 6, 18);
  const usdtBnbPoolAddress = await createPool(
    factory,
    USDT_ADDRESS,
    BNB_ADDRESS,
    500,
    usdtBnbSqrtPriceX96,
  );
  poolInfo.push({
    name: 'USDT-BNB',
    address: usdtBnbPoolAddress,
    fee: 500,
  });

  // Create USDT-RWA(GOLD) pool
  const usdtGoldSqrtPriceX96 = encodePriceSqrt(1, 1900, 6, 18); // Assuming 1 GOLD = $1900
  const usdtGoldPoolAddress = await createPool(
    factory,
    USDT_ADDRESS,
    RWA_GOLD_ADDRESS,
    500,
    usdtGoldSqrtPriceX96,
  );
  poolInfo.push({
    name: 'USDT-GOLD',
    address: usdtGoldPoolAddress,
    fee: 500,
  });

  // Add liquidity with fixed amounts
  const btcToken = MockERC20__factory.connect(BTC_ADDRESS, deployer);
  const bnbToken = MockERC20__factory.connect(BNB_ADDRESS, deployer);
  const usdtToken = MockERC20__factory.connect(USDT_ADDRESS, deployer);
  const usdcToken = MockERC20__factory.connect(USDC_ADDRESS, deployer);
  const daiToken = MockERC20__factory.connect(DAI_ADDRESS, deployer);
  const goldToken = MockERC20__factory.connect(RWA_GOLD_ADDRESS, deployer);

  // BTC-BNB pool
  {
    const btcAmount = ethers.parseUnits('0.01', 8);  // 0.01 BTC
    const bnbAmount = ethers.parseUnits(
      ((0.01 * exchangeRates.BTC) / exchangeRates.BNB).toFixed(18),
    );
    
    console.log('\nAttempting to add liquidity:');
    console.log('BTC Amount:', btcAmount.toString());
    console.log('BNB Amount:', bnbAmount.toString());
    
    // Check balances before adding liquidity
    const btcBalance = await btcToken.balanceOf(await deployer.getAddress());
    const bnbBalance = await bnbToken.balanceOf(await deployer.getAddress());
    console.log('\nCurrent balances:');
    console.log('BTC Balance:', btcBalance.toString());
    console.log('BNB Balance:', bnbBalance.toString());
    
    // Just approve without minting new tokens
    await (await btcToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, 0)).wait();
    await (await bnbToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, 0)).wait();
    await (await btcToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, btcAmount)).wait();
    await (await bnbToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, bnbAmount)).wait();
    
    // Verify approvals
    const btcAllowance = await btcToken.allowance(await deployer.getAddress(), NONFUNGIBLE_POSITION_MANAGER_ADDRESS);
    const bnbAllowance = await bnbToken.allowance(await deployer.getAddress(), NONFUNGIBLE_POSITION_MANAGER_ADDRESS);
    console.log('\nFinal allowances:');
    console.log('BTC Allowance:', btcAllowance.toString());
    console.log('BNB Allowance:', bnbAllowance.toString());

    try {
        await addLiquidity(
          positionManager,
          BTC_ADDRESS,
          BNB_ADDRESS,
          500,
          btcAmount,
          bnbAmount,
          btcBnbSqrtPriceX96,
        );
    } catch (error: any) {
        console.error('\nDetailed error information:');
        console.error('Error message:', error.message);
        if (error.error && error.error.data) {
            try {
                // Try to decode the error
                const iface = new ethers.Interface([
                    'error InvalidTickRange(int24 tickLower, int24 tickUpper)',
                    'error InsufficientInputAmount()',
                    'error PriceSlippageCheck(uint256 amount0, uint256 amount1)',
                    'error LOK()',
                    'error TLU()',
                    'error TLM()',
                    'error TUM()',
                    'error M0()',
                    'error M1()'
                ]);
                const decoded = iface.parseError(error.error.data);
                console.error('Decoded error:', decoded);
            } catch (e) {
                console.error('Raw error data:', error.error.data);
            }
        }
        throw error;
    }
  }

  // USDT-USDC pool
  {
    const usdtAmount = ethers.parseUnits('1000000', 6);  // 1M USDT
    const usdcAmount = ethers.parseUnits('1000000', 6);  // 1M USDC
    
    await (await usdtToken.mint(await deployer.getAddress(), usdtAmount)).wait();
    await (await usdcToken.mint(await deployer.getAddress(), usdcAmount)).wait();
    await (await usdtToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, usdtAmount)).wait();
    await (await usdcToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, usdcAmount)).wait();
    
    await addLiquidity(
      positionManager,
      USDT_ADDRESS,
      USDC_ADDRESS,
      500,
      usdtAmount,
      usdcAmount,
      usdtUsdcSqrtPriceX96,
    );
  }

  // DAI-BNB pool
  {
    const daiAmount = ethers.parseUnits('1000000', 18);  // 1M DAI
    const bnbAmount = ethers.parseUnits('415', 18);      // Equivalent BNB
    
    await (await daiToken.mint(await deployer.getAddress(), daiAmount)).wait();
    await (await bnbToken.mint(await deployer.getAddress(), bnbAmount)).wait();
    await (await daiToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, daiAmount)).wait();
    await (await bnbToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, bnbAmount)).wait();
    
    await addLiquidity(
      positionManager,
      DAI_ADDRESS,
      BNB_ADDRESS,
      500,
      daiAmount,
      bnbAmount,
      daiBnbSqrtPriceX96,
    );
  }

  // USDC-GOLD pool
  {
    const usdcAmount = ethers.parseUnits('1900000', 6);  // 1.9M USDC
    const goldAmount = ethers.parseUnits('1000', 18);    // 1000 GOLD
    
    await (await usdcToken.mint(await deployer.getAddress(), usdcAmount)).wait();
    await (await goldToken.mint(await deployer.getAddress(), goldAmount)).wait();
    await (await usdcToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, usdcAmount)).wait();
    await (await goldToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, goldAmount)).wait();
    
    await addLiquidity(
      positionManager,
      USDC_ADDRESS,
      RWA_GOLD_ADDRESS,
      500,
      usdcAmount,
      goldAmount,
      usdcGoldSqrtPriceX96,
    );
  }

  // USDC-BNB pool
  {
    const usdcAmount = ethers.parseUnits('1000000', 6);  // 1M USDC
    const bnbAmount = ethers.parseUnits('415', 18);      // Equivalent BNB
    
    await (await usdcToken.mint(await deployer.getAddress(), usdcAmount)).wait();
    await (await bnbToken.mint(await deployer.getAddress(), bnbAmount)).wait();
    await (await usdcToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, usdcAmount)).wait();
    await (await bnbToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, bnbAmount)).wait();
    
    await addLiquidity(
      positionManager,
      USDC_ADDRESS,
      BNB_ADDRESS,
      500,
      usdcAmount,
      bnbAmount,
      usdcBnbSqrtPriceX96,
    );
  }

  // USDT-BNB pool
  {
    const usdtAmount = ethers.parseUnits('1000000', 6);  // 1M USDT
    const bnbAmount = ethers.parseUnits('415', 18);      // Equivalent BNB
    
    await (await usdtToken.mint(await deployer.getAddress(), usdtAmount)).wait();
    await (await bnbToken.mint(await deployer.getAddress(), bnbAmount)).wait();
    await (await usdtToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, usdtAmount)).wait();
    await (await bnbToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, bnbAmount)).wait();
    
    await addLiquidity(
      positionManager,
      USDT_ADDRESS,
      BNB_ADDRESS,
      500,
      usdtAmount,
      bnbAmount,
      usdtBnbSqrtPriceX96,
    );
  }

  // USDT-GOLD pool
  {
    const usdtAmount = ethers.parseUnits('1900000', 6);  // 1.9M USDT
    const goldAmount = ethers.parseUnits('1000', 18);    // 1000 GOLD
    
    await (await usdtToken.mint(await deployer.getAddress(), usdtAmount)).wait();
    await (await goldToken.mint(await deployer.getAddress(), goldAmount)).wait();
    await (await usdtToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, usdtAmount)).wait();
    await (await goldToken.approve(NONFUNGIBLE_POSITION_MANAGER_ADDRESS, goldAmount)).wait();
    
    await addLiquidity(
      positionManager,
      USDT_ADDRESS,
      RWA_GOLD_ADDRESS,
      500,
      usdtAmount,
      goldAmount,
      usdtGoldSqrtPriceX96,
    );
  }

  console.log('Pool creation and liquidity addition completed successfully!');
  console.log('\nCreated Pools:');
  console.table(poolInfo);
}

// https://blog.uniswap.org/uniswap-v3-math-primer#how-do-i-calculate-the-current-exchange-rate
function GetPrice(PoolInfo: {
  SqrtX96: number;
  Decimal0: number;
  Decimal1: number;
}) {
  let sqrtPriceX96 = PoolInfo.SqrtX96;
  let Decimal0 = PoolInfo.Decimal0;
  let Decimal1 = PoolInfo.Decimal1;

  const buyOneOfToken0 = parseFloat(
    ((sqrtPriceX96 / 2 ** 96) ** 2 / (10 ** Decimal1 / 10 ** Decimal0)).toFixed(
      Decimal1,
    ),
  );

  const buyOneOfToken1 = parseFloat((1 / buyOneOfToken0).toFixed(Decimal0));
  console.log(
    'price of token0 in value of token1 : ' + buyOneOfToken0.toString(),
  );
  console.log(
    'price of token1 in value of token0 : ' + buyOneOfToken1.toString(),
  );
  console.log('');
  // Convert to wei
  const buyOneOfToken0Wei = Math.floor(
    buyOneOfToken0 * 10 ** Decimal1,
  ).toLocaleString('fullwide', { useGrouping: false });
  const buyOneOfToken1Wei = Math.floor(
    buyOneOfToken1 * 10 ** Decimal0,
  ).toLocaleString('fullwide', { useGrouping: false });
  console.log(
    'price of token0 in value of token1 in lowest decimal : ' +
      buyOneOfToken0Wei,
  );
  console.log(
    'price of token1 in value of token1 in lowest decimal : ' +
      buyOneOfToken1Wei,
  );
  console.log('');
}

// fetch exchange rates for each pool
const getPrices = async () => {
  const factory = IUniswapV3Factory__factory.connect(
    FACTORY_ADDRESS,
    ethers.provider,
  );

  // Get all pool addresses
  const btcBnbPool = await factory.getPool(BTC_ADDRESS, BNB_ADDRESS, 500);
  const usdtUsdcPool = await factory.getPool(USDT_ADDRESS, USDC_ADDRESS, 500);
  const daiBnbPool = await factory.getPool(DAI_ADDRESS, BNB_ADDRESS, 500);
  const usdcGoldPool = await factory.getPool(USDC_ADDRESS, RWA_GOLD_ADDRESS, 500);
  const usdcBnbPool = await factory.getPool(USDC_ADDRESS, BNB_ADDRESS, 500);
  const usdtBnbPool = await factory.getPool(USDT_ADDRESS, BNB_ADDRESS, 500);
  const usdtGoldPool = await factory.getPool(USDT_ADDRESS, RWA_GOLD_ADDRESS, 500);

  // Get pool contracts
  const btcBnbPoolContract = UniswapV3Pool__factory.connect(btcBnbPool, ethers.provider);
  const usdtUsdcPoolContract = UniswapV3Pool__factory.connect(usdtUsdcPool, ethers.provider);
  const daiBnbPoolContract = UniswapV3Pool__factory.connect(daiBnbPool, ethers.provider);
  const usdcGoldPoolContract = UniswapV3Pool__factory.connect(usdcGoldPool, ethers.provider);
  const usdcBnbPoolContract = UniswapV3Pool__factory.connect(usdcBnbPool, ethers.provider);
  const usdtBnbPoolContract = UniswapV3Pool__factory.connect(usdtBnbPool, ethers.provider);
  const usdtGoldPoolContract = UniswapV3Pool__factory.connect(usdtGoldPool, ethers.provider);

  console.log('\nPool Addresses:');
  console.log('BTC-BNB Pool:', btcBnbPool);
  console.log('USDT-USDC Pool:', usdtUsdcPool);
  console.log('DAI-BNB Pool:', daiBnbPool);
  console.log('USDC-GOLD Pool:', usdcGoldPool);
  console.log('USDC-BNB Pool:', usdcBnbPool);
  console.log('USDT-BNB Pool:', usdtBnbPool);
  console.log('USDT-GOLD Pool:', usdtGoldPool);

  // Get prices for each pool
  console.log('\nPool Prices:');

  // BTC-BNB
  {
    const slot0 = await btcBnbPoolContract.slot0();
    console.log('\nBTC-BNB Pool:');
    GetPrice({
      SqrtX96: parseInt(slot0.sqrtPriceX96.toString()),
      Decimal0: 8,  // BTC decimals
      Decimal1: 18, // BNB decimals
    });
  }

  // USDT-USDC
  {
    const slot0 = await usdtUsdcPoolContract.slot0();
    console.log('\nUSDT-USDC Pool:');
    GetPrice({
      SqrtX96: parseInt(slot0.sqrtPriceX96.toString()),
      Decimal0: 6, // USDT decimals
      Decimal1: 6, // USDC decimals
    });
  }

  // DAI-BNB
  {
    const slot0 = await daiBnbPoolContract.slot0();
    console.log('\nDAI-BNB Pool:');
    GetPrice({
      SqrtX96: parseInt(slot0.sqrtPriceX96.toString()),
      Decimal0: 18, // DAI decimals
      Decimal1: 18, // BNB decimals
    });
  }

  // USDC-GOLD
  {
    const slot0 = await usdcGoldPoolContract.slot0();
    console.log('\nUSDC-GOLD Pool:');
    GetPrice({
      SqrtX96: parseInt(slot0.sqrtPriceX96.toString()),
      Decimal0: 6,  // USDC decimals
      Decimal1: 18, // GOLD decimals
    });
  }

  // USDC-BNB
  {
    const slot0 = await usdcBnbPoolContract.slot0();
    console.log('\nUSDC-BNB Pool:');
    GetPrice({
      SqrtX96: parseInt(slot0.sqrtPriceX96.toString()),
      Decimal0: 6,  // USDC decimals
      Decimal1: 18, // BNB decimals
    });
  }

  // USDT-BNB
  {
    const slot0 = await usdtBnbPoolContract.slot0();
    console.log('\nUSDT-BNB Pool:');
    GetPrice({
      SqrtX96: parseInt(slot0.sqrtPriceX96.toString()),
      Decimal0: 6,  // USDT decimals
      Decimal1: 18, // BNB decimals
    });
  }

  // USDT-GOLD
  {
    const slot0 = await usdtGoldPoolContract.slot0();
    console.log('\nUSDT-GOLD Pool:');
    GetPrice({
      SqrtX96: parseInt(slot0.sqrtPriceX96.toString()),
      Decimal0: 6,  // USDT decimals
      Decimal1: 18, // GOLD decimals
    });
  }

  // Print reserves for all pools
  console.log('\nPool Reserves:');
  
  const btc = MockERC20__factory.connect(BTC_ADDRESS, ethers.provider);
  const bnb = MockERC20__factory.connect(BNB_ADDRESS, ethers.provider);
  const usdt = MockERC20__factory.connect(USDT_ADDRESS, ethers.provider);
  const usdc = MockERC20__factory.connect(USDC_ADDRESS, ethers.provider);
  const dai = MockERC20__factory.connect(DAI_ADDRESS, ethers.provider);
  const gold = MockERC20__factory.connect(RWA_GOLD_ADDRESS, ethers.provider);

  console.log('\nBTC-BNB Pool:');
  console.log('BTC Reserve:', (await btc.balanceOf(btcBnbPool)).toString());
  console.log('BNB Reserve:', (await bnb.balanceOf(btcBnbPool)).toString());

  console.log('\nUSDT-USDC Pool:');
  console.log('USDT Reserve:', (await usdt.balanceOf(usdtUsdcPool)).toString());
  console.log('USDC Reserve:', (await usdc.balanceOf(usdtUsdcPool)).toString());

  console.log('\nDAI-BNB Pool:');
  console.log('DAI Reserve:', (await dai.balanceOf(daiBnbPool)).toString());
  console.log('BNB Reserve:', (await bnb.balanceOf(daiBnbPool)).toString());

  console.log('\nUSDC-GOLD Pool:');
  console.log('USDC Reserve:', (await usdc.balanceOf(usdcGoldPool)).toString());
  console.log('GOLD Reserve:', (await gold.balanceOf(usdcGoldPool)).toString());

  console.log('\nUSDC-BNB Pool:');
  console.log('USDC Reserve:', (await usdc.balanceOf(usdcBnbPool)).toString());
  console.log('BNB Reserve:', (await bnb.balanceOf(usdcBnbPool)).toString());

  console.log('\nUSDT-BNB Pool:');
  console.log('USDT Reserve:', (await usdt.balanceOf(usdtBnbPool)).toString());
  console.log('BNB Reserve:', (await bnb.balanceOf(usdtBnbPool)).toString());

  console.log('\nUSDT-GOLD Pool:');
  console.log('USDT Reserve:', (await usdt.balanceOf(usdtGoldPool)).toString());
  console.log('GOLD Reserve:', (await gold.balanceOf(usdtGoldPool)).toString());
};

main()
  .then(async () => {
    await getPrices();
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// getPrices().catch(console.error);
