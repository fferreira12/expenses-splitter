import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Project } from '../models/project.model';
import { CreateExpenseTableData } from '../models/report/expense-table-data';
import { CreateUserReportData } from '../models/report/user-report-creator';
import { User } from '../models/user.model';
import { PdfGenerator } from '../util/pdf-generator';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private pdfGenerator: PdfGenerator;

  constructor() { }

  generateReport(project: Project, user: User): jsPDF {

    let userReportData = CreateUserReportData(project, user);
    this.pdfGenerator = new PdfGenerator(userReportData);
    return this.pdfGenerator.save();

  }

}
