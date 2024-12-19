import Image from 'next/image';
import { Address, zeroAddress } from 'viem';
import sNovaImage from '../../public/assets/sNova.png';

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
  logoURL: string;
  image: React.ReactNode;
};

export const tBNB = {
  name: 'BNB',
  symbol: 'tBNB',
  decimals: 18,
  address: zeroAddress,
  logoURL: '/assets/bnb.png',
  image: (
    <Image
      src="/assets/bnb.png"
      alt=""
      width={72}
      height={72}
      style={{ width: 36, height: 36 }}
    />
  ),
} as const;

export const sNOVA = {
  name: 'staked Nova',
  symbol: 'sNOVA',
  decimals: 18,
  address: '0x999A03C4c31790eB9Bf0e86F8c8439A0119ECE4f',
  logoURL: '/assets/sNova.png',
  image: (
    <div className="w-[36px] h-[36px] relative">
      <Image
        src={sNovaImage}
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36 }}
      />
      <Image
        className="absolute left-0 right-0 top-2"
        src={sNovaImage}
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36, filter: 'blur(8px)' }}
      />
    </div>
  ),
} as const;

export const TOKENS = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    address: '0x31a721837d8964772142e1136B8878b6608549F2',
    logoURL: '/assets/btc.png',
    image: (
      <Image
        src="/assets/btc.png"
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36 }}
      />
    ),
  },
  {
    name: 'NOVA',
    symbol: 'sNOVA',
    decimals: 18,
    address: '0xE03639b06Be343BC0898FAaA8463EcF6E5c14869',
    logoURL: '/assets/sNova.png',
    image: (
      <Image
        src="/assets/sNova.png"
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36 }}
      />
    ),
  },
  {
    name: 'Tether',
    symbol: 'USDT',
    decimals: 6,
    address: '0xA3142213778e757B2AacAdCEe143B03AacFe7bE9',
    logoURL: '/assets/usdt.png',
    image: (
      <Image
        src="/assets/usdt.png"
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36 }}
      />
    ),
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0x188E24768794fA1f126aB97ff5F06D4c5B4bda42',
    logoURL: '/assets/usdc.png',
    image: (
      <Image
        src="/assets/usdc.png"
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36 }}
      />
    ),
  },
  {
    name: 'Dai',
    symbol: 'DAI',
    decimals: 18,
    address: '0x719C9B9CF384E73Ff7D149f237D5cb9004F0d97f',
    logoURL: '/assets/dai.png',
    image: (
      <Image
        src="/assets/dai.png"
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36 }}
      />
    ),
  },
  {
    name: 'RWA Gold',
    symbol: 'GOLD',
    decimals: 18,
    address: '0x57a2825c2e54F90b92580b3C690A24EAC55C1702',
    logoURL: '/assets/gold.png',
    image: (
      <Image
        src="/assets/gold.png"
        alt=""
        width={72}
        height={72}
        style={{ width: 36, height: 36 }}
      />
    ),
  },
] as const;

export const getToken = (addr: string) => {
  const lowercasedAddr = addr.toLowerCase();
  return (
    TOKENS.find((token) => token.address.toLowerCase() === lowercasedAddr) ||
    null
  );
};

export const HARDCODED_TOKEN_PRICES = {
  [tBNB.address]: 1.028,
  [sNOVA.address]: 185.00,
};
