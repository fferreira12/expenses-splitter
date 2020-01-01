import { Injectable } from "@angular/core";
import { User } from "../models/user.model";

import { Observable, Subject } from "rxjs";
import { Expense } from "../models/expense.model";
import { Payment } from "../models/payment.model";
//import { LocalstorageService } from "./localstorage.service";
//import { FirebaseService } from "./firebase.service";
//import { AuthGuardervice } from './auth-guard.service';
import { AuthService } from "./auth.service";
import { Project } from "../models/project.model";
import { Firebasev2Service } from "./firebasev2.service";
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: "root"
})
export class SplitterService {
  allSelfProjects: Project[] = [];
  allProjectsCanEdit: Project[] = [];
  currentProject: Project = new Project();
  isLoading: boolean = true;
  userId: string = null;
  userEmail: string = null;

  // users: User[] = [];
  // expenses: Expense[] = [];
  // payments: Payment[] = [];

  usersObservable: Subject<User[]>;
  expensesObservable: Subject<Expense[]>;
  paymentsObservable: Subject<Payment[]>;
  currentProjectObservable: Subject<Project>;
  allProjectsObservable: Subject<Project[]>;
  loadingObservable: Subject<boolean>;

  weightsObservable: Subject<{ user: User, weight: number }[]>

  constructor(
    private storage: Firebasev2Service,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.resetProjects();

    try {
      this.userId = this.authService.getUserId();
      //this.userEmail = this.authService.currentUser?.email;
      this.authService.subscribeToUserId(userId => {
        if (userId == "") {
          this.currentProject.setData();
        } else {
          this.resetProjects();
          this.userId = userId;
          //this.userEmail = this.authService.currentUser.email;
          this.storage.setUserId(userId);
          this.getData();
        }
      });
      this.authService.subscribeToUserEmail(email => {
        if (email) {
          this.userEmail = email;
          this.resetProjects();
          this.getData();

          let sub = this.translate.onLangChange.subscribe(d => {
            console.log('language has changed');
            console.log(d);
            this.saveLanguagePreference(d.lang);
          });

          this.authService.registerSubscription(sub);
          
          this.getLanguagePreference().subscribe(doc => {
            let data = doc.data();
            console.log('got language, ', data);
            this.translate.use(data.language);
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    //this.getData();

    this.usersObservable = new Subject();
    this.expensesObservable = new Subject();
    this.paymentsObservable = new Subject();
    this.currentProjectObservable = new Subject();
    this.allProjectsObservable = new Subject();
    this.loadingObservable = new Subject();
    this.weightsObservable = new Subject();

    this.emitAllCurrentData();
    this.isLoading = false;
  }

  subscribeToLoading(subscriber) {
    let sub = this.loadingObservable.subscribe(subscriber);
    this.authService.registerSubscription(sub);
  }

  getLoadingStatus() {
    return this.isLoading;
  }

  getAllProjects(includeOthers: boolean = false) {
    if (includeOthers) {
      return [...this.allSelfProjects, ...this.allProjectsCanEdit];
    } else {
      return this.allSelfProjects;
    }
  }

  getCurrentProject() {
    return this.currentProject;
  }

  setCurrentProject(project: Project) {
    this.currentProject = project;
    this.storage.saveLastProject(project);
    this.emitAllCurrentData();
  }

  createNewProject(projectName: string) {
    let p = new Project(null, projectName);
    p.setOwner(this.userId, this.userEmail);
    this.allSelfProjects.push(p);
    this.saveProjectData(p);
    this.setCurrentProject(p);
  }

  renameProject(project: Project, newName: string) {
    project.projectName = newName;
    this.saveProjectData(project);
    this.emitAllCurrentData();
  }

  archiveProject(project: Project) {
    this.storage.archiveProject(project, true);
    this.emitAllCurrentData();
  }

  unArchiveProject(project: Project) {
    this.storage.archiveProject(project, false);
    this.emitAllCurrentData();
  }

  renameUser(user: User, newName: string) {
    if (this.currentProject.renameUser(user, newName)) {
      this.saveProjectData(this.currentProject);
      this.emitAllCurrentData();
    }
  }

  deleteProject(project: Project) {
    //only can edit projects owned
    if (project.ownerId != this.userId) {
      return;
    }
    this.allSelfProjects.splice(this.allSelfProjects.indexOf(project), 1);
    this.storage.deleteProject(project.projectId).then(() => {
      if (this.allSelfProjects.includes(this.currentProject)) {
        this.emitAllCurrentData();
      } else {
        if (this.allSelfProjects.length == 0) {
          this.createNewProject("Default Project");
        }
        this.setCurrentProject(this.allSelfProjects[0]);
      }
    });
  }

  resetProjects() {
    this.allSelfProjects = [];
    this.allProjectsCanEdit = [];
  }

  subscribeToCurrentProject(subscriber) {
    let sub = this.currentProjectObservable.subscribe(subscriber);
    this.authService.registerSubscription(sub);
  }

  subscribeToAllProjects(subscriber) {
    let sub = this.allProjectsObservable.subscribe(subscriber);
    this.authService.registerSubscription(sub);
  }

  prepareStorage() {
    if (this.storage.userId == null && this.userId != null) {
      this.storage.setUserId(this.userId);
      return true;
    }
    if (this.storage.userId == null) {
      return false;
    }
    return true;
  }

  getArchivedProjects() {
    this.getData(true);
  }

  getData(getArchived: boolean = false) {
    if (!this.prepareStorage()) {
      return;
    }
    this.resetProjects();
    this.storage.getProjectsOfUser(getArchived).subscribe(data => {
      // console.log("data");
      // console.log(data);

      // let parsedData = data.data();
      console.log('parsing this', data);
      
      this.tryParseData(data);
      this.emitAllCurrentData();
    });
    this.storage.getProjectsUserCanEdit(this.userEmail).subscribe(data => {
      if (!data) {
        return;
      }

      this.tryParseData(data, false);

      //subscribe to realtime changes
      this.storage.subscribeToProjectChanges(doc => {
        console.log("new data from server");

        if(!doc.data) {
          return;
        }

        let d = doc.data();
        this.parseOne({ id: doc.id, data: d });
      });

      this.emitAllCurrentData();
    });
  }

  tryParseData(data, self: boolean = true) {
    for (let p in data) {
      this.parseOne(data[p]); //id, data > data, userId
    }

    if (self) {
      if (this.allSelfProjects.length == 0) {
        this.currentProject = new Project();
        this.allSelfProjects = [];
        this.allSelfProjects.push(this.currentProject);
        this.saveProjectData(this.currentProject);
      } else {
        //this.currentProject = this.allSelfProjects[0];
        //console.log('before getting last project');
        
        this.storage.getLastProject().subscribe(doc => {
          console.log('got last project', doc);
          
          let data = doc.data();

          console.log('last project data', data);
          let p = this.getAllProjects().find(p => {
            return p.projectId === data.projectId;
          });
          if(p){
            this.setCurrentProject(p);
          } else {
            this.currentProject = this.allSelfProjects[0];
          }
        });
      }
    }

    this.emitAllCurrentData();
  }

  parseOne(pro: any) {
    /*
    let proj = JSON.parse(pro.data.data);
    let project = new Project(pro.id, proj.projectName);
    //project.setEditorEmails(parsed.editors);
    if (pro.data.hasOwnProperty("data")) {
      let parsed = JSON.parse(pro.data.data);
      Object.assign(project, parsed as Partial<Project>);
      project.setEditorEmails(proj.editors || []);
    }
     */

    console.log('trying to parse: ', pro);
    
    let project = new Project(pro.id, pro.projectName);
    Object.assign(project, pro);

    console.log('parsed result: ', project);

    let shouldAddToSelf = !this.allSelfProjects.some(prj => {
      return prj.projectId == project.projectId;
    });
    let shouldAddToOthers = ![
      ...this.allSelfProjects,
      ...this.allProjectsCanEdit
    ].some(prj => {
      return prj.projectId == project.projectId;
    });
    if (self && shouldAddToSelf) {
      this.allSelfProjects.push(project);
    } else if (!self && shouldAddToOthers) {
      this.allProjectsCanEdit.push(project);
    } else {
      this.updateProject(project);
    }
   
    return project;

  }

  updateProject(project: Project) {
    [...this.allSelfProjects, ...this.allProjectsCanEdit].forEach(p => {
      if (p.projectId == project.projectId) {
        p.projectName = project.projectName;
        p.setData(project.users, project.expenses, project.payments);
        p.setEditorEmails(project.editors);
      }
    });
    this.emitAllCurrentData();
  }

  private emitAllCurrentData() {
    this.isLoading = true;
    this.loadingObservable.next(this.isLoading);
    this.usersObservable.next(this.currentProject.users);
    this.expensesObservable.next(this.currentProject.expenses);
    this.paymentsObservable.next(this.currentProject.payments);
    this.allProjectsObservable.next([
      ...this.allSelfProjects,
      ...this.allProjectsCanEdit
    ]);
    this.currentProjectObservable.next(this.currentProject);
    this.isLoading = false;
    this.loadingObservable.next(this.isLoading);
    this.weightsObservable.next(this.getWeights())
  }

  saveProjectData(project: Project) {
    this.isLoading = true;
    if (!this.prepareStorage()) {
      this.isLoading = false;
      return;
    }
    this.loadingObservable.next(this.isLoading);
    if (this.storage.userId == null) {
      this.storage.setUserId(this.userId);
    }
    if (!project.ownerId) {
      project.setOwner(this.userId, this.userEmail);
    }
    this.storage.saveProject(project.ownerId, project);
    this.isLoading = false;
    this.loadingObservable.next(this.isLoading);
  }



  addUser(user: User) {
    if (this.currentProject.addUser(user)) {
      this.saveProjectData(this.currentProject);
      this.usersObservable.next(this.currentProject.users);
    }
  }

  addEditor(project: Project, email: string) {
    this.storage.addEditorToProject(project.projectId, email);
    project.addEditor(email);
    this.saveProjectData(project);
    this.emitAllCurrentData();
  }

  isSelfProject(project: Project) {
    if (!this.userId) {
      this.userId = this.authService.getUserId();
    }
    return project.ownerId == this.userId;
  }

  removeEditor(project: Project, email: string) {
    this.storage.removeEditorFromProject(project.projectId, email);
    project.removeEditor(email);
    this.saveProjectData(project);
    this.emitAllCurrentData();
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
    let sub = this.usersObservable.subscribe(observer);
    this.authService.registerSubscription(sub);
  }

  addExpense(expense: Expense) {
    if (this.currentProject.addExpense(expense)) {
      this.saveProjectData(this.currentProject);
      this.expensesObservable.next(this.currentProject.expenses);
    }
  }

  editExpense(oldExpense: Expense, newExpense: Expense) {
    if(this.currentProject.updateExpense(oldExpense, newExpense)) {
      this.saveProjectData(this.currentProject);
      this.expensesObservable.next(this.currentProject.expenses);
      return true;
    } else {
      return false;
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
    let sub = this.expensesObservable.subscribe(observer);
    this.authService.registerSubscription(sub);
  }

  getWeights() {
    return this.currentProject.weights;
  }

  getWeightForUser(user: User) {
    return this.currentProject.getWeightForUser(user);
  }

  setWeightForUser(user: User, weight: number) {
    this.currentProject.setWeightForUser(user, weight);
    this.weightsObservable.next(this.getWeights());
    this.saveProjectData(this.currentProject);
    this.emitAllCurrentData();
  }

  setWeights(weigths: { user: User, weight: number }[]) {
    this.currentProject.setUnevenSplit(weigths);
    this.weightsObservable.next(this.getWeights());
    this.saveProjectData(this.currentProject);
    this.emitAllCurrentData();
  }

  isEvenSplit() {
    return this.currentProject.isEvenSplit();
  }

  subscribeToWeights(observer) {
    this.weightsObservable.subscribe(observer);
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
    let sub = this.paymentsObservable.subscribe(observer);
    this.authService.registerSubscription(sub);
  }

  getPaymentsMade(user: User) {
    return this.currentProject.getPaymentsMade(user);
  }

  getPaymentsReceived(user: User) {
    return this.currentProject.getPaymentsReceived(user);
  }

  getLanguagePreference() {
    return this.storage.getLanguagePreference();
  }

  saveLanguagePreference(lang: string) {
    console.log('saving lang ' + lang);
    if(!lang) {
      return;
    }
    this.storage.saveLanguagePreference(lang);
  }

}
