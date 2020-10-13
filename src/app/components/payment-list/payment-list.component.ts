import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SplitterService } from 'src/app/services/splitter.service';
import { Payment } from 'src/app/models/payment.model';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { selectPayments } from 'src/app/state/app.selectors';
import { fileUploadProgressToPayment, fileUploadToExpenseSuccess, orderPayments, removeFileFromPaymentSuccess, removePayment, startFileUploadToPayment, startRemoveFileFromPayment } from 'src/app/state/app.actions';
import { Actions, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

@Component({
  selector: "app-payment-list",
  templateUrl: "./payment-list.component.html",
  styleUrls: ["./payment-list.component.css"],
})
export class PaymentListComponent implements OnInit {
  payments: Payment[];
  payments$: Observable<Payment[]>;

  percentUploaded: number = 0.0;
  paymentUploading: Payment;

  constructor(
    private splitterService: SplitterService,
    private _snackBar: MatSnackBar,
    private store: Store<{ projects: AppState }>,
    private actions$: Actions
    ) {}

  ngOnInit() {
    this.payments$ = this.store.select(selectPayments);
    this.payments$.subscribe((payments) => {
      this.payments = payments;
    });

    this.actions$.pipe(
      ofType(fileUploadProgressToPayment),
      tap((status) => {
        this.percentUploaded = Math.floor(status.percent);
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(fileUploadToExpenseSuccess),
      tap((status) => {
        this.openSnackBar("Upload Complete");
        this.percentUploaded = 0;
      })
    ).subscribe();

    this.actions$.pipe(
      ofType(removeFileFromPaymentSuccess),
      tap((status) => {
        this.openSnackBar("File Deleted");
      })
    ).subscribe();

  }

  onRemovePayment(payment: Payment) {
    this.store.dispatch(removePayment({ payment }));
  }

  onFilesAdded(payment: Payment, event: any) {
    this.paymentUploading = payment;

    let file = event.target.files[0];

    this.store.dispatch(startFileUploadToPayment({ payment, file }));

  }

  onDeleteFile(payment: Payment) {
    this.store.dispatch(startRemoveFileFromPayment({ payment }));
  }

  drop(event: CdkDragDrop<Payment[]>) {
    moveItemInArray(this.payments, event.previousIndex, event.currentIndex);
    this.store.dispatch(orderPayments({ payments: this.payments }));
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "Close", {
      duration: 4000,
    });
  }
}
