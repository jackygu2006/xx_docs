validatorAccount = '6XAD1hxSNjb5PV6WaF3NuuJxvYwDBNXH2PnZAYnuZT2xqNVy';
console.log(validatorAccount);
const currentEra = await api.query.staking.currentEra();
console.log(`current era ${currentEra}`)

const points = await api.query.staking.erasRewardPoints(parseInt(currentEra));
const individual = JSON.parse(points.individual);

const validatorPoint = individual[validatorAccount];
console.log('validator points: ' + validatorPoint);
console.log('total points: ' + points.total);
const validatorCount = await api.query.staking.validatorCount();
console.log('validator count: ' + validatorCount);
console.log('average points: ' + (points.total / parseInt(validatorCount)));
console.log('diff to average: ' + (validatorPoint / (points.total / parseInt(validatorCount)) - 1) * 100 + "%");
console.log('========');