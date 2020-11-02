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

  userReportData.payments.forEach(payment => {
    let paymentMade: boolean = payment.payer.id == userReportData.user.id;
    let name = paymentMade ? `Payment made to ${payment.receiver.name}` : `Payment received from ${payment.payer.name}`
    let userWeight = userReportData.project.getWeightForUser(userReportData.user);
    let balance = paymentMade ? eData[eData.length - 1].balance + payment.value : eData[eData.length - 1].balance - payment.value;
    let weights: { [key: string]: number } = {};
    weights[payment.payer.id] = userReportData.project.getWeightForUser(payment.payer);
    weights[payment.receiver.id] = userReportData.project.getWeightForUser(payment.receiver);
    let paid = paymentMade ? payment.value : -payment.value;
    let diff = paymentMade ? payment.value : -payment.value;


    let e: ExpenseTableData = {
      expenseName: name,
      value: payment.value,
      users: [payment.payer, payment.receiver],
      currentUser: userReportData.user,
      userWeight,
      totalWeight: userWeight,
      balance,
      weights,
      paid,
      share: 0,
      diff,
      isLocalWeight: false,
      expense: null
    }

    eData.push(e);

  })

  return eData;

}
