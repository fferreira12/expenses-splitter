import { User } from "./user.model";
import { Expense } from "./expense.model";
import { Payment } from "./payment.model";
import { uuid } from "../util/uuid";
import { ProjectState } from '../state/project.state';
import copy from 'fast-copy';
import { GetTotalWeight, GetWeightForUser, IsEvenSplit, SetEvenSplit, SetUnevenSplit, SetWeightForUser } from './weight/weighted-item-operators';

export class Project {
  editors: string[] = [];
  ownerId: string;
  ownerEmail: string;

  projectId: string;
  projectName: string;
  users: User[];
  expenses: Expense[];
  payments: Payment[];

  order: number;

  _total: number = 0;
  get total(): number {
    if(!this.expenses) {
      return 0;
    }
    this._total = this.expenses.reduce((previous, current) => previous + current.value, 0);
    return this._total;
  }

  set total(value: number) {
    this._total = value;
  }

  get expensesCount(): number {
    if(!this.expenses) {
      return 0;
    }
    return this.expenses.length;
  }

  get expensesAverage(): number {
    if(!this.expenses) {
      return 0;
    }
    return this.expenses.map(exp => exp.value).reduce((a, b) => a + b, 0) / this.expenses.length;
  }

  archived: boolean;

  weights: {user: User, weight: number}[];

  constructor(
    projectId?: string,
    projectName?: string,
    users?: User[],
    expenses?: Expense[],
    payments?: Payment[]
  ) {
    this.projectId = projectId || uuid();
    this.projectName = projectName || "Default";
    this.setData(users, expenses, payments);
  }

  isEmptyProject() {
    return this.projectName == "Default" && this.users.length == 0 && this.expenses.length == 0 && this.payments.length == 0 && this.editors.length == 0;
  }

  public static fromState(projectState: ProjectState): Project {
    let p = new Project();
    p.setState(projectState);
    return p;
  }

  public static batchFromState(projectStates: ProjectState[]): Project[] {
    let clone = copy(projectStates);
    return clone.map(state => Project.fromState(state));
  }

  getState(): ProjectState {
    let clone: Project = copy(this);
    let state: ProjectState = {
      editors: clone.editors,
      ownerId: clone.ownerId,
      ownerEmail: clone.ownerEmail,
      projectId: clone.projectId,
      projectName: clone.projectName,
      users: clone.users,
      expenses: clone.expenses,
      payments: clone.payments,
      order: clone.order,
      _total: clone._total,
      archived: clone.archived,
      weights: clone.weights,
    }
    return state;
  }

  setState(state: ProjectState) {
    if (!state) return;
    this.editors = state.editors;
    this.ownerId = state.ownerId;
    this.ownerEmail = state.ownerEmail;
    this.projectId = state.projectId;
    this.projectName = state.projectName;
    this.setData(state.users, state.expenses.map(e => Expense.createExpense(e)), state.payments);
    this.order = state.order;
    this._total = state._total;
    this.archived = state.archived;
    this.weights = state.weights;
  }

  setData(users?: User[], expenses?: Expense[], payments?: Payment[]) {
    this.users = users || [];
    this.expenses = expenses || [];
    this.payments = payments || [];
  }

  setOwner(ownerId: string, ownerEmail: string) {
    this.ownerId = ownerId;
    this.ownerEmail = ownerEmail;
  }

  setEditorEmails(editorEmails: string[]) {
    this.editors = editorEmails;
  }

  addUser(user: User) {
    if (user.name == null || user.name == "") {
      return false;
    }
    this.users.push(user);
    return true;
  }

  getUser(userId: string): User {
    return this.users.find(u => u.id === userId);
  }

  addEditor(email: string) {
    if (this.editors.includes(email)) {
      return;
    }
    this.editors.push(email);
  }

  removeEditor(email: string) {
    if (!this.editors.includes(email)) {
      return;
    }
    this.editors.splice(this.editors.indexOf(email), 1);
  }

  removeUser(user: User) {
    try {
      this.users.splice(this.users.indexOf(user), 1);
    } catch {
      return false;
    }
    return true;
  }

  removeUserById(userId: string) {
    let index = this.users.findIndex(user => user.id === userId);
    if (index == -1) {
      return false;
    } else {
      this.users.splice(index, 1);
      return true;
    }
  }

  renameUser(user: User, newName: string): boolean {
    if (!this.users.includes(user)) {
      return false;
    } else {
      let index = this.users.indexOf(user);
      this.users[index].name = newName;
      //updates payments and expenses already made with older name
      this.updateUsernameInExpensesMade(user, newName);
      this.updateUsernameInPaymentsMade(user, newName);
      return true;
    }
  }

  renameUserById(userId: string, newName: string) {
    let user = this.users.find(u => u.id === userId);
    if (!user) {
      return false;
    } else {
      return this.renameUser(user, newName);
    }
  }

  updateUsernameInExpensesMade(user: User, newName: string) {
    //update expense
    this.expenses.forEach((expense, expenseIndex) => {

      //updates users
      expense.users.forEach((u, userIndex) => {
        if(u.id === user.id) {
          this.expenses[expenseIndex].users[userIndex].name = newName;
        }
      });

      //updates payers
      expense.payers.forEach((payer, payerIndex) => {
        if(payer.payer.id === user.id) {
          this.expenses[expenseIndex].payers[payerIndex].payer.name = newName;
        }
      });

    });
  }

