import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  home,
  calendarOutline,
  checkmarkCircleOutline,
  settingsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  private router = inject(Router);

  constructor() {
    addIcons({
      home,
      calendarOutline,
      checkmarkCircleOutline,
      settingsOutline,
    });
  }

  goToCreateTask() {
    this.router.navigate(['/tabs/tarefas'], {
      queryParams: {},
      replaceUrl: true,
    });
  }
}
