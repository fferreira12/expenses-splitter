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
import { SignupComponent } from './components/auth/signup/signup.component';
import { SigninComponent } from './components/auth/signin/signin.component';
import { AuthGuardService } from './services/auth-guard.service';

const appRoutes: Routes = [
  { path: "users", component: UsersComponent, canActivate: [AuthGuardService] },
  { path: "expenses", component: ExpensesComponent, canActivate: [AuthGuardService] },
  { path: "payments", component: PaymentsComponent, canActivate: [AuthGuardService] },
  { path: "balance", component: BalanceComponent, canActivate: [AuthGuardService] },
  { path: "signup", component: SignupComponent },
  { path: "signin", component: SigninComponent }
];

@NgModule({
  declarations: [
    AppComponent,
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
    SigninComponent
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
