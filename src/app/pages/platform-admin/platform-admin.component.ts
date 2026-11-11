import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { Organization } from '../../core/models';

@Component({
  selector: 'app-platform-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './platform-admin.component.html',
  styleUrls: ['./platform-admin.component.scss']
})
export class PlatformAdminComponent implements OnInit {
  organizations: Organization[] = [];
  loading = true;

  constructor(private orgService: OrganizationService) {}

  async ngOnInit() {
    this.organizations = await this.orgService.getMyOrganizations();
    this.loading = false;
  }
}
