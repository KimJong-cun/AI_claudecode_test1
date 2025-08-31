# 详细技术方案

## 1. 前端架构

### 技术选型
```json
{
  "framework": "React 18.x",
  "language": "TypeScript 5.x", 
  "ui_library": "Ant Design 5.x",
  "state_management": "Redux Toolkit",
  "routing": "React Router 6.x",
  "charts": "ECharts 5.x + Chart.js",
  "realtime": "Socket.io-client",
  "scientific_computing": "ml-matrix + fft.js",
  "http_client": "Axios",
  "build_tool": "Vite",
  "testing": "Jest + React Testing Library"
}
```

### 项目结构
```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico  
├── src/
│   ├── components/          # 通用组件
│   │   ├── common/         # 基础组件
│   │   ├── charts/         # 图表组件(波形、频谱、噪声分析)
│   │   ├── realtime/       # 实时数据显示组件
│   │   ├── noise-analysis/ # 噪声分析专用组件
│   │   └── upload/         # 上传组件
│   ├── pages/              # 页面组件
│   │   ├── Home/
│   │   ├── RealTimeMonitor/   # 实时监测页面
│   │   ├── NoiseAnalysis/     # 噪声分析页面  
│   │   ├── DataUpload/        # 数据上传页面
│   │   └── Dashboard/         # 综合仪表板
│   ├── hooks/              # 自定义Hook
│   │   ├── useSerialData.ts   # 串口数据Hook
│   │   ├── useNoiseFilter.ts  # 噪声滤波Hook
│   │   └── useRealtime.ts     # 实时数据Hook
│   ├── services/           # API服务
│   │   ├── serialService.ts   # 串口通信服务
│   │   ├── noiseService.ts    # 噪声分析服务
│   │   └── analysisService.ts # 数据分析服务
│   ├── utils/              # 工具函数
│   │   ├── signal-processing/ # 信号处理工具
│   │   ├── noise-filters/     # 噪声滤波算法
│   │   └── thermal-noise/     # 热噪声计算工具
│   ├── store/              # Redux store
│   ├── types/              # TypeScript类型
│   └── styles/             # 样式文件
├── package.json
└── vite.config.ts
```

### 状态管理架构
- **全局状态**: Redux Toolkit (用户认证、应用配置、实时数据流)
- **本地状态**: React useState/useReducer
- **实时状态**: Socket.io + Redux Toolkit (串口数据流)
- **服务器状态**: React Query (API数据缓存)
- **表单状态**: React Hook Form

## 2. 后端架构

### 技术选型
```json
{
  "runtime": "Node.js 18.x",
  "framework": "Express.js 4.x",
  "language": "TypeScript 5.x",
  "orm": "Prisma",
  "validation": "Zod",
  "authentication": "JWT + bcrypt",
  "serial_communication": "serialport + @serialport/parser-readline",
  "realtime": "Socket.io",
  "signal_processing": "ml-matrix + fft-js",
  "file_processing": "Multer + xlsx + csv-parser",
  "task_queue": "Bull Queue + Redis",
  "caching": "Redis",
  "logging": "Winston",
  "testing": "Jest + Supertest"
}
```

