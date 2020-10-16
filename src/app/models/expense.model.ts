import { User } from "./user.model";
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
    e.order = expense.order;
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

  isEqualTo(expense: Expense) {

    let sameName = this.name == expense.name;
    let sameValue = this.value == expense.value;

    let sameUsers = this.users.every(user => {
      return expense.users.some(u => u.id == user.id);
    }) && this.users.length === expense.users.length;

    let samePayers = this.payers.every(payer => {
      return expense.payers.some(p => {
        return p.payer.id == payer.payer.id && p.amount == payer.amount;
      });
    });

    let sameUrl = this.fileUrl == expense.fileUrl;
    let samePath = this.filePath == expense.filePath;

    return (
      sameName && sameValue && sameUsers && samePayers && sameUrl && samePath
    );
  }
}
