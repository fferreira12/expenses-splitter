import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPaymentComponent } from './add-payment.component';

import { splitterServiceStub } from '../../../test/splitter.service.stub';
import { SplitterService } from 'src/app/services/splitter.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('AddPaymentComponent', () => {
  let component: AddPaymentComponent;
  let fixture: ComponentFixture<AddPaymentComponent>;



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPaymentComponent ],
      imports: [ FormsModule, ReactiveFormsModule ],
      providers: [{provide: SplitterService, useValue: splitterServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
