import { Component, OnInit, Input } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { FormGroup, FormControl, FormBuilder, FormArray } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { Expense } from "src/app/models/expense.model";

@Component({
  selector: "app-add-expense",
  templateUrl: "./add-expense.component.html",
  styleUrls: ["./add-expense.component.css"]
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  users: User[];
  singlePayer: boolean = true;

  editing: boolean = false;
  _editingExpense: Expense = null;
  oldExpense: Expense = null;

  @Input() set editingExpense(expense: Expense) {
    if(!expense) {
      return;
    }
    this.editing = true;
    this.oldExpense = Object.freeze(expense);
    this._editingExpense = expense;
    this.updateForm();
    window.scroll(0,0);
  }

  constructor(
    private splitterService: SplitterService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.users = this.splitterService.getUsers();
    this.startForm();
    this.splitterService.subscribeToUsers(users => {
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
    if(!this._editingExpense) return;
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
    if(this._editingExpense) {
      this.editExpense();
    } else {
      this.splitterService.addExpense(e);
    }
  }

  editExpense() {
    let newExpense = this.getNewExpenseFromForm();
    
    let edited = this.splitterService.editExpense(this.oldExpense, newExpense);
    if(edited) {
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

    if(this._editingExpense) {
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
    (this.expenseForm.controls.users as FormArray).controls.forEach((control, i) => {
      control.setValue(this.userIsParticipating(this.users[i]));
    });
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
}
