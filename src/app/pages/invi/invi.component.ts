import { Component, Inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-invi',
  templateUrl: './invi.component.html',
  styleUrls: ['./invi.component.scss'],
})
export class InviComponent {
  inviId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.inviId = this.route.snapshot.paramMap.get('inviId');

    afterNextRender(() => {
      this.initRevealObserver();
    });
  }

  private initRevealObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    const scan = () => {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => observer.observe(el));
    };
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
  }
}
