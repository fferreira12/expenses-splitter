import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, FormArray } from "@angular/forms";
import { SplitterService } from "src/app/services/splitter.service";
import { User } from "src/app/models/user.model";
import { Payment } from "src/app/models/payment.model";
import { Observable } from 'rxjs';

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
    private splitterService: SplitterService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.paymentForm = new FormGroup({
      payer: new FormControl(null),
      receiver: new FormControl(null),
      value: new FormControl(null)
    });
    this.users$ = this.splitterService.getUsers$();
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
    this.splitterService.addPayment(payment);
  }
}
