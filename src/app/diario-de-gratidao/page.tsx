import { DiaryManager } from '@/components/app/DiaryManager';

export default function DiarioDeGratidaoPage() {
  return (
    <DiaryManager
      type="GRATITUDE"
      title="Diário de Gratidão"
      createLabel="Nova gratidão"
      todayPendingMessage="Você ainda não registrou sua gratidão hoje."
    />
  );
}
