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

  @Input('text')
  buttonText: string;

  private file: jsPDF;

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.file = this.reportService.generatePdfReport(this.project, this.user);
  }

  getReport(event) {
    event.stopPropagation();
    return this.file.save(`ExpenseSplitter-${this.project.projectName}-${this.user.name}.pdf`);
  }

  getButtonText(): string {
    return this.buttonText || `${this.user.name}'s Report`;
  }

}
