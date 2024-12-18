import { formatEther, parseEther } from 'ethers';
import { ethers } from 'hardhat';

import { StakedNova__factory } from '../typechain-types';

async function main() {
  const [deployer] = await ethers.getSigners();
  const StakedNova = (await ethers.getContractFactory(
    'StakedNova',
  )) as StakedNova__factory;
  const sNOVA = await StakedNova.deploy();
  await sNOVA.waitForDeployment();

  console.log('StakedNova (Mock)', await sNOVA.getAddress());

  // Test staking and unstaking
  console.log('\nTesting staking and unstaking:');

  // Stake 100 ETH
  const estimation = await sNOVA.estimateStakeOut(parseEther('100'));
  console.log('Estimation for staking 100 ETH:', formatEther(estimation));

  const stakeAmount = parseEther('100');
  await (await sNOVA.stake({ value: stakeAmount })).wait();
  console.log('Staked 100 ETH');

  let balance = await sNOVA.balanceOf(deployer.address);
  console.log('sNOVA balance after staking:', formatEther(balance));

  // Unstake 10 ETH worth of sNOVA
  const unstakeAmount = parseEther('9.85'); // 10 ETH * 0.985
  await (await sNOVA.unstake(unstakeAmount)).wait();
  console.log('Unstaked sNOVA equivalent to 10 ETH');

  balance = await sNOVA.balanceOf(deployer.address);
  console.log('sNOVA balance after unstaking:', formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
