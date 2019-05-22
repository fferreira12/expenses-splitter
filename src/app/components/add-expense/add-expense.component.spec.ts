import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpenseComponent } from './add-expense.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SplitterService } from 'src/app/services/splitter.service';
import { splitterServiceStub } from '../../../test/splitter.service.stub';

describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;

  //let splitterServiceStub = 

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExpenseComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [{provide: SplitterService, useValue: splitterServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
