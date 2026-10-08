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
import { TaskPriority, TaskStatus } from '../../models/task.model';

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
      category: ['Trabalho', [Validators.required]],
      priority: ['medium' as TaskPriority, [Validators.required]],
      status: ['pending' as TaskStatus, [Validators.required]],
    });
  }

  // Getter que converte YYYY-MM-DD para DD/MM/YYYY
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

  setPriority(priority: string) {
    this.taskForm.patchValue({ priority: priority as TaskPriority });
  }

  setStatus(status: string) {
    this.taskForm.patchValue({ status: status as TaskStatus });
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

  async onSubmit() {
    if (this.taskForm.invalid || this.isLoading) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formVal = this.taskForm.value;
    const combinedDueDate = new Date(`${formVal.date}T${formVal.time}:00`);

    const payload = {
      title: formVal.title.trim(),
      description: formVal.description ? formVal.description.trim() : '',
      category: formVal.category,
      priority: formVal.priority,
      status: formVal.status,
      dueDate: combinedDueDate.toISOString(),
    };

    this.taskService.createTask(payload).subscribe({
      next: async () => {
        this.isLoading = false;
        const toast = await this.toastCtrl.create({
          message: 'Tarefa criada com sucesso!',
          duration: 2500,
          color: 'success',
          position: 'bottom',
        });
        await toast.present();
        this.router.navigate(['/tabs/home']);
      },
      error: async (err) => {
        this.isLoading = false;
        const message =
          err.error?.message || 'Falha ao salvar tarefa. Tente novamente.';
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
