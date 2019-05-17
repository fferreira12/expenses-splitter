import { Component, OnInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { FormGroup, FormControl, FormBuilder, FormArray } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { Expense } from 'src/app/models/expense.model';

@Component({
  selector: "app-add-expense",
  templateUrl: "./add-expense.component.html",
  styleUrls: ["./add-expense.component.css"]
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  users: User[];

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
      payer: new FormControl(null)
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
      // console.log(formControl);
      return (formControl as FormControl).value;
    }).map( (playerIsParticipating, i) => {
      if(playerIsParticipating) {
        return this.users[i].id;
      }
    });
    let value = this.expenseForm.controls.value.value;

    const expense = new Expense(expenseName, value);

    //console.log(usersIds);
    let filteredUsers = this.users.filter(user => {
      //console.log(user.id);
      let isIn = usersIds.includes(user.id);
      // console.log(user.id);
      // console.log(isIn);
      return isIn;
    });

    filteredUsers.forEach(user => {
      expense.addUser(user);
    });

    let payer = this.users.find(user => {
      return user.id === payerId;
    });

    expense.setPayer(payer);

    //console.log(expense);

    this.splitterService.addExpense(expense);
  }

  addCheckboxes() {
    //console.log('has now ' + this.users.length + ' users');
    this.users.map((o, i) => {
      const control = new FormControl(true);
      //console.log(control);
      (this.expenseForm.controls.users as FormArray).push(control);
    });
  }

  checkCheckBoxvalue(event) {
    if(event.target.checked) {
      //event.target.value = event.target.name;
      
    }
    //console.log(this.expenseForm.controls.users)
    // console.log(event);
  }
}
