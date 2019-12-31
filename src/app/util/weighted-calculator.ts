import { PaymentCalculator } from './interfaces';
import { User } from '../models/user.model';

export class WeightedCalculator implements PaymentCalculator {
  
  allUsers: User[];
  balance: { [uid:string]: number }
  fairShares: { [uid:string]: number };
  payments: { payer: User; receiver: User; amount: number }[] = [];

  setFairShares(fairShares: { [uid:string]: number }) {
    this.fairShares = fairShares;
  }

  calculate(balance: { [uid:string]: number }): { payer: User; receiver: User; amount: number; }[] {
    this.balance = JSON.parse(JSON.stringify(balance));

    this.payments = [];
    while (!this.isDone(this.balance)) {
      let payment = this.nextPayment(this.balance);
      this.payments.push(payment);
      this.balance[payment.payer.id] += payment.amount;
      this.balance[payment.receiver.id] -= payment.amount;
    }
    return this.payments;
  }

  nextPayment(balance: { [uid:string]: number }): { payer: User; receiver: User; amount: number } {
    let biggestNegative = this.biggestNegative(balance);
    let biggestPositive = this.biggestPositive(balance);

    let payment: { payer: User; receiver: User; amount: number } = {
      payer: null,
      receiver: null,
      amount: 0
    };
    //the bigger debt is less than amount to be received by the biggest positive

    payment.payer = this.getUserById(biggestNegative.smallestId);
    payment.receiver = this.getUserById(biggestPositive.biggestId);
    payment.amount = Math.min(
      Math.abs(biggestNegative.smallestValue),
      biggestPositive.biggestValue
    );

    return payment;
  }

  isDone(balance: { [uid:string]: number }) {
    
    
    if(this.payments.length > 10) {
      return true;
    }
    
    let allEqual = true;
    for (var id in balance) {

        let diff = Math.abs(balance[id]);

        if (diff > 0.01) {

          allEqual = false;
          break; 
        }
    }
    return allEqual;
  }

  biggestNegative(balance: Object) {
    let smallestValue = Infinity;
    let smallestId: string;
    for (var id in balance) {
      if (balance.hasOwnProperty(id)) {
        if (balance[id] < smallestValue) {
          smallestValue = balance[id];
          smallestId = id;
        }
      }
    }
    return { smallestId, smallestValue };
  }

  biggestPositive(balance: Object) {
    let biggestValue = -Infinity;
    let biggestId: string;
    for (var id in balance) {
      if (balance.hasOwnProperty(id)) {
        if (balance[id] > biggestValue) {
          biggestValue = balance[id];
          biggestId = id;
        }
      }
    }
    return { biggestId, biggestValue };
  }

  setAllUsers(users: User[]) {
    this.allUsers = users;
  }

  getUserById(id: string) {
    return this.allUsers.find(u => u.id == id);
  }

}
