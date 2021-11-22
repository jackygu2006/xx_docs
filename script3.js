async function getTotalStakeableIssuance() {
  const totalIssuance = await api.query.balances.totalIssuance();
  const rewardsPoolAccount = await api.consts.xxEconomics.rewardsPoolAccount;
  const balanceRPA = await api.query.balances.account(rewardsPoolAccount);
  const totalCustody = await api.query.xxCustody.totalCustody();
  const liquidityRewards = await api.query.xxEconomics.liquidityRewards();
  const rewardsPoolAndSale =  553402166 * 1e9; 
  const liquidity =  31027692 * 1e9;
  
  console.log(totalIssuance / 1e9);
  console.log(balanceRPA.free / 1e9);
  console.log(totalCustody / 1e9);
  console.log(liquidityRewards / 1e9);

  const totalStakeableIssuance = totalIssuance - balanceRPA.free - totalCustody - liquidityRewards;
  return {
    totalIssuance,
    rewardsPoolAccount,
    balanceRPA: balanceRPA.free,
    totalCustody: totalCustody,
    liquidityRewards: liquidityRewards,
    totalStakeableIssuance: totalStakeableIssuance,
		rewardsPoolAndSale,
		liquidity
  }
}

async function calcInflation(inflationParams, totalStaked, totalStakeableIssuance, idealInterest) {
  if (!(idealInterest && totalStakeableIssuance && totalStaked && idealInterest)) {
    return false;
  }
  let { falloff, idealStake, minInflation } = inflationParams;
  falloff = falloff / 1e9;
  idealStake = idealStake / 1e9;
  minInflation = minInflation / 1e9;
  
  const stakedFraction = totalStaked == 0 || totalStakeableIssuance == 0
    ? 0
    : totalStaked / totalStakeableIssuance;

  const idealInterestNumber = idealInterest / 1e9;
  console.log(stakedFraction, idealInterestNumber, minInflation, idealStake);
  
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

const totalStakeable = await getTotalStakeableIssuance();
console.log(JSON.stringify(totalStakeable))
const totalStakeableIssuance = totalStakeable.totalStakeableIssuance / 10; // 没办法获取准确书记，先手动除10
console.log("totalStakeableIssuance", totalStakeableIssuance / 1e9);

const inflationParams = await api.query.xxEconomics.inflationParams();
console.log("inflationParams", inflationParams);

const totalStaked = await api.query.staking.erasTotalStake(5);
console.log("totalStaked", totalStaked);

const idealInterest = await api.query.xxEconomics.interestPoints();
// 参考 export default function useIdealInterest(): BN | undefined {
const blockHeight = await api.query.system.number();
console.log(blockHeight);

let interest = 0;
for(var i = 0; i < idealInterest.length; i++) {
  if(blockHeight >= idealInterest[i].block) {
    interest = idealInterest[i].interest;
    break;
  }
}
console.log("interest", interest / 1e9);

const inflation = await calcInflation(inflationParams, totalStaked, totalStakeableIssuance, interest);
console.log(JSON.stringify(inflation))

// 以下公式推导出来，不正确
console.log(100 / 36525 * totalStakeableIssuance / 1e9 * (inflationParams.minInflation / 1e9 + totalStaked / totalStakeableIssuance / (inflationParams.idealStake / 1e9) * (interest / 1e9 * inflationParams.idealStake / 1e9 - inflationParams.minInflation / 1e9)));
