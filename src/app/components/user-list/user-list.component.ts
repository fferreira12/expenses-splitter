import { Component, OnInit } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users: User[];

  constructor(private splitterService: SplitterService) { }

  ngOnInit() {
    this.users = this.splitterService.getUsers();
  }

  onRemoveUser(user: User) {
    this.splitterService.removeUser(user);
  }

}
