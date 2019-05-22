import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseListComponent } from './expense-list.component';
import { SplitterService } from 'src/app/services/splitter.service';
import { splitterServiceStub } from 'src/test/splitter.service.stub';
import { AddExpenseComponent } from '../add-expense/add-expense.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('ExpenseListComponent', () => {
  let component: ExpenseListComponent;
  let fixture: ComponentFixture<ExpenseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseListComponent, AddExpenseComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [{provide: SplitterService, useValue: splitterServiceStub }]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
