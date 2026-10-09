import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonIcon,
  IonModal,
  IonDatetime,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  ToastController,
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
} from 'ionicons/icons';
import { TaskService } from '../../services/task.service';
import {
  CreateTaskDto,
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
    IonModal,
    IonDatetime,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
  ],
})
export class TaskFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  public taskForm!: FormGroup;
  public isLoading = false;
  public isDateModalOpen = false;
  public isTimeModalOpen = false;

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
    });
  }

  ngOnInit() {
    const now = new Date();
    const defaultDate = now.toISOString().split('T')[0];
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

  onDateChange(event: any) {
    const value = event.detail.value;
    if (value) {
      this.taskForm.patchValue({ date: value.split('T')[0] });
    }
  }

  onTimeChange(event: any) {
    const value = event.detail.value;
    if (value) {
      const timePart = value.includes('T')
        ? value.split('T')[1].substring(0, 5)
        : value;
      this.taskForm.patchValue({ time: timePart });
    }
  }

  onCancel() {
    this.router.navigate(['/tabs/home']);
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

    const payload: CreateTaskDto = {
      title: formVal.title.trim(),
      description: formVal.description ? formVal.description.trim() : undefined,
      dueDate: combinedDueDate.toISOString(),
      priority: formVal.priority,
      status: formVal.status,
    };

    this.taskService.createTask(payload).subscribe({
      next: async () => {
        this.isLoading = false;
        const toast = await this.toastCtrl.create({
          message: 'Tarefa salva com sucesso!',
          duration: 2500,
          color: 'success',
          position: 'bottom',
        });
        await toast.present();
        this.taskForm.reset();
        this.router.navigate(['/tabs/home']);
      },
      error: async (err) => {
        this.isLoading = false;
        console.error('Erro ao salvar tarefa:', err);

        let message = 'Falha ao salvar tarefa. Tente novamente.';
        if (err.error?.message) {
          message = Array.isArray(err.error.message)
            ? err.error.message.join(', ')
            : err.error.message;
        }

        const toast = await this.toastCtrl.create({
          message,
          duration: 3500,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }
}
