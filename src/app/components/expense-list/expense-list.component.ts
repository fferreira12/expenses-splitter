import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { Expense } from "src/app/models/expense.model";
import { User } from "src/app/models/user.model";
import { Project } from "src/app/models/project.model";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from "firebase";
import { Observable } from 'rxjs';

@Component({
  selector: "app-expense-list",
  templateUrl: "./expense-list.component.html",
  styleUrls: ["./expense-list.component.css"]
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[];
  expenses$: Observable<Expense[]>;

  currentProject: Project;

  percentUploaded: number = 0.0;
  expenseUploading: Expense;

  @Output() editExpense = new EventEmitter<Expense>();

  constructor(private splitterService: SplitterService, private _snackBar: MatSnackBar) {}

  ngOnInit() {
    this.expenses$ = this.splitterService.getExpenses$();
    this.currentProject = this.splitterService.currentProject;
    this.expenses$.subscribe(expenses => {
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
    this.expenseUploading = expense;

    let file = event.target.files[0];
    let promise = this.splitterService.addFileToExpense(file, expense);

    promise.snapshotChanges().subscribe(task => {
      console.log("got task", task);
      this.percentUploaded = Math.floor((100 * task.bytesTransferred) / task.totalBytes);
    });

    //TODO: refactor: add expense has same code
    promise.then(task => {
      if (task.state === firebase.storage.TaskState.SUCCESS) {
        task.ref.getDownloadURL().then(url => {
          let newExpense = new Expense(expense.name, expense.value);
          Object.assign(newExpense, expense);
          newExpense.fileUrl = url;
          newExpense.filePath = task.ref.fullPath;
          newExpense.order = expense.order;
          console.log("saving expense",  expense);
          let success = this.splitterService.editExpense(expense, newExpense);
          if(success) {
            this.openSnackBar('Upload Complete');
          }
          this.splitterService.finishLoading();
        });
      }
    });
  }

  onDeleteFile(expense: Expense) {
    let url = expense.fileUrl;
    this.splitterService.deleteFileFromExpense(expense);
    this.openSnackBar('File Deleted');
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.expenses, event.previousIndex, event.currentIndex);
    this.expenses.forEach((exp, i) => {
      this.splitterService.setExpenseOrder(exp, i);
    });
    
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 4000,
    });
  }
}
