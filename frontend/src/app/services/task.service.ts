import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  createTask(data: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, data);
  }

  updateTask(id: string, data: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, data);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
