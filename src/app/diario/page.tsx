import { DiaryManager } from '@/components/app/DiaryManager';

export default function DiarioPage() {
  return (
    <DiaryManager
      type="DAILY"
      title="Diário"
      createLabel="Nova entrada"
      todayPendingMessage="Você ainda não escreveu no diário hoje."
    />
  );
}
