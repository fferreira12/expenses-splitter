import { Component, OnInit } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { Payment } from 'src/app/models/payment.model';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {

  payments: Payment[];

  constructor(
    private splitterService: SplitterService
  ) { }

  ngOnInit() {
    this.payments = this.splitterService.getPayments();
    this.splitterService.subscribeToPayments(payments => {
      this.payments = payments;
    });
  }

  onRemovePayment(payment: Payment) {
    this.splitterService.removePayment(payment);
  }

  onFilesAdded(payment: Payment, event: any) {
    console.log(payment, event.target.files[0]);
    let file = event.target.files[0];
    this.splitterService.addFileToPayment(file, payment);
  }

  onDeleteFile(payment: Payment) {
    this.splitterService.deleteFileFromPayment(payment);
  }

}
