import { Component, OnInit, Output, EventEmitter } from "@angular/core";
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

  @Output() editExpense = new EventEmitter<Expense>();

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

  onEditExpense(expense: Expense) {
    this.editExpense.emit(expense);
  }

  checkIsPayer(expense: Expense, user: User) {
    return (Expense.createExpense(expense)).isPayer(user);
  }

  getAmountPaid(expense: Expense, user: User) {
    return (Expense.createExpense(expense)).getAmountPaid(user);
  }

}
