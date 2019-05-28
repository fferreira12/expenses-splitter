import { User } from "./user.model";
import { throwError } from "rxjs";

type PayersArray = { payer: User; amount: number }[];

export class Expense {
  name: string;
  users: User[];
  //payer: User;
  payers: PayersArray;
  value: number;
  //multiplePayers = false;

  constructor(expenseName: string, value: number) {
    this.users = [];
    this.name = expenseName;
    this.value = value;
  }

  addUser(user: User) {
    this.users.push(user);
  }

  setPayer(payer: User) {
    this.payers = [{ payer: payer, amount: this.value }];
    //this.multiplePayers = false;
  }

  isPayer(user: User): boolean {
    return this.payers.some(p => {
      return p.payer == user;
    });
  }

  setPayers(payers: PayersArray) {
    //check if totals match
    //this.multiplePayers = true;
    let total = 0;
    payers.forEach(p => {
      total += p.amount;
    });
    if (total - this.value > 0.01) {
      throw "The amounts must add up to the expense total";
    } else if (!this.allPayersAreParticipating(payers)) {
      throw "All payers must be participating in the expense";
    }
    this.payers = payers;
  }

  allPayersAreParticipating(payers?: PayersArray): boolean {
    let ps = payers;
    if (payers == null) {
      ps = this.payers;
    }
    console.log("ps");
    console.log(ps);
    console.log("payers");
    console.log(payers);
    return ps.every(p => {
      return this.users.includes(p.payer);
    });
  }

  getAmountPaid(user: User) {
    //multiple users
    let total = 0;
    (this.payers as PayersArray).forEach(p => {
      if (p.payer == user) {
        total += p.amount;
      }
    });
    return total;
  }
}
