export interface AgentEvent {
  /** 事件类型 (如 "TASK_CREATED", "CREATE_CRON_TASK" 等) */
  type: string;

  /** 事件负载，具体数据由事件类型决定 */
  payload?: any;

  /** EventDescription */
  description: string;

  /** 事件触发的时间戳 */
  timestamp: number;
}
