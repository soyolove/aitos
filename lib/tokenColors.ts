// src/lib/tokenColors.ts

// Define a consistent color palette for tokens
const COLORS: readonly string[] = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#14B8A6", // Teal
    "#F43F5E", // Rose
    "#84CC16", // Lime
    "#06B6D4", // Cyan
  ] as const;
  
  // Common tokens with fixed colors
  const TOKEN_FIXED_COLORS: Record<string, string> = {
    BTC: "#F7931A", // Bitcoin orange
    ETH: "#627EEA", // Ethereum blue
    USDC: "#2775CA", // USDC blue
    USDT: "#26A17B", // Tether green
    SOL: "#14F195", // Solana green
    SUI: "#6FBCF0", // Sui blue
    DEEP: "#8B5CF6", // Purple
    CETUS: "#EC4899", // Pink
    NAVX: "#F59E0B", // Amber
    SEND: "#10B981", // Green
    NS: "#14B8A6", // Teal
    APT: "#09ACF4", // Aptos blue
    AMI: "#FF5733", // AMI orange-red
    PROPS: "#7C3AED", // Purple-violet
    THL: "#059669", // Emerald green
    // Add more fixed mappings as needed
  };
  
  // Keep a map of dynamically assigned colors to ensure consistency
  const tokenColorMap = new Map<string, string>();
  let colorIndex = 0;
  
  /**
   * Get a consistent color for a token symbol
   * @param tokenSymbol - The token symbol (e.g., "BTC", "ETH")
   * @returns Hex color code
   */
  export const getTokenColor = (tokenSymbol: string): string => {
    // Normalize token symbol to uppercase for consistency
    const normalizedSymbol = tokenSymbol.toUpperCase();
  
    // Return fixed color if defined
    if (TOKEN_FIXED_COLORS[normalizedSymbol]) {
      return TOKEN_FIXED_COLORS[normalizedSymbol];
    }
  
    // Return previously assigned color if exists
    if (tokenColorMap.has(normalizedSymbol)) {
      return tokenColorMap.get(normalizedSymbol)!;
    }
  
    // Assign a new color
    const color = COLORS[colorIndex % COLORS.length];
    tokenColorMap.set(normalizedSymbol, color);
    colorIndex++;
  
    return color;
  };
  
  /**
   * Assigns colors to all tokens in an array
   * @param tokens - Array of objects containing a token symbol property
   * @param symbolKey - The property name for the token symbol (default: "token")
   * @returns The original array with color properties added
   */
  export const assignTokenColors = <T extends Record<string, unknown>>(
    tokens: T[],
    symbolKey: string = "token"
  ): (T & { color: string })[] => {
    return tokens.map((item) => ({
      ...item,
      color: getTokenColor(String(item[symbolKey])),
    }));
  };
  
  /**
   * Get color for "Others" category
   * @returns Light slate color
   */
  export const getOthersColor = (): string => "#CBD5E1";