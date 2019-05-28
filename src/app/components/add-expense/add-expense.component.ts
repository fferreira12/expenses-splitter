import { Component, OnInit } from "@angular/core";
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

  onAddExpense(event) {
    event.preventDefault();

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

    const expense = new Expense(expenseName, value);

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

    this.splitterService.addExpense(expense);
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
}
