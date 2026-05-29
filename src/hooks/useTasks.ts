
import { useCallback, useEffect, useState } from "react";



export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface CreateTaskDTO {
  title: string;
}

export interface UpdateTaskDTO {
  title?: string;
  completed?: boolean;
}



const API_URL = "/api/tasks";



async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Erro ao processar requisição";

    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {
     
    }

    throw new Error(message);
  }

  
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

const tasksApi = {
  getAll: () => request<Task[]>(API_URL),

  create: (data: CreateTaskDTO) =>
    request<Task>(API_URL, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTaskDTO) =>
    request<Task>(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<void>(`${API_URL}/${id}`, {
      method: "DELETE",
    }),
};



export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const execute = useCallback(
    async <T,>(
      action: () => Promise<T>,
      options?: {
        submitting?: boolean;
      }
    ): Promise<T | undefined> => {
      const isSubmitting = options?.submitting;

      try {
        setError(null);

        if (isSubmitting) {
          setSubmitting(true);
        } else {
          setLoading(true);
        }

        return await action();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro inesperado";

        setError(message);

        console.error(err);

        return undefined;
      } finally {
        if (isSubmitting) {
          setSubmitting(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );


  const validateTitle = useCallback((title: string) => {
    if (!title.trim()) {
      throw new Error("Título é obrigatório");
    }
  }, []);


  const fetchTasks = useCallback(async () => {
    const data = await execute(() => tasksApi.getAll());

    if (data) {
      setTasks(data);
    }
  }, [execute]);


  const createTask = useCallback(
    async (title: string) => {
      await execute(
        async () => {
          validateTitle(title);

          const createdTask = await tasksApi.create({
            title,
          });

          setTasks((prev) => [createdTask, ...prev]);

          return createdTask;
        },
        { submitting: true }
      );
    },
    [execute, validateTitle]
  );


  const updateTask = useCallback(
    async (id: string, title: string) => {
      await execute(
        async () => {
          validateTitle(title);

          const updatedTask = await tasksApi.update(id, {
            title,
          });

          setTasks((prev) =>
            prev.map((task) =>
              task.id === id ? updatedTask : task
            )
          );

          return updatedTask;
        },
        { submitting: true }
      );
    },
    [execute, validateTitle]
  );


  const toggleTask = useCallback(
    async (id: string) => {
      const currentTask = tasks.find((task) => task.id === id);

      if (!currentTask) return;

      const optimisticValue = !currentTask.completed;

      
      const previousTasks = tasks;

      
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: optimisticValue,
              }
            : task
        )
      );

      try {
        const updatedTask = await tasksApi.update(id, {
          completed: optimisticValue,
        });

        
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? updatedTask : task
          )
        );
      } catch (err) {
        
        setTasks(previousTasks);

        const message =
          err instanceof Error ? err.message : "Erro ao atualizar tarefa";

        setError(message);
      }
    },
    [tasks]
  );


  const deleteTask = useCallback(
    async (id: string) => {
      const previousTasks = tasks;

      
      setTasks((prev) => prev.filter((task) => task.id !== id));

      try {
        await tasksApi.remove(id);
      } catch (err) {
        
        setTasks(previousTasks);

        const message =
          err instanceof Error ? err.message : "Erro ao deletar tarefa";

        setError(message);
      }
    },
    [tasks]
  );


  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    submitting,
    error,

    fetchTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
}
