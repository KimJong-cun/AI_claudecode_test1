// 全局变量
let currentData = null;
let currentChart = null;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    
    // 文件输入事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传功能
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('drop', handleDrop);
    uploadZone.addEventListener('dragleave', handleDragLeave);
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

// 处理拖拽悬停
function handleDragOver(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
}

// 处理文件拖拽放置
function handleDrop(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// 处理文件
function processFile(file) {
    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('请选择CSV格式的文件！');
        return;
    }
    
    // 显示文件信息
    showFileInfo(file);
    
    // 解析CSV文件
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.errors.length > 0) {
                console.error('CSV解析错误:', results.errors);
                alert('CSV文件格式有误，请检查文件！');
                return;
            }
            
            currentData = results.data;
            console.log('CSV数据解析成功:', currentData);
            
            // 显示数据预览
            showDataPreview(currentData.slice(0, 5)); // 只显示前5行
        },
        error: function(error) {
            console.error('文件读取错误:', error);
            alert('文件读取失败，请重试！');
        }
    });
}

// 显示文件信息
function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileDetails = document.getElementById('fileDetails');
    
    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    const lastModified = new Date(file.lastModified).toLocaleString('zh-CN');
    
    fileDetails.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>文件名:</strong> ${file.name}</p>
                <p><strong>文件大小:</strong> ${sizeInMB} MB</p>
            </div>
            <div class="col-md-6">
                <p><strong>文件类型:</strong> ${file.type || 'CSV'}</p>
                <p><strong>修改时间:</strong> ${lastModified}</p>
            </div>
        </div>
    `;
    
    fileInfo.style.display = 'block';
}

// 显示数据预览
function showDataPreview(data) {
    if (!data || data.length === 0) return;
    
    const columns = Object.keys(data[0]);
    const previewDiv = document.getElementById('dataPreview');
    
    let html = `
        <div class="mb-3">
            <span class="badge bg-primary">数据行数: ${currentData.length}</span>
            <span class="badge bg-success">列数: ${columns.length}</span>
        </div>
        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
    `;
    
    // 添加表头
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // 添加数据行
    data.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            const value = row[col] || '';
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    if (currentData.length > 5) {
        html += `<p class="text-muted text-center">显示前5行，共${currentData.length}行数据</p>`;
    }
    
    previewDiv.innerHTML = html;
}

// 分析数据
async function analyzeData() {
    if (!currentData || currentData.length === 0) {
        alert('请先上传CSV文件！');
        return;
    }
    
    // 显示加载动画
    showLoading(true);
    
    try {
        // 生成基础统计信息
        const basicStats = generateBasicStats(currentData);
        
        // 调用AI分析（模拟）
        const aiInsights = await generateAIInsights(currentData, basicStats);
        
        // 创建图表
        createDataChart(currentData);
        
        // 显示结果
        showResults(aiInsights);
        
    } catch (error) {
        console.error('分析过程出错:', error);
        alert('数据分析失败，请重试！');
    } finally {
        showLoading(false);
    }
}

// 生成基础统计信息
function generateBasicStats(data) {
    const columns = Object.keys(data[0]);
    const numericColumns = [];
    const stats = {};
    
    // 识别数值列
    columns.forEach(col => {
        const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
        if (values.length > data.length * 0.5) { // 如果超过一半是数值
            numericColumns.push(col);
            
            // 计算基础统计
            stats[col] = {
                count: values.length,
                sum: values.reduce((a, b) => a + b, 0),
                mean: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                median: calculateMedian(values)
            };
        }
    });
    
    return {
        totalRows: data.length,
        totalColumns: columns.length,
        numericColumns,
        stats,
        columns
    };
}

// 计算中位数
function calculateMedian(values) {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];
}

// 生成AI洞察（集成真实AI服务）
async function generateAIInsights(data, stats) {
    try {
        // 使用AI服务进行分析
        return await aiService.analyzeData(data, stats);
    } catch (error) {
        console.error('AI分析失败，使用备用分析:', error);
        return generateFallbackAnalysis(data, stats);
    }
}

// 备用分析（当AI服务不可用时使用）
function generateFallbackAnalysis(data, stats) {
    let insights = [];
    
    // 数据概览洞察
    insights.push(`📊 **数据概览**: 您的数据集包含 ${stats.totalRows} 行数据和 ${stats.totalColumns} 个字段。`);
    
    // 数值字段洞察  
    if (stats.numericColumns.length > 0) {
        insights.push(`🔢 **数值字段**: 发现 ${stats.numericColumns.length} 个数值字段: ${stats.numericColumns.join(', ')}`);
        
        // 找出最大值和最小值的字段
        let maxVariance = 0;
        let maxVarianceCol = '';
        
        stats.numericColumns.forEach(col => {
            const variance = stats.stats[col].max - stats.stats[col].min;
            if (variance > maxVariance) {
                maxVariance = variance;
                maxVarianceCol = col;
            }
        });
        
        if (maxVarianceCol) {
            insights.push(`📈 **数据分布**: "${maxVarianceCol}" 字段的数据范围最大 (${stats.stats[maxVarianceCol].min.toFixed(2)} - ${stats.stats[maxVarianceCol].max.toFixed(2)})，建议重点关注。`);
        }
    }
    
    // 数据质量洞察
    const emptyCount = data.reduce((count, row) => {
        const emptyFields = Object.values(row).filter(v => !v || v.toString().trim() === '').length;
        return count + emptyFields;
    }, 0);
    
    const totalFields = data.length * stats.totalColumns;
    const completeness = ((totalFields - emptyCount) / totalFields * 100).toFixed(1);
    
    insights.push(`✅ **数据质量**: 数据完整性为 ${completeness}%，${emptyCount > 0 ? `建议处理 ${emptyCount} 个空值` : '数据质量良好'}。`);
    
    // 趋势洞察（如果有日期或时间相关字段）
    const dateColumns = stats.columns.filter(col => 
        col.toLowerCase().includes('date') || 
        col.toLowerCase().includes('time') || 
        col.toLowerCase().includes('年') ||
        col.toLowerCase().includes('月')
    );
    
    if (dateColumns.length > 0) {
        insights.push(`📅 **时间维度**: 发现时间相关字段 "${dateColumns[0]}"，建议进行时间序列分析。`);
    }
    
    // 业务建议
    insights.push(`💡 **基础分析**: 基于数据特征，建议进行${stats.numericColumns.length > 2 ? '相关性分析' : '描述性统计分析'}以发现更深层的数据洞察。`);
    
    return insights;
}

// 创建数据图表
function createDataChart(data) {
    const canvas = document.getElementById('dataChart');
    const ctx = canvas.getContext('2d');
    
    // 销毁之前的图表
    if (currentChart) {
        currentChart.destroy();
    }
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => {
        const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
        return values.length > data.length * 0.5;
    });
    
    if (numericColumns.length === 0) {
        // 如果没有数值列，显示文本统计
        createCategoricalChart(ctx, data, columns[0]);
    } else if (numericColumns.length === 1) {
        // 单个数值列，显示分布图
        createDistributionChart(ctx, data, numericColumns[0]);
    } else {
        // 多个数值列，显示对比图
        createComparisonChart(ctx, data, numericColumns.slice(0, 3)); // 最多显示3个
    }
}

// 创建分类数据图表
function createCategoricalChart(ctx, data, column) {
    const categoryCount = {};
    data.forEach(row => {
        const value = row[column] || '未知';
        categoryCount[value] = (categoryCount[value] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // 只显示前10个
    
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedCategories.map(([label]) => label),
            datasets: [{
                data: sortedCategories.map(([, count]) => count),
                backgroundColor: generateColors(sortedCategories.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${column} 分布图`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 创建数值分布图表
