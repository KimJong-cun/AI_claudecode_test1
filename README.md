# AI数据分析工具

🚀 **一个纯前端的AI数据分析工具，支持CSV文件上传和智能分析**

## ✨ 功能特性

- 📊 **CSV文件上传和解析** - 支持拖拽上传，自动解析数据结构
- 🧠 **AI智能分析** - 集成多个AI服务商，提供专业数据洞察
- 📈 **数据可视化** - 自动生成图表，支持多种图表类型
- 🎯 **零服务器成本** - 纯前端运行，无需后端服务器
- 🔒 **隐私安全** - 数据仅在浏览器本地处理，不上传到服务器
- ⚡ **快速部署** - 一键部署到GitHub Pages

## 🖥️ 在线访问

👉 **[点击访问在线版本](https://你的用户名.github.io/ai-data-analyzer/)**

## 🎯 支持的AI服务

- **OpenAI GPT-4** - 最先进的AI分析
- **百度AI** - 国产AI服务，稳定可靠
- **阿里云机器学习** - 企业级AI服务
- **腾讯云AI** - 多样化AI能力

## 📋 使用步骤

### 1. 上传CSV文件
- 拖拽CSV文件到上传区域
- 或点击选择文件按钮

### 2. 配置AI服务（可选）
- 点击右上角"配置AI服务"
- 选择AI提供商并输入API密钥
- 保存配置

### 3. 开始分析
- 点击"开始AI分析"按钮
- 等待AI生成分析报告
- 查看可视化图表和数据洞察

## 🚀 本地运行

```bash
# 克隆项目
git clone https://github.com/你的用户名/ai-data-analyzer.git

# 进入目录
cd ai-data-analyzer

# 直接打开index.html文件，或使用本地服务器
python -m http.server 8000
# 或
npx serve .
```

## 🔧 AI服务配置

### OpenAI配置
1. 访问 [OpenAI官网](https://platform.openai.com/api-keys)
2. 创建API密钥
3. 在应用中配置密钥

### 百度AI配置
1. 访问 [百度AI开放平台](https://console.bce.baidu.com/)
2. 创建应用获取Client ID和Client Secret
3. 在应用中配置密钥

## 📁 项目结构

```
web-bundles/
├── index.html          # 主页面
├── app.js             # 核心功能逻辑
├── ai-service.js      # AI服务集成
└── README.md          # 说明文档
```

## 🛠️ 技术栈

- **前端框架**: 纯JavaScript + Bootstrap 5
- **图表库**: Chart.js
- **CSV解析**: PapaParse
- **样式**: Bootstrap + 自定义CSS
- **部署**: GitHub Pages

## 📊 示例数据格式

支持的CSV格式示例：

```csv
姓名,年龄,城市,收入
张三,25,北京,8000
李四,30,上海,12000
王五,28,深圳,10000
```

## 🔒 隐私说明

- ✅ 所有数据处理在浏览器本地完成
- ✅ API密钥仅存储在浏览器本地存储中
- ✅ 不会将原始数据上传到任何服务器
- ✅ AI分析时仅发送数据摘要，不发送完整数据

## 💡 使用提示

1. **文件大小**: 建议CSV文件不超过50MB
2. **数据格式**: 确保CSV文件格式正确，有明确的列标题
3. **AI服务**: 配置API密钥后可获得更专业的分析结果
4. **浏览器兼容性**: 支持Chrome、Firefox、Safari、Edge等现代浏览器

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License - 可自由使用和修改

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！