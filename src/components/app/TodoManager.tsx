'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/hooks/useToastStore';
import type { Todo, TodoInput } from '@/services/todo.types';
import { ApiError, todoService } from '@/services/todoService';
import { TodoChecksModal } from './TodoChecksModal';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';

type LoadState = 'loading' | 'loaded' | 'error';

export function TodoManager() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<Todo | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const [checksTodo, setChecksTodo] = useState<Todo | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [{ rows }, tagList] = await Promise.all([
        todoService.list(),
        todoService.tags(),
      ]);
      setTodos(rows);
      setTags(tagList);
      setLoadState('loaded');
    } catch (error) {
      setLoadError(toMessages(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(todo: Todo) {
    setEditing(todo);
    setFormOpen(true);
  }

  function closeForm() {
    if (!submitting) setFormOpen(false);
  }

  async function handleSubmit(input: TodoInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await todoService.update(editing.id, input);
        toast.success('Afazer atualizado com sucesso.');
      } else {
        await todoService.create(input);
        toast.success('Afazer criado com sucesso.');
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await todoService.remove(deleting.id);
      toast.success('Afazer excluído com sucesso.');
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error));
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <Link
        href="/afazeres"
        className="text-sm text-fg-muted transition-colors hover:text-fg"
      >
        ← Voltar para hoje
      </Link>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Gerenciar afazeres
        </h1>
        <Button onClick={openCreate}>Novo afazer</Button>
      </div>

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}

        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="whitespace-pre-line">{loadError.join('\n')}</p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => void load()}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {loadState === 'loaded' && (
          <TodoList
            todos={todos}
            onEdit={openEdit}
            onDelete={setDeleting}
            onChecks={setChecksTodo}
          />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? 'Editar afazer' : 'Novo afazer'}
        onClose={closeForm}
      >
        <TodoForm
          key={editing?.id ?? 'new'}
          initial={editing}
          tags={tags}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        open={checksTodo !== null}
        title={checksTodo ? `Checks — ${checksTodo.name}` : 'Checks'}
        onClose={() => setChecksTodo(null)}
      >
        {checksTodo && <TodoChecksModal todo={checksTodo} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir afazer"
        description={
          deleting
            ? `Tem certeza que deseja excluir "${deleting.name}"? Os checks dele também serão removidos. Essa ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteInProgress) setDeleting(null);
        }}
      />
    </section>
  );
}

function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ['Ocorreu um erro inesperado.'];
}
