import { Component, OnInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { Expense } from "src/app/models/expense.model";
import { User } from "src/app/models/user.model";

@Component({
  selector: "app-expense-list",
  templateUrl: "./expense-list.component.html",
  styleUrls: ["./expense-list.component.css"]
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[];

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.expenses = this.splitterService.getExpenses();
    this.splitterService.subscribeToExpenses(expenses => {
      this.expenses = expenses;
    });
  }

  onRemoveExpense(expense: Expense) {
    this.splitterService.removeExpense(expense);
  }

  checkIsPayer(expense: Expense, user: User) {
    //FIX: should use method isPayer of expense class, but was 'not existing' (maybe after parsed method does not exist)
    return expense.payers.some(p => {
      return p.payer.id == user.id;
    });
  }
}
