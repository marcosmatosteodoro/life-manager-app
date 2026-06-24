'use client';

import { DropdownMenu } from '@/components/ui/DropdownMenu';
import type { FlashCardGroup } from '@/services/flashCardGroup.types';
import { formatDateTime } from '@/utils/date';

interface FlashCardGroupListProps {
  groups: FlashCardGroup[];
  onOpen: (group: FlashCardGroup) => void;
  onManageTerms: (group: FlashCardGroup) => void;
  onAbsorb: (group: FlashCardGroup) => void;
  onEdit: (group: FlashCardGroup) => void;
  onDelete: (group: FlashCardGroup) => void;
}

export function FlashCardGroupList({
  groups,
  onOpen,
  onManageTerms,
  onAbsorb,
  onEdit,
  onDelete,
}: FlashCardGroupListProps) {
  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        Nenhum grupo criado ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {groups.map((group) => (
        <li key={group.id}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(group)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(group);
              }
            }}
            className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900">
                {group.name}
              </p>
              <p className="mt-0.5 text-sm text-neutral-500">
                {group.flashCardsCount ?? 0} flashcard
                {(group.flashCardsCount ?? 0) === 1 ? '' : 's'} · criado em{' '}
                {formatDateTime(group.createdAt)}
              </p>
            </div>
            <div className="shrink-0">
              <DropdownMenu
                ariaLabel={`Ações de ${group.name}`}
                items={[
                  { label: 'Gerenciar termos', onClick: () => onManageTerms(group) },
                  { label: 'Absorver lista', onClick: () => onAbsorb(group) },
                  { label: 'Editar', onClick: () => onEdit(group) },
                  { label: 'Excluir', onClick: () => onDelete(group), danger: true },
                ]}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
