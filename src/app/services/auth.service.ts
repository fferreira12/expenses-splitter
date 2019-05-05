import * as firebase from 'firebase';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  token: string;
  userId: string;
  userIdObservable: BehaviorSubject<string>;

  constructor() { 
    this.userIdObservable = new BehaviorSubject('');
  }

  signupUser(email: string, password: string) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .catch(
        error => console.log(error)
      )
  }

  signinUser(email: string, password: string) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(
      result => {
        this.userId = result.user.uid;
        this.userIdObservable.next(this.userId);
        return result.user.getIdToken();
      }
    )
    .then(token => {
      this.token = token;
      //console.log('token was sucessfully saved:\n' + this.token);
    })
    .catch(
      error => console.log(error)
    )
  }

  subscribeToUserId(subscriber) {
    this.userIdObservable.subscribe(subscriber);
  }

  logout() {
    firebase.auth().signOut();
    this.userId = "";
    this.userIdObservable.next(this.userId);
    this.token = null;
  }

  getToken() {
    firebase.auth().currentUser.getIdToken()
      .then(
        (token: string) => this.token = token
      );
    return this.token;
  }

  getUserId() {
    return firebase.auth().currentUser ? firebase.auth().currentUser.uid : "";
  }

  isAuthenticated() {
    return this.token != null;
  }

}
