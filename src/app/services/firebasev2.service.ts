import { Injectable } from "@angular/core";

import * as firebase from "firebase";

import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { Expense } from "../models/expense.model";
import { Payment } from "../models/payment.model";

@Injectable({
  providedIn: "root"
})
export class Firebasev2Service {
  userId: string = null;
  db: firebase.firestore.Firestore;

  constructor() {
    this.db = firebase.firestore();
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  verifyUserId() {
    if (!this.userId) {
      throw new Error("Must set the user id before using Firebase Service V2");
    }
  }

  saveProject(project: Project) {
    this.verifyUserId();
    //let name = project.projectName;
    this.db
      .collection("projects")
      .doc(project.projectId)
      .set({ userId: this.userId, data: JSON.stringify(project) });
  }

  // saveUser(projectId: string, user: User) {
  //   this.verifyUserId();
  //   this.db
  //     .collection("projects")
  //     .doc(projectId)
  //     .collection("users")
  //     .add({ ...user });
  // }

  // saveExpense(expense: Expense) {}

  // savePayment(payment: Payment) {}

  getProjectsOfUser() {
    let result = this.db
      .collection("projects")
      .where("userId", "==", this.userId)
      .get()
      .then(snapshot => {
        let allProjects = [];
        snapshot.docs.map(docSnap => {
          let id = docSnap.id;
          allProjects.push({ id, data: docSnap.data() });
        });
        return allProjects;
      });
    console.log(result);

    return result;
  }

  getProject(projectId: string) {
    return this.db
      .collection("projects")
      .doc(projectId)
      .get();
  }

  deleteProject(projectId: string) {
    console.log("deleting " + projectId);

    return this.db
      .collection("projects")
      .doc(projectId)
      .delete();
  }

  // getUsers(projectId: string) {}

  // getExpenses(projectId: string) {}

  // getPayments(projectId: string) {}
}
