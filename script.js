// params start
const validatorAccount = '6VSrpiHJaSTUb45eSvWL6jsYkKHWoxES1j7BNRBpDnEbRsqn';
const nominatorAccount = '6VSrpiHJaSTUb45eSvWL6jsYkKHWoxES1j7BNRBpDnEbRsqn';
const newStakeAmount = 10000 * 1e9;
const era = 1;
const showTops = false;
// params end

// 计算质押量
async function getTotalStakeableIssuance() {
  const totalIssuance = await api.query.balances.totalIssuance();
  const rewardsPoolAccount = await api.consts.xxEconomics.rewardsPoolAccount;
  const balanceRPA = await api.query.balances.account(rewardsPoolAccount);
  const totalCustody = await api.query.xxCustody.totalCustody();
  const liquidityRewards = await api.query.xxEconomics.liquidityRewards();
  
  const totalStakeableIssuance = totalIssuance.sub(balanceRPA.free).sub(totalCustody).sub(liquidityRewards);
  return {
    totalIssuance,
    rewardsPoolAccount,
    balanceRPA: balanceRPA.free,
    totalCustody,
    liquidityRewards,
    totalStakeableIssuance
  }
}

const totalStakeableIssuance = await getTotalStakeableIssuance();
console.log("totalStakeableIssuance", totalStakeableIssuance.totalStakeableIssuance / 1e9)

// 计算通胀


const currentEra = await api.query.staking.currentEra();
console.log(`current Era: ${currentEra}`);

const totalPayout = await api.query.staking.erasValidatorReward(era);
console.log(`caculating era ${era}`);
console.log(`total validators payout: ${totalPayout / 1e9} XX`);

const validators = await api.query.staking.validators(validatorAccount);
const commission = validators.commission / 1e9;
console.log('commission rate: ' + commission * 100 + ' %');

const validatorsArray = await api.query.session.validators();
console.log('validators: ' + validatorsArray.length);

const erasStakers = await api.query.staking.erasStakers(era, validatorAccount);
// console.log(erasStakers);
let nominatorAmount = 0;

// Points
console.log('================');
const points = await api.query.staking.erasRewardPoints(era);
const individual = JSON.parse(points.individual);

const validatorPoint = individual[validatorAccount];
console.log('validator points: ' + validatorPoint);
console.log('total points: ' + points.total);
console.log('point rate: ' + (validatorPoint / points.total * 100) + ' %');
console.log('everage point rate: ' + (1 / validatorsArray.length * 100) + ' %');
const diff = (validatorPoint / points.total - 1 / validatorsArray.length) / (1 / validatorsArray.length)
console.log('diff from average: ' + (diff * 100) + ' %');
console.log('*node reward: ' + (totalPayout * validatorPoint / points.total) / 1e9 + ' XX');

// Stake
console.log('================');
console.log('node total stake: ' + erasStakers.total / 1e9 + ' XX');

let reward = 0;
if(nominatorAccount == validatorAccount) {
	nominatorAmount = erasStakers.own;
	console.log('self stake: ' + nominatorAmount / 1e9 + ' XX');
	console.log('self stake rate: ' + nominatorAmount / erasStakers.total * 100 + ' %');
	
	console.log('================');
	reward = totalPayout * validatorPoint / points.total * (1 - commission) * nominatorAmount / erasStakers.total;
	console.log('era stake reward: ' + reward / 1e9 + ' XX');
	const operatingReward = totalPayout * validatorPoint / points.total * commission;
	console.log('era operating reward: ' + operatingReward / 1e9 + ' XX');
	reward = reward + operatingReward;
	console.log('*era total reward: ' + reward / 1e9 + ' XX');
} else {
	for(i = 0; i < erasStakers.others.length; i++) {
		if(nominatorAccount == erasStakers.others[i].who) {
			nominatorAmount = erasStakers.others[i].value;
		}
	}
	console.log('nominator stake: ' + nominatorAmount / 1e9 + ' XX');
	console.log('nominating rate: ' + nominatorAmount / erasStakers.total * 100 + ' %');
	
	console.log('================');
	reward = totalPayout * validatorPoint / points.total * (1 - commission) * nominatorAmount / erasStakers.total;
	console.log('*era reward: ' + reward / 1e9 + ' XX');
}


// Hours per Era
// const currentSession = await api.query.staking.erasStartSessionIndex(era);
const hours = 24;//currentSession / era;
console.log('hours per era: ' + hours);

// APR
console.log('simple APR: ' + 24 / hours * 365 * reward / nominatorAmount * 100 + ' %');
// console.log('compound APR: ');

if(!showTops) {
  console.log('Done...');
  return;
}

// Top 20 point validators
console.log('================');
console.log('Top 20 points validators');
let individualArray = [];
for(var v in individual) {
	individualArray.push({
		validator: v,
		points: individual[v]
	});
}
individualArray.sort(function(a, b) {return a.points < b.points ? 1 : -1});
for(let i = 0; i < 20; i++) console.log(i + 1, individualArray[i].validator, individualArray[i].points);

// 综合预期收益排行
console.log('================');
/**
 * index = (1 - commission) * newStakeAmount / (totalStakeAmount + newStakeAmount) * validatorPoint / points.total
 */
let array = [];
for(let i = 0; i < 100; i++) {
	const _validatorAccount = individualArray[i].validator; 
	const _validators = await api.query.staking.validators(_validatorAccount);
	const _commission = _validators.commission / 1e9;
	const _erasStakers = await api.query.staking.erasStakers(era, _validatorAccount);
	const _totalStakeAmount = _erasStakers.total;
	const _validatorPoint = individual[_validatorAccount];

	const index = (1 - _commission) * newStakeAmount / (_totalStakeAmount + newStakeAmount) * _validatorPoint / points.total * 1e20;
	const o = {
		validator: _validatorAccount,
		index,
		points: individualArray[i].points,
	}
	console.log(JSON.stringify(o));
	array.push(o);
}

console.log('================');
console.log('Top 20 high yield validators if stake ' + newStakeAmount / 1e8);
array.sort(function(a, b) {return a.index < b.index ? 1 : -1});
for(let i = 0; i < 100; i++) console.log(i + 1, array[i].validator, array[i].index);

console.log('\nDone...');