import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SplitterService } from 'src/app/services/splitter.service';
import { Payment } from 'src/app/models/payment.model';
import * as firebase from 'firebase';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {

  payments: Payment[];

  percentUploaded: number = 0.0;
  paymentUploading: Payment;

  constructor(private splitterService: SplitterService, private _snackBar: MatSnackBar) { }

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
    /*console.log(payment, event.target.files[0]);
    let file = event.target.files[0];
    this.splitterService.addFileToPayment(file, payment);*/




    this.paymentUploading = payment;

    let file = event.target.files[0];
    let promise = this.splitterService.addFileToPayment(file, payment);

    promise.snapshotChanges().subscribe(task => {
      console.log("got task", task);
      this.percentUploaded = Math.floor((100 * task.bytesTransferred) / task.totalBytes);
    });

    promise.then(task => {
      if (task.state === firebase.storage.TaskState.SUCCESS) {
        task.ref.getDownloadURL().then(url => {
          let newPayment = new Payment(payment.payer, payment.receiver, payment.value);
          Object.assign(newPayment, payment);
          newPayment.fileUrl = url;
          newPayment.filePath = task.ref.fullPath;
          newPayment.order = payment.order;
          console.log("saving payment",  newPayment);
          let success = this.splitterService.editPayment(payment, newPayment);
          if(success) {
            this.openSnackBar('Upload Complete');
          }
        });
      }
    });
  }

  onDeleteFile(payment: Payment) {
    this.splitterService.deleteFileFromPayment(payment);
    this.openSnackBar('File Deleted');
  }

  drop(event: CdkDragDrop<Payment[]>) {
    moveItemInArray(this.payments, event.previousIndex, event.currentIndex);
    this.splitterService.setPaymentOrder(event.item.data as Payment, event.currentIndex);
    this.payments.forEach((pay, i) => {
      this.splitterService.setPaymentOrder(pay, i);
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 4000,
    });
  }

}