### 项目结构
```
backend/
├── src/
│   ├── controllers/        # 控制器
│   │   ├── auth.controller.ts
│   │   ├── file.controller.ts
│   │   ├── serial.controller.ts      # 串口通信控制器
│   │   ├── analysis.controller.ts
│   │   ├── noise.controller.ts       # 噪声分析控制器
│   │   └── user.controller.ts
│   ├── services/           # 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── file.service.ts
│   │   ├── serial.service.ts         # 串口通信服务
│   │   ├── analysis.service.ts
│   │   ├── noise-filter.service.ts   # 噪声滤波服务
│   │   ├── thermal-noise.service.ts  # 热噪声计算服务
│   │   └── ai.service.ts
│   ├── algorithms/         # 算法模块
│   │   ├── signal-processing/        # 信号处理算法
│   │   │   ├── fft.ts               # 快速傅里叶变换
│   │   │   ├── filters.ts           # 数字滤波器
│   │   │   └── noise-analysis.ts    # 噪声分析算法
│   │   ├── noise-filters/           # 噪声滤波器
│   │   │   ├── line-filter.ts       # 工频干扰滤波
│   │   │   ├── switching-filter.ts  # 开关电源纹波滤波
│   │   │   └── adaptive-filter.ts   # 自适应滤波
│   │   └── thermal-noise/           # 热噪声相关
│   │       ├── johnson-nyquist.ts   # 约翰逊-奈奎斯特噪声
│   │       ├── temperature-calc.ts  # 温度系数计算
│   │       └── quality-score.ts     # 数据质量评分
│   ├── models/             # 数据模型
│   ├── middleware/         # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/             # 路由定义
│   │   ├── auth.routes.ts
│   │   ├── serial.routes.ts          # 串口相关路由
│   │   ├── noise.routes.ts           # 噪声分析路由
│   │   └── analysis.routes.ts
│   ├── websocket/          # WebSocket处理
│   │   ├── serial-handler.ts         # 串口数据实时传输
│   │   └── analysis-handler.ts       # 分析结果实时推送
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript类型
│   ├── config/             # 配置文件
│   └── jobs/               # 后台任务
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
└── tsconfig.json
```

### API设计规范
```typescript
// REST API 端点设计
interface APIEndpoints {
  // 认证相关
  'POST /api/auth/register': RegisterRequest
  'POST /api/auth/login': LoginRequest
  'POST /api/auth/logout': void
  
  // 串口通信相关
  'GET /api/serial/ports': SerialPort[]
  'POST /api/serial/connect': { port: string, baudRate: number }
  'POST /api/serial/disconnect': void
  'GET /api/serial/status': SerialConnectionStatus
  
  // 实时数据流（WebSocket）
  'WS /ws/serial-data': RealTimeDataStream
  'WS /ws/analysis-results': AnalysisResultStream
  
  // 噪声分析相关
  'POST /api/noise/configure-filters': NoiseFilterConfig
  'POST /api/noise/start-analysis': StartAnalysisRequest  
  'GET /api/noise/analysis/:id/status': AnalysisStatus
  'GET /api/noise/analysis/:id/result': NoiseAnalysisResult
  'POST /api/noise/apply-filters': ApplyFiltersRequest
  'GET /api/noise/quality-score/:id': DataQualityScore
  
  // 热噪声计算
  'POST /api/thermal/calculate': ThermalNoiseRequest
  'GET /api/thermal/parameters/:id': ThermalNoiseParameters
  
  // 文件上传（历史数据）
  'POST /api/files/upload': FormData
  'GET /api/files': FileListResponse
  'DELETE /api/files/:id': void
  
  // 用户管理
  'GET /api/users/profile': UserProfile
  'PUT /api/users/profile': UpdateProfileRequest
  'GET /api/users/analysis-history': AnalysisHistory[]
}

// 核心数据类型定义
interface RealTimeDataPoint {
  timestamp: number
  voltage: number      // AD9226采集的电压值
  temperature: number  // 温度传感器数据
  resistance: number   // 电阻值
  metadata?: {
    adcRawValue: number // 12位ADC原始值
    calibrationApplied: boolean
  }
}

interface NoiseFilterConfig {
  lineFrequencyFilter: boolean     // 工频干扰滤波(50Hz)
  switchingNoiseFilter: boolean    // 开关电源纹波滤波
  adaptiveFilter: boolean          // 自适应滤波
  thermalNoiseIsolation: boolean   // 热噪声隔离
  customFilters?: CustomFilter[]   // 用户自定义滤波器
}

interface ThermalNoiseResult {
  johnsonNyquistNoise: number      // 约翰逊-奈奎斯特噪声
  thermalNoiseCoefficient: number  // 热噪声系数
  temperatureDependency: number    // 温度依赖性
  qualityScore: number             // 数据质量评分(0-100)
  confidence: number               // 计算置信度
}
```
```