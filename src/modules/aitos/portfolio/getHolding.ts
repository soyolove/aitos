import { getHolding_apt } from "./apt/holding_apt";

export async function getHolding() {
  return await getHolding_apt();
}

export interface BalanceOnScan {
  coinType: string;
  coinName: string | null;
  coinSymbol: string | null;
  balance: number;
  balanceUsd: number | null;
  decimals: number | null;
  coinPrice: number | null;
}
