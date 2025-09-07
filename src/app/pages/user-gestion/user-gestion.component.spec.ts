import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGestionComponent } from './user-gestion.component';

describe('UserGestionComponent', () => {
  let component: UserGestionComponent;
  let fixture: ComponentFixture<UserGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserGestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
