const API_BASE = 'http://localhost:5000/api';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const todoApi = {
  getAll: () => request<Todo[]>(`${API_BASE}/todos`),

  getById: (id: string) => request<Todo>(`${API_BASE}/todos/${id}`),

  create: (data: CreateTodoInput) =>
    request<Todo>(`${API_BASE}/todos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTodoInput) =>
    request<Todo>(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
    }),
};
