import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsComponent } from './payments.component';
import { AddPaymentComponent } from '../add-payment/add-payment.component';
import { PaymentListComponent } from '../payment-list/payment-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SplitterService } from 'src/app/services/splitter.service';
import { splitterServiceStub } from 'src/test/splitter.service.stub';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ PaymentsComponent, AddPaymentComponent, PaymentListComponent ],
      providers: [{provide: SplitterService, useValue: splitterServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
