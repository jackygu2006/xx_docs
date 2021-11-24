async function getTotalStakeableIssuance() {
  const totalIssuance = await api.query.balances.totalIssuance();
  const rewardsPoolAccount = await api.consts.xxEconomics.rewardsPoolAccount;
  const rewardsPoolBalance = await api.query.system.account(rewardsPoolAccount);
  const totalCustody = await api.query.xxCustody.totalCustody();
  const liquidityRewards = await api.query.xxEconomics.liquidityRewards();
  const publicTestnetAccount = await api.consts.xxPublic.testnetAccount;
  const publicTestnetBalance = await api.query.system.account(publicTestnetAccount);
  const publicSaleAccount = await api.consts.xxPublic.saleAccount;
  const publicSaleBalance = await api.query.system.account(publicSaleAccount);
  
  console.log("Total Issuance", totalIssuance / 1e9 + " XX");
  console.log("RewardsPool Balance", rewardsPoolBalance.data.free / 1e9 + " XX");
  console.log("Total Custody", totalCustody / 1e9 + " XX");
  console.log("Liquidity Rewards", liquidityRewards / 1e9 + " XX");
  console.log("Public Testnet Balance", publicTestnetBalance.data.free / 1e9 + " XX");
  console.log("Public Sale Balance", publicSaleBalance.data.free / 1e9 + " XX");

  const totalStakeableIssuance = totalIssuance - rewardsPoolBalance.data.free - totalCustody - liquidityRewards - publicTestnetBalance.data.free - publicSaleBalance.data.free;
  return {
    totalIssuance,
    rewardsPoolAccount,
    rewardsPoolBalance: rewardsPoolBalance.data.free,
    totalCustody: totalCustody,
    liquidityRewards: liquidityRewards,
    publicTestnetBalance: publicTestnetBalance.data.free,
    publicSaleBalance: publicSaleBalance.data.free,
    totalStakeableIssuance: totalStakeableIssuance,
  }
}

async function calcInflation(inflationParams, totalStaked, totalStakeableIssuance, idealInterest) {
  if (!(idealInterest && totalStakeableIssuance && totalStaked && idealInterest)) {
    return false;
  }
  let { falloff, idealStake, minInflation } = inflationParams;
  falloff = falloff / 1e9;
  idealStake = idealStake / 1e9;
  minInflation = 0; //minInflation / 1e9;
  
  const stakedFraction = totalStaked == 0 || totalStakeableIssuance == 0
    ? 0
    : totalStaked / totalStakeableIssuance;

  const idealInterestNumber = idealInterest / 1e9;
  
  const inflation = 100 * (minInflation + (
    stakedFraction <= idealStake
      ? (stakedFraction * (idealInterestNumber - (minInflation / idealStake)))
      : (((idealInterestNumber * idealStake) - minInflation) * Math.pow(2, (idealStake - stakedFraction) / falloff))
  ));

  return {
    inflation,
    stakedReturn: stakedFraction
      ? (inflation / stakedFraction)
      : 0
  };
}

const currentEra = await api.query.staking.currentEra();
console.log(`Current Era: ${currentEra}`);

const totalStakeable = await getTotalStakeableIssuance();
const totalStakeableIssuance = totalStakeable.totalStakeableIssuance;
console.log("============")
console.log("Total Stakeable Issuance", Math.round(totalStakeableIssuance / 1e9) + " XX");

const inflationParams = await api.query.xxEconomics.inflationParams();
console.log("Min Inflation", 0);//inflationParams.minInflation / 1e9 * 100 + "%");
console.log("Ideal Stake Rate", inflationParams.idealStake / 1e9 * 100 + "%");
console.log("Falloff", inflationParams.falloff / 1e9 * 100 + "%");

const totalStaked = await api.query.staking.erasTotalStake(parseInt(currentEra));
console.log("Total staked", Math.round(totalStaked / 1e9) + " XX");
console.log("Stake Fraction", totalStaked / totalStakeableIssuance * 100 + "%");

const idealInterest = await api.query.xxEconomics.interestPoints();
const blockHeight = await api.query.system.number();

let interest = 0;
for(var i = 0; i < idealInterest.length; i++) {
  if(blockHeight >= idealInterest[i].block) {
    interest = idealInterest[i].interest;
    break;
  }
}
console.log("Ideal interest", interest / 1e9 * 100 + "%");

const inflation = await calcInflation(inflationParams, totalStaked, totalStakeableIssuance, interest);
console.log("Inflation", inflation.inflation + "%");
console.log("Anual Profit Rate", inflation.inflation / (totalStaked / totalStakeableIssuance) + "%");
console.log("Era Reward", totalStakeableIssuance * inflation.inflation / 100 / 365.25 / 1e9 + " XX");

