import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocalWeightsComponent } from './add-local-weights.component';

describe('AddLocalWeightsComponent', () => {
  let component: AddLocalWeightsComponent;
  let fixture: ComponentFixture<AddLocalWeightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLocalWeightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLocalWeightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
