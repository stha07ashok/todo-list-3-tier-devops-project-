'use client';

import { useState, useEffect, useCallback } from 'react';
import { todoApi, type Todo, type UpdateTodoInput } from './api';

function CheckIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900/50" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading your tasks...</p>
    </div>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const newTodo = await todoApi.create({ title: title.trim(), description: description.trim() || undefined });
      setTodos((prev) => [newTodo, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await todoApi.update(todo._id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t._id === todo._id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleSaveEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!editingTodo || !editTitle.trim()) return;
    try {
      const updates: UpdateTodoInput = { title: editTitle.trim() };
      if (editDescription.trim()) updates.description = editDescription.trim();
      else updates.description = '';
      const updated = await todoApi.update(editingTodo._id, updates);
      setTodos((prev) => prev.map((t) => (t._id === editingTodo._id ? updated : t)));
      setEditingTodo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <header className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 mb-3">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Todo List
            </span>
          </h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">Stay organized, get things done</p>
        </header>

        {error && (
          <div className="mb-6 animate-slide-up rounded-xl border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20 px-5 py-4 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="flex-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <button onClick={() => setError('')} className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline">Dismiss</button>
            </div>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 animate-slide-up space-y-6" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{todos.length}</p>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
              </div>
              <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">Done</p>
              </div>
              <div className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{todos.length - completedCount}</p>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">Pending</p>
              </div>
            </div>

            {todos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-xl shadow-indigo-500/5">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">New Task</h2>
                <div className="space-y-2.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 pl-9 pr-3 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-start pl-3 pt-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description (optional)"
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 pl-9 pr-3 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <PlusIcon />
                      Add Todo
                    </span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-indigo-700 to-purple-700 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </form>

            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-xl shadow-indigo-500/5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-4 w-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">1</span> Click the circle to mark a task complete
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-4 w-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">2</span> Hover over a task to reveal edit & delete
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-4 w-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">3</span> Track your progress with the stats above
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 animate-slide-up min-h-0" style={{ animationDelay: '200ms' }}>
            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-xl shadow-indigo-500/5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tasks
                  {todos.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">({todos.length})</span>
                  )}
                </h2>
                <div className="flex gap-1">
                  <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">All</button>
                  <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">Active</button>
                  <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">Done</button>
                </div>
              </div>

              {loading ? (
                <Spinner />
              ) : todos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <ClipboardIcon />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No tasks yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                    Your todo list is empty. Add your first task from the panel on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                  {todos.map((todo, index) => (
                    <div
                      key={todo._id}
                      className="group relative rounded-xl bg-white/60 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start gap-3 pl-2">
                        <button
                          onClick={() => handleToggle(todo)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                            todo.completed
                              ? 'border-emerald-400 bg-emerald-400 text-white scale-110'
                              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:scale-110'
                          }`}
                        >
                          {todo.completed && <CheckIcon />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`text-sm font-semibold ${
                              todo.completed ? 'text-gray-400 dark:text-gray-500 line-through decoration-2' : 'text-gray-900 dark:text-white'
                            }`}>
                              {todo.title}
                            </h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                              <button
                                onClick={() => handleEdit(todo)}
                                className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all"
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => handleDelete(todo._id)}
                                className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-all"
                                title="Delete"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
                          </div>
                          {todo.description && (
                            <p className={`mt-0.5 text-xs ${
                              todo.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {todo.description}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                            {new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md animate-scale-in rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <EditIcon />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit task</h2>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Todo title"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  autoFocus
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-start pl-4 pt-3.5 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editTitle.trim()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
