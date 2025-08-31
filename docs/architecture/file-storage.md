# 文件存储架构

## 存储策略
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