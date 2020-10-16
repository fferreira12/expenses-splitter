import { Component, OnInit } from "@angular/core";
import { Expense } from "src/app/models/expense.model";
import { User } from "src/app/models/user.model";
import { SimpleCalculator } from "src/app/util/payment-calculator";
import { Payment } from 'src/app/models/payment.model';
import { WeightedCalculator } from 'src/app/util/weighted-calculator';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import { Store } from '@ngrx/store';
import { selectCurrentProject, selectExpenses, selectFairShares, selectPayments, selectPaymentsMade, selectPaymentsReceived, selectWeights, selectWeightsForUser } from 'src/app/state/app.selectors';
import { map } from 'rxjs/operators';
import { addPayment } from 'src/app/state/app.actions';

@Component({
  selector: "app-balance",
  templateUrl: "./balance.component.html",
  styleUrls: ["./balance.component.css"]
})
export class BalanceComponent implements OnInit {
  users: User[] = [];
  users$: Observable<User[]>;
  expenses: Expense[];
  expenses$: Observable<Expense[]>;
  paidValues: any;
  fairShares: any;
  balances: any = {};
  calculator: WeightedCalculator;
  suggestedPayments: { payer: User; receiver: User; amount: number }[];

  constructor(private store: Store<{projects: AppState}>) {}

  ngOnInit() {
    this.calculator = new WeightedCalculator();

    this.calculator.setAllUsers(this.users);
    // this.fairShares = this.splitterService.getFairShares();
    this.store.select(selectFairShares).subscribe(fairShares => this.fairShares = fairShares)
    this.calculator.setFairShares(this.fairShares);

    this.expenses$ = this.store.select(selectExpenses);
    this.expenses$.subscribe(expenses => {
      this.expenses = expenses;
      this.updateValuesSharesAndBalance();
    });


    this.store.select(selectPayments).subscribe(payments => this.updateValuesSharesAndBalance());

    this.users$ = this.store.select(selectCurrentProject).pipe(map(curr => curr.users));
    this.users$.subscribe(users => {
      this.users = users;
      this.calculator.setAllUsers(this.users);
      this.updateValuesSharesAndBalance();
    });

    this.store.select(selectWeights).subscribe(weights => {
      this.calculator.setFairShares(this.fairShares);
      this.updateValuesSharesAndBalance();
    });

    this.store.select(selectCurrentProject).subscribe(currentProject => {
      this.paidValues = currentProject.getPaidValues();
      this.fairShares = currentProject.getFairShares();
      this.balances = currentProject.getBalances();
      this.updateValuesSharesAndBalance()
    })

  }

  updateValuesSharesAndBalance() {
    if(this.balances) {
      this.calculator.setFairShares(this.fairShares);
      this.suggestedPayments = this.calculator.calculate(this.balances);
    }
  }

  getPaymentsMade(user: User) {
    return this.store.select(selectPaymentsMade, user);
  }

  getPaymentsReceived(user: User) {
    return this.store.select(selectPaymentsReceived, user);
  }

  onAddToPayments(p: any) {
    let payer = new User(p.payer.name, p.payer.id);
    let receiver = new User(p.receiver.name, p.receiver.id);
    let value = p.amount;
    let pay = new Payment(payer, receiver, value);
    this.store.dispatch(addPayment({payment: pay}))
  }
}
