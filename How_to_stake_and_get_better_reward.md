[返回目录](README.md)

## Era reward formula
```
index = (1 - commission) * newStakeAmount / (totalStakeAmount + newStakeAmount) * validatorPoint / points.total
```

The reward of era is `stake payout * index`

## params:
* node commission(%)
* validator point weight
  * Produce a block: +300 points
  * Done a round of precomputation: +10 points
  * Fail a round of postcomputation: -20 points
* new stake amount
* total amount already staked in the node
  
## Strategy
Stake in the less staked, lower commission, higher perfomance point nodes.




