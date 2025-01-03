import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllExpensesComponent } from './all-expenses.component';

describe('AllExpensesComponent', () => {
  let component: AllExpensesComponent;
  let fixture: ComponentFixture<AllExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllExpensesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
