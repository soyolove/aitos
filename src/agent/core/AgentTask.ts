export interface AgentTask<TPayload = any> {
  /** 任务唯一ID（由TaskManager创建时自动生成） */
  id: string;

  /**
   * 任务类型，用于区分不同模块或逻辑的任务
   * 例如："CRON_TASK"、"WEBHOOK_TASK" 等
   */
  type: string;
  descrpition: string;

  /**
   * 模块自定义的负载类型
   * 例如 CronTaskPayload, WebhookPayload 等
   */
  payload: TPayload;

  /** 任务创建时间戳 */
  createdAt: number;

  /** 任务状态 */
  status: TaskStatus;

  /** 任务最终结果（如有需要） */
  result?: any;

  // 任务执行时调用的回调函数
  callback?: (payload: TPayload) => any;
}

type TaskStatus = "pending" | "running" | "completed" | "failed";
