import { User } from '../user.model';
import { Project } from '../project.model';
import { UserReportData } from './user-report-data';

export function CreateUserReportData(project: Project, user: User): UserReportData {

  if (!project || !user) return;

  if (!project.users.some(u => u.id === user.id)) {
    throw new Error(`Can't generate report: user ${user.name} does not belong to project ${project.projectName}`);
  };

  let expenses = project.expenses.filter(e => e.users.some(u => u.id === user.id));

  return {
    project,
    user,
    expenses,
    payments: project.payments.filter(p => p.payer.id === user.id || p.receiver.id === user.id),
    time: new Date(),
    totalExpenses: expenses.reduce((p, c) => p + c.value, 0)
  }

}
