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
  userEmail: string = null;
  db: firebase.firestore.Firestore;
  allProjectIds: string[] = [];

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

  saveProject(ownerId: string, project: Project) {
    this.verifyUserId();
    //let name = project.projectName;
    this.db
      .collection("projects")
      .doc(project.projectId)
      .set({
        userId: ownerId,
        editors: project.editors,
        data: JSON.stringify(project)
      });
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
          this.addToAllProjectIds(id);
          allProjects.push({ id, data: docSnap.data() });
        });
        return allProjects;
      });
    console.log(result);

    return result;
  }

  getProjectsUserCanEdit(email: string) {
    console.log("getting all projects that " + email + " can edit");
    this.userEmail = email;
    if (!email) {
      return Promise.resolve(null);
    }
    let result = this.db
      .collection("projects")
      .where("editors", "array-contains", email)
      .get()
      .then(snapshot => {
        let allProjects = [];
        snapshot.docs.map(docSnap => {
          let id = docSnap.id;
          this.addToAllProjectIds(id);
          //only get projects current user is not the owner
          if (id != this.userId) {
            allProjects.push({ id, data: docSnap.data() });
          }
        });
        return allProjects;
      });
    console.log(result);

    return result;
  }

  addToAllProjectIds(id: string) {
    if (!this.allProjectIds.includes(id)) {
      this.allProjectIds.push(id);
    }
  }

  subscribeToProjectChanges(subscriber) {
    if (this.allProjectIds.length == 0) {
      return;
    }

    this.allProjectIds.forEach(id => {
      this.db
        .collection("projects")
        .doc(id)
        .onSnapshot(doc => {
          subscriber(doc);
        });
    });
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

  addEditorToProject(projectId: string, editorEmail: string) {
    this.db
      .collection("projects")
      .doc(projectId)
      .get()
      .then(docSnap => {
        let data = docSnap.data();
        let editors = data.editors;
        if (!editors) {
          editors = [];
        }
        if (editors.includes(editorEmail)) {
          return;
        }
        editors.push(editorEmail);
        this.db
          .collection("projects")
          .doc(projectId)
          .set(
            {
              editors: editors
            },
            { merge: true }
          );
        console.log("editors");
        console.log(editors);
      });
  }

  removeEditorFromProject(projectId: string, editorEmail: string) {
    this.db
      .collection("projects")
      .doc(projectId)
      .get()
      .then(docSnap => {
        let data = docSnap.data();
        let editors = data.editors;
        if (!editors) {
          return;
        }
        if (!editors.includes(editorEmail)) {
          return;
        }
        editors.splice(editors.indexOf(editorEmail), 1);
        this.db
          .collection("projects")
          .doc(projectId)
          .set(
            {
              editors: editors
            },
            { merge: true }
          );
        console.log("editors");
        console.log(editors);
      });
  }

  // getUsers(projectId: string) {}

  // getExpenses(projectId: string) {}

  // getPayments(projectId: string) {}
}
