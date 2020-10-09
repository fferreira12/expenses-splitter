import { Injectable } from "@angular/core";
import { User } from "../models/user.model";

import { Subject, Observable, BehaviorSubject } from "rxjs";
import { Expense } from "../models/expense.model";
import { Payment } from "../models/payment.model";
//import { LocalstorageService } from "./localstorage.service";
//import { FirebaseService } from "./firebase.service";
//import { AuthGuardervice } from './auth-guard.service';
import { AuthService } from "./auth.service";
import { Project } from "../models/project.model";
import { Firebasev2Service } from "./firebasev2.service";
import { TranslateService } from "@ngx-translate/core";
import { tap } from 'rxjs/operators';
import * as firebase from 'firebase';

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

  usersObservable: BehaviorSubject<User[]>;
  expensesObservable: BehaviorSubject<Expense[]>;
  paymentsObservable: BehaviorSubject<Payment[]>;
  currentProjectObservable: BehaviorSubject<Project>;
  allProjectsObservable: BehaviorSubject<Project[]>;
  loadingObservable: BehaviorSubject<boolean>;

  weightsObservable: BehaviorSubject<{ user: User; weight: number }[]>;

  constructor(
    private db: Firebasev2Service,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.resetProjects();

    try {
      this.userId = this.authService.getUserId();
      //this.userEmail = this.authService.currentUser?.email;

      this.authService.subscribeToUser((user: firebase.User) => {
        if (!user) {
          this.currentProject.setData();
          return;
        } else {
          this.resetProjects();
          this.userId = user.uid;
          this.userEmail = user.email;
          this.db.setUserId(this.userId);
          this.getData();
        }

        let sub = this.translate.onLangChange.subscribe(d => {
          this.saveLanguagePreference(d.lang);
        });

        this.authService.registerSubscription(sub);

        this.getLanguagePreference().subscribe(doc => {
          let data = doc.data();
          this.translate.use(data.language);
        });
      });
    } catch (e) {
      console.log(e);
    }

    //this.getData();

    this.usersObservable = new BehaviorSubject([]);
    this.expensesObservable = new BehaviorSubject([]);
    this.paymentsObservable = new BehaviorSubject([]);
    this.currentProjectObservable = new BehaviorSubject(null);
    this.allProjectsObservable = new BehaviorSubject([]);
    this.loadingObservable = new BehaviorSubject(true);
    this.weightsObservable = new BehaviorSubject(null);

    this.emitAllCurrentData();
    this.finishLoading();
  }

  getLoadingStatus$(): Observable<boolean> {
    return this.loadingObservable.asObservable();
  }

  startLoading() {
    this.isLoading = true;
    this.loadingObservable.next(this.isLoading);
  }

  finishLoading() {
    this.isLoading = false;
    this.loadingObservable.next(this.isLoading);
  }

  getAllProjects(includeOthers: boolean = true) {
    let p: Project[];
    if (includeOthers) {
      p = [...this.allSelfProjects, ...this.allProjectsCanEdit];
    } else {
      p = this.allSelfProjects;
    }
    return p.sort((a, b) => a.order - b.order);
  }

  getAllProjects$(): Observable<Project[]> {
    return this.allProjectsObservable.asObservable();
  }

  //deprecated
  getCurrentProject() {
    return this.currentProject;
  }

  getCurrentProject$(): Observable<Project> {
    return this.currentProjectObservable.asObservable();
  }

  setCurrentProject(project: Project) {
    this.currentProject = project;
    this.db.saveLastProject(project.projectId);
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
    this.db.archiveProject(project, true);
    this.emitAllCurrentData();
  }

  unArchiveProject(project: Project) {
    this.db.archiveProject(project, false);
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
    this.db.deleteProject(project.projectId).then(() => {
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

  prepareStorage() {
    if (this.db.userId == null && this.userId != null) {
      this.db.setUserId(this.userId);
      return true;
    }
    if (this.db.userId == null) {
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
    this.db.getProjectsOfUser(getArchived).subscribe(data => {

      this.tryParseData(data);
      this.emitAllCurrentData();
    });
    this.db.getProjectsUserCanEdit(this.userEmail).subscribe(data => {
      if (!data) {
        return;
      }

      this.tryParseData(data, false);

      //subscribe to realtime changes
      this.db.subscribeToProjectChanges(doc => {
        if (!doc.data) {
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
        //console.log('before getting last project');

        this.db.getLastProject().subscribe(doc => {

          let data = doc.data();

          let p = this.getAllProjects().find(p => {
            return p.projectId === data.projectId;
          });
          if (p) {
            this.setCurrentProject(p);
          } else {
            //try to download project by id, in the case it is an archived project
            this.db.getProject(data.projectId).subscribe(docSnap => {
              if (!docSnap.exists) {
                this.currentProject = this.allSelfProjects[0];
                return;
              }

              let data = docSnap.data();
              let p = this.parseOne({ id: data.projectId, ...docSnap.data() });
              this.setCurrentProject(p);
            });
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

    let project = new Project(pro.id, pro.projectName);
    Object.assign(project, pro);

    let shouldAddToSelf = project.ownerId === this.userId;
    let shouldAddToOthers =
      !shouldAddToSelf &&
      project.editors.some(editorEmail => editorEmail === this.userEmail);
    let alreadyAdded = [
      ...this.allSelfProjects,
      ...this.allProjectsCanEdit
    ].some(p => p.projectId === project.projectId);
    if (alreadyAdded) {
      return project;
    }
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
    this.startLoading();
    this.usersObservable.next(this.getUsers());
    this.expensesObservable.next(this.getExpenses());
    this.paymentsObservable.next(this.getPayments());
    this.allProjectsObservable.next(this.getAllProjects());
    this.currentProjectObservable.next(this.currentProject);
    this.weightsObservable.next(this.getWeights());
    this.finishLoading();
  }

  saveProjectData(project: Project, saveLastProject: boolean = false) {
    this.startLoading();
    if (!this.prepareStorage()) {
      this.finishLoading();
      return;
    }
    if (this.db.userId == null) {
      this.db.setUserId(this.userId);
    }
    if (!project.ownerId) {
      project.setOwner(this.userId, this.userEmail);
    }
    this.db.saveProject(project.ownerId, project, saveLastProject);
    this.finishLoading();
  }

  addUser(user: User) {
    if (this.currentProject.addUser(user)) {
      this.saveProjectData(this.currentProject);
      this.usersObservable.next(this.getUsers());
    }
  }

  setUsersOrder(users: User[]) {
    users.forEach((user, index) => {
      user.order = index;
    });
    this.saveProjectData(this.currentProject, false);
    this.usersObservable.next(this.getUsers());
  }

  addEditor(project: Project, email: string) {
    this.db.addEditorToProject(project.projectId, email);
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
    this.db.removeEditorFromProject(project.projectId, email);
    project.removeEditor(email);
    this.saveProjectData(project);
    this.emitAllCurrentData();
  }

  removeUser(user: User) {
    if (this.currentProject.removeUser(user)) {
      this.removeExpensesAndPaymentsWithNoAssociatedUser();
      this.saveProjectData(this.currentProject);
      this.usersObservable.next(this.getUsers());
    }
  }

  removeExpensesAndPaymentsWithNoAssociatedUser() {
    this.currentProject.removeExpensesAndPaymentsWithNoAssociatedUser();
  }

  private getUsers(): User[] {
    return this.currentProject.users.sort((a, b) => a.order - b.order);
  }

  getUsers$(): Observable<User[]> {
    return this.usersObservable.asObservable();
  }

  addExpense(expense: Expense) {
    if (this.currentProject.addExpense(expense)) {
      this.saveProjectData(this.currentProject);
      this.expensesObservable.next(this.getExpenses());
      return true;
    } else {
      return false;
    }
  }

  editExpense(oldExpense: Expense, newExpense: Expense) {
    if (this.currentProject.updateExpense(oldExpense, newExpense)) {
      this.saveProjectData(this.currentProject);
      this.expensesObservable.next(this.getExpenses());
      return true;
    } else {
      return false;
    }
  }

  removeExpense(expense: Expense) {
    let filePath = expense.filePath;
    if (this.currentProject.removeExpense(expense)) {
      if (filePath) {
        this.db.deleteFile(filePath);
      }
      this.saveProjectData(this.currentProject);
      this.expensesObservable.next(this.getExpenses());
    }
  }

  private getExpenses(): Expense[] {
    return this.currentProject.expenses.sort((a, b) => a.order - b.order);
  }

  getExpenses$(): Observable<Expense[]> {
    return this.expensesObservable.asObservable();
  }

  setExpenseOrder(expense: Expense, order: number) {
    this.currentProject.setOrder(expense, order);
    this.saveProjectData(this.currentProject);
    this.expensesObservable.next(this.currentProject.expenses);
  }

  setPaymentOrder(payment: Payment, order: number) {
    this.currentProject.setOrder(payment, order);
    this.saveProjectData(this.currentProject);
    this.paymentsObservable.next(this.currentProject.payments);
  }

  setProjectsOrder(projects: Project[]) {
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      project.order = i;
      this.saveProjectData(project, false);
    }
    this.allProjectsObservable.next(this.getAllProjects());

  }

  addFileToExpense(file: File, expense: Expense) {
    this.startLoading();
    if (!this.currentProject.expenses.includes(expense)) {
      console.error(
        "Can't upload because expense does not belong to current project"
      );

      return;
    }
    if (
      !(file.type.startsWith("image/") || file.type == "application/pdf") ||
      file.size > 50 * 1024 * 1024
    ) {
      console.error(
        "Can't upload because file is not supported or is bigger than 50MB"
      );
      return;
    }
    console.log("starting upload");

    let promise = this.db.uploadFile(file, this.currentProject, "expenses");

    promise.snapshotChanges()
    .pipe(
      tap(snapshot => {
          if(snapshot.state === firebase.storage.TaskState.SUCCESS) {
            this.finishLoading();
          }
        }
      )
    )

    return promise;
  }

  deleteFileFromExpense(expense: Expense) {
    if (!this.currentProject.expenses.includes(expense)) {
      console.log(
        "Can't upload because expense does not belong to current project"
      );

      return;
    }
    console.log("starting delete");
    this.db.deleteFile(expense.filePath).subscribe(
      () => {
        console.log("File deleted");
        expense.filePath = "";
        expense.fileUrl = "";
        this.saveProjectData(this.currentProject);
        this.expensesObservable.next(this.getExpenses());
      },

      () => {
        console.error("Error deleting file");
      }
    );
  }

  addFileToPayment(file: File, payment: Payment) {
    if (!this.currentProject.payments.includes(payment)) {
      console.error(
        "Can't upload because pyament does not belong to current project"
      );

      return;
    }
    if (
      !(file.type.startsWith("image/") || file.type == "application/pdf") ||
      file.size > 50 * 1024 * 1024
    ) {
      console.error(
        "Can't upload because file is not supported or is bigger than 50MB"
      );
      return;
    }
    console.log("starting upload");

    /*
    this.db.uploadFile(file, this.currentProject, "payments").then(task => {
      task.ref.getDownloadURL().then(url => {
        payment.fileUrl = url;
        payment.filePath = task.ref.fullPath;
        this.saveProjectData(this.currentProject);
        this.expensesObservable.next(this.getExpenses());
        console.log("File uploaded", payment);
      });
    });
    */

    let promise = this.db.uploadFile(file, this.currentProject, "payments");

    return promise;
  }

  deleteFileFromPayment(payment: Payment) {
    if (!this.currentProject.payments.includes(payment)) {
      console.log(
        "Can't upload because expense does not belong to current project"
      );

      return;
    }
    console.log("starting delete");
    this.db.deleteFile(payment.filePath).subscribe(
      () => {
        console.log("File deleted");
        payment.filePath = "";
        payment.fileUrl = "";
        this.saveProjectData(this.currentProject);
        this.paymentsObservable.next(this.getPayments());
      },

      () => {
        console.error("Error deleting file");
      }
    );
  }

  getWeights() {
    return this.currentProject.weights;
  }

  getWeights$(): Observable<{ user: User; weight: number }[]> {
    return this.weightsObservable;
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

  // TODO: not being used, evaluate removal
  setWeights(weigths: { user: User; weight: number }[]) {
    this.currentProject.setUnevenSplit(weigths);
    this.weightsObservable.next(this.getWeights());
    this.saveProjectData(this.currentProject);
    this.emitAllCurrentData();
  }

  unSetWeights() {
    this.currentProject.setEvenSplit();
    this.weightsObservable.next(this.getWeights());
    this.saveProjectData(this.currentProject);
    this.emitAllCurrentData();
  }

  isEvenSplit() {
    return this.currentProject.isEvenSplit();
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
      this.paymentsObservable.next(this.getPayments());
    }
  }

  removePayment(payment: Payment) {
    let filePath = payment.filePath;
    if (this.currentProject.removePayment(payment)) {
      if (filePath) {
        this.db.deleteFile(filePath);
      }
      this.saveProjectData(this.currentProject);
      this.paymentsObservable.next(this.getPayments());
    }
  }

  editPayment(oldPayment: Payment, newPayment: Payment) {
    if (this.currentProject.updatePayment(oldPayment, newPayment)) {
      this.saveProjectData(this.currentProject);
      this.paymentsObservable.next(this.getPayments());
      return true;
    } else {
      return false;
    }
  }

  private getPayments(): Payment[] {
    return this.currentProject.payments.sort((a, b) => a.order - b.order);;
  }

  getPayments$(): Observable<Payment[]> {
    return this.paymentsObservable.asObservable();
  }

  getPaymentsMade(user: User) {
    return this.currentProject.getPaymentsMade(user);
  }

  getPaymentsReceived(user: User) {
    return this.currentProject.getPaymentsReceived(user);
  }

  getLanguagePreference() {
    return this.db.getLanguagePreference();
  }

  saveLanguagePreference(lang: string) {
    //console.log('saving lang ' + lang);
    if (!lang) {
      return;
    }
    this.db.saveLanguagePreference(lang);
  }
}
