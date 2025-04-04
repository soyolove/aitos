import { getProvider, getModel } from "@/utils/ai";
import { z } from "zod";
import { generateText, tool } from "ai";
import { db } from "@/db";
import { actionStateTable } from "@/db/schema";
import { TokenOnTargetPortfolio, adjustPortfolio } from "./core";
import { getHolding } from "./getHolding";
import { TOKEN_USE } from "../config/chain-config";
import { select_portfolio } from "../config/portfolio";

import { getNewestTradingInstruct } from "@/db/getInstruct";
import { getTradingPrompt } from "../config/prompt";
const select = "qwen";
const provider = getProvider({ provider: select });
const model = getModel({ inputModel: "large", provider: select });
const token_portfolio = select_portfolio;

function createPortfolioSchema(tokens: TOKEN_USE[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    thinking: z.string().describe("The reason for the portfolio adjustment"),
  };

  tokens.forEach((token) => {
    const fieldName = `${token.coinSymbol.toLowerCase()}_weight`;

    schemaFields[fieldName] = z
      .number()
      .min(0)
      .max(100)
      .describe(`The weight of ${token.coinSymbol} holding in the portfolio`);
  });

  return z.object(schemaFields);
}

const portfolioParams = createPortfolioSchema(token_portfolio);

function extractWeightsFromResult(
  result: z.infer<typeof portfolioParams>
): TokenOnTargetPortfolio[] {
  return token_portfolio.map((token) => {
    const weightKey =
      `${token.coinSymbol.toLowerCase()}_weight` as keyof typeof result;
    return {
      coinType: token.coinType,
      targetPercentage: result[weightKey] as number,
      coinSymbol: token.coinSymbol,
    };
  });
}

export async function adjustPortfolio_by_AI({
  current_holding,
  insight,
}: {
  current_holding: string;
  insight: string;
}) {
  try {
    const { validPortfolio } = await getHolding();
    const preference_instruct = await getNewestTradingInstruct();

    const systemPrompt = getTradingPrompt({
      current_holding: validPortfolio,
      token_portfolio: token_portfolio,
      preference_instruct: preference_instruct,
    });

    const { text, toolResults } = await generateText({
      model: provider(model),
      toolChoice: "required",
      tools: {
        adjust_portfolio: tool({
          description:
            "This tool is used to adjust the portfolio. You can adjust weight of Aptos holding to adjust the portfolio. Notice that the sum of all weights should be 100.",
          parameters: portfolioParams,
          execute: async (result) => {
            const { thinking } = result;

            const target_portfolio = extractWeightsFromResult(result);

            try {
              console.log(`-- Adjust portfolio --`);

              console.log(`Thinking:`, thinking);
              console.log(`Target portfolio:`, target_portfolio);

              adjustPortfolio({ targetPortfolio: target_portfolio })
                .then(() => {
                  db.insert(actionStateTable)
                    .values({
                      action: `adjust_portfolio: ${target_portfolio.map(
                        (token) => {
                          const parts = token.coinType.split("::");
                          const tokenName = parts[parts.length - 1];
                          return `${tokenName}:${token.targetPercentage}%\n`;
                        }
                      )}`,
                      reason: thinking,
                      details: {
                        target_portfolio: target_portfolio,
                      },
                    })
                    .then(() => {
                      console.log(`Save portfolio action in DB successfully`);
                    });
                })
                .catch((e) => {
                  console.log(`Error in adjustToTargetProportion`);
                  console.log(e);
                });

              return {
                status: "success",
                target: target_portfolio,
              };
            } catch (e) {
              console.log("Error in adjust_portfolio tool");
              console.log(e);
            }
          },
        }),
      },

      maxSteps: 1,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `The market insight is \n${insight}`,
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
}
