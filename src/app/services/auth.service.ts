import * as firebase from 'firebase';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  token: string;
  userId: string;
  userIdObservable: BehaviorSubject<string>;

  constructor(private localStorage: LocalstorageService) { 
    this.userIdObservable = new BehaviorSubject('');
    
  }

  init(){
    if(this.localStorage.get('user-id') != null) {
      this.userId = this.localStorage.get('user-id');
    }
    if(this.localStorage.get('user-token') != null) {
      this.token = this.localStorage.get('user-token')
      //firebase.auth().signInWithCustomToken(this.token);
    }
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        //console.log('signed in');
        //console.log(user);
        this.userId = user.uid;
        user.getIdToken(false).then(token => {
          this.token = token;
        })
      } else {
        //console.log('not signed in');
      }
    });
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
        this.localStorage.save("user-id", this.userId);
        this.userIdObservable.next(this.userId);
        return result.user.getIdToken();
      }
    )
    .then(token => {
      this.token = token;
      this.localStorage.save("user-token", this.token);
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
    this.userId = "";
    this.userIdObservable.next(this.userId);
    this.token = null;
    this.localStorage.save("user-id", null);
    this.localStorage.save("user-token", null);
    firebase.auth().signOut();
  }

  getToken() {
    firebase.auth().currentUser.getIdToken()
      .then(
        (token: string) => this.token = token
      );
    return this.token;
  }

  getUserId() {
    if(this.userId !== null && this.userId !== null) {
      return this.userId;
    }
    return firebase.auth().currentUser ? firebase.auth().currentUser.uid : "";
  }

  isAuthenticated() {
    return this.token != null;
  }

}
