import { Expense } from '../expense.model';
import { Project } from "../project.model";
import { User } from '../user.model';
import { CreateExpenseTableData } from './expense-table-data';
import { CreateUserReportData } from './user-report-creator';
import { UserReportData } from './user-report-data';

fdescribe("Reports", () => {

  let p: Project;
  let u1: User;
  let u2: User;
  let e1: Expense;
  let e2: Expense;
  let reportData: UserReportData;

  beforeEach(() => {
    p = new Project();
    p.projectName = "Test Project";

    u1 = new User("User1");
    u2 = new User("User2");
    p.addUser(u1);
    p.addUser(u2);

    e1 = new Expense("Expense1", 50);
    e1.addUser(u1);
    e1.addUser(u2);
    e1.setPayer(u1);
    p.addExpense(e1);

    e2 = new Expense("Expense2", 150);
    e2.addUser(u1);
    e2.addUser(u2);
    e2.setPayer(u2);
    p.addExpense(e2);

    reportData = CreateUserReportData(p, u1);
  })

  it("should create report data", () => {

    let reportData = CreateUserReportData(p, u1);

    expect(reportData).toBeTruthy();
  });

  it("should create expense table data", () => {

    let expenseData = CreateExpenseTableData(reportData);

    expect(expenseData).toBeTruthy();
  });

});
