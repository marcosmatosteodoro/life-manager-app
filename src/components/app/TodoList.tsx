'use client';

import { Button } from '@/components/ui/Button';
import { formatDays, type Todo } from '@/services/todo.types';
import { formatDate } from '@/utils/date';

interface TodoListProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onChecks: (todo: Todo) => void;
}

export function TodoList({ todos, onEdit, onDelete, onChecks }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        Nenhum afazer cadastrado ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium break-words text-neutral-900">
                {todo.name}
              </span>
              {todo.tag && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  {todo.tag}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">
              {formatDays(todo.days)}
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              A partir de {formatDate(todo.startDate)}
              {todo.endDate ? ` até ${formatDate(todo.endDate)}` : ''}
            </p>
            {todo.description && (
              <p className="mt-1 text-sm text-neutral-600">{todo.description}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            <Button variant="ghost" onClick={() => onChecks(todo)}>
              Checks
            </Button>
            <Button variant="ghost" onClick={() => onEdit(todo)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(todo)}
            >
              Excluir
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
