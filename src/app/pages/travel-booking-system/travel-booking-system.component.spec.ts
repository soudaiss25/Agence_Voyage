import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelBookingSystemComponent } from './travel-booking-system.component';

describe('TravelBookingSystemComponent', () => {
  let component: TravelBookingSystemComponent;
  let fixture: ComponentFixture<TravelBookingSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravelBookingSystemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TravelBookingSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
