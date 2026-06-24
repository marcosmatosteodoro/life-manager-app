import { FlashCardTermsManager } from '@/components/app/FlashCardTermsManager';

export default async function TermosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FlashCardTermsManager groupId={Number(id)} />;
}
