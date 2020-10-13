import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Expense } from "src/app/models/expense.model";
import { User } from "src/app/models/user.model";
import { Project } from "src/app/models/project.model";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from "firebase";
import { Observable, Subject } from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import { Store } from '@ngrx/store';
import { selectCurrentProject, selectExpenses } from 'src/app/state/app.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, tap } from 'rxjs/operators';
import { fileUploadProgressToExpense, fileUploadToExpenseSuccess, removeExpense, startRemoveFileFromExpense, startFileUploadToExpense, orderExpenses } from 'src/app/state/app.actions';

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

  expenseFile: File = null;
  destroyed$ = new Subject<boolean>();

  constructor(
    private store: Store<{projects: AppState}>,
    private _snackBar: MatSnackBar,
    private actions$: Actions
  ) {

   }

  ngOnInit() {
    this.expenses$ = this.store.select(selectExpenses);
    this.store.select(selectCurrentProject).subscribe(p => this.currentProject = p);
    this.expenses$.subscribe(expenses => {
      this.expenses = expenses;
    });

    this.actions$.pipe(
      ofType(fileUploadProgressToExpense),
      tap((status) => {
        this.percentUploaded = Math.floor(status.percent);
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(fileUploadToExpenseSuccess),
      tap((status) => {
        this.openSnackBar("Upload Complete");
        this.percentUploaded = 0;
        this.expenseFile = null;
      })
    ).subscribe();
  }

  onRemoveExpense(expense: Expense) {
    this.store.dispatch(removeExpense({ expense }));
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

    this.expenseFile = event.target.files[0];

    this.store.dispatch(startFileUploadToExpense({expense: expense, file: this.expenseFile}))

  }

  onDeleteFile(expense: Expense) {
    this.store.dispatch(startRemoveFileFromExpense({ expense }));
    this.openSnackBar('File Deleted');
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.expenses, event.previousIndex, event.currentIndex);
    this.store.dispatch(orderExpenses({ expenses: this.expenses }));
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 4000,
    });
  }
}
