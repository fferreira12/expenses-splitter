import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetReportComponent } from './get-report.component';

describe('GetReportComponent', () => {
  let component: GetReportComponent;
  let fixture: ComponentFixture<GetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
