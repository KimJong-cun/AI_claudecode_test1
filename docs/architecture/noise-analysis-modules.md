# 噪声滤波和热噪声分析模块

## 1. 信号处理算法模块

### 1.1 快速傅里叶变换 (FFT)
```typescript
// backend/src/algorithms/signal-processing/fft.ts
export class FFTProcessor {
  // 计算功率谱密度
  static computePowerSpectralDensity(data: number[], sampleRate: number): FrequencySpectrum
  
  // 频域滤波
  static frequencyDomainFilter(spectrum: FrequencySpectrum, filterConfig: FilterConfig): FrequencySpectrum
  
  // IFFT逆变换
  static inverseFFT(spectrum: FrequencySpectrum): number[]
}

interface FrequencySpectrum {
  frequencies: number[]      // 频率轴
  magnitudes: number[]       // 幅度谱
  phases: number[]          // 相位谱
  powerSpectralDensity: number[]  // 功率谱密度
}
```

### 1.2 数字滤波器
```typescript
// backend/src/algorithms/signal-processing/filters.ts
export class DigitalFilters {
  // 低通滤波器（去除高频噪声）
  static lowPassFilter(data: number[], cutoffFreq: number, sampleRate: number): number[]
  
  // 高通滤波器（去除低频漂移）
  static highPassFilter(data: number[], cutoffFreq: number, sampleRate: number): number[]
  
  // 带通滤波器（保留特定频段）
  static bandPassFilter(data: number[], lowFreq: number, highFreq: number, sampleRate: number): number[]
  
  // 带阻滤波器（去除特定频段噪声）
  static bandStopFilter(data: number[], centerFreq: number, bandwidth: number, sampleRate: number): number[]
  
  // 巴特沃斯滤波器
  static butterworthFilter(data: number[], order: number, cutoffFreq: number, filterType: 'lowpass' | 'highpass'): number[]
}
```

## 2. 专用噪声滤波器

### 2.1 工频干扰滤波器 (50Hz)
```typescript
// backend/src/algorithms/noise-filters/line-filter.ts
export class LineFrequencyFilter {
  private readonly LINE_FREQUENCY = 50; // 50Hz工频
  private readonly HARMONICS = [50, 100, 150, 200, 250]; // 谐波频率
  
  // 自适应陷波器去除工频干扰
  static removeLineNoise(data: number[], sampleRate: number): {
    filteredData: number[]
    removedNoise: number[]
    attenuationDb: number
  }
  
  // 检测工频干扰强度
  static detectLineNoiseLevel(data: number[], sampleRate: number): {
    fundamentalPower: number    // 基频功率
    harmonicsPower: number[]   // 各次谐波功率
    totalLinePower: number     // 总工频功率
  }
}
```

### 2.2 开关电源纹波滤波器
```typescript
// backend/src/algorithms/noise-filters/switching-filter.ts
export class SwitchingNoiseFilter {
  // 检测开关频率
  static detectSwitchingFrequency(data: number[], sampleRate: number): {
    primaryFreq: number        // 主开关频率
    harmonics: number[]        // 谐波频率
    confidence: number         // 检测置信度
  }
  
  // 去除开关纹波
  static removeSwitchingNoise(data: number[], sampleRate: number, switchingFreq?: number): {
    filteredData: number[]
    removedNoise: number[]
    noiseReduction: number     // 噪声抑制比
  }
}
```

### 2.3 自适应滤波器
```typescript
// backend/src/algorithms/noise-filters/adaptive-filter.ts
export class AdaptiveFilter {
  // LMS自适应滤波器
  static lmsAdaptiveFilter(data: number[], reference: number[], stepSize: number): {
    filteredData: number[]
    filterWeights: number[]
    convergenceError: number[]
  }
  
  // 维纳滤波器
  static wienerFilter(data: number[], noiseVariance: number): number[]
  
  // 卡尔曼滤波器
  static kalmanFilter(data: number[], processNoise: number, measurementNoise: number): number[]
}
```

## 3. 热噪声分析模块

### 3.1 约翰逊-奈奎斯特噪声计算
```typescript
// backend/src/algorithms/thermal-noise/johnson-nyquist.ts
export class JohnsonNyquistNoise {
  private static readonly BOLTZMANN_CONSTANT = 1.380649e-23; // 玻尔兹曼常数
  
  // 计算理论热噪声功率
  static calculateTheoreticalNoisePower(
    temperature: number,        // 温度(K)
    resistance: number,         // 电阻值(Ω)  
    bandwidth: number          // 带宽(Hz)
  ): number {
    // V²(rms) = 4kTRΔf
    return 4 * this.BOLTZMANN_CONSTANT * temperature * resistance * bandwidth;
  }
  
  // 从实测数据提取热噪声
  static extractThermalNoise(
    voltageData: number[],
    temperatureData: number[],
    resistanceData: number[],
    sampleRate: number
  ): ThermalNoiseAnalysis
}

interface ThermalNoiseAnalysis {
  measuredNoisePower: number     // 实测噪声功率
  theoreticalNoisePower: number  // 理论噪声功率
  thermalNoiseCoefficient: number // 热噪声系数
  temperatureDependency: {
    correlation: number          // 温度相关系数
    slope: number               // 温度斜率
  }
  frequencyResponse: {
    frequencies: number[]
    noiseDensity: number[]      // 噪声功率谱密度
  }
}
```

