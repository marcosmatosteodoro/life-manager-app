'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { dialog } from '@/hooks/useDialogStore';
import { toast } from '@/hooks/useToastStore';
import type { ProblemCategory } from '@/services/problem.types';
import { ApiError, problemCategoryService } from '@/services/problemService';

const DEFAULT_COLOR = '#3b82f6';

interface ProblemCategoryManagerProps {
  categories: ProblemCategory[];
  /** Chamado após criar/editar/excluir para o pai recarregar a lista. */
  onChanged: () => void;
}

/** Gestão das categorias (nome + cor): criar, editar e excluir. */
export function ProblemCategoryManager({
  categories,
  onChanged,
}: ProblemCategoryManagerProps) {
  const { t } = useTranslation(['problems', 'common']);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(null);
    setName('');
    setColor(DEFAULT_COLOR);
  }

  function startEdit(category: ProblemCategory) {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const input = { name: name.trim(), color };
      if (editingId != null) {
        await problemCategoryService.update(editingId, input);
        toast.success(t('categories.updated'));
      } else {
        await problemCategoryService.create(input);
        toast.success(t('categories.created'));
      }
      resetForm();
      onChanged();
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: ProblemCategory) {
    const ok = await dialog.confirm({
      title: t('common:delete'),
      description: t('categories.confirmDelete', { name: category.name }),
      confirmLabel: t('common:delete'),
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await problemCategoryService.remove(category.id);
      toast.success(t('categories.deleted'));
      if (editingId === category.id) resetForm();
      onChanged();
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('common:unexpectedError')],
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-edge-strong px-4 py-6 text-center text-sm text-fg-muted">
          {t('categories.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-2 rounded-md border border-edge px-3 py-2"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-edge"
                style={{ backgroundColor: category.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-sm text-fg">
                {category.name}
              </span>
              <Button variant="ghost" onClick={() => startEdit(category)}>
                {t('common:edit')}
              </Button>
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => void handleDelete(category)}
              >
                {t('common:delete')}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 border-t border-edge pt-4"
      >
        <h3 className="text-sm font-semibold text-fg">
          {editingId != null
            ? t('categories.editTitle')
            : t('categories.newTitle')}
        </h3>
        <div className="flex items-end gap-2">
          <input
            type="color"
            aria-label={t('categories.color')}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-12 shrink-0 cursor-pointer rounded border border-edge bg-transparent"
          />
          <div className="min-w-0 flex-1">
            <Field label={t('categories.name')} htmlFor="category-name">
              <input
                id="category-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('categories.namePlaceholder')}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving
              ? t('common:saving')
              : editingId != null
                ? t('common:save')
                : t('common:add')}
          </Button>
          {editingId != null && (
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={saving}
            >
              {t('common:cancel')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
