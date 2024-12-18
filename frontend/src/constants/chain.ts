import { createPublicClient, defineChain, http } from 'viem';

// export const kiichainTestnet = defineChain({
//   id: 123454321,
//   name: 'Kiichain Tesnet',
//   nativeCurrency: {
//     name: 'KII',
//     symbol: 'KII',
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://a.sentry.testnet.kiivalidator.com:8645'],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Kiichain Testnet',
//       url: 'https://app.kiiglobal.io/kiichain',
//       apiUrl: '',
//     },
//   },
//   contracts: {
//     multicall3: {
//       address: '0x032690D03EB035B8D1e43A57086ee5b829ebf316',
//     },
//   },
// });

export const opBNBTestnet = defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  network: 'opBNB Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    public: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
    default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'opBNB Scan', url: 'http://opbnbscan.com/' },
    default: { name: 'opBNB Scan', url: 'http://opbnbscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
});

export const client = createPublicClient({
  chain: opBNBTestnet,
  transport: http(),
});
