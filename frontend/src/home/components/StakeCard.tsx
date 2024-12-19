import styled from '@emotion/styled';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Address, formatEther, parseEther } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import { Toaster, toast } from 'react-hot-toast';
import bnbToSnovaImage from '@/assets/bnb-to-snova.png';
import { NovaButton } from '@/components/NovaButton';
import { client } from '@/constants/chain';
import { tBNB, sNOVA, HARDCODED_TOKEN_PRICES } from '@/constants/tokens';
import { TokenBalanceData } from '@/hooks/useWalletTokens';

import { StakeTokenInput } from './StakeTokenInput';

const STAKED_NOVA_ADDRESS = '0x999A03C4c31790eB9Bf0e86F8c8439A0119ECE4f';

type StakeCardProps = {
  tokenBalances: Record<Address, TokenBalanceData>;
};
export const StakeCard: React.FC<StakeCardProps> = ({ tokenBalances }) => {
  const [stage, setStage] = useState<'main' | 'stake' | 'unstake'>('main');
  const [draft, setDraft] = useState<string>('');
  const [estimation, setEstimation] = useState<string>('0');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!draft || draft === '0') {
      setEstimation('0');
      setError('');
      return;
    }

    const fetchEstimation = async () => {
      try {
        const amount = parseFloat(draft);
        const balance = stage === 'stake' 
          ? parseFloat(formatEther(tokenBalances[tBNB.address]?.balance || 0n))
          : parseFloat(formatEther(tokenBalances[sNOVA.address]?.balance || 0n));
        
        if (amount > balance) {
          setError('Insufficient balance');
          setEstimation('0');
          return;
        }

        setError('');
        
        if (stage === 'stake') {
          const bnbPrice = HARDCODED_TOKEN_PRICES[tBNB.address];
          const sNovaPrice = HARDCODED_TOKEN_PRICES[sNOVA.address];
          const ratio = sNovaPrice / bnbPrice;
          setEstimation((amount * ratio).toString());
        } else {
          const bnbPrice = HARDCODED_TOKEN_PRICES[tBNB.address];
          const sNovaPrice = HARDCODED_TOKEN_PRICES[sNOVA.address];
          const ratio = bnbPrice / sNovaPrice;
          setEstimation((amount * ratio).toString());
        }
      } catch (error) {
        console.error('Estimation failed:', error);
        setEstimation('0');
        setError('Invalid amount');
      }
    };

    fetchEstimation();
  }, [draft, stage, tokenBalances]);

  const { address } = useAccount();
  const walletClientRes = useWalletClient();

  const handleSwap = async () => {
    const walletClient = walletClientRes.data;
    if (!address || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseEther(draft);
      let tx;

      if (stage === 'stake') {
        tx = await walletClient.writeContract({
          address: STAKED_NOVA_ADDRESS,
          abi: ABI,
          functionName: 'stake',
          value: amount,
        });
      } else {
        tx = await walletClient.writeContract({
          address: STAKED_NOVA_ADDRESS,
          abi: ABI,
          functionName: 'unstake',
          args: [amount],
        });
      }

      const receipt = await client.waitForTransactionReceipt({ hash: tx });
      console.log(receipt);
      
      toast.success(
        `Successfully ${stage === 'stake' ? 'staked' : 'unstaked'} ${draft} ${
          stage === 'stake' ? 'BNB' : 'sNOVA'
        }`
      );
      
      setDraft('');
      setEstimation('0');
    } catch (error) {
      console.error(`${stage === 'stake' ? 'Stake' : 'Unstake'} failed:`, error);
      toast.error(
        `Failed to ${stage === 'stake' ? 'stake' : 'unstake'}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <StakeImageWrapper>
        <StakeImage src={bnbToSnovaImage} alt="" />
        <AbsoluteStakeImage src={bnbToSnovaImage} alt="" />
      </StakeImageWrapper>
      {stage === 'main' ? (
        <>
          <StakeTitle>Stake your BNB and receive sNOVA</StakeTitle>
          <div className="mt-[10px] flex items-center w-full gap-[6px]">
            <NovaButton
              className="flex-1 primary"
              onClick={() => setStage('stake')}
            >
              Stake
            </NovaButton>
            <NovaButton className="flex-1" onClick={() => setStage('unstake')}>
              Unstake
            </NovaButton>
          </div>
        </>
      ) : (
        <div className="flex flex-col w-full">
          <InteractionTitleContainer>
            <InteractionTitle>
              {stage === 'stake' ? 'Stake BNB' : 'Unstake sNOVA'}
            </InteractionTitle>
            <Chavron
              className="transition-opacity cursor-pointer hover:opacity-65"
              onClick={() => {
                setStage('main');

                // reset draft and estimation
                setDraft('');
                setEstimation('0');
              }}
            />
          </InteractionTitleContainer>
          <div className="mt-[10px] flex flex-col items-center w-full gap-[10px]">
            <StakeTokenInput
              label="Sell"
              token={stage === 'stake' ? tBNB : sNOVA}
              value={draft}
              placeholder="0"
              onChange={(e) => setDraft(e.target.value)}
              tokenBalances={tokenBalances}
            />
            {error && (
              <span className="text-red-500 text-sm w-full text-left">
                {error}
              </span>
            )}
            <StakeTokenInput
              label="Buy"
              token={stage === 'stake' ? sNOVA : tBNB}
              value={estimation}
              disabled
              tokenBalances={tokenBalances}
            />
            <NovaButton
              className="w-full primary"
              onClick={handleSwap}
              disabled={!!error || !draft || draft === '0' || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="w-5 h-5" />
                  <span>Processing...</span>
                </div>
              ) : (
                stage === 'stake' ? 'Stake' : 'Unstake'
              )}
            </NovaButton>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 464px;

  padding: 12px;
  border-radius: 16px;
  /* background: #fff; */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 5%, #fff 100%);

  box-shadow: 0px 16px 32px 0px rgba(29, 0, 79, 0.06);

  display: flex;
  flex-direction: column;
`;
const StakeImageWrapper = styled.div`
  margin: 0 auto;
  position: relative;
  display: flex;

  width: 116px;
  height: 132px;
  z-index: 0;
`;
const StakeImage = styled(Image)`
  width: 100%;
  height: 100%;
`;
const AbsoluteStakeImage = styled(StakeImage)`
  width: 100%;
  height: 100%;

  position: absolute;
  top: 18px;
  right: 36px;
  z-index: -1;
  filter: blur(23px);
  opacity: 0.65;
`;
const StakeTitle = styled.h2`
  margin-top: 10px;

  color: #1d004f;
  text-align: center;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.88px;
`;

const InteractionTitleContainer = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
const InteractionTitle = styled.h2`
  color: #1d004f;
  text-align: center;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.88px;
`;

const Chavron: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clip-path="url(#clip0_8_93)">
      <rect
        x="0.5"
        y="0.651001"
        width="27"
        height="27"
        rx="13.5"
        fill="#C9AAFF"
        fillOpacity="0.19"
      />
      <g clip-path="url(#clip1_8_93)">
        <path
          d="M8 15.651L14 9.651L20 15.651"
          stroke="#5D00FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_8_93">
        <rect
          x="0.5"
          y="0.651001"
          width="27"
          height="27"
          rx="13.5"
          fill="white"
        />
      </clipPath>
      <clipPath id="clip1_8_93">
        <rect
          width="27"
          height="27"
          fill="white"
          transform="matrix(1 0 0 -1 0.5 27.651)"
        />
      </clipPath>
    </defs>
  </svg>
);

const ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'allowance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidApprover',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSpender',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'ethAmount',
        type: 'uint256',
      },
    ],
    name: 'estimateStakeOut',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'estimateUnstakeOut',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stake',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

export const Spinner = ({ className = "" }) => (
  <svg 
    className={`animate-spin ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
