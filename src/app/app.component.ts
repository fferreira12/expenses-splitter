import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as firebase from "firebase";
import { AuthService } from "./services/auth.service";
import { SplitterService } from './services/splitter.service';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "expense-splitter-frontend";

  constructor(
    private authService: AuthService,
    private translate: TranslateService
  ) {
    translate.setDefaultLang("en");
    // firebase.initializeApp({
    //   apiKey: "AIzaSyCd_YNHAiC18p5OXcXTMBRdUjXkdmww3jk",
    //   authDomain: "expenses-splitter.firebaseapp.com",
    //   databaseURL: "https://expenses-splitter.firebaseio.com",
    //   projectId: "expenses-splitter",
    //   storageBucket: "expenses-splitter.appspot.com",
    //   messagingSenderId: "774324107394",
    //   appId: "1:774324107394:web:0dc06aa30af836d5"
    // });
    //firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    //this.authService.init();
  }

  ngOnInit() {
    
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}
