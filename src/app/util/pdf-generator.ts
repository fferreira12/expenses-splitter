import { jsDocComment } from '@angular/compiler';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'

import { CreateExpenseTableData, ExpenseTableData } from '../models/report/expense-table-data';
import { UserReportData } from '../models/report/user-report-data';

export class PdfGenerator {

  private doc: jsPDF = new jsPDF();

  private fontSize: number = 12;
  private leftMargin: number = 15;
  private topMargin: number = 15;
  private yLocation: number = 12 / 2.835 + 15;
  private lineSpacing: number = 3;
  private indentSize: number = 10;

  private expenseData: ExpenseTableData[];

  constructor(
    private userReportData: UserReportData
  ) {
    this.generate();
  }

  public save(): jsPDF {
    return this.doc;
  }

  private generate() {
    this.expenseData = CreateExpenseTableData(this.userReportData);

    this.writeTitle(`Expenses Splitter Report - ${this.userReportData.project.projectName} - ${this.userReportData.user.name}`);

    this.writeLine(`Project: ${this.userReportData.project.projectName}`);
    this.writeLine(`${this.userReportData.project.expenses.length} expenses`, 1);
    this.writeLine(`R$ ${this.userReportData.project.total} total`, 1);
    this.blankLine();

    this.writeLine(`Users (${this.userReportData.project.users.length})`);
    this.userReportData.project.users.forEach(u => {
      this.writeLine(`${u.name}: Weight: ${this.userReportData.project.getWeightForUser(u)}`, 1, u.id === this.userReportData.user.id);
    });

    this.blankLine();

    this.writeLine(`User in this report: ${this.userReportData.user.name}`);
    this.writeLine(`Participated in ${this.userReportData.expenses.length} expenses`);
    this.writeLine(`Total value of expenses: R$ ${this.userReportData.totalExpenses}`);

    this.blankLine();

    this.writeLine(`Report generated at ${this.userReportData.time}`)

    this.writeTable();

  }

  private writeLine(content: string, indentLevel: number = 0, bold: boolean = false) {
    this.doc.text(content, this.leftMargin + indentLevel * this.indentSize, this.yLocation);
    this.yLocation += this.fontSize / 2.835 + this.lineSpacing;
  }

  private writeTitle(content: string) {
    this.doc.setFontSize(16);
    this.writeLine(content);
    this.doc.setFontSize(12);
  }

  private blankLine() {
    this.writeLine('');
  }

  private writeTable() {
    let headers = [
      ['Id', 'Expense', 'Value', 'Users', 'Proportion', 'Share', 'Paid','Diff', 'Balance']
    ];

    let body: string[][] = this.expenseData.map((eData, i) => {

      let users = '';

      eData.users.forEach(u => {
        users += u.name;
        users += ` (${eData.weights[u.id]})\n`;
      });

      let proportion: string = `${eData.userWeight}/${eData.totalWeight} (${(100 * eData.userWeight / eData.totalWeight).toFixed(2)}%)`

      let diffTxt = eData.diff > 0 ? `+${eData.diff.toFixed(2)}` : eData.diff.toFixed(2);

      let row: string[] = [
        i.toString(),
        eData.expenseName,
        eData.value.toFixed(2),
        users,
        proportion,
        eData.share.toFixed(2),
        eData.paid.toFixed(2),
        diffTxt,
        eData.balance.toFixed(2)
      ]

      return row;

    });

    autoTable(this.doc, {
      head: headers,
      body: body,
      startY: this.yLocation,
      margin: {
        left: this.leftMargin,
        right: this.leftMargin
      }
    })
  }

}
