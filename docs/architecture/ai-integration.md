# AI服务集成架构（端口化设计）

## 可插拔AI服务接口设计
```typescript
// AI服务抽象接口 - 支持多种实现
interface AIAnalysisService {
  analyzeData(data: DataPoint[]): Promise<AnalysisResult>
  detectAnomalies(data: DataPoint[]): Promise<Anomaly[]>
  generateInsights(stats: BasicStatistics): Promise<Insight[]>
  isAvailable(): Promise<boolean>
}

// 模拟AI服务实现（开发阶段使用）
class MockAIService implements AIAnalysisService {
  async analyzeData(data: DataPoint[]): Promise<AnalysisResult> {
    // 基于统计规则的模拟分析
    return {
      trends: this.detectTrends(data),
      correlations: this.findCorrelations(data),
      patterns: this.identifyPatterns(data)
    }
  }

  async detectAnomalies(data: DataPoint[]): Promise<Anomaly[]> {
    // 使用IQR方法检测异常值
    return this.calculateOutliers(data)
  }

  async generateInsights(stats: BasicStatistics): Promise<Insight[]> {
    // 基于模板的洞察生成
    return this.generateTemplateInsights(stats)
  }

  async isAvailable(): Promise<boolean> {
    return true // 模拟服务始终可用
  }
}

// 真实AI服务实现（待集成）
class ExternalAIService implements AIAnalysisService {
  constructor(private config: {
    apiKey: string
    endpoint: string
    provider: 'baidu' | 'aliyun' | 'tencent'
  }) {}

  async analyzeData(data: DataPoint[]): Promise<AnalysisResult> {
    if (!this.config.apiKey) {
      throw new Error('AI service not configured')
    }
    // 真实API调用逻辑
    return await this.callExternalAPI('/analyze', data)
  }

  async isAvailable(): Promise<boolean> {
    return !!this.config.apiKey && await this.pingService()
  }
}

// AI服务工厂
class AIServiceFactory {
  static create(): AIAnalysisService {
    const apiKey = process.env.AI_API_KEY
    const provider = process.env.AI_PROVIDER
    
    if (apiKey && provider) {
      return new ExternalAIService({
        apiKey,
        endpoint: this.getEndpoint(provider),
        provider: provider as any
      })
    }
    
    // 回退到模拟服务
    console.log('Using mock AI service for development')
    return new MockAIService()
  }
}
```

## 分析流程设计（支持AI服务切换）
```typescript
// 分析任务处理流程
class AnalysisProcessor {
  private aiService: AIAnalysisService

  constructor() {
    this.aiService = AIServiceFactory.create()
  }

  async processFile(fileId: string): Promise<AnalysisResult> {
    // 1. 文件解析
    const data = await this.parseFile(fileId)
    
    // 2. 数据预处理
    const cleanData = await this.preprocessData(data)
    
    // 3. 基础统计分析（始终可用）
    const basicStats = await this.calculateBasicStats(cleanData)
    
    // 4. AI分析（可插拔）
    let aiInsights: Insight[] = []
    if (await this.aiService.isAvailable()) {
      try {
        aiInsights = await this.aiService.generateInsights(basicStats)
      } catch (error) {
        console.log('AI analysis failed, using basic insights')
        aiInsights = this.generateBasicInsights(basicStats)
      }
    } else {
      aiInsights = this.generateBasicInsights(basicStats)
    }
    
    // 5. 图表配置生成
    const chartsConfig = await this.generateCharts(cleanData, basicStats)
    
    // 6. 报告生成
    const report = await this.generateReport(basicStats, aiInsights)
    
    return {
      basicStats,
      insights: aiInsights,
      chartsConfig,
      report,
      aiEnabled: await this.aiService.isAvailable()
    }
  }

  // 基础洞察生成（不依赖外部AI）
  private generateBasicInsights(stats: BasicStatistics): Insight[] {
    const insights: Insight[] = []
    
    // 基于统计数据的模板化洞察
    if (stats.trend === 'increasing') {
      insights.push({
        type: 'trend',
        message: '数据呈现上升趋势',
        confidence: 0.8
      })
    }
    
    // 更多基础洞察逻辑...
    return insights
  }
}
```

## 环境配置
```typescript
// 环境变量配置
interface EnvironmentConfig {
  // AI服务配置（可选）
  AI_API_KEY?: string
  AI_PROVIDER?: 'baidu' | 'aliyun' | 'tencent'
  AI_ENDPOINT?: string
  
  // 开发模式配置
  MOCK_AI_ENABLED?: boolean
  AI_TIMEOUT?: number
}

// 配置验证
class ConfigValidator {
  static validateAIConfig(): {
    hasAI: boolean
    provider?: string
    warnings: string[]
  } {
    const warnings: string[] = []
    const apiKey = process.env.AI_API_KEY
    const provider = process.env.AI_PROVIDER
    
    if (!apiKey) {
      warnings.push('AI_API_KEY not configured, using mock AI service')
    }
    
    if (!provider) {
      warnings.push('AI_PROVIDER not specified, defaulting to mock')
    }
    
    return {
      hasAI: !!(apiKey && provider),
      provider,
      warnings
    }
  }
}
```