  updateUsernameInPaymentsMade(user: User, newName: string) {
    this.payments.forEach((payment, paymentIndex) => {

      if(payment.payer.id === user.id) {
        this.payments[paymentIndex].payer.name = newName;
      }

      if(payment.receiver.id === user.id) {
        this.payments[paymentIndex].receiver.name = newName;
      }

    });
  }

  removeExpensesAndPaymentsWithNoAssociatedUser() {
    let userIds = this.users.map(user => user.id);

    for (let i = this.expenses.length - 1; i >= 0; --i) {
      let expense = this.expenses[i];
      let missing = !expense.users.every(user => {
        return userIds.includes(user.id);
      });
      if (missing) {
        this.removeExpense(expense);
      }
    }

    for (let i = this.payments.length - 1; i >= 0; --i) {
      let payment = this.payments[i];
      let missing =
        !userIds.includes(payment.payer.id) ||
        !userIds.includes(payment.receiver.id);
      if (missing) {
        this.removePayment(payment);
      }
    }
  }

  addExpense(expense: Expense, updating: boolean = false) {
    if (
      !expense.allPayersAreParticipating(expense.payers) ||
      expense.value == null ||
      expense.value == 0
    ) {
      return false;
    }

    if(!updating && (!expense.order || expense.order == 0)) {
      expense.order = this.expenses.length;
    }

    this.expenses.push(expense);
    return true;
    //this.saveProjectData(this.currentProject);
    //this.expensesObservable.next(this.currentProject.expenses);
  }

  //TODO: improve expense deletion
  removeExpense(expense: Expense) {
    let index = this.expenses.findIndex(exp => exp.isEqualTo(expense));

    if (index == -1) return false;

    try {
      this.expenses.splice(index, 1);
      return true;
    } catch {
      return false;
    }
  }

  updateExpense(oldExpense: Expense, newExpense: Expense) {
    let removed = this.removeExpense(oldExpense);
    if(removed) {
      this.addExpense(newExpense, true);
      return true;
    } else {
      return false;
    }
  }

  setOrder(orderable: { order: number }, order: number) {
    // if(!this.expenses.includes(expense)) {
    //   return;
    // }
    orderable.order = order;
  }

  addPayment(payment: Payment, updating: boolean = false) {
    if (
      payment.payer == null ||
      payment.receiver == null ||
      payment.payer == payment.receiver ||
      payment.value == null ||
      payment.value <= 0
    ) {
      //console.log("invalid payment");
      return false;
    }
    if(!updating && (!payment.order || payment.order == 0)) {
      payment.order = this.payments.length;
    }

    this.payments.push(payment);
    return true;
  }

  //TODO: improve expense deletion
  removePayment(payment: Payment) {
    let s = JSON.stringify(payment);
    let index = this.payments.findIndex(p => JSON.stringify(p) == s);

    try {
      this.payments.splice(index, 1);
      return true;
    } catch {
      return false;
    }

  }

  updatePayment(oldPayment: Payment, newPayment: Payment) {
    let removed = this.removePayment(oldPayment);
    if(removed) {
      this.addPayment(newPayment, true);
      return true;
    } else {
      return false;
    }
  }

  getPaidValues() {
    //console.log("inside get paid values");
    let paid = {};
    this.users.forEach(user => {
      paid[user.id] = 0;
      this.expenses.forEach(expense => {
        let e = Expense.createExpense(expense);

        paid[user.id] += e.getAmountPaid(user);
      });
    });

    //console.log(paid);
    return paid;
  }

  setUnevenSplit(weights: {user: User, weight: number}[]) {
    return SetUnevenSplit(this, weights);
  }

  setEvenSplit() {
    return SetEvenSplit(this);
  }

  isEvenSplit(): boolean {
    return IsEvenSplit(this);
  }

  getTotalWeight(expense: Expense) {
    return GetTotalWeight(this, expense);
  }

  getWeightForUser(user: User): number {
    return GetWeightForUser(this, user);
  }

  setWeightForUser(user: User, weight: any) {
    return SetWeightForUser(this, user, weight);
  }

  getFairShares(): { [uid: string]: number } {
    let fairShares = {};
    this.users.forEach(user => {
      fairShares[user.id] = 0;
    });

    let evenSplit = !this.weights;

    this.expenses.forEach(expense => {

      let isWeightedExpense = !expense.isEvenSplit();
      let totalWeight = isWeightedExpense ? expense.getTotalWeight() : this.getTotalWeight(expense);

      expense.users.forEach(user => {
        let userWeight = isWeightedExpense ? expense.getWeightForUser(user) : this.getWeightForUser(user);

        let amount = (expense.value * userWeight) / totalWeight;
        fairShares[user.id] += amount;
      });

    });
    return fairShares;
  }

  getBalances() {
    let balance = {};
    this.users.forEach(user => {
      balance[user.id] = 0;
    });

    if (this.expenses.length === 0 && this.payments.length === 0) {
      return balance;
    }

    let paid = this.getPaidValues();
    let fairShares = this.getFairShares();

    this.users.forEach(user => {
      balance[user.id] = paid[user.id] - fairShares[user.id];
    });

    this.payments.forEach(payment => {
      balance[payment.payer.id] += payment.value;
      balance[payment.receiver.id] -= payment.value;
    });

    return balance;
  }

  getPaymentsMade(user: User) {
    let total = 0;
    this.payments.forEach(payment => {
      if (payment.payer.id === user.id) {
        total += payment.value;
      }
    });
    return total;
  }

  getPaymentsReceived(user: User) {
    let total = 0;
    this.payments.forEach(payment => {
      if (payment.receiver.id === user.id) {
        total += payment.value;
      }
    });
    return total;
  }
}
