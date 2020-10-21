import { Expense } from '../expense.model';
import { User } from '../user.model';
import { WeightedItem } from './weighted-item';

export function SetUnevenSplit(operand: WeightedItem, weights: {user: User, weight: number}[]) {
  if(weights.length < operand.users.length) {
    console.warn('Not all users are receiving a weight. Users with unset weights will receive a value of 1');
  }

  operand.weights = [];

  let userWithUnsetWeights: string[] = [];
  operand.users.forEach(user => {
    let weight = weights.find(weight => weight.user.id === user.id);
    if(weight) {
      operand.weights.push(weight);
    } else {
      operand.weights.push({user, weight:1});
      userWithUnsetWeights.push(user.name);
    }
  });

  if(userWithUnsetWeights.length > 0) {
    let s = userWithUnsetWeights.join(', ');
    console.warn(`Users ${s.substring(0, s.length - 2)} did not have weights and will receive a weight value of 1`);

  }
}

export function SetEvenSplit(operand: WeightedItem) {
  operand.weights = undefined;
}

export function IsEvenSplit(operand: WeightedItem): boolean {
  return !operand.weights || operand.weights.every(weight => {
    return weight.weight === operand.weights[0].weight;
  });
}

export function GetTotalWeight(operand: WeightedItem, expense: Expense) {
  let totalWeight = 0.0;
  let evenSplit = !operand.weights;
  if(evenSplit) {
    totalWeight = expense.users.length;
  } else {
    let weightsToCount = operand.weights
    .filter(weight => { //filter to only use weights of users participating in this expense
      return expense.users.some(user => user.id === weight.user.id)
    });

    weightsToCount.forEach(weight => {
      totalWeight += parseFloat(weight.weight as any);
    });
  }
  return totalWeight;
}

export function GetWeightForUser(operand: WeightedItem, user: User): number {
  if(!operand.weights) {
    return 1;
  }
  let weight = operand.weights.find(weight => weight.user.id === user.id);
  return weight ? weight.weight : 1.0;
}

export function SetWeightForUser(operand: WeightedItem, user: User, weight: any) {
  if(!operand.weights) {
    operand.weights = [];
  }

  operand.weights = [
    ...operand.weights.filter(weight => weight.user.id !== user.id),
    { user, weight: parseFloat(weight) }
  ];

  let allEqual = operand.weights.length === operand.users.length && operand.weights.every(weight => weight.weight == operand.weights[0].weight);
  let allOnes = operand.weights.every(weight => weight.weight == 1);
  if(allEqual || allOnes) {
    //operand.setEvenSplit();
    SetEvenSplit(operand);
  } else {
    //operand.setWeightForRemainingUsers();
    SetWeightForRemainingUsers(operand);
  }

}

export function SetWeightForRemainingUsers(operand: WeightedItem) {
  if(!operand.weights) {
    return;
  }
  operand.users.forEach(user => {
    if(!operand.weights.some(weight => weight.user.id === user.id)) {
      //operand.setWeightForUser(user, 1);
      SetWeightForUser(operand, user, 1);
    }
  })
}
