import { Component, OnInit } from '@angular/core';

import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'expense-splitter-frontend';

  ngOnInit() {
    firebase.initializeApp({
      apiKey: "AIzaSyCd_YNHAiC18p5OXcXTMBRdUjXkdmww3jk",
      authDomain: "expenses-splitter.firebaseapp.com",
      databaseURL: "https://expenses-splitter.firebaseio.com",
      projectId: "expenses-splitter",
      storageBucket: "expenses-splitter.appspot.com",
      messagingSenderId: "774324107394"
    });
  }
}
