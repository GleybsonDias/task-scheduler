import { prisma } from "./prisma.js";
import { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schema.js";

export async function createTask(userId: string, data: CreateTaskInput) {
  return await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      categoryId: data.categoryId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId,
    },
    include: {
      category: true,
    },
  });
}

export async function listTasks(userId: string) {
  return await prisma.task.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: {
      category: true,
    },
  });

  if (!task) {
    throw new Error("Tarefa não encontrada.");
  }

  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskInput,
) {
  await getTaskById(userId, taskId);

  return await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : null
          : undefined,
    },
    include: {
      category: true,
    },
  });
}

export async function deleteTask(userId: string, taskId: string) {
  await getTaskById(userId, taskId);

  return await prisma.task.delete({
    where: { id: taskId },
  });
}
