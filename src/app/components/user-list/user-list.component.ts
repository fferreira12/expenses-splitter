import { Component, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

import { User } from "src/app/models/user.model";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { selectCurrentProject, selectIsEvenSplit, selectWeightsForCurrentProject } from 'src/app/state/app.selectors';
import { map } from 'rxjs/operators';
import { orderUsers, removeUser, renameUser, setWeight, unsetWeights } from 'src/app/state/app.actions';
import { Project } from 'src/app/models/project.model';

@Component({
  selector: "app-user-list",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.css"]
})
export class UserListComponent implements OnInit {
  users: User[];
  users$: Observable<User[]>
  editMode: boolean;
  editingUser: User;

  editingWeight: number;
  weights: { user: User, weight: number }[];
  weights$: Observable<{ user: User, weight: number }[]>;

  currentProject$: Observable<Project>;
  currentProject: Project;

  evenSplit: boolean;

  constructor(private store: Store<{projects: AppState}>) {}

  ngOnInit() {
    this.currentProject$ = this.store.select(selectCurrentProject);
    this.currentProject$.subscribe(p => this.currentProject = p);
    this.users$ = this.store.select(selectCurrentProject).pipe(map(curr => curr?.users.slice().sort((a, b) => a.order - b.order)));
    this.users$.subscribe(users => {
      if (!users) return;
      this.users = [...users];
    });

    this.weights$ = this.store.select(selectWeightsForCurrentProject);
    this.weights$.subscribe(weights => {
      if (!weights) return;
      this.weights = [...weights];
    })
    this.store.select(selectIsEvenSplit).subscribe(isEven => this.evenSplit = isEven);
  }

  onRemoveUser(user: User) {
    this.store.dispatch(removeUser({userId: user.id}));
  }

  onEditUser(user: User) {
    if(this.editingUser) {
      return;
    }
    this.editMode = !this.editMode;
    this.editingUser = {...user};
    this.editingWeight = this.getWeightForUser(this.editingUser);
  }

  isEditing(user: User) {
    return this.editingUser && this.editingUser.id == user.id && this.editMode;
  }

  onSave(user: User) {
    this.store.dispatch(renameUser({
      userId: user.id,
      newName: this.editingUser.name
    }));
    this.store.dispatch(setWeight({
      user,
      weight: this.editingWeight
    }))
    this.editingUser = null;
    this.editingWeight = null;
    this.editMode = false;
  }

  getWeightForUser(user: User) {
    return this.currentProject.getWeightForUser(user);
  }

  onResetWeights() {
    this.store.dispatch(unsetWeights());
    delete this.weights;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.users, event.previousIndex, event.currentIndex);
    this.store.dispatch(orderUsers({ users: this.users }));
  }
}
