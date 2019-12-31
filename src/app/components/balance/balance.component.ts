import { Component, OnInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { Expense } from "src/app/models/expense.model";
import { User } from "src/app/models/user.model";
import { SimpleCalculator } from "src/app/util/payment-calculator";
import { Payment } from 'src/app/models/payment.model';
import { WeightedCalculator } from 'src/app/util/weighted-calculator';

@Component({
  selector: "app-balance",
  templateUrl: "./balance.component.html",
  styleUrls: ["./balance.component.css"]
})
export class BalanceComponent implements OnInit {
  users: User[];
  expenses: Expense[];
  paidValues: any;
  fairShares: any;
  balances: any = {};
  calculator: WeightedCalculator;
  suggestedPayments: { payer: User; receiver: User; amount: number }[];

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.calculator = new WeightedCalculator();

    this.users = this.splitterService.getUsers();
    this.calculator.setAllUsers(this.users);
    this.expenses = this.splitterService.getExpenses();

    this.updateValuesSharesAndBalance();

    this.splitterService.subscribeToExpenses(expenses => {
      this.expenses = expenses;

      this.updateValuesSharesAndBalance();
    });

    this.splitterService.subscribeToPayments(payments => {
      this.updateValuesSharesAndBalance();
    });

    this.splitterService.subscribeToUsers(users => {
      this.users = users;
      this.calculator.setAllUsers(this.users);
      this.updateValuesSharesAndBalance();
    });

    this.calculator.setFairShares(this.splitterService.getFairShares());
    this.splitterService.subscribeToWeights(weights => {
      this.fairShares = this.splitterService.getFairShares();
      this.calculator.setFairShares(this.fairShares);
    })
  }

  updateValuesSharesAndBalance() {
    this.paidValues = this.splitterService.getPaidValues();
    this.fairShares = this.splitterService.getFairShares();
    this.balances = this.splitterService.getBalances();
    this.calculator.setFairShares(this.fairShares);
    this.suggestedPayments = this.calculator.calculate(this.balances);
    //console.log(this.suggestedPayments);
  }

  getPaymentsMade(user: User) {
    return this.splitterService.getPaymentsMade(user);
  }

  getPaymentsReceived(user: User) {
    return this.splitterService.getPaymentsReceived(user);
  }

  onAddToPayments(p: any) {
    let payer = new User(p.payer.name, p.payer.id);
    let receiver = new User(p.receiver.name, p.receiver.id);
    let value = p.amount;
    let pay = new Payment(payer, receiver, value);
    this.splitterService.addPayment(pay);
  }
}
