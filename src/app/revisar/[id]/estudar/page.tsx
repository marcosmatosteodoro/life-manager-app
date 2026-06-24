import { FlashCardStudy } from '@/components/app/FlashCardStudy';

export default async function EstudarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FlashCardStudy groupId={Number(id)} />;
}
