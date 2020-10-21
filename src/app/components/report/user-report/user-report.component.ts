import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Project } from 'src/app/models/project.model';
import { ExpenseTableData } from 'src/app/models/report/expense-table-data';
import { User } from 'src/app/models/user.model';
import { ReportService } from 'src/app/services/report.service';
import { selectCurrentProject, selectUser } from 'src/app/state/app.selectors';
import { AppState } from 'src/app/state/app.state';

@Component({
  selector: 'app-user-report',
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.css']
})
export class UserReportComponent implements OnInit {

  currentProject$: Observable<Project>;
  currentUser$: Observable<User>;
  userId: string;

  expenseData: ExpenseTableData[];

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private store: Store<{projects: AppState}>
  ) { }

  ngOnInit(): void {
    this.currentProject$ = this.store.select(selectCurrentProject);

    this.currentUser$ = this.route.params.pipe(
      mergeMap((params) => {
        return this.store.select(selectUser, params.userId);
      })
    );

    combineLatest([this.currentProject$, this.currentUser$]).subscribe(([project, user]) => {

      this.expenseData = this.reportService.getExpenseReportData(project, user);

    });

  }

  getUsersString(eData: ExpenseTableData): string[] {
    let localWeights = eData.isLocalWeight;
    let users: string[] = [];
    eData.users.forEach(u => {
        users.push(u.name + ` [${eData.weights[u.id]}]`);
    });
    return users;
  }

  getDiffString(eData: ExpenseTableData) {
    return eData.diff > 0 ? `+${eData.diff.toFixed(2)}` : eData.diff.toFixed(2);
  }

}
