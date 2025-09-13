import { Address, Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  EmergencyWithdrawn as EmergencyWithdrawnEvent,
  RewardsClaimed as RewardsClaimedEvent,
  Staked as StakedEvent,
  Withdrawn as WithdrawnEvent,
} from "../generated/StakingContract/StakingContract"
import {
  EmergencyWithdrawn,
  RewardsClaimed,
  Staked,
  Withdrawn,
  Transaction,
  User,
  Protocol,
} from "../generated/schema"

function handleSingletonProtocolCreation(): Protocol {
  let protocol = Protocol.load("protocol")
  if (!protocol) {
    protocol = new Protocol("protocol")
    protocol.totalStaked = BigInt.zero()
    protocol.totalRewardsClaimed = BigInt.zero()
    protocol.totalWithdrawn = BigInt.zero()
    protocol.totalEmergencyWithdrawn = BigInt.zero()
    protocol.save()
  }
  return protocol as Protocol
}

function handleSingletonUserCreation(userAddress: Address): User {
  let protocol = handleSingletonProtocolCreation()
  let user = User.load(userAddress as Bytes)
  if (!user) {
    user = new User(userAddress as Bytes)
    user.protocol = protocol.id
    user.save()
    protocol.save()
  }
  return user as User
}

function handleCreateTransaction(event: ethereum.Event): Bytes {
  let entity = new Transaction(event.transaction.hash)
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.timestamp = event.block.timestamp
  entity.save()
  return entity.id
}

export function handleEmergencyWithdrawn(event: EmergencyWithdrawnEvent): void {
  let protocol = handleSingletonProtocolCreation()
  let entity = new EmergencyWithdrawn(event.transaction.hash)
  entity.user = handleSingletonUserCreation(event.params.user).id
  entity.amount = event.params.amount
  entity.penalty = event.params.penalty
  entity.newTotalStaked = event.params.newTotalStaked
  entity.transactionData = handleCreateTransaction(event)
  entity.save()
  protocol.totalEmergencyWithdrawn = protocol.totalEmergencyWithdrawn.plus(event.params.amount)
  protocol.totalStaked = event.params.newTotalStaked
  protocol.save()
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  let protocol = handleSingletonProtocolCreation()
  let entity = new RewardsClaimed(event.transaction.hash)
  entity.user = handleSingletonUserCreation(event.params.user).id
  entity.amount = event.params.amount
  entity.newPendingRewards = event.params.newPendingRewards
  entity.totalStaked = event.params.totalStaked
  entity.transactionData = handleCreateTransaction(event)
  entity.save()
  protocol.totalRewardsClaimed = protocol.totalRewardsClaimed.plus(event.params.amount)
  protocol.save()
}

export function handleStaked(event: StakedEvent): void {
  let protocol = handleSingletonProtocolCreation()
  let entity = new Staked(event.transaction.hash)
  entity.user = handleSingletonUserCreation(event.params.user).id
  entity.amount = event.params.amount
  entity.newTotalStaked = event.params.newTotalStaked
  entity.currentRewardRate = event.params.currentRewardRate
  entity.transactionData = handleCreateTransaction(event)
  entity.save()
  protocol.totalStaked = event.params.newTotalStaked
  protocol.save()
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let protocol = handleSingletonProtocolCreation()
  let entity = new Withdrawn(event.transaction.hash)
  entity.user = handleSingletonUserCreation(event.params.user).id
  entity.amount = event.params.amount
  entity.newTotalStaked = event.params.newTotalStaked
  entity.currentRewardRate = event.params.currentRewardRate
  entity.rewardsAccrued = event.params.rewardsAccrued
  entity.transactionData = handleCreateTransaction(event)
  entity.save()
  protocol.totalWithdrawn = protocol.totalWithdrawn.plus(event.params.amount)
  protocol.totalStaked = event.params.newTotalStaked
  protocol.save()
}
