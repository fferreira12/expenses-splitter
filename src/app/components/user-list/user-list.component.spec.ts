import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';
import { SplitterService } from 'src/app/services/splitter.service';
import { splitterServiceStub } from 'src/test/splitter.service.stub';
import { AddUserComponent } from '../add-user/add-user.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListComponent, AddUserComponent ],
      imports: [ ReactiveFormsModule, FormsModule ],
      providers: [{provide: SplitterService, useValue: splitterServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
