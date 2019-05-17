import { User } from './user.model';

export class Expense {

  name: string;
  users: User[]
  payer: User
  value: number;

  constructor(expenseName: string, value: number){
    this.users = [];
    this.name = expenseName;
    this.value= value;
  }

  addUser(user: User) {
    this.users.push(user);
  }

  setPayer(payer: User) {
    this.payer= payer;
  }
}