import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSpinner, ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
  briefcaseOutline,
  bookOutline,
  cartOutline,
  barbellOutline,
  calendarOutline,
  checkmarkCircleOutline,
  folderOutline,
  checkmarkDoneOutline,
} from 'ionicons/icons';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasTasks: boolean;
  dateKey: string;
}

export interface AgendaTaskItem {
  id: string;
  title: string;
  timeFormatted: string;
  categoryName: string;
  categoryIcon: string;
  priority: TaskPriority;
  status: TaskStatus;
  indicatorColor: string;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner],
})
export class AgendaPage implements ViewWillEnter {
  private taskService = inject(TaskService);

  public readonly weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  public currentDate = signal<Date>(new Date());
  public selectedDate = signal<Date>(new Date());
  public allTasks = signal<Task[]>([]);
  public isLoading = signal<boolean>(false);

  public currentMonthYearLabel = computed(() => {
    const date = this.currentDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${date.getFullYear()}`;
  });

  public selectedDateFormatted = computed(() => {
    const date = this.selectedDate();
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();

    return `${capitalizedWeekday}, ${day} de ${month} de ${year}`;
  });

  public taskDatesSet = computed(() => {
    const set = new Set<string>();

    this.allTasks().forEach((task) => {
      if (task.dueDate) {
        const localKey = this.toLocalDateKey(new Date(task.dueDate));
        set.add(localKey);
      }
    });

    return set;
  });

  public calendarDays = computed(() => {
    const current = this.currentDate();
    const selected = this.selectedDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: CalendarDay[] = [];
    const today = new Date();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      const key = this.toLocalDateKey(d);
      days.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        isSelected: this.isSameDay(d, selected),
        hasTasks: this.taskDatesSet().has(key),
        dateKey: key,
      });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const key = this.toLocalDateKey(d);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: this.isSameDay(d, today),
        isSelected: this.isSameDay(d, selected),
        hasTasks: this.taskDatesSet().has(key),
        dateKey: key,
      });
    }

    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingDays = totalSlots - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const key = this.toLocalDateKey(d);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        isSelected: this.isSameDay(d, selected),
        hasTasks: this.taskDatesSet().has(key),
        dateKey: key,
      });
    }

    return days;
  });

  public selectedDayTasks = computed(() => {
    const selectedKey = this.toLocalDateKey(this.selectedDate());

    const realTasks = this.allTasks().filter((task) => {
      if (!task.dueDate) return false;
      const taskLocalKey = this.toLocalDateKey(new Date(task.dueDate));
      return taskLocalKey === selectedKey;
    });

    return realTasks.map((t) => this.mapTaskToAgendaItem(t));
  });

  constructor() {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      briefcaseOutline,
      bookOutline,
      cartOutline,
      barbellOutline,
      calendarOutline,
      checkmarkCircleOutline,
      folderOutline,
      checkmarkDoneOutline,
    });
  }

  ionViewWillEnter() {
    this.fetchTasks();
  }

  fetchTasks() {
    this.isLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.isLoading.set(false);
        this.allTasks.set(tasks || []);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  previousMonth() {
    const current = this.currentDate();
    this.currentDate.set(
      new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }

  nextMonth() {
    const current = this.currentDate();
    this.currentDate.set(
      new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }

  selectDay(day: CalendarDay) {
    this.selectedDate.set(day.date);
    if (!day.isCurrentMonth) {
      this.currentDate.set(
        new Date(day.date.getFullYear(), day.date.getMonth(), 1),
      );
    }
  }

  private mapTaskToAgendaItem(task: Task): AgendaTaskItem {
    let timeFormatted = '00:00';
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      timeFormatted = `${hours}:${minutes}`;
    }

    const categoryName = task.category?.name || 'Trabalho';
    const status: TaskStatus = task.status || 'PENDING';

    return {
      id: task.id,
      title: task.title,
      timeFormatted,
      categoryName,
      categoryIcon: this.resolveCategoryIcon(categoryName),
      priority: task.priority || 'MEDIUM',
      status,
      indicatorColor:
        status === 'COMPLETED'
          ? '#27ae60'
          : this.resolveIndicatorColor(task.priority),
    };
  }

  private resolveCategoryIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('estud')) return 'book-outline';
    if (n.includes('compr') || n.includes('finan')) return 'cart-outline';
    if (n.includes('saúd') || n.includes('saude') || n.includes('acad'))
      return 'barbell-outline';
    if (n.includes('trab')) return 'briefcase-outline';
    return 'folder-outline';
  }

  private resolveIndicatorColor(priority: TaskPriority): string {
    if (priority === 'HIGH') return '#eb5757';
    if (priority === 'MEDIUM') return '#1d5ab9';
    return '#27ae60';
  }

  private toLocalDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
