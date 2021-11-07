const validatorAccount = '5FQvuaC6nrrnSYk2czFkz5yeTLdbHWi7TkwzWYzR3Xa1eAoJ';
const nominatorAccount = '5HgiRemWuS6LF31SYanw58JATnTg3yWdTNuJYK4h3fC8tWfZ';
const era = 716;

const currentEra = await api.query.staking.currentEra();
console.log(`current Era: ${currentEra}`);

const totalPayout = await api.query.staking.erasValidatorReward(era);
console.log(`caculating era ${era}`);
console.log(`total validators payout: ${totalPayout / 1e9} PTC`);

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
console.log('*node reward: ' + (totalPayout * validatorPoint / points.total) / 1e9 + ' PTC');

// Stake
console.log('================');
console.log('node total stake: ' + erasStakers.total / 1e9 + ' PTC');

let reward = 0;
if(nominatorAccount == validatorAccount) {
	nominatorAmount = erasStakers.own;
	console.log('self stake: ' + nominatorAmount / 1e9 + ' PTC');
	console.log('self stake rate: ' + nominatorAmount / erasStakers.total * 100 + ' %');
	
	console.log('================');
	reward = totalPayout * validatorPoint / points.total * (1 - commission) * nominatorAmount / erasStakers.total;
	console.log('era stake reward: ' + reward / 1e9 + ' PTC');
	const operatingReward = totalPayout * validatorPoint / points.total * commission;
	console.log('era operating reward: ' + operatingReward / 1e9 + ' PTC');
	reward = reward + operatingReward;
	console.log('*era total reward: ' + reward / 1e9 + ' PTC');
} else {
	for(i = 0; i < erasStakers.others.length; i++) {
		if(nominatorAccount == erasStakers.others[i].who) {
			nominatorAmount = erasStakers.others[i].value;
		}
	}
	console.log('nominator stake: ' + nominatorAmount / 1e9 + ' PTC');
	console.log('nominating rate: ' + nominatorAmount / erasStakers.total * 100 + ' %');
	
	console.log('================');
	reward = totalPayout * validatorPoint / points.total * (1 - commission) * nominatorAmount / erasStakers.total;
	console.log('*era reward: ' + reward / 1e9 + ' PTC');
}


// Hours per Era
const currentSession = await api.query.staking.erasStartSessionIndex(era);
const hours = currentSession / era;
// console.log('hours per era: ' + hours);

// APR
console.log('simple APR: ' + 24 / hours * 365 * reward / nominatorAmount * 100 + ' %');
// console.log('compound APR: ');

// Top 20 point validators
console.log('================');
console.log('Top 20 validators');
let individualArray = [];
for(var v in individual) {
	individualArray.push({
		validator: v,
		points: individual[v]
	});
}
individualArray.sort(function(a, b) {return a.points < b.points ? 1 : -1});
for(var i = 0; i < 20; i++) console.log(i + 1, individualArray[i].validator, individualArray[i].points);


console.log('\nDone...');

