import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Converte o UUID (string) da tarefa em um inteiro positivo de 32 bits
   * exigido pelo @capacitor/local-notifications no iOS/Android.
   */
  private uuidToNotificationId(uuid: string): number {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Converte para inteiro 32-bit
    }
    return Math.abs(hash) || 1;
  }

  /**
   * Verifica e solicita permissão de notificações locais ao usuário.
   */
  async ensurePermissions(): Promise<boolean> {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') {
        return true;
      }

      const request = await LocalNotifications.requestPermissions();
      return request.display === 'granted';
    } catch (err) {
      console.warn('Notificações locais não suportadas neste ambiente:', err);
      return false;
    }
  }

  /**
   * Agenda ou atualiza a notificação local para uma tarefa.
   * Se a tarefa estiver concluída ou com data passada, cancela agendamentos anteriores.
   */
  async scheduleTaskNotification(task: Task): Promise<void> {
    if (!task?.id) return;

    try {
      // Remove qualquer agendamento anterior desta tarefa para evitar duplicidade
      await this.cancelTaskNotification(task.id);

      // Só agenda se a tarefa estiver pendente e possuir data/hora futura
      if (task.status === 'COMPLETED' || !task.dueDate) {
        return;
      }

      const scheduleDate = new Date(task.dueDate);
      const now = new Date();

      if (scheduleDate.getTime() <= now.getTime()) {
        return; // Data/hora já passou
      }

      const hasPermission = await this.ensurePermissions();
      if (!hasPermission) return;

      const notificationId = this.uuidToNotificationId(task.id);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: 'Lembrete Taskly 📅',
            body: task.description
              ? `${task.title} — ${task.description}`
              : `Hora da sua tarefa: ${task.title}`,
            schedule: {
              at: scheduleDate,
              allowWhileIdle: true,
            },
            extra: {
              taskId: task.id,
            },
          },
        ],
      });
    } catch (err) {
      console.warn('Não foi possível agendar a notificação local:', err);
    }
  }

  /**
   * Cancela a notificação agendada de uma tarefa (ao concluir ou excluir).
   */
  async cancelTaskNotification(taskId: string): Promise<void> {
    if (!taskId) return;

    try {
      const notificationId = this.uuidToNotificationId(taskId);
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }],
      });
    } catch (err) {
      console.warn('Não foi possível cancelar a notificação local:', err);
    }
  }
}
