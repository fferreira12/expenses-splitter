import { Component, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  loading:boolean = false;

  constructor(private authService: AuthService, private router: Router, private ngZone: NgZone) { }

  ngOnInit() {
  }

  onSignin(form: NgForm) {
    this.loading = true;
    this.authService.signinUser(form.value.email, form.value.password)
    .then(data => {
      this.loading = false;
      this.router.navigate(['/home'])
    });
  }

  onGoogleSignin() {
    this.loading = true;
    this.authService.googleSignin()
    .then(data => {
      this.loading = false;
    });
    this.authService.subscribeToUserId(userId => {
      this.ngZone.run(() => {
        this.router.navigate(['/home']);
      })
    })
  }

}
