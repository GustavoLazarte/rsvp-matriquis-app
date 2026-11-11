import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role.service';

export const roleGuard: CanActivateFn = async (route, state) => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  const orgId = route.queryParams['orgId'] || route.parent?.queryParams['orgId'];
  if (!orgId) {
    router.navigate(['/select-event']);
    return false;
  }

  const role = await roleService.getMyRoleForOrg(orgId);
  if (!role) {
    router.navigate(['/select-event']);
    return false;
  }

  const allowed = route.data['roles'] as string[] | undefined;
  if (allowed && !allowed.includes(role)) {
    router.navigate(['/select-event']);
    return false;
  }
  return true;
};
