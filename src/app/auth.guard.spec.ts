import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './services/auth.service';
import { User } from './models/user.inteface';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUserValue']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if authenticated and role matches', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
authServiceSpy.getCurrentUserValue.and.returnValue({
  role: 'admin'
} as Partial<User> as User);
    const route: any = { data: { roles: ['admin'] } };
    const state: any = {};

    expect(guard.canActivate(route, state)).toBeTrue();
  });

  it('should block activation if not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const route: any = { data: {} };
    const state: any = { url: '/dashboard' };

    expect(guard.canActivate(route, state)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: state.url } });
  });

  it('should redirect to unauthorized if role does not match', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
   authServiceSpy.getCurrentUserValue.and.returnValue({
  role: 'admin'
} as Partial<User> as User);;

    const route: any = { data: { roles: ['admin'] } };
    const state: any = {};

    expect(guard.canActivate(route, state)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});
