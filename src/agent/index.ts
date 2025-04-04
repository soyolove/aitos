/**
 * agent/index.ts
 *
 * 定义 Agent 类，整合核心模块：
 * - sensing (事件感知)
 * - taskManager (任务管理)
 * - thinking (思维)
 * - state (状态)
 *
 * 这样就形成“一个Agent实例”，外部可调用其方法，也可将其注入模块中。
 */

import { DefaultSensing, ISensing } from "./core/Sensing";
import { TaskManager } from "./core/TaskManager";
import { DefaultThinking, IThinking } from "./core/Thinking";
import { DefaultState, IState } from "./core/State";

export class Agent {
  // 暴露给外界的核心组件
  public sensing: ISensing; // 事件感知
  public taskManager: TaskManager; // 任务管理
  public thinking: IThinking; // 思维
  public state: IState; // 默认状态

  constructor() {
    // 1. 初始化感知层
    this.sensing = new DefaultSensing();

    // 2. 初始化任务管理 (需要注入sensing, 用于发事件)
    this.taskManager = new TaskManager(this.sensing);

    // 3. 初始化其他默认模块
    this.thinking = new DefaultThinking();
    this.state = new DefaultState();

    this.on();
  }

  on() {
    setInterval(() => {
      // console.log("HEARTBEAT");
      this.sensing.emitEvent({
        type: "HEARTBEAT_EVENT",
        description: "HEARTBEAT",
        payload: {},
        timestamp: Date.now(),
      });
    }, 6000_000);
  }
}
