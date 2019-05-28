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
    this.resetProjects();

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
    this.emitAllCurrentData();
  }

  createNewProject(projectName: string) {
    let p = new Project(null, projectName);
    this.allProjects.push(p);
    this.saveProjectData(p);
    this.setCurrentProject(p);
  }

  renameProject(project: Project, newName: string) {
    project.projectName = newName;
    this.saveProjectData(project);
    this.emitAllCurrentData();
  }

  renameUser(user: User, newName: string) {
    if (this.currentProject.renameUser(user, newName)) {
      this.saveProjectData(this.currentProject);
      this.emitAllCurrentData();
    }
  }

  deleteProject(project: Project) {
    this.allProjects.splice(this.allProjects.indexOf(project), 1);
    this.storage.delete(project.projectId);
    if (this.allProjects.includes(this.currentProject)) {
      this.emitAllCurrentData();
    } else {
      if (this.allProjects.length == 0) {
        this.createNewProject("Default Project");
      }
      this.setCurrentProject(this.allProjects[0]);
    }
  }

  resetProjects() {
    this.allProjects = [];
  }

  subscribeToCurrentProject(subscriber) {
    this.currentProjectObservable.subscribe(subscriber);
  }

  subscribeToAllProjects(subscriber) {
    this.allProjectsObservable.subscribe(subscriber);
  }

  getData() {
    this.storage.get().then(data => {
      let parsedData = data.data();
      this.tryParseData(parsedData);
      this.emitAllCurrentData();
    });
  }

  tryParseData(data) {
    this.resetProjects();

    let d;
    try {
      d = JSON.parse(data[Object.keys(data)[0]]) as Partial<Project>;
    } catch {
      this.currentProject = new Project();
      this.allProjects = [];
      this.allProjects.push(this.currentProject);
      this.saveProjectData(this.currentProject);
      return;
    }

    //get all projects
    for (let project in data) {
      if (data.hasOwnProperty(project)) {
        let p = new Project();
        Object.assign(p, JSON.parse(data[project]) as Partial<Project>);
        this.allProjects.push(p);
      }
    }

    let project = new Project();
    this.currentProject = Object.assign(project, d);
    //console.log("d");
  }

  private emitAllCurrentData() {
    this.usersObservable.next(this.currentProject.users);
    this.expensesObservable.next(this.currentProject.expenses);
    this.paymentsObservable.next(this.currentProject.payments);
    this.allProjectsObservable.next(this.allProjects);
    this.currentProjectObservable.next(this.currentProject);
  }

  saveProjectData(project: Project) {
    this.storage.save(project.projectId, project);
  }

  addUser(user: User) {
    if (this.currentProject.addUser(user)) {
      this.saveProjectData(this.currentProject);
      this.usersObservable.next(this.currentProject.users);
    }
  }

  removeUser(user: User) {
    if (this.currentProject.removeUser(user)) {
      this.removeExpensesAndPaymentsWithNoAssociatedUser();
      this.saveProjectData(this.currentProject);
      this.usersObservable.next(this.currentProject.users);
    }
  }

  removeExpensesAndPaymentsWithNoAssociatedUser() {
    this.currentProject.removeExpensesAndPaymentsWithNoAssociatedUser();
  }

  getUsers(): User[] {
    return this.currentProject.users;
  }

  subscribeToUsers(observer) {
    this.usersObservable.subscribe(observer);
  }

  addExpense(expense: Expense) {
    if (this.currentProject.addExpense(expense)) {
      this.saveProjectData(this.currentProject);
      this.expensesObservable.next(this.currentProject.expenses);
    }
  }

  removeExpense(expense: Expense) {
    if (this.currentProject.removeExpense(expense)) {
      this.saveProjectData(this.currentProject);
      this.expensesObservable.next(this.currentProject.expenses);
    }
  }

  getExpenses(): Expense[] {
    return this.currentProject.expenses;
  }

  subscribeToExpenses(observer) {
    this.expensesObservable.subscribe(observer);
  }

  getPaidValues() {
    return this.currentProject.getPaidValues();
  }

  getFairShares() {
    return this.currentProject.getFairShares();
  }

  getBalances() {
    return this.currentProject.getBalances();
  }

  addPayment(payment: Payment) {
    if (this.currentProject.addPayment(payment)) {
      this.saveProjectData(this.currentProject);
      this.paymentsObservable.next(this.currentProject.payments);
    }
  }

  removePayment(payment: Payment) {
    if (this.currentProject.removePayment(payment)) {
      this.saveProjectData(this.currentProject);
      this.paymentsObservable.next(this.currentProject.payments);
    }
  }

  getPayments(): Payment[] {
    return this.currentProject.payments;
  }

  subscribeToPayments(observer) {
    this.paymentsObservable.subscribe(observer);
  }

  getPaymentsMade(user: User) {
    return this.currentProject.getPaymentsMade(user);
  }

  getPaymentsReceived(user: User) {
    return this.currentProject.getPaymentsReceived(user);
  }
}
