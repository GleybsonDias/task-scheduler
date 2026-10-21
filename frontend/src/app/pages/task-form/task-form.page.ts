import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonContent,
  IonSpinner,
  IonIcon,
  IonDatetime,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  ToastController,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  textOutline,
  reorderThreeOutline,
  calendarOutline,
  timeOutline,
  pricetagOutline,
  flagOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  homeOutline,
  personOutline,
  add,
  trashOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { TaskService } from '../../services/task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPriority,
  TaskStatus,
} from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.page.html',
  styleUrls: ['./task-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonSpinner,
    IonIcon,
    IonDatetime,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
  ],
})
export class TaskFormPage implements ViewWillEnter, OnDestroy {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastCtrl = inject(ToastController);
  private routeSub?: Subscription;

  public taskForm!: FormGroup;
  public isLoading = false;
  public isDeleting = false;
  public taskId: string | null = null;
  public isEditMode = false;

  public isDateModalOpen = signal<boolean>(false);
  public isTimeModalOpen = signal<boolean>(false);
  public isDeleteModalOpen = signal<boolean>(false);

  public categories: string[] = [
    'Trabalho',
    'Estudos',
    'Pessoal',
    'Saúde',
    'Finanças',
  ];

  constructor() {
    addIcons({
      chevronBackOutline,
      textOutline,
      reorderThreeOutline,
      calendarOutline,
      timeOutline,
      pricetagOutline,
      flagOutline,
      checkmarkCircleOutline,
      chevronForwardOutline,
      homeOutline,
      personOutline,
      add,
      trashOutline,
      alertCircleOutline,
    });
    this.initForm();

    // Escuta mudanças nos queryParams mesmo se a página já estiver aberta
    this.routeSub = this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.taskId = id;
        this.isEditMode = true;
        this.loadTaskDetails(id);
      } else {
        this.resetToCreateMode();
      }
    });
  }

  ionViewWillEnter() {
    const id =
      this.route.snapshot.queryParamMap.get('id') ||
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.resetToCreateMode();
    }
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  public resetToCreateMode() {
    this.taskId = null;
    this.isEditMode = false;
    this.isLoading = false;
    this.isDeleting = false;
    this.resetFormToDefaults();
  }

  private initForm() {
    const now = new Date();
    const defaultDate = this.toLocalDateString(now);
    const defaultTime = now.toTimeString().substring(0, 5);

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      date: [defaultDate, [Validators.required]],
      time: [defaultTime, [Validators.required]],
      category: ['Trabalho'],
      priority: ['MEDIUM' as TaskPriority, [Validators.required]],
      status: ['PENDING' as TaskStatus, [Validators.required]],
    });
  }

  private resetFormToDefaults() {
    if (!this.taskForm) return;
    const now = new Date();
    const defaultDate = this.toLocalDateString(now);
    const defaultTime = now.toTimeString().substring(0, 5);

    this.taskForm.reset({
      title: '',
      description: '',
      date: defaultDate,
      time: defaultTime,
      category: 'Trabalho',
      priority: 'MEDIUM',
      status: 'PENDING',
    });
  }

  private toLocalDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private loadTaskDetails(id: string) {
    this.isLoading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.isLoading = false;
        const due = task.dueDate ? new Date(task.dueDate) : new Date();
        const dateStr = this.toLocalDateString(due);
        const hours = String(due.getHours()).padStart(2, '0');
        const minutes = String(due.getMinutes()).padStart(2, '0');

        this.taskForm.patchValue({
          title: task.title,
          description: task.description || '',
          date: dateStr,
          time: `${hours}:${minutes}`,
          category: task.category?.name || 'Trabalho',
          priority: task.priority || 'MEDIUM',
          status: task.status || 'PENDING',
        });
      },
      error: async () => {
        this.resetToCreateMode();
        const toast = await this.toastCtrl.create({
          message: 'Não foi possível carregar os detalhes da tarefa.',
          duration: 2500,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
        this.navigateBackClean();
      },
    });
  }

  private navigateBackClean() {
    this.resetToCreateMode();
    // Limpa os queryParams da aba de tarefas antes de ir para a Home
    this.router
      .navigate(['/tabs/tarefas'], { queryParams: {}, replaceUrl: true })
      .then(() => {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      });
  }

  get formattedDate(): string {
    const rawDate = this.taskForm?.get('date')?.value;
    if (!rawDate) return '';

    const dateOnly = rawDate.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return rawDate;
  }

  setPriority(priority: TaskPriority) {
    this.taskForm.patchValue({ priority });
  }

  setStatus(status: TaskStatus) {
    this.taskForm.patchValue({ status });
  }

  openDateModal() {
    this.isDateModalOpen.set(true);
  }

  closeDateModal() {
    this.isDateModalOpen.set(false);
  }

  openTimeModal() {
    this.isTimeModalOpen.set(true);
  }

  closeTimeModal() {
    this.isTimeModalOpen.set(false);
  }

  onDateChange(event: any) {
    const value = event.detail.value;
    if (value) {
      this.taskForm.patchValue({ date: value.split('T')[0] });
    }
    this.closeDateModal();
  }

  onTimeChange(event: any) {
    const value = event.detail.value;
    if (value) {
      const timePart = value.includes('T')
        ? value.split('T')[1].substring(0, 5)
        : value.substring(0, 5);
      this.taskForm.patchValue({ time: timePart });
    }
    this.closeTimeModal();
  }

  onCancel() {
    this.navigateBackClean();
  }

  openDeleteModal() {
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
  }

  confirmDelete() {
    if (!this.taskId || this.isDeleting) return;

    const idToDelete = this.taskId;
    this.isDeleting = true;

    this.taskService.deleteTask(idToDelete).subscribe({
      next: async () => {
        this.closeDeleteModal();
        const toast = await this.toastCtrl.create({
          message: 'Tarefa excluída com sucesso!',
          duration: 2500,
          color: 'success',
          position: 'bottom',
        });
        await toast.present();
        this.navigateBackClean();
      },
      error: async () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        const toast = await this.toastCtrl.create({
          message: 'Erro ao excluir a tarefa. Tente novamente.',
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }

  async onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Por favor, preencha os campos obrigatórios corretamente.',
        duration: 2500,
        color: 'warning',
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    const formVal = this.taskForm.value;

    const timeWithSeconds =
      formVal.time && formVal.time.length === 5
        ? `${formVal.time}:00`
        : formVal.time || '00:00:00';
    const combinedDueDate = new Date(`${formVal.date}T${timeWithSeconds}`);

    if (this.isEditMode && this.taskId) {
      const updatePayload: UpdateTaskDto = {
        title: formVal.title.trim(),
        description: formVal.description ? formVal.description.trim() : '',
        dueDate: combinedDueDate.toISOString(),
        priority: formVal.priority,
        status: formVal.status,
      };

      this.taskService.updateTask(this.taskId, updatePayload).subscribe({
        next: async () => {
          const toast = await this.toastCtrl.create({
            message: 'Tarefa atualizada com sucesso!',
            duration: 2500,
            color: 'success',
            position: 'bottom',
          });
          await toast.present();
          this.navigateBackClean();
        },
        error: async (err) => {
          this.isLoading = false;
          const message =
            err.error?.message || 'Falha ao atualizar tarefa. Tente novamente.';
          const toast = await this.toastCtrl.create({
            message: Array.isArray(message) ? message.join(', ') : message,
            duration: 3500,
            color: 'danger',
            position: 'bottom',
          });
          await toast.present();
        },
      });
    } else {
      const createPayload: CreateTaskDto = {
        title: formVal.title.trim(),
        description: formVal.description
          ? formVal.description.trim()
          : undefined,
        dueDate: combinedDueDate.toISOString(),
        priority: formVal.priority,
        status: formVal.status,
      };

      this.taskService.createTask(createPayload).subscribe({
        next: async () => {
          const toast = await this.toastCtrl.create({
            message: 'Tarefa salva com sucesso!',
            duration: 2500,
            color: 'success',
            position: 'bottom',
          });
          await toast.present();
          this.navigateBackClean();
        },
        error: async (err) => {
          this.isLoading = false;
          const message =
            err.error?.message || 'Falha ao salvar tarefa. Tente novamente.';
          const toast = await this.toastCtrl.create({
            message: Array.isArray(message) ? message.join(', ') : message,
            duration: 3500,
            color: 'danger',
            position: 'bottom',
          });
          await toast.present();
        },
      });
    }
  }
}
