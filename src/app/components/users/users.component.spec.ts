import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { UserListComponent } from '../user-list/user-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SplitterService } from 'src/app/services/splitter.service';
import { splitterServiceStub } from 'src/test/splitter.service.stub';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, FormsModule ],
      declarations: [ UsersComponent, AddUserComponent, UserListComponent ],
      providers: [{provide: SplitterService, useValue: splitterServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
