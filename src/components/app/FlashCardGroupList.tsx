'use client';

import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['flashcards', 'common']);

  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-edge-strong px-4 py-10 text-center text-sm text-fg-muted">
        {t('emptyGroups')}
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
            className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-edge bg-surface px-4 py-3 transition-colors hover:border-edge-strong hover:bg-surface-muted"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">
                {group.name}
              </p>
              <p className="mt-0.5 text-sm text-fg-muted">
                {t('flashcardCount', {
                  count: group.flashCardsCount ?? 0,
                  date: formatDateTime(group.createdAt),
                })}
              </p>
            </div>
            <div className="shrink-0">
              <DropdownMenu
                ariaLabel={t('groupActions', { name: group.name })}
                items={[
                  { label: t('manageTerms'), onClick: () => onManageTerms(group) },
                  { label: t('absorbList'), onClick: () => onAbsorb(group) },
                  { label: t('common:edit'), onClick: () => onEdit(group) },
                  { label: t('common:delete'), onClick: () => onDelete(group), danger: true },
                ]}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
