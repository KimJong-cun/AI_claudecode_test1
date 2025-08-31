# 数据库设计

## PostgreSQL 主数据库

### 核心用户和设备表
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

-- 采集设备表
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) DEFAULT 'STM32_AD9226',
    serial_port VARCHAR(50),
    baud_rate INTEGER DEFAULT 115200,
    status VARCHAR(20) DEFAULT 'disconnected',
    last_connected TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 数据采集和存储
```sql
-- 实时数据表（高频写入，分区表）
CREATE TABLE realtime_data (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id),
    timestamp BIGINT NOT NULL,      -- 微秒级时间戳
    voltage DECIMAL(10,6) NOT NULL, -- AD9226电压值
    temperature DECIMAL(8,3),       -- 温度值
    resistance DECIMAL(12,6),       -- 电阻值
    adc_raw_value INTEGER,          -- 12位ADC原始值
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 按月分区示例
CREATE TABLE realtime_data_2025_08 PARTITION OF realtime_data
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

-- 文件上传表（批量数据）
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    data_points_count INTEGER,
    status VARCHAR(20) DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 噪声分析相关表
```sql
-- 噪声分析任务表
CREATE TABLE noise_analysis_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    device_id UUID REFERENCES devices(id),
    file_id UUID REFERENCES uploaded_files(id),
    analysis_type VARCHAR(50) NOT NULL, -- 'realtime' | 'batch'
    noise_sources TEXT[],               -- 用户指定的噪声源
    filter_config JSONB NOT NULL,      -- 滤波器配置
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 噪声分析结果表
CREATE TABLE noise_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES noise_analysis_tasks(id),
    original_data_stats JSONB,         -- 原始数据统计信息
    filtered_data_stats JSONB,         -- 滤波后数据统计
    thermal_noise_params JSONB,        -- 热噪声参数
    quality_score DECIMAL(5,2),        -- 数据质量评分
    confidence_level DECIMAL(5,2),     -- 置信度
    frequency_analysis JSONB,          -- 频域分析结果
    noise_classification JSONB,        -- 噪声类型分类
    report_content TEXT,               -- 生成的分析报告
    charts_config JSONB,              -- 图表配置信息
    created_at TIMESTAMP DEFAULT NOW()
);

-- 噪声源配置表
CREATE TABLE noise_source_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frequency_range JSONB,             -- 频率范围
    filter_params JSONB,               -- 滤波参数
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 索引优化
```sql
-- 性能优化索引
CREATE INDEX idx_realtime_data_device_timestamp ON realtime_data(device_id, timestamp);
CREATE INDEX idx_realtime_data_timestamp ON realtime_data(timestamp);
CREATE INDEX idx_devices_user_status ON devices(user_id, status);
CREATE INDEX idx_noise_tasks_user_status ON noise_analysis_tasks(user_id, status);
CREATE INDEX idx_noise_results_task_id ON noise_analysis_results(task_id);

-- 分析查询优化
CREATE INDEX idx_realtime_voltage_range ON realtime_data(voltage) WHERE voltage IS NOT NULL;
CREATE INDEX idx_realtime_temp_range ON realtime_data(temperature) WHERE temperature IS NOT NULL;
```

## Redis 缓存策略
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