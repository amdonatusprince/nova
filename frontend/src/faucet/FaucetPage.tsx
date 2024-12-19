
import { NextPage } from 'next';
import React from 'react';
import { parseAbi } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import { BalanceList } from '@/components/BalanceList';
import { FaucetItem } from '@/components/FaucetItem';
import { Notification } from '@/components/Notification';
import { client } from '@/constants/chain';
import { TOKENS, getToken } from '@/constants/tokens';


const TOKEN_AMOUNTS: Record<string, number> = {
  BTC: 0.005,
  BNB: 0.5,
  USDC: 10,
  USDT: 10,
  DAI: 10,
  GOLD: 1,
  sNOVA: 1,
};

const FaucetPage: NextPage = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  return (
    <>
      <Notification />

      {/* main */}
      <main className="mt-[100px] flex flex-col w-full max-w-[1000px] mx-auto px-4">
        <BalanceList className="w-full max-w-[600px] mx-auto mt-[32px]">
          {TOKENS.map((token) => (
            <FaucetItem
              key={token.address}
              {...token}
              amount={TOKEN_AMOUNTS[token.symbol]}
              onClick={async (amountInUnits) => {
                console.log(`Claiming ${amountInUnits} ${token.symbol}`);
                if (!walletClient || !address) {
                  alert('Please connect your wallet');
                  return;
                }
                const tx = await walletClient.writeContract({
                  address: token.address,
                  abi: parseAbi([
                    'function mint(address to, uint256 amount) public',
                  ]),
                  functionName: 'mint',
                  args: [address, amountInUnits],
                });
                const receipt = await client.waitForTransactionReceipt({
                  hash: tx,
                });
                console.log(receipt);
              }}
            />
          ))}
        </BalanceList>
      </main>

      <style global jsx>{`
        html {
          background: #f1eef4;
        }
      `}</style>
    </>
  );
};

export default FaucetPage;
