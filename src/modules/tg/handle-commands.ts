// src/modules/telegram/insight-commands.ts
import { TelegramBotManager } from "./bot_manager";
import {
  insightInstructTable,
  defiInsightTable,
  insightStateTable,
} from "@/db/schema";
import { db } from "@/db";
import { desc } from "drizzle-orm";
import { storeMessageRecord } from "./throw_insight";
export function registerInsightCommands(botManager: TelegramBotManager) {
  // Command to get the latest instruct insight
  botManager.registerCommand({
    command: "market_insight",
    description: "Get the latest market insight",
    handler: async (msg) => {
      try {
        const latestInstruct = await db
          .select()
          .from(insightStateTable)
          .orderBy(desc(insightStateTable.timestamp))
          .limit(1);

        if (latestInstruct.length === 0) {
          await botManager.bot!.sendMessage(
            msg.chat.id,
            "No market insights available."
          );
          return;
        }

        const insight = latestInstruct[0];
        const formattedDate = new Date(insight.timestamp).toLocaleString();

        const response =
          `📊 *Latest Market Insight*\n\n` +
          `*Timestamp:* ${formattedDate}\n\n` +
          `${insight.insight}`;

        await botManager.bot!.sendMessage(msg.chat.id, response, {
          parse_mode: "Markdown",
        });
        storeMessageRecord({ content: response });
      } catch (error) {
        console.error("[Telegram] Error fetching market insight:", error);

        if (error instanceof Error) {
          await botManager.bot!.sendMessage(
            msg.chat.id,
            `Error fetching market insight: ${error.message}`
          );
        } else {
          await botManager.bot!.sendMessage(
            msg.chat.id,
            "Error fetching market insight: An unknown error occurred."
          );
        }
      }
    },
  });
}
