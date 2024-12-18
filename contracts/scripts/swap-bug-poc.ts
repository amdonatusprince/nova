import * as dotenv from 'dotenv';
import { formatUnits, parseEther } from 'viem';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { BANK_ABI, SWAP_ABI } from './precompiles';

dotenv.config();

const PRECOMPILES = {
  Bank: '0x4381dC2aB14285160c808659aEe005D51255adD7',
  Staking: '0xd9A998CaC66092748FfEc7cFBD155Aae1737C2fF',
  Rewards: '0x55684E2CA2BACE0ADC512C1AFF880B15B8EA7214',

  // https://github.com/KiiChain/kii-solidity-contracts/blob/2932b6e50cde33f1bc9e7a82148e1b3aa3bc3c70/contracts/Swap.sol#L18
  Swap: '0xF948f57612E05320A6636a965cA4fbaed3147A0f',
} as const;
console.log(PRECOMPILES);

const kiichain = defineChain({
  // https://docs.kiiglobal.io/docs/build-on-kiichain/developer-tools/deploy-a-smart-contract#chain-information
  id: 123454321,
  name: 'KiiChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Kii',
    symbol: 'KII',
  },
  rpcUrls: {
    default: {
      http: ['https://a.sentry.testnet.kiivalidator.com:8645'],
    },
  },
});

const client = createPublicClient({
  chain: kiichain,
  transport: http(),
});

const main = async () => {
  const account = privateKeyToAccount(
    (process.env.PRIVATE_KEY || '') as `0x${string}`,
  );
  const walletClient = createWalletClient({
    chain: kiichain,
    transport: http(),
    account,
  });

  console.log('Account address:', account.address);

  // Query available denoms in the Swap precompile
  const availableDenomsPre = await client.readContract({
    address: PRECOMPILES.Bank,
    abi: BANK_ABI,
    functionName: 'getAllSpendableBalances',
    args: [PRECOMPILES.Swap],
  });
  console.log(PRECOMPILES.Swap, { availableDenomsPre });

  // Get KII balance
  const kiiBalance = await client.getBalance({
    address: account.address,
  });
  console.log('KII balance:', formatUnits(kiiBalance, 18));

  // Get tKII balance
  const tkiiBalance = await client.readContract({
    address: PRECOMPILES.Bank,
    abi: BANK_ABI,
    functionName: 'getBalance',
    args: [account.address, 'tkii'],
  });
  console.log('tKII balance:', formatUnits(tkiiBalance, 6));

  // Buy tKII
  const kiiToBuy = parseEther('1'); // Buy 1 KII worth of tKII
  const buyHash = await walletClient.writeContract({
    address: PRECOMPILES.Swap,
    abi: SWAP_ABI,
    functionName: 'buysNOVA',
    value: kiiToBuy,
  });
  console.log('Buy transaction hash:', buyHash);

  // Wait for the transaction to be mined
  const buyReceipt = await client.waitForTransactionReceipt({ hash: buyHash });
  console.log('Buy transaction receipt:', buyReceipt);

  // Check updated balances
  const newKiiBalance = await client.getBalance({
    address: account.address,
  });
  console.log('New KII balance:', formatUnits(newKiiBalance, 18));

  const newTkiiBalance = await client.readContract({
    address: PRECOMPILES.Bank,
    abi: BANK_ABI,
    functionName: 'getBalance',
    args: [account.address, 'tkii'],
  });
  console.log('New tKII balance:', formatUnits(newTkiiBalance, 6));

  // Sell tKII (if you want to test selling)
  const tkiiToSell = 1000000n; // Sell 1 tKII
  const sellHash = await walletClient.writeContract({
    address: PRECOMPILES.Swap,
    abi: SWAP_ABI,
    functionName: 'sellsNOVA',
    args: [tkiiToSell],
  });
  console.log('Sell transaction hash:', sellHash);

  // Wait for the sell transaction to be mined
  const sellReceipt = await client.waitForTransactionReceipt({
    hash: sellHash,
  });
  console.log('Sell transaction receipt:', sellReceipt);

  // Check final balances
  const finalKiiBalance = await client.getBalance({
    address: account.address,
  });
  console.log('Final KII balance:', formatUnits(finalKiiBalance, 18));

  const finalTkiiBalance = await client.readContract({
    address: PRECOMPILES.Bank,
    abi: BANK_ABI,
    functionName: 'getBalance',
    args: [account.address, 'tkii'],
  });
  console.log('Final tKII balance:', formatUnits(finalTkiiBalance, 6));

  // Query available denoms in the Swap precompile
  const availableDenomsPost = await client.readContract({
    address: PRECOMPILES.Bank,
    abi: BANK_ABI,
    functionName: 'getAllSpendableBalances',
    args: [PRECOMPILES.Swap],
  });
  console.log(PRECOMPILES.Swap, { availableDenomsPost });
  // 0xF948f57612E05320A6636a965cA4fbaed3147A0f {
  //   availableDenomsPost: [ { amount: 1699900000000000n, denom: 'tkii' } ]
  // }

  // This will only return the same tkii (sNOVA) balance as before,
  // which was originally funded in https://github.com/KiiChain/kii-solidity-contracts/blob/2932b6e50cde33f1bc9e7a82148e1b3aa3bc3c70/scripts/send.ts#L57
  // 1699900000 * 10 ** 6
};

main().catch(console.error);
