import { Component, OnInit, Renderer2 } from '@angular/core';

import Swiper from 'swiper';


@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.loadScripts();
  }

  loadScripts() {
    const scripts = [
      '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
      '/assets/vendor/php-email-form/validate.js',
      '/assets/vendor/aos/aos.js',
      '/assets/vendor/glightbox/js/glightbox.min.js',
      '/assets/vendor/purecounter/purecounter_vanilla.js',
      '/assets/vendor/swiper/swiper-bundle.min.js',
      '/assets/js/main.js'
    ];

    scripts.forEach(script => {
      const scriptElement = this.renderer.createElement('script');
      scriptElement.src = script;
      scriptElement.type = 'text/javascript';
      scriptElement.defer = true;
      this.renderer.appendChild(document.body, scriptElement);
    });
  }
}
