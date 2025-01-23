import { Component, OnInit, Renderer2 } from '@angular/core';

// import Swiper from 'swiper';


@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  fullText: string = 'pense ';
  typewriterText: string = '';
  typingSpeed: number = 500;

  isLoading: boolean = true;

  ngOnInit() {
    this.isLoading = true;
    this.loadScripts();
    this.startTypewriterEffect();
    this.isLoading = false;
  }

  startTypewriterEffect(): void {
    let index = 0;
    const interval = setInterval(() => {
      if (index < this.fullText.length) {
        this.typewriterText += this.fullText[index];
        index++;
      } else {
        clearInterval(interval);
      }
    }, this.typingSpeed);
  }

  loadScripts() {
    const scripts = [
      '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
      '/assets/vendor/php-email-form/validate.js',
      '/assets/vendor/aos/aos.js',
      '/assets/vendor/glightbox/js/glightbox.min.js',
      '/assets/vendor/purecounter/purecounter_vanilla.js',
      '/assets/vendor/swiper/swiper-bundle.min.js',
      '/assets/js/main.js',
    ];

    scripts.forEach((script) => {
      const scriptElement = this.renderer.createElement('script');
      scriptElement.src = script;
      scriptElement.type = 'text/javascript';
      scriptElement.defer = true;
      this.renderer.appendChild(document.body, scriptElement);
    });
  }
}
