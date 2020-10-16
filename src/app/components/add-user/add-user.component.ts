import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { AppState } from 'src/app/state/app.state';
import { Store } from '@ngrx/store';
import { addUser } from 'src/app/state/app.actions';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  name = new FormControl('');

  constructor(private store: Store<{ projects: AppState }>) { }

  ngOnInit() {
  }

  onAddUser() {
    //let user: User = new User(this.name.value);
    //this.splitterService.addUser(user);
    this.store.dispatch(addUser({ userName: this.name.value }));
    this.name.reset();
  }

}
