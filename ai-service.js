// AI服务配置和调用模块
class AIService {
    constructor() {
        // 支持的AI服务提供商
        this.providers = {
            // 百度AI - 文档分析
            baidu: {
                name: '百度AI',
                endpoint: 'https://aip.baidubce.com/rpc/2.0/ai/v1/analysis',
                needsToken: true,
                tokenEndpoint: 'https://aip.baidubce.com/oauth/2.0/token'
            },
            
            // OpenAI GPT - 智能分析
            openai: {
                name: 'OpenAI GPT-4',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                needsToken: false
            },
            
            // 阿里云机器学习
            aliyun: {
                name: '阿里云机器学习',
                endpoint: 'https://eas.cn-shanghai.aliyuncs.com/api/predict',
                needsToken: true
            },
            
            // 腾讯云AI
            tencent: {
                name: '腾讯云AI',
                endpoint: 'https://tia.tencentcloudapi.com',
                needsToken: true
            }
        };
        
        // 当前使用的提供商
        this.currentProvider = 'openai'; // 默认使用OpenAI
        
        // API密钥存储（实际使用时应该加密存储）
        this.apiKeys = this.loadApiKeys();
    }
    
    // 从本地存储加载API密钥
    loadApiKeys() {
        const keys = localStorage.getItem('ai_api_keys');
        return keys ? JSON.parse(keys) : {};
    }
    
    // 保存API密钥
    saveApiKeys() {
        localStorage.setItem('ai_api_keys', JSON.stringify(this.apiKeys));
    }
    
    // 设置API密钥
    setApiKey(provider, key) {
        this.apiKeys[provider] = key;
        this.saveApiKeys();
    }
    
    // 切换AI提供商
    setProvider(provider) {
        if (this.providers[provider]) {
            this.currentProvider = provider;
            return true;
        }
        return false;
    }
    
    // 检查API密钥是否配置
    isApiKeyConfigured(provider = this.currentProvider) {
        return !!(this.apiKeys[provider] && this.apiKeys[provider].trim());
    }
    
    // 调用AI分析
    async analyzeData(data, basicStats) {
        if (!this.isApiKeyConfigured()) {
            // 如果没有配置API密钥，返回模拟结果
            return this.generateMockAnalysis(data, basicStats);
        }
        
        try {
            switch (this.currentProvider) {
                case 'openai':
                    return await this.callOpenAI(data, basicStats);
                case 'baidu':
                    return await this.callBaiduAI(data, basicStats);
                case 'aliyun':
                    return await this.callAliyunAI(data, basicStats);
                default:
                    return this.generateMockAnalysis(data, basicStats);
            }
        } catch (error) {
            console.error('AI分析调用失败:', error);
            // 出错时返回基础分析
            return this.generateMockAnalysis(data, basicStats);
        }
    }
    
