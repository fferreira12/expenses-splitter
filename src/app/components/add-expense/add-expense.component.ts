import { Component, OnInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { FormGroup, FormControl, FormBuilder, FormArray } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { Expense } from "src/app/models/expense.model";
import { FirebaseService } from "src/app/services/firebase.service";

@Component({
  selector: "app-add-expense",
  templateUrl: "./add-expense.component.html",
  styleUrls: ["./add-expense.component.css"]
})
export class AddExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  users: User[];
  uploadProgress: number = 0;
  file: File = null;
  url: string;
  uploadComplete: boolean = false;

  constructor(
    private splitterService: SplitterService,
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.users = this.splitterService.getUsers();
    this.expenseForm = new FormGroup({
      expenseName: new FormControl(null),
      users: new FormArray([]),
      value: new FormControl(null),
      payer: new FormControl(null),
      file: new FormControl(null)
    });
    this.addCheckboxes();
    this.splitterService.subscribeToUsers(users => {
      this.users = users;

      this.expenseForm.controls.users = this.formBuilder.array([]);

      this.addCheckboxes();
    });
  }

  onChooseFile(event) {
    this.file = event.target.files[0];
  }

  onUploadFile() {
    let task = this.firebaseService.uploadFile(this.file);
    task.then(snapshot => snapshot.ref.getDownloadURL().then(url => (this.url = url)));
    task.on(
      "state_changed",

      snapshot => {
        var percentage =
          (100 * snapshot.bytesTransferred) / snapshot.totalBytes;
        this.uploadProgress = percentage;
        
        console.log(`${percentage}% complete`);
      },

      function error(err) {
        console.log(err);
      },

      () => {
        this.uploadComplete = true;
        console.log("upload complete");
      }
    );
  }

  cannAddExpense() {
    return this.file == null || this.uploadComplete;
  }

  onAddExpense(event) {
    event.preventDefault();

    if (!this.cannAddExpense()) {
      return;
    }

    let expenseName = this.expenseForm.controls.expenseName.value;
    let payerId = this.expenseForm.controls.payer.value;
    let usersIds = (this.expenseForm.controls.users as FormArray).controls
      .map(formControl => {
        // console.log(formControl);
        return (formControl as FormControl).value;
      })
      .map((playerIsParticipating, i) => {
        if (playerIsParticipating) {
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
    expense.setFileLocation(this.url);

    console.log("expense added");
    console.log(expense);

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
    if (event.target.checked) {
      //event.target.value = event.target.name;
    }
    //console.log(this.expenseForm.controls.users)
    // console.log(event);
  }
}
