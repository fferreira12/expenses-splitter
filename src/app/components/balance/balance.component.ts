import { Component, OnInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { Expense } from "src/app/models/expense.model";
import { User } from "src/app/models/user.model";

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
  balances: any;

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.users = this.splitterService.getUsers();
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
      this.updateValuesSharesAndBalance();
    });
  }

  updateValuesSharesAndBalance() {
    this.paidValues = this.splitterService.getPaidValues();
    this.fairShares = this.splitterService.getFairShares();
    this.balances = this.splitterService.getBalances();
  }

  getPaymentsMade(user: User) {
    return this.splitterService.getPaymentsMade(user);
  }

  getPaymentsReceived(user: User) {
    return this.splitterService.getPaymentsReceived(user);
  }
}
