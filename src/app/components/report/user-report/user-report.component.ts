import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, race } from 'rxjs';
import { filter, mergeMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/models/expense.model';
import { Project } from 'src/app/models/project.model';
import { ExpenseTableData } from 'src/app/models/report/expense-table-data';
import { UserReportData } from 'src/app/models/report/user-report-data';
import { User } from 'src/app/models/user.model';
import { Firebasev2Service } from 'src/app/services/firebasev2.service';
import { ReportService } from 'src/app/services/report.service';
import { selectCurrentProject, selectProjectById, selectUser } from 'src/app/state/app.selectors';
import { AppState } from 'src/app/state/app.state';
import { Location } from '@angular/common';
import { loadProjects, setCurrentProject } from 'src/app/state/app.actions';


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
    private store: Store<{ projects: AppState }>,
    private db: Firebasev2Service,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.currentProject$ = race(
      this.store.select(selectCurrentProject).pipe(
        filter(v => v !== null),
        tap(v => console.log(v))
      ),
      this.route.params.pipe(
        mergeMap((params) => {
          return this.db.getProjectById(params.projectId);
        }),
        tap(p => {
          console.log('p',p);
          let states = [p];
          this.store.dispatch(loadProjects({projects:states}))
        })
      )
    );
    this.currentProject$.subscribe(p => {
      if (p) {
        this.currentProject = p;
      }
    });

    this.currentUser$ = this.route.params.pipe(
      mergeMap((params) => {
        return this.store.select(selectUser, params.userId);
      })
    );

    combineLatest([this.currentProject$, this.currentUser$]).subscribe(([project, user]) => {

      if (!project || !user) {
        return;
      }

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
    let percent = this.userReportData.totalExpenses * 100.0 / this.getTotalExpenses(project.expenses);
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

  back() {
    this.location.back();
  }

}
