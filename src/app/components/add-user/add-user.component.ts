import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SplitterService } from 'src/app/services/splitter.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  name = new FormControl('');

  constructor(private splitterService: SplitterService) { }

  ngOnInit() {
  }

  onAddUser() {
    let user: User = new User(this.name.value);
    this.splitterService.addUser(user);
    this.name.reset();
  }

}
