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
    this.expenseForm = new FormGroup({
      expenseName: new FormControl(null),
      users: new FormArray([]),
      value: new FormControl(null),
      payer: new FormControl(null),
      payers: new FormArray([])
    });
    this.addCheckboxes();
    this.splitterService.subscribeToUsers(users => {
      this.users = users;

      this.expenseForm.controls.users = this.formBuilder.array([]);

      this.addCheckboxes();
    });
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
    if(!this._editingExpense) return;
    let onePayer = this._editingExpense.payers.length == 1;
    this.singlePayer = onePayer;
    let amountsPayed = this._editingExpense.payers.map(payer => payer.amount);
    this.expenseForm.patchValue({
      expenseName: this._editingExpense.name,
      users: this._editingExpense.users,
      value: this._editingExpense.value,
      payer: onePayer ? this._editingExpense.payers[0].payer.id : null,
      payers: !onePayer ? amountsPayed : []
    });
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
    let edited = this.splitterService.editExpense(this.oldExpense, this.getNewExpenseFromForm());
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
      const control = new FormControl(true);
      const valueControl = new FormControl(0);
      (this.expenseForm.controls.users as FormArray).push(control);
      (this.expenseForm.controls.payers as FormArray).push(valueControl);
    });
  }

  checkCheckBoxvalue(event) {
    if (event.target.checked) {
      //event.target.value = event.target.name;
    }
    //console.log(this.expenseForm.controls.users)
    // console.log(event);
  }

  onSinglePlayerCheck(event) {
    //console.log(event);

    this.singlePayer = !event.target.checked;
  }

  onCancelEdit() {
    this._editingExpense = null;
    this.singlePayer = true;
    this.expenseForm.reset();
  }
}
