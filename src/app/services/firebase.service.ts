import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

import * as firebase from "firebase";

@Injectable({
  providedIn: "root"
})
export class FirebaseService {
  userId: string;
  db: firebase.firestore.Firestore;

  constructor(private authService: AuthService) {
    this.userId = this.authService.getUserId();
    this.authService.subscribeToUserId(userId => {
      this.userId = userId;
    });
    this.db = firebase.firestore();
  }

  save(key: string, data: any) {
    if (this.userId == "") {
      this.userId = this.authService.getUserId();
    }
    let docRef = this.db.collection("user-data").doc(this.userId);
    return docRef.get().then(docSnapshot => {
      if (docSnapshot.exists) {
        return this.db
          .collection("user-data")
          .doc(this.userId)
          .update({
            [key]: JSON.stringify(data)
          });
      } else {
        return this.db
          .collection("user-data")
          .doc(this.userId)
          .set({
            [key]: JSON.stringify(data)
          });
      }
    });
  }

  delete(key: string) {
    if (this.userId == "") {
      this.userId = this.authService.getUserId();
    }
    let docRef = this.db.collection("user-data").doc(this.userId);
    return docRef.get().then(docSnapshot => {
      if (docSnapshot.exists) {
        return this.db
          .collection("user-data")
          .doc(this.userId)
          .update({
            [key]: firebase.firestore.FieldValue.delete()
          });
      }
    });
  }

  get() {
    if (this.userId == "") {
      this.userId = this.authService.getUserId();
    }
    if (this.userId != "") {
      return this.db
        .collection("user-data")
        .doc(this.userId)
        .get();
    } else {
      return Promise.resolve(null);
    }
  }

  subscribeToChanges(subscriber) {
    let sub = this.db
      .collection("user-data")
      .doc(this.userId)
      .onSnapshot(subscriber);

      this.authService.registerSnapshot(sub);
  }
}
