import { Injectable } from "@angular/core";
import { User } from "../models/user.model";

import { Observable, Subject } from "rxjs";
import { Expense } from "../models/expense.model";
import { Payment } from "../models/payment.model";
import { LocalstorageService } from "./localstorage.service";
import { FirebaseService } from "./firebase.service";
//import { AuthGuardervice } from './auth-guard.service';
import { AuthService } from "./auth.service";
import { Project } from "../models/project.model";

@Injectable({
  providedIn: "root"
})
export class SplitterService {
  allProjects: Project[] = [];
  currentProject: Project = new Project();

  // users: User[] = [];
  // expenses: Expense[] = [];
  // payments: Payment[] = [];

  usersObservable: Subject<User[]>;
  expensesObservable: Subject<Expense[]>;
  paymentsObservable: Subject<Payment[]>;
  currentProjectObservable: Subject<Project>;
  allProjectsObservable: Subject<Project[]>;

  constructor(
    private storage: FirebaseService,
    private authService: AuthService
  ) {
    this.authService.subscribeToUserId(userId => {
      if (userId == "") {
        this.currentProject.setData();
      } else {
        this.getData();
      }
    });

    this.getData();

    this.usersObservable = new Subject();
    this.expensesObservable = new Subject();
    this.paymentsObservable = new Subject();
    this.currentProjectObservable = new Subject();
    this.allProjectsObservable = new Subject();
  }

  getAllProjects() {
    return this.allProjects;
  }

  getCurrentProject() {
    return this.currentProject;
  }

  setCurrentProject(project: Project) {
    this.currentProject = project;
  }

  createNewProject(projectName: string) {
    let p = new Project(null, projectName);
    this.allProjects.push(p);
    this.setCurrentProject(p);
    this.emitAllCurrentData();
  }

  subscribeToCurrentProject(subscriber) {
    this.currentProjectObservable.subscribe(subscriber);
  }

  subscribeToAllProjects(subscriber) {
    this.allProjectsObservable.subscribe(subscriber);
  }

  getData() {
    this.storage.get().then(data => {
      // console.log("getting users");
      // console.log(JSON.parse(data.data()["users"]));
      let parsedData = data.data();
      this.tryParseData(parsedData);
      this.emitAllCurrentData();
    });
  }

  tryParseData(data) {
    let d = JSON.parse(data[Object.keys(data)[0]]) as Partial<Project>;

    //get all projects
    for (let project in data) {
      if (data.hasOwnProperty(project)) {
        let p = new Project();
        Object.assign(p, JSON.parse(data[project]) as Partial<Project>);
        //if(p.expenses.length != 0 || p.payments.length != 0 || p.users.length != 0) {
          this.allProjects.push(p);
        //}
      }
    }

    let project = new Project();
    this.currentProject = Object.assign(project, d);
    console.log("d");
  }

  private emitAllCurrentData() {
    this.usersObservable.next(this.currentProject.users);
    this.expensesObservable.next(this.currentProject.expenses);
    this.paymentsObservable.next(this.currentProject.payments);
    this.allProjectsObservable.next(this.allProjects);
    this.currentProjectObservable.next(this.currentProject);
  }

  addUser(user: User) {
    if (user.name == null || user.name == "") {
      return;
    }
    this.currentProject.users.push(user);
    this.storage.save(this.currentProject.projectId, this.currentProject);
    this.usersObservable.next(this.currentProject.users);
  }

  removeUser(user: User) {
    this.currentProject.users.splice(
      this.currentProject.users.indexOf(user),
      1
    );

    //FIX: not working
    //cascade remove any payments or expenses that had this user
    this.removeExpensesAndPaymentsWithNoAssociatedUser();

    this.storage.save(this.currentProject.projectId, this.currentProject);
    this.usersObservable.next(this.currentProject.users);
  }

  removeExpensesAndPaymentsWithNoAssociatedUser() {
    let userIds = this.currentProject.users.map(user => user.id);

    for (let i = this.currentProject.expenses.length - 1; i >= 0; --i) {
      let expense = this.currentProject.expenses[i];
      let missing = !expense.users.every(user => {
        return userIds.includes(user.id);
      });
      if (missing) {
        this.removeExpense(expense);
      }
    }

    for (let i = this.currentProject.payments.length - 1; i >= 0; --i) {
      let payment = this.currentProject.payments[i];
      let missing =
        !userIds.includes(payment.payer.id) ||
        !userIds.includes(payment.receiver.id);
      if (missing) {
        this.removePayment(payment);
      }
    }
  }

  getUsers(): User[] {
    return this.currentProject.users;
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

    this.currentProject.expenses.push(expense);
    this.storage.save(this.currentProject.projectId, this.currentProject);
    this.expensesObservable.next(this.currentProject.expenses);
  }

  removeExpense(expense: Expense) {
    this.currentProject.expenses.splice(
      this.currentProject.expenses.indexOf(expense),
      1
    );
    this.storage.save(this.currentProject.projectId, this.currentProject);
    this.expensesObservable.next(this.currentProject.expenses);
  }

  getExpenses(): Expense[] {
    return this.currentProject.expenses;
  }

  subscribeToExpenses(observer) {
    this.expensesObservable.subscribe(observer);
  }

  getPaidValues() {
    //console.log("inside get paid values");
    let paid = {};
    this.currentProject.users.forEach(user => {
      paid[user.id] = 0;
    });
    this.currentProject.expenses.forEach(expense => {
      paid[expense.payer.id] += expense.value;
    });
    //console.log(paid);
    return paid;
  }

  getFairShares() {
    let fairShares = {};
    this.currentProject.users.forEach(user => {
      fairShares[user.id] = 0;
    });
    this.currentProject.expenses.forEach(expense => {
      expense.users.forEach(user => {
        fairShares[user.id] += (expense.value * 1.0) / expense.users.length;
      });
    });
    return fairShares;
  }

  getBalances() {
    let balance = {};
    this.currentProject.users.forEach(user => {
      balance[user.id] = 0;
    });

    if (
      this.currentProject.expenses.length === 0 &&
      this.currentProject.payments.length === 0
    ) {
      return balance;
    }

    let paid = this.getPaidValues();
    let fairShares = this.getFairShares();

    this.currentProject.users.forEach(user => {
      balance[user.id] = paid[user.id] - fairShares[user.id];
    });

    this.currentProject.payments.forEach(payment => {
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

    this.currentProject.payments.push(payment);
    this.storage.save(this.currentProject.projectId, this.currentProject);
    this.paymentsObservable.next(this.currentProject.payments);

    //FIX
    //this.expensesObservable.next(this.expenses);
  }

  removePayment(payment: Payment) {
    this.currentProject.payments.splice(
      this.currentProject.payments.indexOf(payment),
      1
    );
    this.storage.save(this.currentProject.projectId, this.currentProject);
    this.paymentsObservable.next(this.currentProject.payments);
    //this.expensesObservable.next(this.expenses);
  }

  getPayments(): Payment[] {
    return this.currentProject.payments;
  }

  subscribeToPayments(observer) {
    this.paymentsObservable.subscribe(observer);
  }

  getPaymentsMade(user: User) {
    let total = 0;
    this.currentProject.payments.forEach(payment => {
      if (payment.payer.id === user.id) {
        total += payment.value;
      }
    });
    return total;
  }

  getPaymentsReceived(user: User) {
    let total = 0;
    this.currentProject.payments.forEach(payment => {
      if (payment.receiver.id === user.id) {
        total += payment.value;
      }
    });
    return total;
  }
}
