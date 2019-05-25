import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";

import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  error = null;
  loading: boolean = false;
  //passwordsMatch: boolean;

  ngOnInit() {}

  onSignup(form: NgForm) {
    this.loading = true;
    const email = form.value.email;
    const password = form.value.password;
    const password2 = form.value.password2;

    if (password !== password2) {
      this.error = new Error("Passwords must match");
      this.loading = false;
      return;
    }

    this.authService.signupUser(email, password).then(data => {
      this.loading = false;
      if (data) {
        this.router.navigate(["/signin"]);
      } else {
        this.error = {
          message: "Could not create account"
        };
      }
    });
  }
}
