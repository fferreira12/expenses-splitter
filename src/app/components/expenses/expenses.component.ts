import { Component, OnInit } from '@angular/core';
import { Expense } from 'src/app/models/expense.model';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {

  editingExpense: Expense;

  constructor() { }

  ngOnInit() {
  }

  onEditExpense(expense: Expense) {
    this.editingExpense = null;
    this.editingExpense = expense;
  }

}
