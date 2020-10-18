import { Component, Input, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import { Project } from 'src/app/models/project.model';
import { User } from 'src/app/models/user.model';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-get-report',
  templateUrl: './get-report.component.html',
  styleUrls: ['./get-report.component.css']
})
export class GetReportComponent implements OnInit {

  @Input()
  project: Project;

  @Input()
  user: User;

  private file: jsPDF;

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.file = this.reportService.generateReport(this.project, this.user);
  }

  getReport() {
    return this.file.save(`ExpenseSplitter-${this.project.projectName}-${this.user.name}.pdf`);
  }

}
