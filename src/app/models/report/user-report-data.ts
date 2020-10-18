import { Expense } from '../expense.model';
import { Payment } from '../payment.model';
import { Project } from '../project.model';
import { User } from '../user.model';

export interface UserReportData {

  project: Project;
  user: User;
  expenses: Expense[];
  payments: Payment[];
  time: Date;
  totalExpenses?: number;

}
