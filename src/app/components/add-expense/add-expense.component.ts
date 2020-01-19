import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, FormArray } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as firebase from "firebase";

import { SplitterService } from "src/app/services/splitter.service";
import { User } from "src/app/models/user.model";
import { Expense } from "src/app/models/expense.model";
import { OcrService } from "src/app/services/ocr.service";
import { Observable } from 'rxjs';

@Component({
  selector: "app-add-expense",
  templateUrl: "./add-expense.component.html",
  styleUrls: ["./add-expense.component.css"]
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  users: User[] = [];
  users$: Observable<User[]>;
  singlePayer: boolean = true;

  editing: boolean = false;
  _editingExpense: Expense = null;
  oldExpense: Expense = null;

  expenseFile: File = null;
  percentUploaded: number = 0.0;

  @Input() set editingExpense(expense: Expense) {
    if (!expense) {
      return;
    }
    this.editing = true;
    this.oldExpense = Object.freeze(expense);
    this._editingExpense = expense;
    this.updateForm();
    window.scroll(0, 0);
  }

  constructor(
    private splitterService: SplitterService,
    private formBuilder: FormBuilder,
    private ocr: OcrService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.startForm();
    this.users$ = this.splitterService.getUsers$()
    this.users$.subscribe(users => {
      this.users = users;
      this.startForm();
    });
  }

  startForm() {
    this.expenseForm = new FormGroup({
      expenseName: new FormControl(null),
      users: new FormArray([]),
      value: new FormControl(null),
      payer: new FormControl(null),
      payers: new FormArray([])
    });
    this.addCheckboxes();
  }

  getTitle() {
    return this._editingExpense ? "EditExpense" : "AddExpense";
  }

  userIsParticipating(user: User) {
    if (!this._editingExpense) {
      return true;
    }
    return this._editingExpense.users.some(u => {
      return u.id == user.id;
    });
  }

  getPayer() {
    if (this._editingExpense && this.singlePayer) {
      return this._editingExpense.payers[0].payer;
    }
  }

  updateForm() {
    //debugger;
    if (!this._editingExpense) return;
    let onePayer = this._editingExpense.payers.length == 1;
    this.singlePayer = onePayer;
    let amountsPayed = this._editingExpense.payers.map(payer => payer.amount);
    this.expenseForm.reset();
    this.expenseForm.patchValue({
      expenseName: this._editingExpense.name,
      users: this._editingExpense.users,
      value: this._editingExpense.value,
      payer: onePayer ? this._editingExpense.payers[0].payer.id : null,
      payers: !onePayer ? amountsPayed : []
    });
    this.updateCheckboxes();
  }

  onAddExpense(event) {
    event.preventDefault();
    let e = this.getNewExpenseFromForm();
    //console.log("expense created", e);
    if (this._editingExpense) {
      this.editExpense();
    } else {
      let success = this.splitterService.addExpense(e);

      if (success && this.expenseFile) {
        let task = this.splitterService.addFileToExpense(this.expenseFile, e);

        task.snapshotChanges().subscribe(task => {
          console.log("got task", task);
          this.percentUploaded = Math.floor(
            (100 * task.bytesTransferred) / task.totalBytes
          );
        });

        //TODO: refactor: expense list has same code
        task.then(task => {
          if (task.state === firebase.storage.TaskState.SUCCESS) {
            task.ref.getDownloadURL().then(url => {
              let newExpense = new Expense(e.name, e.value);
              Object.assign(newExpense, e);
              newExpense.fileUrl = url;
              newExpense.filePath = task.ref.fullPath;
              newExpense.order = e.order;
              console.log("saving expense", e);
              let success = this.splitterService.editExpense(e, newExpense);
              if (success) {
                this.openSnackBar("Upload Complete");
              }
              this.percentUploaded = 0;
              this.expenseFile = null;
              this.splitterService.finishLoading();
            });
          }
        });
      }
    }
  }

  editExpense() {
    let newExpense = this.getNewExpenseFromForm();

    let edited = this.splitterService.editExpense(this.oldExpense, newExpense);
    if (edited) {
      this.onCancelEdit();
    }
  }

  getNewExpenseFromForm(): Expense {
    let expenseName = this.expenseForm.controls.expenseName.value;
    let payerId = this.expenseForm.controls.payer.value;
    let usersIds = (this.expenseForm.controls.users as FormArray).controls
      .map(formControl => {
        return (formControl as FormControl).value;
      })
      .map((playerIsParticipating, i) => {
        if (playerIsParticipating) {
          return this.users[i].id;
        }
      });
    let value = this.expenseForm.controls.value.value;

    let expense = new Expense(expenseName, value);

    if (this._editingExpense) {
      expense.order = this._editingExpense.order;
    }

    let filteredUsers = this.users.filter(user => {
      let isIn = usersIds.includes(user.id);
      return isIn;
    });

    filteredUsers.forEach(user => {
      expense.addUser(user);
    });

    let payer;
    if (this.singlePayer) {
      payer = this.users.find(user => {
        return user.id === payerId;
      });
      expense.setPayer(payer);
    } else {
      let payers = [];
      let total = 0;
      this.users.forEach((u, i) => {
        let val = (this.expenseForm.controls.payers as FormArray).controls[i]
          .value;
        if (val > 0) {
          payers.push({ payer: u, amount: val });
          total += val;
        }
      });
      expense.value = total;
      expense.setPayers(payers);
    }

    return expense;
  }

  addCheckboxes() {
    this.users.map((o, i) => {
      const control = new FormControl(this.userIsParticipating(o));
      const valueControl = new FormControl(0);
      (this.expenseForm.controls.users as FormArray).push(control);
      (this.expenseForm.controls.payers as FormArray).push(valueControl);
    });
  }

  updateCheckboxes() {
    (this.expenseForm.controls.users as FormArray).reset();
    (this.expenseForm.controls.users as FormArray).controls.forEach(
      (control, i) => {
        control.setValue(this.userIsParticipating(this.users[i]));
      }
    );
  }

  checkCheckBoxvalue(event) {
    //this.updateCheckboxes();
  }

  onSinglePlayerCheck(event) {
    //console.log(event);

    this.singlePayer = !event.target.checked;
  }

  onCancelEdit() {
    this._editingExpense = null;
    this.oldExpense = null;
    this.singlePayer = true;
    this.editing = false;
    this.startForm();
  }

  resetForm() {
    this.expenseForm.reset();
    (this.expenseForm.controls.users as FormArray).controls.forEach(control => {
      control.setValue(true);
    });
  }

  onFilesAdded(event) {
    this.expenseFile = event.target.files[0];
    this.ocr.recognizeText(this.expenseFile).subscribe(text => {
      let valuePattern = /R? ?\$ ?([\d]+[.,][\d]+)\w+/;
      let valueMatches = text.match(valuePattern);
      let lastValueMatch = parseFloat(
        valueMatches[valueMatches.length - 1].replace(",", ".")
      );

      let actualValue = this.expenseForm.controls["value"].value;
      let actualName = this.expenseForm.controls["expenseName"].value;

      if (lastValueMatch && !this.editingExpense && !actualValue) {
        this.expenseForm.controls["value"].setValue(lastValueMatch);
      }

      if (!this.editingExpense && !actualName) {
        let firstLine = text.split("\n")[0];
        this.expenseForm.controls["expenseName"].setValue(firstLine);
      }

      console.log(lastValueMatch);
    });
  }

  onRemoveFile() {
    this.expenseFile = null;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "Close", {
      duration: 4000
    });
  }
}
