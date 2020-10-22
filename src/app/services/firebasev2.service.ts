import { Injectable } from "@angular/core";

//import * as firebase from "firebase";

import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { Expense } from "../models/expense.model";
import { Payment } from "../models/payment.model";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { AuthService } from './auth.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { uuid } from '../util/uuid';

@Injectable({
  providedIn: "root"
})
export class Firebasev2Service {
  userId: string = null;
  userEmail: string = null;
  //db: firebase.firestore.Firestore;
  allProjectIds: string[] = [];
  projects$: Observable<Project[]>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.projects$ = this.db.collection<Project>("projects2").valueChanges();
    this.projects$.pipe(map(projects => {
      return projects.map(p => p.projectId);
    }))
    .subscribe((projectIds => {
      this.allProjectIds = projectIds;
    }))
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  verifyUserId() {
    if (!this.userId) {
      console.warn("Must set the user id before using Firebase Service V2");
    }
  }

  saveProject(ownerId: string, project: Project, isCurrentProject: boolean = true) {
    this.verifyUserId();
    //let name = project.projectName;

    /* OLD
    this.db
      .collection("projects")
      .doc(project.projectId)
      .set({
        userId: ownerId,
        editors: project.editors,
        data: JSON.stringify(project)
      });
    */

    // NEW
    if (project.isEmptyProject()) return;

    project.ownerId = ownerId;
    let plainJSProject = JSON.parse(JSON.stringify(project));
    this.db.collection('projects2').doc<Project>(project.projectId).set(plainJSProject);

    if(isCurrentProject) {
      this.saveLastProject(project.projectId);
    }
  }

  saveLastProject(projectId: string) {
    if (!projectId) return;

    return this.db
    .collection("last-projects")
    .doc(this.userId)
    .set({
      projectId: projectId,
      //projectName: project.projectName,
      userId: this.userId
    });
  }

  saveLanguagePreference(language: string) {
    var doc = this.db.collection('preferences').doc(this.userId);
    doc.set({
      language: language,
      userId: this.userId
    }, { merge: true });
  }

  getLanguagePreference() {
    var doc = this.db.collection('preferences').doc(this.userId);
    return doc.get();
  }

  getLastProject(userId: string = undefined) {
    if (!(userId || this.userId)) {
      this.verifyUserId();
      return of(null);
    }
    return this.db.collection('last-projects').doc(userId || this.userId).get();
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

  getProjectsOfUser(getArchived: boolean = false, userId = undefined): Observable<Project[]> {
    //console.log('getting projects of user: ', this.afAuth.auth.currentUser)

    // let collection = getArchived ?
    //   this.db.collection<Project>("projects2") :
    //   this.db.collection<Project>("projects2", ref => ref.where('archived', '==', getArchived));

    if (!(this.userId || userId)) return of([]);


    let collection = this.db.collection<Project>("projects2", ref => ref.where('ownerId', '==', userId || this.userId));

    let result = collection.valueChanges().pipe(map(projects => {
      let ps = projects.filter(p => getArchived || !p.archived);
      return ps;
    }));


    return result;

    /*
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
    */
  }

  getProjectsUserCanEdit(email: string): Observable<Project[]> {
    //console.log("getting all projects that " + email + " can edit");
    this.userEmail = email;
    if (!email) {
      return from([]);
    }

    /*
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
    */

    return this.projects$.pipe(map(projectsArray => {
      return projectsArray.filter(project => {
        project.editors.some(editorEmail => editorEmail === email)
      })
    }))
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

    /*
    this.allProjectIds.forEach(id => {
      let unsubscribe = this.db
        .collection("projects")
        .doc(id)
        .onSnapshot(doc => {
          subscriber(doc);
        });

      this.auth.registerSnapshot(unsubscribe);

    });
    */

    this.projects$.subscribe(subscriber);
  }

  getProject(projectId: string) {
    return this.db
      .collection("projects2")
      .doc(projectId)
      .get();
  }

  deleteProject(projectId: string) {
    return this.db
      .collection("projects2")
      .doc(projectId)
      .delete();
  }

  archiveProject(project: Project, archive: boolean) {
    project.archived = archive;
    this.saveProject(project.ownerId, project, false);
    this.db
      .collection("projects2")
      .doc(project.projectId)
      .update({archived: archive});
  }

  addEditorToProject(projectId: string, editorEmail: string) {
    let project: Observable<Project>;
    project = this.db.doc<Project>('projects2/'+projectId).valueChanges();

    project.subscribe(p => {
      if(!p.editors.includes(editorEmail)) {
        let editors = [
          editorEmail,
          ...p.editors
        ]
        return this.db.doc<Project>('projects2/'+projectId).update({
          editors
        })
      }
    });

    /*
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
      */
  }

  removeEditorFromProject(projectId: string, editorEmail: string) {

    /*
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
      */

     let project: Observable<Project>;
     project = this.db.doc<Project>('projects2/'+projectId).valueChanges();

     project.subscribe(p => {
       if(p.editors.includes(editorEmail)) {

        let editors = p.editors.filter(editor => editor !== editorEmail);
         return this.db.doc<Project>('projects2/'+projectId).update({
           editors
         })
       }
     });
  }

  uploadFile(file: File, project: Project, collection: string) {
    let id = uuid();
    let ref = this.storage.ref(`users/${this.userId}/projects/${project.projectId}/${collection}/${id}.${file.name}`);
    return ref.put(file);

  }

  deleteFile(fullPath: string) {
    return this.storage.ref(fullPath).delete();
  }



  // getUsers(projectId: string) {}

  // getExpenses(projectId: string) {}

  // getPayments(projectId: string) {}
}
