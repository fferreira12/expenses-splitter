import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Expense } from 'src/app/models/expense.model';
import { User } from 'src/app/models/user.model';
import { selectUser, selectUsers, selectWeights } from 'src/app/state/app.selectors';
import { AppState } from 'src/app/state/app.state';

@Component({
  selector: 'app-add-local-weights',
  templateUrl: './add-local-weights.component.html',
  styleUrls: ['./add-local-weights.component.css']
})
export class AddLocalWeightsComponent implements OnInit {

  useLocalWeights: boolean = false;
  weights: { user: User, weight: number }[];
  users: User[];
  _expense: Expense;

  @Input() set expense(expense: Expense) {
    if (!expense) return;
    this._expense = expense;
    this.useLocalWeights = !!this._expense.weights;
    if (this.weights) {
      this.weights = this._expense.weights;
    }
  }

  constructor(private store: Store<{ projects: AppState }>) { }

  get inputWeights() {
    return this.weights;
  }

  ngOnInit(): void {
    this.store.select(selectWeights).subscribe(w => this.weights = w);
    this.store.select(selectUsers).subscribe(users => {
      this.users = users;
      if (this.users && !this.weights) {
        this.weights = this.users.map(u => {
          return {
            user: u,
            weight: 1
          }
        })
      }
    });
  }

  getLocalWeightsResult() {
    return {
      useLocalWeights: this.useLocalWeights,
      localWeights: this.weights
    }
  }

}
