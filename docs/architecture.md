# AI数据分析网站 - 系统架构设计

## 架构概览

### 整体架构模式
- **架构风格**: 前后端分离的单体应用架构
- **部署模式**: 容器化云部署
- **数据流**: RESTful API + 异步任务处理
- **扩展策略**: 水平扩展 + 微服务预留

### 核心技术栈
- **前端**: React.js + TypeScript + Ant Design
- **后端**: Node.js + Express.js + TypeScript  
- **数据库**: PostgreSQL + Redis
- **AI服务**: 百度AI/阿里云机器学习平台
- **存储**: 阿里云OSS/腾讯云COS
- **部署**: Docker + 云服务器

## 系统架构图

```mermaid
graph TB
    subgraph "用户层"
        Web[Web浏览器]
        Mobile[移动端浏览器]
    end
    
    subgraph "CDN层"
        CDN[静态资源CDN]
    end
    
    subgraph "负载均衡层"
        LB[负载均衡器]
    end
    
    subgraph "应用层"
        Frontend[React前端应用]
        API[Node.js API服务]
        TaskQueue[任务队列处理器]
    end
    
    subgraph "数据层"
        PostgresDB[(PostgreSQL)]
        RedisCache[(Redis缓存)]
        FileStorage[对象存储OSS]
    end
    
    subgraph "外部服务"
        AIService[AI分析服务]
        EmailService[邮件服务]
    end
    
    Web --> CDN
    Mobile --> CDN
    CDN --> LB
    LB --> Frontend
    Frontend --> API
    API --> PostgresDB
    API --> RedisCache
    API --> FileStorage
    API --> TaskQueue
    TaskQueue --> AIService
    API --> EmailService
```

## 详细技术方案

### 1. 前端架构

#### 技术选型
```json
{
  "framework": "React 18.x",
  "language": "TypeScript 5.x",
  "ui_library": "Ant Design 5.x",
  "state_management": "Redux Toolkit",
  "routing": "React Router 6.x",
  "charts": "ECharts 5.x",
  "http_client": "Axios",
  "build_tool": "Vite",
  "testing": "Jest + React Testing Library"
}
```

#### 项目结构
```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/          # 通用组件
│   │   ├── common/         # 基础组件
│   │   ├── charts/         # 图表组件
│   │   └── upload/         # 上传组件
│   ├── pages/              # 页面组件
│   │   ├── Home/
│   │   ├── Upload/
│   │   ├── Analysis/
│   │   └── Dashboard/
│   ├── hooks/              # 自定义Hook
│   ├── services/           # API服务
│   ├── store/              # Redux store
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript类型
│   └── styles/             # 样式文件
├── package.json
└── vite.config.ts
```

#### 状态管理架构
- **全局状态**: Redux Toolkit (用户认证、应用配置)
- **本地状态**: React useState/useReducer
- **服务器状态**: React Query (API数据缓存)
- **表单状态**: React Hook Form

### 2. 后端架构

#### 技术选型
```json
{
  "runtime": "Node.js 18.x",
  "framework": "Express.js 4.x",
  "language": "TypeScript 5.x",
  "orm": "Prisma",
  "validation": "Zod",
  "authentication": "JWT + bcrypt",
  "file_processing": "Multer + xlsx + csv-parser",
  "task_queue": "Bull Queue",
  "logging": "Winston",
  "testing": "Jest + Supertest"
}
```

#### 项目结构
```
backend/
├── src/
│   ├── controllers/        # 控制器
│   │   ├── auth.controller.ts
│   │   ├── file.controller.ts
│   │   ├── analysis.controller.ts
│   │   └── user.controller.ts
│   ├── services/           # 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── file.service.ts
│   │   ├── analysis.service.ts
│   │   └── ai.service.ts
│   ├── models/             # 数据模型
│   ├── middleware/         # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/             # 路由定义
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

#### API设计规范
```typescript
// REST API 端点设计
interface APIEndpoints {
  // 认证相关
  'POST /api/auth/register': RegisterRequest
  'POST /api/auth/login': LoginRequest
  'POST /api/auth/logout': void
  
  // 文件上传
  'POST /api/files/upload': FormData
  'GET /api/files': FileListResponse
  'DELETE /api/files/:id': void
  
  // 数据分析
  'POST /api/analysis/start': AnalysisRequest
  'GET /api/analysis/:id/status': AnalysisStatus
  'GET /api/analysis/:id/result': AnalysisResult
  
