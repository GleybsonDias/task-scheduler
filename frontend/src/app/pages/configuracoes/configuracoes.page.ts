import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonContent, IonIcon, IonModal, ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  checkmarkCircleOutline,
  createOutline,
  logOutOutline,
  chevronForwardOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonModal],
})
export class ConfiguracoesPage implements OnInit, ViewWillEnter, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userSub?: Subscription;

  public userName = signal<string>('Carregando...');
  public userEmail = signal<string>('');
  public isLogoutModalOpen = signal<boolean>(false);

  constructor() {
    addIcons({
      calendarOutline,
      checkmarkCircleOutline,
      createOutline,
      logOutOutline,
      chevronForwardOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {
    this.subscribeToUser();
  }

  ionViewWillEnter() {
    this.refreshUserData();
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  private subscribeToUser() {
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName.set(user.name);
        this.userEmail.set(user.email);
      }
    });
  }

  private refreshUserData() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName.set(user.name);
      this.userEmail.set(user.email);
    }

    // Tenta atualizar dados em segundo plano pela API caso tenham mudado
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res?.user) {
          if (res.user.name) this.userName.set(res.user.name);
          if (res.user.email) this.userEmail.set(res.user.email);
        }
      },
      error: () => {
        // Se a rota /me falhar, mantém os dados da sessão local já carregados
      },
    });
  }

  goToEditProfile() {
    this.router.navigate(['/pages/configuracoes/edit']);
  }

  openLogoutModal() {
    this.isLogoutModalOpen.set(true);
  }

  closeLogoutModal() {
    this.isLogoutModalOpen.set(false);
  }

  confirmLogout() {
    this.closeLogoutModal();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