    // OpenAI GPT-4分析
    async callOpenAI(data, basicStats) {
        const apiKey = this.apiKeys.openai;
        
        // 准备数据摘要（避免发送过多数据）
        const dataSummary = this.prepareDataSummary(data, basicStats);
        
        const prompt = `
作为一名资深数据分析师，请分析以下CSV数据并提供专业洞察：

数据概览：
- 总行数: ${basicStats.totalRows}
- 总列数: ${basicStats.totalColumns}  
- 数值列: ${basicStats.numericColumns.join(', ')}
- 列名: ${basicStats.columns.join(', ')}

统计信息：
${JSON.stringify(basicStats.stats, null, 2)}

数据样本（前5行）：
${JSON.stringify(data.slice(0, 5), null, 2)}

请提供：
1. 数据质量评估
2. 关键洞察和趋势
3. 潜在问题和异常
4. 业务建议
5. 进一步分析方向

请用中文回答，格式简洁易懂。
        `;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: '你是一名专业的数据分析师，擅长从数据中发现洞察和趋势。'
                    },
                    {
                        role: 'user', 
                        content: prompt
                    }
                ],
                max_tokens: 1500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API调用失败: ${response.status}`);
        }
        
        const result = await response.json();
        const analysis = result.choices[0].message.content;
        
        return this.formatAIResponse(analysis);
    }
    
    // 百度AI分析
    async callBaiduAI(data, basicStats) {
        // 首先获取访问令牌
        const token = await this.getBaiduAccessToken();
        
        const dataSummary = this.prepareDataSummary(data, basicStats);
        
        const response = await fetch(`https://aip.baidubce.com/rpc/2.0/ai/v1/analysis?access_token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: dataSummary,
                analysis_type: 'comprehensive'
            })
        });
        
        if (!response.ok) {
            throw new Error(`百度AI API调用失败: ${response.status}`);
        }
        
        const result = await response.json();
        return this.formatBaiduResponse(result);
    }
    
    // 获取百度AI访问令牌
    async getBaiduAccessToken() {
        const { client_id, client_secret } = this.apiKeys.baidu || {};
        
        if (!client_id || !client_secret) {
            throw new Error('百度AI API密钥未配置');
        }
        
        const response = await fetch('https://aip.baidubce.com/oauth/2.0/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
        });
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(`获取百度AI令牌失败: ${result.error_description}`);
        }
        
        return result.access_token;
    }
    
    // 准备数据摘要
    prepareDataSummary(data, basicStats) {
        return {
            overview: {
                rows: basicStats.totalRows,
                columns: basicStats.totalColumns,
                numeric_columns: basicStats.numericColumns
            },
            statistics: basicStats.stats,
            sample_data: data.slice(0, 3), // 只发送前3行作为样本
            columns: basicStats.columns
        };
    }
    
    // 格式化AI响应
    formatAIResponse(analysis) {
        // 将AI响应分割成段落
        const paragraphs = analysis.split('\n').filter(p => p.trim());
        return paragraphs.map(p => p.trim()).filter(p => p);
    }
    
    // 格式化百度AI响应
    formatBaiduResponse(result) {
        if (result.insights) {
            return result.insights;
        }
        return ['百度AI分析完成，但未返回具体洞察。'];
    }
    
    // 生成模拟分析（当没有API密钥时使用）
    generateMockAnalysis(data, basicStats) {
        const insights = [];
        
        // 数据概览
        insights.push(`🔍 **数据概览分析**: 检测到包含 ${basicStats.totalRows} 条记录的数据集，共有 ${basicStats.totalColumns} 个字段，数据结构${basicStats.totalColumns > 10 ? '较为复杂' : '相对简单'}。`);
        
        // 数据质量评估
        const numericRatio = (basicStats.numericColumns.length / basicStats.totalColumns * 100).toFixed(1);
        insights.push(`📊 **数据类型分布**: 数值型字段占比 ${numericRatio}%，${numericRatio > 50 ? '适合进行统计分析' : '偏向文本数据，适合分类分析'}。`);
        
        // 统计洞察
        if (basicStats.numericColumns.length > 0) {
            const firstNumCol = basicStats.numericColumns[0];
            const stats = basicStats.stats[firstNumCol];
            const range = stats.max - stats.min;
            const coefficient = range / stats.mean;
            
            insights.push(`📈 **关键指标分析**: "${firstNumCol}" 字段均值为 ${stats.mean.toFixed(2)}，标准差较${coefficient > 1 ? '大' : '小'}，数据${coefficient > 1 ? '波动明显' : '相对稳定'}。`);
        }
        
        // 数据质量
        const sampleRow = data[0];
        const emptyFields = Object.values(sampleRow).filter(v => !v || v.toString().trim() === '').length;
        const completeness = ((basicStats.totalColumns - emptyFields) / basicStats.totalColumns * 100).toFixed(1);
        
        insights.push(`✅ **数据完整性**: 样本数据完整性约 ${completeness}%，${completeness > 90 ? '质量优秀' : '建议进行数据清洗'}。`);
        
        // 业务建议
        if (basicStats.numericColumns.length >= 2) {
            insights.push(`🎯 **分析建议**: 建议进行相关性分析，探索 "${basicStats.numericColumns[0]}" 与 "${basicStats.numericColumns[1]}" 之间的关系。`);
        }
        
        // 趋势预测
        insights.push(`🔮 **智能洞察**: 基于数据特征，${basicStats.totalRows > 1000 ? '数据量充足，适合机器学习建模' : '建议收集更多数据以提高分析准确性'}。`);
        
        insights.push(`💡 **AI提示**: 当前使用模拟AI分析。配置真实AI服务密钥可获得更深入的专业洞察。`);
        
        return insights;
    }
    
    // 显示API配置界面
    showApiConfigModal() {
        // 创建模态框
        const modalHtml = `
            <div class="modal fade" id="apiConfigModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">AI服务配置</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">选择AI服务提供商:</label>
                                <select class="form-select" id="providerSelect" onchange="aiService.onProviderChange()">
                                    ${Object.entries(this.providers).map(([key, provider]) => 
                                        `<option value="${key}" ${key === this.currentProvider ? 'selected' : ''}>${provider.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div id="apiKeyConfig"></div>
                            <div class="alert alert-info">
                                <strong>提示:</strong> API密钥仅存储在您的浏览器本地，不会上传到服务器。
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" onclick="aiService.saveApiConfig()">保存配置</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('apiConfigModal'));
        this.onProviderChange(); // 初始化配置界面
        modal.show();
        
        // 模态框关闭后移除DOM
        document.getElementById('apiConfigModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    }
    
    // 提供商切换事件
    onProviderChange() {
        const provider = document.getElementById('providerSelect').value;
        const configDiv = document.getElementById('apiKeyConfig');
        
        let configHtml = '';
        
        switch (provider) {
            case 'openai':
                configHtml = `
                    <div class="mb-3">
                        <label class="form-label">OpenAI API Key:</label>
                        <input type="password" class="form-control" id="openai_key" 
                               value="${this.apiKeys.openai || ''}" 
                               placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx">
                        <div class="form-text">
                            在 <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI官网</a> 获取API密钥
                        </div>
                    </div>
                `;
                break;
                
            case 'baidu':
                configHtml = `
                    <div class="mb-3">
                        <label class="form-label">百度AI Client ID:</label>
                        <input type="text" class="form-control" id="baidu_client_id" 
                               value="${this.apiKeys.baidu?.client_id || ''}" 
                               placeholder="请输入Client ID">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">百度AI Client Secret:</label>
                        <input type="password" class="form-control" id="baidu_client_secret" 
                               value="${this.apiKeys.baidu?.client_secret || ''}" 
                               placeholder="请输入Client Secret">
                        <div class="form-text">
                            在 <a href="https://console.bce.baidu.com/" target="_blank">百度AI开放平台</a> 获取密钥
                        </div>
                    </div>
                `;
                break;
                
            default:
                configHtml = '<p class="text-muted">该服务商配置功能开发中...</p>';
        }
        
        configDiv.innerHTML = configHtml;
    }
    
    // 保存API配置
    saveApiConfig() {
        const provider = document.getElementById('providerSelect').value;
        
        switch (provider) {
            case 'openai':
                const openaiKey = document.getElementById('openai_key').value.trim();
                if (openaiKey) {
                    this.setApiKey('openai', openaiKey);
                    this.setProvider('openai');
                }
                break;
                
            case 'baidu':
                const clientId = document.getElementById('baidu_client_id').value.trim();
                const clientSecret = document.getElementById('baidu_client_secret').value.trim();
                if (clientId && clientSecret) {
                    this.setApiKey('baidu', { client_id: clientId, client_secret: clientSecret });
                    this.setProvider('baidu');
                }
                break;
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('apiConfigModal'));
        modal.hide();
        
        // 显示成功消息
        this.showToast('AI服务配置已保存！', 'success');
    }
    
    // 显示提示消息
    showToast(message, type = 'info') {
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        // 创建toast容器（如果不存在）
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        
        container.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = container.lastElementChild;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // 自动移除
        toastElement.addEventListener('hidden.bs.toast', function () {
            this.remove();
        });
    }
}

// 创建全局AI服务实例
const aiService = new AIService();