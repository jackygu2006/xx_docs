## 第一部分 NPoS的节点奖励机制
### 1. 基本原理
xx network的经济模型采取`NPoS`机制，在NPOS机制下，决定每个节点收益的主要因素是全网质押率，即：当全网质押数量越大，质押率越高，产出越高；当全网质押数量越小，质押率越低，产出越少。

如果考虑市场因素，当币价越高，会导致提名人解除质押，在市场上卖出，导致质押率下降，产出减少，从而减缓卖出压力；相反，币价越低，会有很多人将币质押到节点赚取币本位利息，导致质押率上升，产出增加，弥补持有人在币价上的损失。

**特点：**
* 每个ERA的产出只与全网质押量成正比
* 没有”头矿“暴利期
* 提名收益只跟质押量和全网统一的目标利息率相关
* 将“矿工”的做空力量约束在可控范围
* 将产量/价格的供需决定关系牢牢绑定
* 通过`team multiplier`（团队乘数），使得团队对项目早期有高度的控制力
* 节点之间在技术稳定性上竞争，努力提升`Point`（幸运值）
* 推动社区关注焦点从挖矿转向生态建设

### 2. 单个ERA奖励量化计算
在`substrate`的`staking`模块中，每个`ERA`结束后会发放一次奖励，假设每个`ERA`为一天（24小时），则每天的总奖励计算公式为：

(1) 

<!-- $DailyReward = \frac{StakeableAmoount * InflationRate}{365.25}$ -->
![](https://tva1.sinaimg.cn/large/008i3skNgy1gwr7c5wa4fj30ms01zaa7.jpg)

上面公式中的 $StakeableAmount$是指当前可质押总量，可质押总量是在发行总量中，扣除以下数量得到：
* 托管账户中的数量，如团队，基金会等，总计3.35亿
* 流动性挖矿数量（5000万枚）
* 测试网奖励总量（约846万枚）
* 公募/私募解锁的（总量2.4292亿，每日解锁一定数量）

方便起见，可用`JavaScript`脚本在区块链上获取，代码`见附1`。

上述公式中的 $InflationRate$是通胀率，即挖矿奖励。分别有两种情况，由以下公式获得：

#### 条件一：当全网质押率($StakeRate$)小于目标质押率（$IdealStakeRate$）时：

(2)

<!-- $InflationRate = MinInflationRate + StakeRate * (IdeaInterest - \frac{MinInflationRate}{ IdealStakeRate})$ -->
![](https://tva1.sinaimg.cn/large/008i3skNgy1gwr7ejnm79j30oj01dmxa.jpg)

参数：

* $MinInflationRate$: 最小通胀率

* $StakeRate$: 全网质押率，即: 质押总量 / 当前可质押总量, 公式为：

  <!-- $StakeRate = \frac{StakedAmount}{StakeableAmount}$ -->
  ![](https://tva1.sinaimg.cn/large/008i3skNgy1gwr7f75hmoj309t01ct8m.jpg)

* $IdeaInterest$: 目标年化收益率。

* $IdealStakeRate$: 目标质押率，即希望达到的目标质押率。

以上参数都可以在链上通过`JavaScript`脚本获得，代码见`附录2`。

也可以使用`附录3`的`JavaScript`代码，计算通胀率$InflationRate$。

#### 条件二：当总质押率大于目标质押率（$IdealStakeRate$）时：
TODO

### 3. 简化公式

上述条件一，当没有通胀率，即$MinInflationRate = 0$时，

(3)

![](https://tva1.sinaimg.cn/large/008i3skNgy1gwr7iyqy8rj30cs00i3ye.jpg)
<!-- $InflationRate = StakeRate * IdeaInterest$ -->

将他代入每天总奖励的公式，得到：
<!-- $DailyReward = StakeableAmoount * \frac{StakeRate * IdeaInterest}{365.25}$ -->

![](https://tva1.sinaimg.cn/large/008i3skNgy1gwr7gm249yj30jc01cjre.jpg)

因为$StakedAmount = StakeableAmoount * StakeRate$，所以有：

(4)
<!-- $DailyReward = \frac{StakedAmount * IdeaInterest}{365.25}$ -->
![](https://tva1.sinaimg.cn/large/008i3skNgy1gwr7hvyu0jj30e601c748.jpg)

xx network在前五年内没有通胀，所以$MinInflationRate = 0$，故可以使用上述公式方便地计算节点奖励。

因为目标利息$IdealInterest$会每周下降，所以在节点数不变情况下，$StakedAmount$相应的不断上升，才能保障节点收益不下降。每周利息已经写入区块链，可以通过`附件4`的`JavaScript`代码获取。


## 第二部分 奖励在节点内部的分配机制
TODO

## 第三部分 产量估算
以主网运行一个月后，达到稳定时，节点平均质押30万XX，节点数量550个估算，总质押量1.65亿XX。

第一年目标年化利息（$idealInterest$）将从最高`57.86%`逐步降到`25%`（每7天调整一次，具体可通过`附件4`的代码从链上获取），按平均`41%`计算，得到第一年全网总产量为`6765万XX`，即每个节点年产量为`12.3万XX`。

风险：
* 如果达不到上述假设的质押量或验证人节点数，节点产量会相应下降。
* 如果全网质押率超过目标质押率85%，节点产量会急剧下降。

----------------------------------------------------------------
## 附录：JavaScript脚本代码

以下脚本，都可在xx network官方浏览器钱包中执行，方式如下：
![](https://tva1.sinaimg.cn/large/008i3skNgy1gwr7s67phyj31wm0u0n1u.jpg)

xx浏览器钱包地址：https://explorer.xx.network/?rpc=wss%3A%2F%2Fmainnet.xxlabs.net

### 1. 获取可质押代币总量 $totalStakeableIssuance$

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

### 2. 获取通胀参数$Inflation$以及当前区块的目标收益率$IdealInterest$
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

### 3. 获取通胀率$InflationRate$
```
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

const inflation = await calcInflation(inflationParams, totalStaked, totalStakeableIssuance, interest);
console.log("Inflation", inflation.inflation + "%");
```

### 4. 获取主网目标利息表 $IdealInterest$
```
const idealInterest = await api.query.xxEconomics.interestPoints();
console.log(JSON.stringify(idealInterest))
```

### 5. 节点收益查询表
为了方便起见，已将三年内每天的预期奖励列表如下：
[点击查看](https://docs.google.com/spreadsheets/d/1j9vzmm-xf1TiSE3DIeNqRBzTUN0aXVynVsYbHYymwCY/edit?usp=sharing)