import axios, { AxiosError } from "axios";
import { CMC_TOKEN_RATE_ANALYSIS } from "../config/cmc/type";
const BASE_URL =
  "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical";
// const intervals = ["1h", "4h", "12h", "1d", "2d", "3d", "7d", "15d", "30d"];

type Interval = "1h" | "1d" | "3d" | "7d" | "30d";

const intervals: Interval[] = ["1h", "1d", "3d", "7d", "30d"];

const currentSpot = "5m";

type PairInfo = {
  pair: string;
} & Record<Interval, { value: number; change: number }>;

export async function getHistoricalData({
  id,
  interval,
  retries = 3,
  name,
}: {
  id: string;
  interval: string;
  retries?: number;
  name?: string;
}) {
  const params = {
    id: id,
    convert: "USD",
    interval: interval,
    count: 2,
  };

  const config = {
    headers: {
      "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY!,
      Accept: "application/json",
    },
  };

  try {
    const response = await axios.get(BASE_URL, { params, ...config });
    const data = response.data.data;

    // 检查 data 是否存在
    if (!data) {
      console.error("response.data.data is undefined or null:", response.data);
      throw new Error("No data found in response");
    }

    // 检查 quotes 是否存在且不为空
    if (!data.quotes || data.quotes.length === 0) {
      console.error("quotes is missing or empty in response.data.data:", data);
      throw new Error("No quotes found in data");
    }

    // 检查 quote 是否存在
    if (!data.quotes[0].quote) {
      console.error("quote is missing in quotes[0]:", data.quotes[0]);
      throw new Error("No quote found in quotes[0]");
    }

    console.log(
      `Fetched historical data for ${name || id} (${interval}) price is ${
        data.quotes[0].quote.USD.price
      }`
    );
    // 返回价格
    return data.quotes[0].quote.USD.price as number;
  } catch (error: unknown) {
    if (
      error instanceof AxiosError &&
      error.response &&
      error.response.status === 429 &&
      retries > 0
    ) {
      console.warn(`Received 429, retrying... (${retries} retries left)`);
      const retryAfter = error.response.headers["retry-after"] || 1;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 20000));
      return getHistoricalData({ id, interval, retries: retries - 1, name });
    }

    // 打印详细错误信息
    if (error instanceof AxiosError && error.response) {
      console.error("API response error, response.data:", error.response.data);
    } else {
      console.error("Error fetching historical data:", error);
    }
  }
}

const calculateRatio = (priceA: number, priceB: number): number => {
  return priceA / priceB;
};

const calculateChangePercentage = (
  newValue: number,
  oldValue: number
): string => {
  const change = ((newValue - oldValue) / oldValue) * 100;
  return change.toFixed(2) + "%";
};

export class InvestmentState {
  private state: Map<string, any> = new Map(); // key: `asset-time`, value: price

  setPrice(asset: string, interval: string, price: number) {
    const key = `${asset}-${interval}`;
    this.state.set(key, price);
  }

  getPrice(asset: string, interval: string): number | undefined {
    return this.state.get(`${asset}-${interval}`);
  }

  getCurrentPrice(asset: string): number | undefined {
    return this.state.get(`${asset}-${currentSpot}`);
  }

  // Function to calculate ratio between two assets
  getRatio(
    assetA: string,
    assetB: string,
    interval: string
  ): number | undefined {
    const priceA = this.getPrice(assetA, interval);
    const priceB = this.getPrice(assetB, interval);
    if (priceA && priceB) {
      return calculateRatio(priceA, priceB);
    }
    return undefined;
  }

  // 统一的比值计算函数
  private generatePairInfo(assetA: string, assetB: string): PairInfo {
    const pairName = `${assetA}/${assetB}`;
    const pairInfo: PairInfo = {
      pair: pairName,
      "1h": { value: 0, change: 0 },
      "1d": { value: 0, change: 0 },
      "3d": { value: 0, change: 0 },
      "7d": { value: 0, change: 0 },
      "30d": { value: 0, change: 0 },
    };

    const currentRatio = this.getRatio(assetA, assetB, currentSpot);

    intervals.forEach((interval) => {
      const oldRatio = this.getRatio(assetA, assetB, interval) || 0;
      let changeVal = 0;

      if (currentRatio && oldRatio) {
        const changeStr = calculateChangePercentage(currentRatio, oldRatio);
        changeVal = parseFloat(changeStr.replace("%", ""));
      }

      (pairInfo as any)[interval] = {
        value: oldRatio,
        change: changeVal,
      };
    });

    return pairInfo;
  }

  generateRate(ratePairs: CMC_TOKEN_RATE_ANALYSIS[]) {
    const insightMap: { [key: string]: string[] } = {};
    const marketData: PairInfo[] = [];

    ratePairs.forEach(({ assetA, assetB, A_on_B_introduction }) => {
      const pairName = `${assetA.symbol}/${assetB.symbol}`;
      insightMap[pairName] = [];
      const pairInfo = this.generatePairInfo(assetA.symbol, assetB.symbol);
      marketData.push(pairInfo);
      intervals.forEach((interval) => {
        const changeStr = pairInfo[interval].change.toFixed(2) + "%";
        insightMap[pairName].push(`${interval} ${changeStr}`);
      });
    });

    const formattedString = Object.keys(insightMap)
      .map((pair) => `${pair} rate: ${insightMap[pair].join(", ")}`)
      .join("\n");

    return {
      formattedString,
      marketData,
    };
  }
}
