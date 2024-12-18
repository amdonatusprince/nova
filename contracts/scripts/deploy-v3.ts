import { encodeBytes32String } from 'ethers';
import { ethers } from 'hardhat';

export const deployV3 = async () => {
  const wbnb = await (await ethers.getContractFactory('WBNB')).deploy();
  console.log('WBNB', await wbnb.getAddress());

  const factory = await (
    await ethers.getContractFactory('UniswapV3Factory')
  ).deploy();
  console.log('UniswapV3Factory', await factory.getAddress());
  // const hash = await factory.initCodeHash();
  // console.log('initCodeHash', hash);

  const router = await (
    await ethers.getContractFactory('SwapRouter')
  ).deploy(factory, wbnb);
  console.log('SwapRouter', await router.getAddress());

  const nftDescriptor = await (
    await ethers.getContractFactory('NFTDescriptor')
  ).deploy();
  console.log('NFTDescriptor', await nftDescriptor.getAddress());

  const tokenDescriptor = await (
    await ethers.getContractFactory('NonfungibleTokenPositionDescriptor', {
      libraries: {
        NFTDescriptor: nftDescriptor,
      },
    })
  ).deploy(wbnb, encodeBytes32String('NOVA'));
  console.log(
    'NonfungibleTokenPositionDescriptor',
    await tokenDescriptor.getAddress(),
  );

  const nfPositionManager = await (
    await ethers.getContractFactory('NonfungiblePositionManager')
  ).deploy(factory, wbnb, tokenDescriptor);
  console.log(
    'NonfungiblePositionManager',
    await nfPositionManager.getAddress(),
  );

  return {
    wbnb,
    factory,
    router,
    tokenDescriptor,
    nfPositionManager,
  };
};

if (require.main === module) {
  deployV3().catch(console.error);
}