  // 用户管理
  'GET /api/users/profile': UserProfile
  'PUT /api/users/profile': UpdateProfileRequest
}
```

### 3. 数据库设计

#### PostgreSQL 主数据库
```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 文件表
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 分析任务表
CREATE TABLE analysis_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    file_id UUID NOT NULL REFERENCES files(id),
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 分析结果表
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES analysis_tasks(id),
    basic_stats JSONB,
    insights JSONB,
    charts_config JSONB,
    report_content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_analysis_tasks_user_id ON analysis_tasks(user_id);
CREATE INDEX idx_analysis_tasks_status ON analysis_tasks(status);
```

#### Redis 缓存策略
```typescript
// 缓存键命名规范
interface CacheKeys {
  user_session: `session:${userId}`
  analysis_result: `analysis:${taskId}`
  file_metadata: `file:${fileId}`
  rate_limit: `rate_limit:${userId}:${endpoint}`
}

// 缓存过期时间
const CACHE_TTL = {
  session: 24 * 60 * 60,      // 24小时
  analysis: 7 * 24 * 60 * 60, // 7天
  file_metadata: 60 * 60,      // 1小时
  rate_limit: 60               // 1分钟
}
```

### 4. AI服务集成架构（端口化设计）

#### 可插拔AI服务接口设计
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

#### 分析流程设计（支持AI服务切换）
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

#### 环境配置
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

### 5. 文件存储架构

#### 存储策略
```typescript
interface StorageConfig {
  local: {
    temp_upload: '/tmp/uploads',
    max_size: '10MB'
  },
  cloud: {
    provider: 'aliyun-oss' | 'tencent-cos',
    bucket: 'ai-analysis-files',
    region: 'cn-hangzhou',
    cdn_domain: 'cdn.example.com'
  }
}

// 文件处理流程
class FileProcessor {
  async uploadFile(file: Express.Multer.File): Promise<FileRecord> {
    // 1. 本地临时存储
    const tempPath = await this.saveToTemp(file)
    
    // 2. 文件验证
    await this.validateFile(tempPath)
    
    // 3. 上传到云存储
    const cloudPath = await this.uploadToCloud(tempPath)
    
    // 4. 清理临时文件
    await this.cleanupTemp(tempPath)
    
    // 5. 数据库记录
    return await this.saveFileRecord(file, cloudPath)
  }
}
```

### 6. 安全架构设计

#### 认证授权方案
```typescript
// JWT Token 结构
interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// 权限控制
enum Permission {
  UPLOAD_FILE = 'upload:file',
  VIEW_ANALYSIS = 'view:analysis',
  EXPORT_RESULT = 'export:result',
  MANAGE_ACCOUNT = 'manage:account'
}
```

#### 数据安全措施
1. **传输加密**: HTTPS/TLS 1.3
2. **存储加密**: 数据库字段级加密
3. **文件安全**: 云存储访问控制
4. **API安全**: 请求限流 + 参数验证
5. **会话管理**: JWT + Redis会话存储

### 7. 部署架构

#### 容器化配置
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose 开发环境
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/aianalyzer
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: aianalyzer
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 8. 监控与日志

#### 监控指标
- **系统指标**: CPU、内存、磁盘使用率
- **应用指标**: API响应时间、错误率、并发数
- **业务指标**: 文件上传成功率、分析任务完成率
- **用户指标**: 活跃用户数、功能使用情况

#### 日志策略
```typescript
// 日志配置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

### 9. 性能优化策略

#### 前端优化
- **代码分割**: React.lazy + Suspense
- **资源优化**: 图片压缩、CDN加速
- **缓存策略**: Service Worker + HTTP缓存
- **懒加载**: 图表按需加载

#### 后端优化
- **数据库优化**: 索引优化、查询优化
- **缓存策略**: Redis多层缓存
- **异步处理**: 任务队列处理耗时操作
- **连接池**: 数据库连接池管理

### 10. 扩展性设计

#### 水平扩展准备
- **无状态设计**: API服务无状态
- **数据库分片**: 按用户ID分片预留
- **微服务拆分**: 分析引擎独立部署
- **消息队列**: 服务间异步通信

这个架构设计注重简洁性和可扩展性，能够支持初期的MVP需求，同时为后续的功能扩展和性能优化预留了空间。