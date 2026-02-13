import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { Injectable } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { LocalstorageService } from "./localstorage.service";
import { Router } from '@angular/router';

@Injectable({
  providedIn: "root"
})
export class AuthService {
  token: string;
  userId: string;
  userIdObservable: BehaviorSubject<string>;
  userObservable: BehaviorSubject<firebase.User> = new BehaviorSubject(null);
  currentUser: firebase.User;
  userEmail: string = null;
  userEmailObservable: BehaviorSubject<string> = new BehaviorSubject(null);

  subscriptionsToCancelOnLogout: Subscription[] = [];
  snapshotsToCancelOnLogout: (()=>void)[] = [];

  constructor(private localStorage: LocalstorageService, public afAuth: AngularFireAuth, private router: Router) {

    this.userIdObservable = new BehaviorSubject("");
    //this.userObservable = new BehaviorSubject(null);
    this.init();
  }

  init() {
    if (this.localStorage.get("user-id") != null) {
      this.userId = this.localStorage.get("user-id");
    }
    if (this.localStorage.get("user-token") != null) {
      this.token = this.localStorage.get("user-token");
      //firebase.auth().signInWithCustomToken(this.token);
    }

    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)

    this.afAuth.onAuthStateChanged(user => {
      if (user) {
        //console.log("signed in");
        //console.log(user);
        this.userId = user.uid;
        this.currentUser = user;
        this.userEmail = this.currentUser.email;
        //console.log("calling user observable");
        this.userObservable.next(this.currentUser);
        this.userIdObservable.next(this.userId);
        this.userEmailObservable.next(this.userEmail);
        user.getIdToken(false).then(token => {
          this.token = token;
        });
      } else {
        //console.log("not signed in");
      }
    });
  }

  getUser$() {
    return this.userObservable.asObservable();
  }

  subscribeToUser(subscriber) {
    let sub = this.userObservable.subscribe(subscriber);
    this.registerSubscription(sub);
  }

  subscribeToUserEmail(subscriber) {
    let sub = this.userEmailObservable.subscribe(subscriber);
    this.registerSubscription(sub);
  }

  signupUser(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .catch(error => console.log(error));
  }

  signinUser(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then(result => {
        return this.onSucessLogin(result);
      })
      .then(token => {
        this.token = token;
        this.localStorage.save("user-token", this.token);
        //console.log('token was sucessfully saved:\n' + this.token);
      })
      .catch(error => console.log(error));
  }

  googleSignin() {
    var provider = new firebase.auth.GoogleAuthProvider()
    return this.afAuth.signInWithPopup(provider).then((result) => {
      return this.onSucessLogin(result);

    })
    .then(token => {
      this.token = token;
      this.localStorage.save("user-token", this.token);
      return this.currentUser;
      //console.log('token was sucessfully saved:\n' + this.token);
    })
    .catch(error => console.log(error));
  }

  onSucessLogin(result: firebase.auth.UserCredential) {
    this.currentUser = result.user;
    this.userId = result.user.uid;
    this.localStorage.save("user-id", this.userId);
    this.userIdObservable.next(this.userId);
    return result.user.getIdToken();
  }

  subscribeToUserId(subscriber) {
    let sub = this.userIdObservable.subscribe(subscriber);
    this.registerSubscription(sub);
  }

  logout() {
    this.userId = "";
    this.userIdObservable.next(this.userId);
    this.token = null;
    this.localStorage.save("user-id", null);
    this.localStorage.save("user-token", null);
    this.cancelAllSubscriptionsAndSnapshots();
    this.afAuth.signOut().then(() => {
      this.router.navigate(['signin']);
    });

  }

  getToken() {
    this.afAuth.currentUser
      .then(user => user?.getIdToken())
      .then((token: string) => (this.token = token));
    return this.token;
  }

  getUserId() {
    if (this.userId !== null && this.userId !== null) {
      return this.userId;
    }
    // currentUser is a Promise in compat mode, but we have userId cached
    return this.userId || "";
  }

  isAuthenticated() {
    return this.token != null;
  }

  registerSubscription(subscription: Subscription) {
    if(!this.subscriptionsToCancelOnLogout.includes(subscription)) {
      this.subscriptionsToCancelOnLogout.push(subscription);
    }
  }

  registerSnapshot(func: ()=>void) {
    if(!this.snapshotsToCancelOnLogout.includes(func)) {
      this.snapshotsToCancelOnLogout.push(func);
    }
  }

  cancelAllSubscriptionsAndSnapshots() {

    this.subscriptionsToCancelOnLogout.forEach(sub => {
      sub.unsubscribe();
    });

    this.snapshotsToCancelOnLogout.forEach(func => func());

  }
}
