import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';


export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticated = await auth.isAuthenticated();
  
  if (authenticated) {    
    return true;
  }

  return router.parseUrl('/login');
};
