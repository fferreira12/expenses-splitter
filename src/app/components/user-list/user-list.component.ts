import { Component, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

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

  editingWeight: number;
  weights: { user: User, weight: number }[];

  evenSplit: boolean;

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.users = this.splitterService.getUsers();
    this.splitterService.subscribeToUsers(users => {
      this.users = users;
    });

    this.weights = this.splitterService.getWeights();
    this.evenSplit = this.splitterService.isEvenSplit();
    this.splitterService.subscribeToWeights(weights => {
      this.weights = weights;
      this.evenSplit = this.splitterService.isEvenSplit();
    })
  }

  onRemoveUser(user: User) {
    this.splitterService.removeUser(user);
  }

  onEditUser(user: User) {
    if(this.editingUser) {
      return;
    }
    this.editMode = !this.editMode;
    this.editingUser = user;
    this.editingWeight = this.getWeightForUser(this.editingUser);
  }

  isEditing(user: User) {
    return this.editingUser == user && this.editMode;
  }

  onSave(user: User) {
    this.splitterService.renameUser(user, user.name);
    this.splitterService.setWeightForUser(user, this.editingWeight);
    this.editingUser = null;
    this.editingWeight = null;
    this.editMode = false;
  }

  getWeightForUser(user: User) {
    return this.splitterService.getWeightForUser(user);
  }

  onResetWeights() {
    this.splitterService.unSetWeights();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.users, event.previousIndex, event.currentIndex);
    this.splitterService.setUsersOrder(this.users);
  }
}
