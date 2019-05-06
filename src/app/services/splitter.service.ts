import { Injectable } from "@angular/core";
import { User } from "../models/user.model";

import { Observable, Subject } from "rxjs";
import { Expense } from "../models/expense.model";
import { Payment } from "../models/payment.model";
import { LocalstorageService } from "./localstorage.service";
import { FirebaseService } from "./firebase.service";
//import { AuthGuardervice } from './auth-guard.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: "root"
})
export class SplitterService {
  users: User[] = [];
  expenses: Expense[] = [];
  payments: Payment[] = [];

  usersObservable: Subject<User[]>;
  expensesObservable: Subject<Expense[]>;
  paymentsObservable: Subject<Payment[]>;

  constructor(private storage: FirebaseService, private authService: AuthService) {
    //console.log("creating instance of Splitter Service");
    // this.users = [
    //   new User("Fernando"),
    //   new User("Thiago"),
    //   new User("Henrique"),
    //   new User("Vitor")
    // ];

    // this.users = storage.get("users") || [];
    // this.expenses = storage.get("expenses") || [];
    // this.payments = storage.get("payments") || [];

    this.authService.subscribeToUserId(userId => {
      if(userId == "") {
        this.users = [];
        this.expenses = [];
        this.payments = [];
      } else {
        this.getData();
      }
    })

    this.getData();
    
    this.usersObservable = new Subject();
    this.expensesObservable = new Subject();
    this.paymentsObservable = new Subject();
  }

  getData(){
    this.storage.get().then(data => {
      //console.log("getting users");
      //console.log(JSON.parse(data.data()["users"]));
      let parsedData = data.data();
      this.tryParseData(parsedData);
      this.emitAllCurrentData();
    });
  }

  tryParseData(data) {
    try {
      let users = JSON.parse(data["users"]);
      this.users = users as User[] | [];
    } catch {
      this.users = [];
    }
    try {
      let expenses = JSON.parse(data["expenses"]);
      this.expenses = expenses as Expense[] | [];
    } catch {
      this.expenses = [];
    }
    try {
      let payments = JSON.parse(data["payments"]);
      this.payments = payments as Payment[] | [];
    } catch {
      this.payments = [];
    }
  }

  private emitAllCurrentData() {
    this.usersObservable.next(this.users);
    this.expensesObservable.next(this.expenses);
    this.paymentsObservable.next(this.payments);
  }

  addUser(user: User) {
    if (user.name == null || user.name == "") {
      return;
    }
    this.users.push(user);
    this.storage.save("users", this.users);
    this.usersObservable.next(this.users);
  }

  removeUser(user: User) {
    this.users.splice(this.users.indexOf(user), 1);

    //FIX: not working
    //cascade remove any payments or expenses that had this user
    this.removeExpensesAndPaymentsWithNoAssociatedUser();

    this.storage.save("users", this.users);
    this.usersObservable.next(this.users);
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

  getUsers(): User[] {
    return this.users;
  }

  subscribeToUsers(observer) {
    this.usersObservable.subscribe(observer);
  }

  addExpense(expense: Expense) {
    if (
      !expense.users.includes(expense.payer) ||
      expense.value == null ||
      expense.value == 0
    ) {
      return;
    }

    this.expenses.push(expense);
    this.storage.save("expenses", this.expenses);
    this.expensesObservable.next(this.expenses);
  }

  removeExpense(expense: Expense) {
    this.expenses.splice(this.expenses.indexOf(expense), 1);
    this.storage.save("expenses", this.expenses);
    this.expensesObservable.next(this.expenses);
  }

  getExpenses(): Expense[] {
    return this.expenses;
  }

  subscribeToExpenses(observer) {
    this.expensesObservable.subscribe(observer);
  }

  getPaidValues() {
    //console.log("inside get paid values");
    let paid = {};
    this.users.forEach(user => {
      paid[user.id] = 0;
    });
    this.expenses.forEach(expense => {
      paid[expense.payer.id] += expense.value;
    });
    //console.log(paid);
    return paid;
  }

  getFairShares() {
    let fairShares = {};
    this.users.forEach(user => {
      fairShares[user.id] = 0;
    });
    this.expenses.forEach(expense => {
      expense.users.forEach(user => {
        fairShares[user.id] += (expense.value * 1.0) / expense.users.length;
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

  addPayment(payment: Payment) {
    if (
      payment.payer == null ||
      payment.receiver == null ||
      payment.payer == payment.receiver ||
      payment.value == null ||
      payment.value <= 0
    ) {
      console.log("invalid payment");
      return;
    }

    this.payments.push(payment);
    this.storage.save("payments", this.payments);
    this.paymentsObservable.next(this.payments);

    //FIX
    //this.expensesObservable.next(this.expenses);
  }

  removePayment(payment: Payment) {
    this.payments.splice(this.payments.indexOf(payment), 1);
    this.storage.save("payments", this.payments);
    this.paymentsObservable.next(this.payments);
    //this.expensesObservable.next(this.expenses);
  }

  getPayments(): Payment[] {
    return this.payments;
  }

  subscribeToPayments(observer) {
    this.paymentsObservable.subscribe(observer);
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