### 3.2 温度系数计算
```typescript
// backend/src/algorithms/thermal-noise/temperature-calc.ts
export class TemperatureCalculator {
  // 计算电阻温度系数
  static calculateTemperatureCoefficient(
    resistanceData: number[],
    temperatureData: number[]
  ): {
    tcr: number                 // 温度系数 (ppm/°C)
    referenceTemp: number       // 参考温度
    referenceResistance: number // 参考电阻
    rSquared: number           // 拟合度
  }
  
  // 温度补偿
  static temperatureCompensation(
    data: number[],
    temperature: number[],
    tcr: number
  ): number[]
}
```

### 3.3 数据质量评分
```typescript
// backend/src/algorithms/thermal-noise/quality-score.ts
export class DataQualityScorer {
  static calculateQualityScore(
    originalData: number[],
    filteredData: number[],
    analysis: ThermalNoiseAnalysis
  ): QualityScore
}

interface QualityScore {
  overallScore: number          // 总评分 (0-100)
  components: {
    signalToNoise: number       // 信噪比评分
    dataStability: number       // 数据稳定性评分  
    thermalAccuracy: number     // 热噪声计算准确性
    temperatureConsistency: number // 温度一致性
    filterEffectiveness: number // 滤波效果评分
  }
  recommendations: string[]     // 改进建议
  confidence: number           // 评分置信度
}
```

## 4. AI智能分析模块

### 4.1 噪声源识别
```typescript
// backend/src/algorithms/ai-analysis/noise-classification.ts
export class NoiseClassifier {
  // 使用机器学习识别噪声类型
  static classifyNoiseTypes(spectrum: FrequencySpectrum): NoiseClassification[]
  
  // 异常噪声检测
  static detectAnomalousNoise(data: number[], historicalData: number[][]): AnomalyDetection
}

interface NoiseClassification {
  type: 'thermal' | 'line_frequency' | 'switching' | 'shot' | 'flicker' | 'unknown'
  confidence: number
  frequencyRange: [number, number]
  characteristics: string[]
}
```

### 4.2 智能滤波建议
```typescript
// backend/src/algorithms/ai-analysis/filter-recommendation.ts
export class FilterRecommendationEngine {
  // 基于噪声分析推荐最优滤波策略
  static recommendFilters(
    noiseClassification: NoiseClassification[],
    dataCharacteristics: DataCharacteristics
  ): FilterRecommendation[]
}

interface FilterRecommendation {
  filterType: string
  parameters: FilterParameters
  expectedImprovement: number    // 预期改善程度
  priority: 'high' | 'medium' | 'low'
  reasoning: string             // 推荐理由
}
```

## 5. 实时处理流水线

### 5.1 数据流处理
```typescript
// backend/src/services/realtime-processor.ts
export class RealTimeDataProcessor {
  private bufferSize = 4096;
  private analysisWindow = 1024;
  
  // 实时数据处理流水线
  async processRealTimeData(dataPoint: RealTimeDataPoint): Promise<ProcessedResult> {
    // 1. 数据缓存
    this.addToBuffer(dataPoint);
    
    // 2. 滑动窗口分析
    if (this.bufferFull()) {
      const windowData = this.getAnalysisWindow();
      
      // 3. 实时滤波
      const filteredData = await this.applyRealTimeFilters(windowData);
      
      // 4. 快速噪声分析
      const quickAnalysis = await this.quickNoiseAnalysis(filteredData);
      
      // 5. 质量评估
      const qualityCheck = this.quickQualityCheck(quickAnalysis);
      
      return {
        filteredData,
        quickAnalysis,
        qualityScore: qualityCheck.score,
        alerts: qualityCheck.alerts
      };
    }
  }
}
```

## 6. 用户自定义噪声源

### 6.1 噪声源模板系统
```typescript
// backend/src/services/noise-template.service.ts
export class NoiseTemplateService {
  // 创建自定义噪声源模板
  async createNoiseTemplate(template: NoiseSourceTemplate): Promise<string>
  
  // 应用噪声源模板进行滤波
  async applyNoiseTemplate(data: number[], templateId: string): Promise<FilterResult>
}

interface NoiseSourceTemplate {
  name: string
  description: string
  noiseCharacteristics: {
    frequencyRange: [number, number]
    powerLevel: number
    pattern: 'periodic' | 'random' | 'burst'
  }
  filterStrategy: {
    method: 'notch' | 'adaptive' | 'wiener' | 'custom'
    parameters: Record<string, any>
  }
  effectiveness: number         // 历史效果评估
}
```