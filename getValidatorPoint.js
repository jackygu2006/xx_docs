validatorAccount = '6YTxZnYDBVQKY5Bg2xtEwMen3xABzNt3bvqdDwVBELcDfoye';
console.log(validatorAccount);
const currentEra = await api.query.staking.currentEra();
console.log(`current era ${currentEra}`)

const points = await api.query.staking.erasRewardPoints(parseInt(currentEra));
const individual = JSON.parse(points.individual);

const validatorPoint = individual[validatorAccount];
console.log('validator points: ' + validatorPoint);
console.log('total points: ' + points.total);
console.log('average points: ' + (points.total / 250));
console.log('diff to average: ' + (validatorPoint / (points.total / 250) - 1) * 100 + "%");
console.log('========');