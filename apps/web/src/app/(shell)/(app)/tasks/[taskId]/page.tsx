import type { Metadata } from "next";

import { TaskScreen } from "@/components/tasks/task-screen";

export const metadata: Metadata = { title: "Review" };

const TaskPage = async ({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) => {
  const { taskId } = await params;

  return <TaskScreen taskId={taskId} />;
};

export default TaskPage;
