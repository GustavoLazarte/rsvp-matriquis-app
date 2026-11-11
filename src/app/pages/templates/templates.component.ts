import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TemplateService } from '../../core/services/template.service';
import { Template } from '../../core/models';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  templates: Template[] = [];
  loading = true;

  constructor(private templateService: TemplateService) {}

  async ngOnInit() {
    this.templates = await this.templateService.getTemplates();
    this.loading = false;
  }

  selectTemplate(t: Template) {
    alert('Plantilla seleccionada: ' + t.name);
  }
}
