import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  EmergencyWithdrawn as EmergencyWithdrawnEvent,
  RewardRateUpdated as RewardRateUpdatedEvent,
  RewardsClaimed as RewardsClaimedEvent,
  Staked as StakedEvent,
  StakingInitialized as StakingInitializedEvent,
  Withdrawn as WithdrawnEvent,
} from "../generated/StakingContract/StakingContract";
import {
  EmergencyWithdrawn,
  RewardsClaimed,
  Staked,
  Withdrawn,
  Transaction,
  User,
} from "../generated/schema";

export function handleCreateUser(userAddress: Address): User {
  let user = User.load(userAddress as Bytes);
  if (user == null) {
    user = new User(userAddress as Bytes);
    user.save();
  }
  return user as User;
}

export function handleCreateTransaction(event: ethereum.Event): Bytes {
  let entity = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.timestamp = event.block.timestamp;
  entity.save();
  return entity.id;
}


export function handleEmergencyWithdrawn(event: EmergencyWithdrawnEvent): void {
  let entity = new EmergencyWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = handleCreateUser(event.params.user).id;
  entity.amount = event.params.amount;
  entity.penalty = event.params.penalty;
  entity.newTotalStaked = event.params.newTotalStaked;
  entity.transactionData = handleCreateTransaction(event);
  entity.save();
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  let entity = new RewardsClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = handleCreateUser(event.params.user).id;
  entity.amount = event.params.amount;
  entity.newPendingRewards = event.params.newPendingRewards;
  entity.totalStaked = event.params.totalStaked;
  entity.transactionData = handleCreateTransaction(event);
  entity.save();
}

export function handleStaked(event: StakedEvent): void {
  let entity = new Staked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = handleCreateUser(event.params.user).id;
  entity.amount = event.params.amount;
  entity.newTotalStaked = event.params.newTotalStaked;
  entity.currentRewardRate = event.params.currentRewardRate;
  entity.transactionData = handleCreateTransaction(event);
  entity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let entity = new Withdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = handleCreateUser(event.params.user).id;
  entity.amount = event.params.amount;
  entity.newTotalStaked = event.params.newTotalStaked;
  entity.currentRewardRate = event.params.currentRewardRate;
  entity.rewardsAccrued = event.params.rewardsAccrued;
  entity.transactionData = handleCreateTransaction(event);
  entity.save();
}
