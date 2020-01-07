import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { Expense } from "src/app/models/expense.model";
import { User } from "src/app/models/user.model";
import { Project } from "src/app/models/project.model";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: "app-expense-list",
  templateUrl: "./expense-list.component.html",
  styleUrls: ["./expense-list.component.css"]
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[];

  currentProject: Project;

  @Output() editExpense = new EventEmitter<Expense>();

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.expenses = this.splitterService.getExpenses();
    this.currentProject = this.splitterService.currentProject;
    this.splitterService.subscribeToExpenses(expenses => {
      this.currentProject = this.splitterService.currentProject;
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
    return Expense.createExpense(expense).isPayer(user);
  }

  getAmountPaid(expense: Expense, user: User) {
    return Expense.createExpense(expense).getAmountPaid(user);
  }

  onFilesAdded(expense: Expense, event) {
    let file = event.target.files[0];
    this.splitterService.addFileToExpense(file, expense);
  }

  onDeleteFile(expense: Expense) {
    let url = expense.fileUrl;
    this.splitterService.deleteFileFromExpense(expense);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.expenses, event.previousIndex, event.currentIndex);
    this.splitterService.setExpenseOrder(event.item.data as Expense, event.currentIndex)
  }
}
