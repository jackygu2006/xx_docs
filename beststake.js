const maxNominate = 100;

const currentEra = await api.query.staking.currentEra();
console.log(`current Era: ${currentEra}`);
const era = currentEra - 1;

const totalPayout = await api.query.staking.erasValidatorReward(era);
console.log(`caculating era ${era}`);

const validatorsArray = await api.query.session.validators();

// 100 validators sorted 
let commissions = [0];
let pointWeights = [0];
let stakedAmounts = [0];
let accounts = [0];
let all = [];

const points = await api.query.staking.erasRewardPoints(era);
const individual = JSON.parse(points.individual);
const totalPoints = points.total;

for(let i = 0; i < validatorsArray.length; i++) {
	const validatorAccount = validatorsArray[i];
	const erasStakers = await api.query.staking.erasStakers(era, validatorAccount);
	const stakedAmount = parseInt(erasStakers.total);

	// commission rate
	const validators = await api.query.staking.validators(validatorAccount);
	const commission = validators.commission / 1e9;

	// point weight
	const validatorPoint = individual[validatorAccount] / totalPoints;

	if(stakedAmount > 0 && commission > 0 && validatorPoint > 0) {
		const index = (1 - commission) * validatorPoint / stakedAmount;
		all.push({
			account: validatorAccount,
			stakedAmount,
			commission,
			validatorPoint,
			index,
		})
		console.log(i, index, validatorAccount, commission, validatorPoint, Math.round(stakedAmount / 1e9));	
	}
}

const sortedArray = all.sort(function(a, b) {
	return a.index < b.index ? 1 : -1
});

console.log("========")
for(let i = 0; i < maxNominate; i++) {
	console.log(i, sortedArray[i].index, sortedArray[i].account, sortedArray[i].commission, sortedArray[i].validatorPoint, Math.round(sortedArray[i].stakedAmount / 1e9));
	commissions.push(sortedArray[i].commission);
	pointWeights.push(sortedArray[i].validatorPoint);
	accounts.push("'" + sortedArray[i].account + "'");
	stakedAmounts.push(Math.round(sortedArray[i].stakedAmount / 1e9))
}

console.log("====== Paste Following ======");
console.log("accounts = ", accounts);
console.log("commissions = ", commissions);
console.log("pointWeights = ", pointWeights)
console.log("stakedAmounts = ", stakedAmounts)

