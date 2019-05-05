import { Component, OnInit } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { Expense } from 'src/app/models/expense.model';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent implements OnInit {

  expenses: Expense[] = [];

  constructor(
    private splitterService: SplitterService
  ) { }

  ngOnInit() {
    this.expenses = this.splitterService.getExpenses();
    this.splitterService.subscribeToExpenses(expenses => {
      this.expenses = expenses;
    })
  }

  onRemoveExpense(expense: Expense) {
    this.splitterService.removeExpense(expense);
  }

}
