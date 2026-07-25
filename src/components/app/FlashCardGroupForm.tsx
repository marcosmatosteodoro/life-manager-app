'use client';

import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import type {
  FlashCardGroup,
  FlashCardGroupType,
} from '@/services/flashCardGroup.types';

interface FlashCardGroupFormProps {
  initial?: FlashCardGroup | null;
  submitting: boolean;
  onSubmit: (input: { name: string; type: FlashCardGroupType }) => void;
  onCancel: () => void;
}

/** Sugestão de nome: data de hoje com o mês por extenso no idioma (ex.: 21-julho-2026). */
function suggestedName(language: string): string {
  const now = new Date();
  const month = new Intl.DateTimeFormat(language, { month: 'long' }).format(now);
  return `${now.getDate()}-${month}-${now.getFullYear()}`;
}

export function FlashCardGroupForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: FlashCardGroupFormProps) {
  const { i18n } = useTranslation();
  // Ao criar, pré-preenche com a data de hoje (editável); ao editar, mantém o nome.
  const [name, setName] = useState(
    initial?.name ?? suggestedName(i18n.language),
  );
  // Tipo só é escolhido na criação; ao editar, mantém o do grupo.
  const [type, setType] = useState<FlashCardGroupType>(initial?.type ?? 'text');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ name: name.trim(), type });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome do grupo" htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Phrasal Verbs"
          className={inputClass}
        />
      </Field>
      {!initial && (
        <Field label="Tipo dos cards" htmlFor="group-type">
          <select
            id="group-type"
            value={type}
            onChange={(e) => setType(e.target.value as FlashCardGroupType)}
            className={inputClass}
          >
            <option value="text">Texto</option>
            <option value="image">Imagem</option>
          </select>
        </Field>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : initial ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
