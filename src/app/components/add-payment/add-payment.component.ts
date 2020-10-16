import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, FormArray } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { Payment } from "src/app/models/payment.model";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { selectCurrentProject } from 'src/app/state/app.selectors';
import { map } from 'rxjs/operators';
import { addPayment } from 'src/app/state/app.actions';

@Component({
  selector: "app-add-payment",
  templateUrl: "./add-payment.component.html",
  styleUrls: ["./add-payment.component.css"]
})
export class AddPaymentComponent implements OnInit {
  users: User[] = [];
  users$: Observable<User[]>;
  paymentForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<{projects: AppState}>
  ) {}

  ngOnInit() {
    this.paymentForm = new FormGroup({
      payer: new FormControl(null),
      receiver: new FormControl(null),
      value: new FormControl(null)
    });
    //this.users$ = this.splitterService.getUsers$();
    this.users$ = this.store.select(selectCurrentProject).pipe(map(curr => curr.users));
    this.users$.subscribe(users => {
      this.users = users;
    });
  }

  onAddPayment() {
    //console.log('on add payment');
    let payer = this.users.find(
      user => user.id == this.paymentForm.controls.payer.value
    );
    let receiver = this.users.find(
      user => user.id == this.paymentForm.controls.receiver.value
    );
    let value = this.paymentForm.controls.value.value;
    let payment = new Payment(payer, receiver, value);
    this.store.dispatch(addPayment({ payment }));
  }
}
