# Technical Assumptions

## Repository Structure: Monorepo
采用单一代码仓库结构，前端和后端代码在同一个仓库中管理，便于开发阶段的快速迭代和部署。

## Service Architecture
采用前后端分离的单体应用架构，前端React应用通过RESTful API与后端Node.js服务通信。AI分析功能可以作为独立的微服务模块，便于后期扩展。

## Testing Requirements
实施完整的测试策略：单元测试覆盖核心业务逻辑，集成测试验证API接口，端到端测试确保用户流程完整性。目标测试覆盖率70%以上。

## Additional Technical Assumptions and Requests
- **前端技术栈**：React.js + TypeScript + Ant Design UI组件库
- **后端技术栈**：Node.js + Express.js + TypeScript
- **数据库**：PostgreSQL用于用户数据存储，Redis用于会话和缓存管理
- **AI服务**：预留第三方AI分析服务接口（如百度AI、阿里云机器学习），初期使用模拟AI服务和统计算法
- **文件存储**：使用云存储服务（阿里云OSS或腾讯云COS）
- **部署环境**：Docker容器化部署，使用云服务器（阿里云或腾讯云）
- **CI/CD**：GitHub Actions或GitLab CI进行自动化构建和部署