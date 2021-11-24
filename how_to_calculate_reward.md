## 第一部分 NPoS的节点奖励机制
### 1. 基本原理
xx network的经济模型采取`NPoS`机制，所以在讨论xx network节点奖励之前，先来介绍下标准的NPoS奖励计算方式。

在NPOS机制下，决定每个节点收益的主要因素是全网质押率，即：当全网质押数量越大，质押率越高，产出越高；当全网质押数量越小，质押率越低，产出越少。

如果考虑市场因素，当币价越高，就会有很多提名人解除质押，在市场上卖出，导致质押率下降，产出减少，从而减缓卖出压力；相反，币价越低，会有很多人将币质押到节点赚取币本位利息，导致质押率上升，产出增加，弥补持有人在币价上的损失。

### 2. 每个ERA的奖励量化计算如下

在substrate的staking模块中，规定每个ERA会发放奖励，假设每个ERA为一天（24小时），则每天的总奖励计算公式为：

(1) 

$DailyReward = \frac{StakeableAmoount * InflationRate}{365.25}$

上面公式中$StakeableAmount$是当前可质押总量，可用JavaScript脚本在区块链上获取（见附1），可以通过查询链上数据获得。

$InflationRate$是通胀率，通过以下公式获得：

* #### 情况一：当质押率($StakeRate$)小于目标质押率（$IdealStakeRate$）时：

(2)

$InflationRate = MinInflationRate + StakeRate * (IdeaInterest - \frac{MinInflationRate}{ IdealStakeRate})$

参数：

1- $MinInflationRate$: 最小通胀率

2- $StakeRate$: 全网质押率，即: 质押总量 / 当前可质押总量, 公式为：$StakeRate = \frac{StakedAmount}{StakeableAmount}$

3- $IdeaInterest$: 目标年化收益率。

4- $IdealStakeRate$: 目标质押率，即希望达到的目标质押率。

以上参数都可以在链上获得，代码见附录2。

### 3. 简化公式

当没有通胀率，即$MinInflationRate = 0$时，

(3)

$InflationRate = StakeRate * IdeaInterest$

将他代入每天总奖励的公式，得到：

$DailyReward = StakeableAmoount * \frac{StakeRate * IdeaInterest}{365.25}$，因为$StakedAmount = StakeableAmoount * StakeRate$，所以有：

(4)

$DailyReward = \frac{StakedAmount * IdeaInterest}{365.25}$

因为xx network在前五年内没有通胀，所以$MinInflationRate = 0$，故可以使用上述公式方便的计算节点奖励。

因为$IdealInterest$会每周下降，所以在节点数不变情况下，$StakedAmount$相应的不断上升，才能保障节点收益不下降。

* #### 情况二：当总质押率大于目标质押率（$IdealStakeRate$）时：


## 第二部分 节点内分配机制


## 附录：JavaScript脚本代码
### 1. 获取可质押代币总量

```
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

const totalStakeable = await getTotalStakeableIssuance();
const totalStakeableIssuance = totalStakeable.totalStakeableIssuance;
```

### 2. 获取通胀参数以及目标收益率
```
const inflationParams = await api.query.xxEconomics.inflationParams();
console.log("Min Inflation", inflationParams.minInflation / 1e9 * 100 + "%");
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

```

### 3. 节点收益查询表
为了方便起见，下表按周为单位，将三年内每天的预期奖励列表如下：
[点击查看](https://docs.google.com/spreadsheets/d/1j9vzmm-xf1TiSE3DIeNqRBzTUN0aXVynVsYbHYymwCY/edit?usp=sharing)