function createDistributionChart(ctx, data, column) {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    const sortedData = data
        .map((row, index) => ({ value: parseFloat(row[column]), index }))
        .filter(item => !isNaN(item.value))
        .sort((a, b) => a.value - b.value);
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedData.map((_, index) => `第${index + 1}条`),
            datasets: [{
                label: column,
                data: sortedData.map(item => item.value),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${column} 数值分布`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// 创建对比图表
function createComparisonChart(ctx, data, columns) {
    const datasets = columns.map((col, index) => {
        const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
        return {
            label: col,
            data: values.slice(0, Math.min(20, values.length)), // 最多显示20个数据点
            borderColor: getColorByIndex(index),
            backgroundColor: getColorByIndex(index, 0.1),
            fill: false,
            tension: 0.1
        };
    });
    
    const maxLength = Math.max(...datasets.map(d => d.data.length));
    const labels = Array.from({ length: Math.min(20, maxLength) }, (_, i) => `数据${i + 1}`);
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '数值字段对比分析',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// 生成颜色数组
function generateColors(count) {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// 根据索引获取颜色
function getColorByIndex(index, alpha = 1) {
    const colors = ['#667eea', '#764ba2', '#f5576c', '#43e97b', '#4facfe'];
    const color = colors[index % colors.length];
    
    if (alpha < 1) {
        // 转换为rgba格式
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
}

// 显示/隐藏加载动画
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

// 显示分析结果
function showResults(insights) {
    const resultsDiv = document.getElementById('results');
    const aiInsightsDiv = document.getElementById('aiInsights');
    
    // 格式化AI洞察
    let insightsHtml = '';
    insights.forEach(insight => {
        insightsHtml += `<div class="alert alert-info"><i class="fas fa-lightbulb me-2"></i>${insight}</div>`;
    });
    
    aiInsightsDiv.innerHTML = insightsHtml;
    resultsDiv.style.display = 'block';
    
    // 平滑滚动到结果区域
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 导出功能（未来扩展）
function exportResults() {
    // TODO: 实现结果导出功能
    alert('导出功能正在开发中...');
}