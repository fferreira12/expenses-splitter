import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Project } from '../models/project.model';
import { CreateExpenseTableData, ExpenseTableData } from '../models/report/expense-table-data';
import { CreateUserReportData } from '../models/report/user-report-creator';
import { UserReportData } from '../models/report/user-report-data';
import { User } from '../models/user.model';
import { PdfGenerator } from '../util/pdf-generator';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private pdfGenerator: PdfGenerator;

  constructor() { }

  generatePdfReport(project: Project, user: User): jsPDF {

    let userReportData = CreateUserReportData(project, user);
    this.pdfGenerator = new PdfGenerator(userReportData);
    return this.pdfGenerator.save();

  }

  getUserReportData(project: Project, user: User): UserReportData {
    return CreateUserReportData(project, user);
  }

  getExpenseReportData(project: Project, user: User): ExpenseTableData[] {
    return CreateExpenseTableData(CreateUserReportData(project, user));
  }

}
