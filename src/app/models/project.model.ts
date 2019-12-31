import { User } from "./user.model";
import { Expense } from "./expense.model";
import { Payment } from "./payment.model";
import { uuid } from "../util/uuid";

export class Project {
  editors: string[] = [];
  ownerId: string;
  ownerEmail: string;

  projectId: string;
  projectName: string;
  users: User[];
  expenses: Expense[];
  payments: Payment[];

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

  addExpense(expense: Expense) {
    if (
      !expense.allPayersAreParticipating(expense.payers) ||
      expense.value == null ||
      expense.value == 0
    ) {
      return false;
    }

    this.expenses.push(expense);
    return true;
    //this.saveProjectData(this.currentProject);
    //this.expensesObservable.next(this.currentProject.expenses);
  }

  removeExpense(expense: Expense) {
    try {
      this.expenses.splice(this.expenses.indexOf(expense), 1);
      return true;
    } catch {
      return false;
    }
  }

  updateExpense(oldExpense: Expense, newExpense: Expense) {
    let removed = this.removeExpense(oldExpense);
    if(removed) {
      this.addExpense(newExpense);
      return true;
    } else {
      return false;
    }
  }

  addPayment(payment: Payment) {
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

    this.payments.push(payment);
    return true;
  }

  removePayment(payment: Payment) {
    try {
      this.payments.splice(this.payments.indexOf(payment), 1);
      return true;
    } catch {
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
    if(weights.length < this.users.length) {
      console.warn('Not all users are receiving a weight. Users with unset weights will receive a value of 1');
    }

    this.weights = [];

    this.users.forEach(user => {
      let weight = weights.find(weight => weight.user.id === user.id);
      if(weight) {
        this.weights.push(weight);
      } else {
        this.weights.push({user, weight:1});
      }
    })
  }

  setEvenSplit() {
    this.weights = undefined;
  }

  getTotalWeight(expense: Expense) {
    let totalWeight = 0;
    let evenSplit = !this.weights;
    if(evenSplit) {
      totalWeight = expense.users.length;
    } else {
      totalWeight = this.weights
      .filter(weight => { //filter to only use weights of users participating in this expense
        return expense.users.some(user => user.id === weight.user.id)
      }).reduce((total, current) => total + current.weight, 0) //reduce to sum the weights
    }
    return totalWeight;
  }

  getWeightForUser(user: User): number {
    if(!this.weights) {
      return 1;
    }
    let weight = this.weights.find(weight => weight.user.id === user.id);
    return weight ? weight.weight : 1;
  }

  getFairShares(): { [uid: string]: number } {
    let fairShares = {};
    this.users.forEach(user => {
      fairShares[user.id] = 0;
    });

    let evenSplit = !this.weights;

    this.expenses.forEach(expense => {
      
      expense.users.forEach(user => {
        fairShares[user.id] += (expense.value * this.getWeightForUser(user)) / this.getTotalWeight(expense);
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
