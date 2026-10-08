import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent],
})
export class SplashPage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    // Aguarda 2 segundos para dar tempo de exibir a animação/marca
    setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    }, 2000);
  }
}
