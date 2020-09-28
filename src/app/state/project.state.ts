import { User } from '../models/user.model';
import { Expense } from '../models/expense.model';
import { Payment } from '../models/payment.model';

export class ProjectState {
  editors: string[] = [];
  ownerId: string = "";
  ownerEmail: string = "";

  projectId: string = "";
  projectName: string = "";

  users: User[] = [];
  expenses: Expense[] = [];
  payments: Payment[] = [];

  order: number = 0;

  _total: number = 0;

  archived: boolean = false;
  weights: {user: User, weight: number}[] = [];
}
