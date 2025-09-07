import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToutesDestinationComponent } from './toutes-destination.component';

describe('ToutesDestinationComponent', () => {
  let component: ToutesDestinationComponent;
  let fixture: ComponentFixture<ToutesDestinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToutesDestinationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToutesDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
