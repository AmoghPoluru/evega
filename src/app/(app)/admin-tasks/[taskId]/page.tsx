import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ taskId: string }>;
}

export default async function LegacyAdminTaskDetailPage({ params }: Props) {
  const { taskId } = await params;
  redirect(`/staff/tasks/${taskId}`);
}
