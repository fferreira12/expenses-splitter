import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AddUserComponent } from "./components/add-user/add-user.component";
import { UserListComponent } from "./components/user-list/user-list.component";
import { AddExpenseComponent } from "./components/add-expense/add-expense.component";
import { ExpenseListComponent } from "./components/expense-list/expense-list.component";
import { BalanceComponent } from "./components/balance/balance.component";
import { AddPaymentComponent } from "./components/add-payment/add-payment.component";
import { PaymentListComponent } from "./components/payment-list/payment-list.component";
import { HeaderComponent } from "./components/header/header.component";
import { UsersComponent } from "./components/users/users.component";
import { ExpensesComponent } from "./components/expenses/expenses.component";
import { PaymentsComponent } from "./components/payments/payments.component";
import { SignupComponent } from "./components/auth/signup/signup.component";
import { SigninComponent } from "./components/auth/signin/signin.component";
import { AuthGuardService } from "./services/auth-guard.service";
import { HomeComponent } from "./components/home/home.component";
import { ProjectListComponent } from "./components/project-list/project-list.component";
import { ProjectsComponent } from "./components/projects/projects.component";
import { LoadingComponent } from "./components/loading/loading.component";

const appRoutes: Routes = [
  { path: "", component: HomeComponent, canActivate: [AuthGuardService] },
  { path: "home", component: HomeComponent, canActivate: [AuthGuardService] },
  {
    path: "projects",
    component: ProjectsComponent,
    canActivate: [AuthGuardService]
  },
  { path: "users", component: UsersComponent, canActivate: [AuthGuardService] },
  {
    path: "expenses",
    component: ExpensesComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: "payments",
    component: PaymentsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: "balance",
    component: BalanceComponent,
    canActivate: [AuthGuardService]
  },
  { path: "signup", component: SignupComponent },
  { path: "signin", component: SigninComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    AddUserComponent,
    UserListComponent,
    AddExpenseComponent,
    ExpenseListComponent,
    BalanceComponent,
    AddPaymentComponent,
    PaymentListComponent,
    HeaderComponent,
    UsersComponent,
    ExpensesComponent,
    PaymentsComponent,
    SignupComponent,
    SigninComponent,
    HomeComponent,
    ProjectListComponent,
    ProjectsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
