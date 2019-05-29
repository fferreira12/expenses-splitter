import { Component, OnInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { User } from "src/app/models/user.model";

@Component({
  selector: "app-user-list",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.css"]
})
export class UserListComponent implements OnInit {
  users: User[];
  editMode: boolean;
  editingUser: User;

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.users = this.splitterService.getUsers();
    this.splitterService.subscribeToUsers(users => {
      this.users = users;
    });
  }

  onRemoveUser(user: User) {
    this.splitterService.removeUser(user);
  }

  onEditUsername(user: User) {
    this.editMode = !this.editMode;
    this.editingUser = user;
    //console.log("renaming " + user.name);
  }

  isEditing(user: User) {
    return this.editingUser == user && this.editMode;
  }

  onLeaveFocus(user: User) {
    this.splitterService.renameUser(user, user.name);
    this.editMode = false;
  }
}
