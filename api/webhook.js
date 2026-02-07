module.exports = async (req, res) => {
    // 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        console.log(`[${new Date().toISOString()}] 收到 ${req.method} 请求`);
        
        if (req.method === 'POST') {
            // 获取 POST 数据
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            const body = Buffer.concat(chunks).toString();
            const data = JSON.parse(body || '{}');
            
            console.log('POST 数据:', JSON.stringify(data, null, 2));
            
            if (data.update_id) {
                // 处理 Telegram Webhook
                await handleTelegramUpdate(data);
                console.log('✅ 处理完成');
                return res.status(200).json({ ok: true });
            }
            
            // 其他测试请求
            return res.status(200).json({ 
                ok: true, 
                message: 'Webhook 接收成功',
                timestamp: new Date().toISOString(),
                received: data
            });
            
        } else {
            // GET 请求返回状态页面
            return res.status(200).send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webhook 状态</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            color: white; 
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.1); 
            backdrop-filter: blur(10px); 
            padding: 40px; 
            border-radius: 20px; 
        }
        .status { 
            background: #48bb78; 
            padding: 10px 20px; 
            border-radius: 20px; 
            display: inline-block; 
            margin: 10px 0; 
        }
        .error { 
            background: #f56565; 
            padding: 10px 20px; 
            border-radius: 20px; 
            display: inline-block; 
            margin: 10px 0; 
        }
        .btn { 
            display: inline-block; 
            background: #4CAF50; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 50px; 
            margin: 5px; 
            border: none; 
            cursor: pointer; 
        }
        pre { 
            background: #1a1a1a; 
            color: #0f0; 
            padding: 20px; 
            border-radius: 10px; 
            overflow-x: auto; 
            max-height: 300px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Webhook API 状态</h1>
        <div class="status">✅ API 正常运行</div>
        <div class="error">❌ 待处理更新: <span id="pending-count">0</span></div>
        
        <p><strong>当前时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
        <p><strong>Webhook URL:</strong> ${typeof window !== 'undefined' ? window.location.href : ''}</p>
        <p><strong>支持方法:</strong> GET, POST</p>
        
        <h3>🧪 功能测试</h3>
        <button class="btn" onclick="testGet()">测试 GET</button>
        <button class="btn" onclick="testPost()">测试 POST</button>
        <button class="btn" onclick="clearPending()">清空待处理</button>
        
        <div id="test-result" style="margin-top: 20px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 10px; display: none;"></div>
        
        <script>
            function showResult(message, type = 'success') {
                const div = document.getElementById('test-result');
                div.style.display = 'block';
                div.innerHTML = message;
                div.style.borderLeft = \`4px solid \${type === 'success' ? '#48bb78' : '#f56565'}\`;
            }
            
            function testGet() {
                showResult('🔄 测试 GET 请求...', 'info');
                fetch(window.location.href)
                    .then(r => r.text())
                    .then(html => showResult('✅ GET 请求成功', 'success'))
                    .catch(e => showResult('❌ GET 请求失败: ' + e.message, 'error'));
            }
            
            function testPost() {
                showResult('🔄 发送测试 POST 数据...', 'info');
                fetch(window.location.href, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        test: true,
                        message: 'Hello Webhook!',
                        timestamp: new Date().toISOString()
                    })
                })
                .then(r => r.json())
                .then(data => showResult('✅ POST 测试成功<br>' + JSON.stringify(data, null, 2), 'success'))
                .catch(e => showResult('❌ POST 测试失败: ' + e.message, 'error'));
            }
            
            function clearPending() {
                if (confirm('确定要清空待处理的更新吗？')) {
                    showResult('🔄 清空中...', 'info');
                    fetch('/api/clear', { method: 'POST' })
                        .then(r => r.json())
                        .then(data => {
                            document.getElementById('pending-count').textContent = '0';
                            showResult('✅ 待处理更新已清空', 'success');
                        })
                        .catch(e => showResult('❌ 清空失败: ' + e.message, 'error'));
                }
            }
            
            // 检查待处理数量
            setInterval(() => {
                // 这里可以添加检查待处理数量的逻辑
            }, 5000);
        </script>
        
        <p style="margin-top: 30px;">
            <a href="/" style="color: white;">🏠 返回管理页面</a>
        </p>
    </div>
</body>
</html>
            `);
        }
        
    } catch (error) {
        console.error('Webhook 处理错误:', error);
        return res.status(500).json({ 
            ok: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// 处理 Telegram 更新
async function handleTelegramUpdate(update) {
    const updateId = update.update_id;
    
    console.log(`处理更新 #${updateId}`);
    
    if (update.message) {
        const msg = update.message;
        const chatId = msg.chat.id;
        const text = msg.text || '';
        const user = msg.from;
        
        console.log(`收到消息: ${text} 来自 ${user.first_name} (${user.id})`);
        
        // 生成回复
        const reply = generateReply(text, user.first_name);
        
        // 发送回复（如果有 Bot Token）
        if (process.env.TELEGRAM_BOT_TOKEN) {
            try {
                await sendTelegramMessage(chatId, reply);
                console.log('✅ 消息已回复');
            } catch (error) {
                console.error('❌ 发送回复失败:', error);
            }
        } else {
            console.log('⚠️  未设置 TELEGRAM_BOT_TOKEN，跳过回复');
        }
    }
    
    return { processed: true, updateId };
}

// 生成回复内容
function generateReply(text, username = '用户') {
    if (text === '/start') {
        return \`🤖 欢迎 \${username}！

欢迎使用中蒙代购机器人助手！

📦 我们提供：
• 正品代购服务
• 3-7天快速配送  
• 透明的价格体系
• 24小时客服

🔗 直接发送商品链接开始代购！
输入 "价格" 了解费用详情
输入 "联系" 获取联系方式

有什么需要帮助的吗？\`;
    }
    
    if (text.toLowerCase().includes('价格') || text.toLowerCase().includes('钱') || text.toLowerCase().includes('费用')) {
        return \`💰 **代购费用说明**

📋 费用结构：
1️⃣ **商品价格** - 实物价格
2️⃣ **代购服务费** - 5-10%
3️⃣ **国内运费** - 到我们的仓库
4️⃣ **国际运费** - ¥65/kg
5️⃣ **包装费** - ¥5

💡 **计算示例：**
商品价 ¥100 + 服务费 ¥10 + 运费 ¥65 = **总计 ¥175**

⏰ **时效：** 3-7个工作日送达蒙古

需要更详细的价格计算吗？\`;
    }
    
    if (text.toLowerCase().includes('联系') || text.toLowerCase().includes('客服')) {
        return \`📞 **联系方式**

📱 **客服微信：** zhongmeng代购客服
📧 **客服邮箱：** service@daqui.com
💬 **Telegram群组：** @zhongmeng_daqui_group
📞 **客服电话：** +976-XXXX-XXXX

⏰ **服务时间：** 
周一至周日 9:00-21:00 (蒙古时间)

有任何问题随时联系我们！\`;
    }
    
    if (text.startsWith('http')) {
        return \`🔗 **商品链接已接收**

✅ **链接已记录**
🔍 **正在查询商品信息**
⏳ **稍后为您提供报价**

📋 **接下来的流程：**
1. 商品价格查询
2. 运费计算
3. 确认订单
4. 付款下单
5. 物流追踪

客服会尽快联系您确认订单详情！
`;
    }
    
    // 默认回复
    return \`📱 您好 \${username}！我是中蒙代购机器人。

🔗 **快速开始：**
• 发送商品链接
• 输入"价格"了解费用  
• 输入"联系"获取客服

有什么可以帮您的吗？
\`;
}

// 发送 Telegram 消息
async function sendTelegramMessage(chatId, text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error('未设置 TELEGRAM_BOT_TOKEN 环境变量');
    }
    
    const response = await fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });
    
    if (!response.ok) {
        throw new Error(\`Telegram API 错误: \${response.status}\`);
    }
    
    return response.json();
}
