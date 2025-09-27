import { GoogleGenerativeAI } from '@google/generative-ai';
import { appConfig, BASKET_CONFIGS } from '@/config';
import { AIRecommendation, YieldData, RiskProfile } from '@/types';
import { db } from '@/database/connection';
import { logger } from '@/utils/logger';

export class AIAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(appConfig.ai.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: appConfig.ai.model });
  }

  /**
   * Analyze yield data and recommend the best basket
   */
  public async recommendBasket(
    currentYields: YieldData[],
    historicalYields: YieldData[][],
    userRiskProfile?: RiskProfile
  ): Promise<AIRecommendation> {
    try {
      // Prepare data for AI analysis
      const analysisData = this.prepareAnalysisData(
        currentYields,
        historicalYields
      );

      // Generate AI prompt
      const prompt = this.generatePrompt(analysisData, userRiskProfile);

      // Get AI recommendation
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse AI response
      const recommendation = this.parseAIResponse(text, analysisData);

      // Store recommendation in database
      await this.storeRecommendation(recommendation);

      logger.info(
        `AI recommendation generated: Basket ${recommendation.recommendedBasket} with ${recommendation.confidence}% confidence`
      );

      return recommendation;
    } catch (error) {
      logger.error('Failed to generate AI recommendation', error);
      throw error;
    }
  }

  /**
   * Prepare data for AI analysis
   */
  private prepareAnalysisData(
    currentYields: YieldData[],
    historicalYields: YieldData[][]
  ): any {
    const assetYields = new Map<
      string,
      { current: number; historical: number[] }
    >();

    // Process current yields
    currentYields.forEach((yieldData) => {
      assetYields.set(yieldData.asset, {
        current: yieldData.apr,
        historical: [],
      });
    });

    // Process historical yields
    historicalYields.forEach((dayYields) => {
      dayYields.forEach((yieldData) => {
        const asset = assetYields.get(yieldData.asset);
        if (asset) {
          asset.historical.push(yieldData.apr);
        }
      });
    });

    // Calculate basket yields
    const basketAnalysis = this.calculateBasketYields(assetYields);

    return {
      assetYields: Object.fromEntries(assetYields),
      basketAnalysis,
      marketTrends: this.analyzeMarketTrends(assetYields),
      riskMetrics: this.calculateRiskMetrics(assetYields),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate expected yields for each basket
   */
  private calculateBasketYields(
    assetYields: Map<string, { current: number; historical: number[] }>
  ): any {
    const basketAnalysis: any = {};

    Object.entries(BASKET_CONFIGS).forEach(([basketId, config]) => {
      let weightedYield = 0;
      let totalAllocation = 0;
      const assetDetails: any[] = [];

      config.assets.forEach((asset) => {
        const yieldData = assetYields.get(asset.symbol);
        if (yieldData) {
          const allocation = asset.allocation / 10000; // Convert from basis points
          const contribution = yieldData.current * allocation;
          weightedYield += contribution;
          totalAllocation += allocation;

          assetDetails.push({
            symbol: asset.symbol,
            allocation: asset.allocation,
            currentYield: yieldData.current,
            contribution: contribution,
          });
        }
      });

      // Calculate volatility
      const volatility = this.calculateBasketVolatility(assetDetails);

      basketAnalysis[basketId] = {
        name: config.name,
        riskProfile: config.riskProfile,
        expectedYield: weightedYield,
        volatility,
        assetDetails,
        riskAdjustedYield: weightedYield / (1 + volatility / 100),
      };
    });

    return basketAnalysis;
  }

  /**
   * Calculate basket volatility based on asset correlations and individual volatilities
   */
  private calculateBasketVolatility(assetDetails: any[]): number {
    // Simplified volatility calculation
    // In production, you'd use proper correlation matrices and variance calculations
    let totalVariance = 0;

    assetDetails.forEach((asset) => {
      const allocation = asset.allocation / 10000;
      const volatility = Math.abs(asset.currentYield) * 0.1; // Assume 10% of yield as volatility
      totalVariance += Math.pow(allocation * volatility, 2);
    });

    return Math.sqrt(totalVariance) * 100; // Convert to percentage
  }

  /**
   * Analyze market trends from historical data
   */
  private analyzeMarketTrends(
    assetYields: Map<string, { current: number; historical: number[] }>
  ): any {
    const trends: any = {};

    assetYields.forEach((data, asset) => {
      if (data.historical.length > 1) {
        const first = data.historical[0];
        const last = data.historical[data.historical.length - 1];
        const trend = ((last - first) / first) * 100;

        trends[asset] = {
          trend: trend,
          direction: trend > 0 ? 'upward' : trend < 0 ? 'downward' : 'stable',
          volatility: this.calculateVolatility(data.historical),
        };
      }
    });

    return trends;
  }

  /**
   * Calculate risk metrics
   */
  private calculateRiskMetrics(
    assetYields: Map<string, { current: number; historical: number[] }>
  ): any {
    const metrics: any = {
      overallVolatility: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
    };

    // Calculate overall market volatility
    const allYields: number[] = [];
    assetYields.forEach((data) => {
      allYields.push(...data.historical);
    });

    if (allYields.length > 1) {
      metrics.overallVolatility = this.calculateVolatility(allYields);
      metrics.maxDrawdown = this.calculateMaxDrawdown(allYields);
      metrics.sharpeRatio = this.calculateSharpeRatio(allYields);
    }

    return metrics;
  }

  /**
   * Calculate volatility (standard deviation)
   */
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(values: number[]): number {
    let maxDrawdown = 0;
    let peak = values[0];

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
      } else {
        const drawdown = ((peak - values[i]) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate Sharpe ratio
   */
  private calculateSharpeRatio(values: number[]): number {
    if (values.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < values.length; i++) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }

    const meanReturn =
      returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    const riskFreeRate = 0.05; // 5% annual risk-free rate

    return volatility > 0 ? (meanReturn - riskFreeRate / 252) / volatility : 0;
  }

  /**
   * Generate AI prompt for basket recommendation
   */
  private generatePrompt(
    analysisData: any,
    userRiskProfile?: RiskProfile
  ): string {
    return `
You are an expert DeFi yield optimization AI agent. Analyze the following market data and recommend the best basket allocation for optimal risk-adjusted returns.

MARKET DATA:
${JSON.stringify(analysisData, null, 2)}

BASKET OPTIONS:
1. Conservative (Low Risk): USDC 60%, ETH 20%, BTC 20%
2. Balanced (Medium Risk): ETH 40%, BTC 30%, SOL 20%, LINK 10%
3. Aggressive (High Risk): SOL 40%, AVAX 30%, LINK 20%, MATIC 10%

USER PREFERENCE: ${
      userRiskProfile ? RiskProfile[userRiskProfile] : 'No preference'
    }

REQUIREMENTS:
- Consider current yields, historical performance, and volatility
- Factor in market trends and risk metrics
- Provide confidence score (0-100)
- Explain reasoning clearly
- Recommend the basket with best risk-adjusted returns

RESPONSE FORMAT (JSON only):
{
  "recommendedBasket": 0|1|2,
  "confidence": 0-100,
  "reasoning": "Detailed explanation of recommendation",
  "expectedYield": 0-5000,
  "riskScore": 0-100
}
`;
  }

  /**
   * Parse AI response and create recommendation
   */
  private parseAIResponse(text: string, analysisData: any): AIRecommendation {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and create recommendation
      const recommendation: AIRecommendation = {
        recommendedBasket: this.validateBasketId(parsed.recommendedBasket),
        confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
        reasoning: parsed.reasoning || 'AI analysis completed',
        expectedYield: Math.max(0, Math.min(5000, parsed.expectedYield || 0)),
        riskScore: Math.max(0, Math.min(100, parsed.riskScore || 50)),
        timestamp: new Date(),
      };

      return recommendation;
    } catch (error) {
      logger.error('Failed to parse AI response', { text, error });

      // Fallback recommendation
      return {
        recommendedBasket: RiskProfile.Medium,
        confidence: 30,
        reasoning: 'Fallback recommendation due to AI parsing error',
        expectedYield: 1000,
        riskScore: 50,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate basket ID
   */
  private validateBasketId(basketId: any): RiskProfile {
    const id = parseInt(basketId);
    if (id >= 0 && id <= 2) {
      return id as RiskProfile;
    }
    return RiskProfile.Medium; // Default fallback
  }

  /**
   * Store AI recommendation in database
   */
  private async storeRecommendation(
    recommendation: AIRecommendation
  ): Promise<void> {
    try {
      await db.query(
        `INSERT INTO decisions (recommended_basket, confidence_score, reasoning, expected_yield_basis_points, risk_score, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          recommendation.recommendedBasket,
          recommendation.confidence,
          recommendation.reasoning,
          recommendation.expectedYield,
          recommendation.riskScore,
          recommendation.timestamp,
        ]
      );

      logger.debug('AI recommendation stored in database');
    } catch (error) {
      logger.error('Failed to store AI recommendation', error);
      // Don't throw - this is not critical for the main flow
    }
  }

  /**
   * Get recent AI recommendations from database
   */
  public async getRecentRecommendations(
    limit: number = 10
  ): Promise<AIRecommendation[]> {
    try {
      const result = await db.query(
        `SELECT recommended_basket, confidence_score, reasoning, expected_yield_basis_points, risk_score, timestamp
         FROM decisions 
         ORDER BY timestamp DESC 
         LIMIT $1`,
        [limit]
      );

      return result.rows.map((row: any) => ({
        recommendedBasket: row.recommended_basket,
        confidence: row.confidence_score,
        reasoning: row.reasoning,
        expectedYield: row.expected_yield_basis_points,
        riskScore: row.risk_score,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      logger.error('Failed to get recent recommendations', error);
      return [];
    }
  }
}

export const aiAgent = new AIAgent();
