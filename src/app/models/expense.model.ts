import { User } from "./user.model";
import { throwError } from "rxjs";
import { PayersArray } from "../util/types";

export class Expense {
  name: string;
  users: User[];
  //payer: User;
  payers: PayersArray;
  value: number;
  //multiplePayers = false;
  fileUrl: string;
  filePath: string
  order:number;

  constructor(expenseName: string, value: number) {
    this.users = [];
    this.name = expenseName;
    this.value = value;
  }

  static createExpense(expense: Expense) {
    let e = new Expense(expense.name, expense.value);
    e.users = [...expense.users];
    e.payers = [...expense.payers];
    e.fileUrl = expense.fileUrl;
    e.filePath = expense.filePath;
    return e;
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
      return p.payer.id == user.id;
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

    return ps.every(payer => {
      return this.users.some(p => p.id === payer.payer.id);
    });
  }

  getAmountPaid(user: User) {
    //multiple users
    let total = 0;
    this.payers.forEach(p => {
      if (p.payer.id == user.id) {
        total += p.amount;
      }
    });
    return total;
  }
}
