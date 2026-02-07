export default async function handler(request, res) {
    // CORS 头设置
    if (request.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    try {
        // 记录日志
        await logMessage(`收到 ${request.method} 请求到 /api/webhook`);
        
        if (request.method === 'POST') {
            const body = await request.json();
            
            // 处理 Telegram Webhook
            if (body.update_id) {
                await handleTelegramUpdate(body);
                return res.status(200).json({ ok: true });
            }
            
            // 处理测试请求
            return res.status(200).json({ 
                ok: true, 
                message: 'Webhook 接收正常',
                received: body 
            });
            
        } else {
            // GET 请求显示状态页面
            return res.status(200).send(getStatusHTML());
        }
        
    } catch (error) {
        await logMessage(`错误: ${error.message}`, 'error');
        return res.status(500).json({ error: error.message });
    }
}

// 处理 Telegram 更新
async function handleTelegramUpdate(update) {
    const updateId = update.update_id;
    await logMessage(`处理更新 #${updateId}`);
    
    if (update.message) {
        const msg = update.message;
        const text = msg.text || '';
        const chatId = msg.chat.id;
        const user = msg.from;
        
        await logMessage(`收到消息: ${text} 来自 ${user.first_name}`);
        
        // 自动回复
        const reply = generateReply(text);
        if (reply) {
            await sendMessage(chatId, reply);
        }
    }
}

// 生成回复内容
function generateReply(text) {
    if (text === '/start') {
        return `🤖 您好，${'用户'}！

欢迎使用中蒙代购机器人！

📦 我们提供：
• 正品保障的代购服务
• 3-7天快速送达
• 透明的价格体系

🔗 直接发送商品链接开始代购！
`;
    }
    
    if (text.toLowerCase().includes('价格') || text.toLowerCase().includes('钱')) {
        return `💰 **费用说明**

📦 代购流程：
1. 商品实价
2. 代购服务费（5-10%）
3. 国内运费
4. 国际运费（¥65/kg）

💡 例如：价值¥100的商品
• 商品价：¥100
• 代购费：¥10
• 运费：¥65
• 总计：¥175
`;
    }
    
    if (text.startsWith('http')) {
        return `🔗 **收到商品链接**

正在为您查询商品信息...

✅ 商品链接已记录
⏳ 价格查询中...
📦 稍后为您报价

请耐心等待，客服会尽快联系您！
`;
    }
    
    // 默认回复
    return `📱 您好！我是中蒙代购机器人助手。

🔗 发送商品链接开始代购
💬 输入 "价格" 了解费用
📞 输入 "联系" 查看联系方式

有什么需要帮助的吗？
`;
}

// 发送消息到 Telegram
async function sendMessage(chatId, text) {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            await logMessage('未设置 BOT_TOKEN 环境变量');
            return;
        }
        
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        if (response.ok) {
            await logMessage(`消息已发送给 ${chatId}`);
        } else {
            await logMessage(`发送消息失败: ${response.status}`, 'error');
        }
    } catch (error) {
        await logMessage(`发送消息异常: ${error.message}`, 'error');
    }
}

// 写入日志
async function logMessage(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    console.log(logLine.trim());
    
    // 尝试写入日志文件（Vercel 环境可能有限制）
    try {
        const { writeFile } = await import('fs/promises');
        await writeFile('logs.txt', logLine, { flag: 'a' });
    } catch (error) {
        console.log('无法写入日志文件:', error.message);
    }
}

// 生成状态页面HTML
function getStatusHTML() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webhook 状态</title>
    <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; }
        .status { background: #48bb78; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
        .logs { background: #1a1a1a; color: #0f0; padding: 20px; border-radius: 10px; font-family: monospace; max-height: 400px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Webhook 状态</h1>
        <div class="status">✅ 运行正常</div>
        <p><strong>时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
        <p><strong>状态:</strong> 系统正常运行</p>
        
        <h3>📋 使用说明</h3>
        <ul>
            <li>Webhook URL: ${typeof window !== 'undefined' ? window.location.href : ''}</li>
            <li>HTTP 方法: GET (状态页面) / POST (Telegram 推送)</li>
            <li>支持: Telegram Bot API</li>
        </ul>
        
        <div style="margin-top: 30px;">
            <a href="/" style="color: white; text-decoration: none;">🏠 返回管理页面</a>
        </div>
    </div>
</body>
</html>
    `;
}
