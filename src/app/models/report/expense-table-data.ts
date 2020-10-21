import { Expense } from '../expense.model';
import { User } from '../user.model';
import { UserReportData } from './user-report-data';

export interface ExpenseTableData {
  expenseName: string,
  value: number,
  users: User[],
  currentUser: User,
  share: number,
  paid: number,
  diff: number,
  userWeight: number,
  weights: { [key: string]: number }
  totalWeight: number,
  balance: number,
  isLocalWeight: boolean,
  expense: Expense
}

export function CreateExpenseTableData(userReportData: UserReportData): ExpenseTableData[] {

  let balance = 0;
  let eData: ExpenseTableData[] = []

  if (!userReportData) return;

  userReportData.expenses.forEach(e => {

    let hasLocalWeights = !!e.weights;

    let totalWeight = hasLocalWeights ? e.getTotalWeight() : e.users.reduce((p, c) => p + userReportData.project.getWeightForUser(c), 0);
    let userWeight = hasLocalWeights ? e.getWeightForUser(userReportData.user) : userReportData.project.getWeightForUser(userReportData.user);
    let weights: { [key: string]: number } = {};

    if (hasLocalWeights) {
      e.weights.forEach(w => weights[w.user.id] = w.weight);
    } else if (userReportData.project.weights) {
      userReportData.project.weights.forEach(w => weights[w.user.id] = w.weight);
    } else {
      userReportData.project.users.forEach(u => weights[u.id] = 1);
    }

    let fairValue = 1.0 * e.value * userWeight / totalWeight;
    let paidValue = e.payers.reduce((p, c) => {
      return c.payer.id === userReportData.user.id ? p + c.amount : p;
    }, 0);

    balance = balance - fairValue + paidValue;

    let paid = e.payers.reduce((p, c) => {
      return c.payer.id === userReportData.user.id ? p + c.amount : p;
    }, 0);

    let share = 1.0 * e.value * userWeight / totalWeight;
    let diff = paid - share;

    let data: ExpenseTableData = {
      expenseName: e.name,
      value: e.value,
      users: e.users,
      currentUser: userReportData.user,
      userWeight,
      totalWeight,
      balance,
      weights,
      paid,
      share,
      diff,
      isLocalWeight: hasLocalWeights,
      expense: e
    }

    eData.push(data);

  });

  return eData;

}
