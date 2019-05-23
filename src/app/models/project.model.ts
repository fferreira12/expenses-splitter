import { User } from './user.model';
import { Expense } from './expense.model';
import { Payment } from './payment.model';

export class Project {
  
  projectId: string;
  projectName: string;
  users: User[];
  expenses: Expense[];
  payments: Payment[];

  constructor(projectId?: string, projectName?: string, users?:User[], expenses?: Expense[], payments?: Payment[]) {
    this.projectId = projectId || Math.random().toString().substr(2);
    this.projectName = projectName || "default";
    this.setData(users, expenses, payments);
  }

  setData(users?:User[], expenses?: Expense[], payments?: Payment[]) {
    this.users = users || [];
    this.expenses = expenses || [];
    this.payments = payments || [];
  }

}