import { NotificationService } from '../services/notification.service';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  ToastController,
  ViewWillEnter,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  timeOutline,
  checkmarkCircleOutline,
  schoolOutline,
  cashOutline,
  fitnessOutline,
  bookOutline,
  calendarOutline,
  chevronForwardOutline,
  checkbox,
  clipboardOutline,
} from 'ionicons/icons';
import { TaskService } from '../services/task.service';
import {
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskDto,
} from '../models/task.model';

export type TaskFilterType = 'ALL' | 'PENDING' | 'COMPLETED';

export interface TaskItemView {
  id: string;
  title: string;
  categoryName: string;
  categoryIcon: string;
  scheduleText: string;
  priority: TaskPriority;
  status: TaskStatus;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner],
})
export class HomePage implements ViewWillEnter {
  private notificationService = inject(NotificationService);

  private router = inject(Router);

  private taskService = inject(TaskService);
  private toastCtrl = inject(ToastController);

  public userName = 'Gleybson';
  public searchQuery = signal<string>('');
  public currentFilter = signal<TaskFilterType>('ALL');
  public isLoading = signal<boolean>(false);

  // Lista de tarefas reais obtidas da API
  public tasks = signal<TaskItemView[]>([]);

  // Contadores automáticos baseados nas tarefas do banco
  public totalCount = computed(() => this.tasks().length);
  public pendingCount = computed(
    () => this.tasks().filter((t) => t.status === 'PENDING').length,
  );
  public completedCount = computed(
    () => this.tasks().filter((t) => t.status === 'COMPLETED').length,
  );

  // Filtro dinâmico por texto de busca e status da aba
  public filteredTasks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.currentFilter();

    return this.tasks().filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.categoryName.toLowerCase().includes(query);

      const matchesStatus =
        filter === 'ALL' ||
        (filter === 'PENDING' && task.status === 'PENDING') ||
        (filter === 'COMPLETED' && task.status === 'COMPLETED');

      return matchesSearch && matchesStatus;
    });
  });

  constructor() {
    addIcons({
      searchOutline,
      timeOutline,
      checkmarkCircleOutline,
      schoolOutline,
      cashOutline,
      fitnessOutline,
      bookOutline,
      calendarOutline,
      chevronForwardOutline,
      checkbox,
      clipboardOutline,
    });
  }

  openTaskDetail(taskId: string) {
    this.router.navigate(['/tabs/tarefas'], {
      queryParams: { id: taskId },
    });
  }

  // Executado sempre que o usuário entra na tela Home (atualiza após criar tarefa)
  ionViewWillEnter() {
    this.fetchTasks();
  }

  fetchTasks() {
    this.isLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: (apiTasks: Task[]) => {
        this.isLoading.set(false);
        const mappedTasks: TaskItemView[] = (apiTasks || []).map((t) => ({
          id: t.id,
          title: t.title,
          categoryName: t.category?.name || 'Trabalho',
          categoryIcon: this.resolveCategoryIcon(t.category?.name || ''),
          scheduleText: this.formatDueDate(t.dueDate),
          priority: t.priority || 'MEDIUM',
          status: t.status || 'PENDING',
        }));
        this.tasks.set(mappedTasks);
      },
      error: async (err) => {
        this.isLoading.set(false);
        console.error('Erro ao buscar tarefas:', err);
      },
    });
  }

  setFilter(filter: TaskFilterType) {
    this.currentFilter.set(filter);
  }

  // Alterna o status da tarefa e sincroniza com a API
  toggleTaskStatus(task: TaskItemView) {
    const newStatus: TaskStatus =
      task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // Atualização otimista na tela
    this.tasks.update((list) =>
      list.map((item) =>
        item.id === task.id ? { ...item, status: newStatus } : item,
      ),
    );

    const updateDto: UpdateTaskDto = { status: newStatus };
    this.taskService.updateTask(task.id, updateDto).subscribe({
      next: async (updatedTask) => {
        if (newStatus === 'COMPLETED') {
          await this.notificationService.cancelTaskNotification(task.id);
        } else {
          await this.notificationService.scheduleTaskNotification(updatedTask);
        }
      },
      error: async () => {
        // Reverte caso a API falhe
        this.tasks.update((list) =>
          list.map((item) =>
            item.id === task.id ? { ...item, status: task.status } : item,
          ),
        );
        const toast = await this.toastCtrl.create({
          message: 'Erro ao atualizar status da tarefa.',
          duration: 2500,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }

  private resolveCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    if (name.includes('estudo')) return 'school-outline';
    if (name.includes('finan')) return 'cash-outline';
    if (name.includes('saúde') || name.includes('saude'))
      return 'fitness-outline';
    if (name.includes('pessoal')) return 'book-outline';
    return 'calendar-outline';
  }

  private formatDueDate(dueDate?: string | null): string {
    if (!dueDate) return 'Sem horário';
    try {
      const date = new Date(dueDate);
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      if (isToday) {
        return `Hoje • ${hours}:${minutes}`;
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month} • ${hours}:${minutes}`;
    } catch {
      return 'Data agendada';
    }
  }
}
