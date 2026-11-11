import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-org-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './org-admin.component.html',
  styleUrls: ['./org-admin.component.scss']
})
export class OrgAdminComponent {}
