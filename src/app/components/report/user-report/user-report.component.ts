import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Expense } from 'src/app/models/expense.model';
import { Project } from 'src/app/models/project.model';
import { ExpenseTableData } from 'src/app/models/report/expense-table-data';
import { UserReportData } from 'src/app/models/report/user-report-data';
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
  currentProject: Project;
  currentUser$: Observable<User>;
  userId: string;


  expenseData: ExpenseTableData[];
  userReportData: UserReportData;
  fairShares: { [key: string]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private store: Store<{projects: AppState}>
  ) { }

  ngOnInit(): void {
    this.currentProject$ = this.store.select(selectCurrentProject);
    this.currentProject$.subscribe(p => this.currentProject = p);

    this.currentUser$ = this.route.params.pipe(
      mergeMap((params) => {
        return this.store.select(selectUser, params.userId);
      })
    );

    combineLatest([this.currentProject$, this.currentUser$]).subscribe(([project, user]) => {

      this.fairShares = project.getFairShares();
      this.userReportData = this.reportService.getUserReportData(project, user);
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

  getTotalExpenses(expenses: Expense[]) {
    return expenses.reduce((p, c) => p + c.value, 0);
  }

  getExpenseCountString(project: Project) {
    let percent = this.userReportData.expenses.length * 100.0 / project.expenses.length;
    return this.userReportData.expenses.length + '/' + project.expenses.length + ' (' + percent.toFixed(0) + '%)';
  }

  getExpenseValueString(project: Project) {
    let percent = this.userReportData.expenses.length * 100.0 / project.expenses.length;
    return "R$ " + this.userReportData.totalExpenses.toFixed(0) + '/' + this.getTotalExpenses(project.expenses).toFixed(0) + ` (${percent.toFixed(0)}%)`;
  }

  getExpensesPaid(user: User) {
    let paid = this.userReportData.expenses.reduce((p, c) => {
      return p + c.payers.reduce((p, c) => {
        let paid = c.payer.id == user.id ? c.amount : 0;
        return paid;
      }, 0)
    }, 0);
    return paid;
  }

  getFairShare(user: User) {
    return this.fairShares[user.id];
  }

  getBalance(user: User) {
    let value: number = this.currentProject.getBalances()[user.id];
    let sign = value > 0 ? "+" : "";
    return "R$ " + sign + value.toFixed(2);
  }

  getPaymentsMade(user: User) {
    return this.currentProject.getPaymentsMade(user);
  }

  getPaymentsReceived(user: User) {
    return this.currentProject.getPaymentsReceived(user);
  }

}
