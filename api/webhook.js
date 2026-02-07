module.exports = (req, res) => {
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    console.log(`[${new Date().toISOString()}] ${req.method} 请求`);
    
    // 处理 GET 请求
    if (req.method === 'GET') {
        return res.status(200).json({
            ok: true,
            message: '✅ Webhook API 运行正常',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            usage: '用于接收 Telegram 机器人消息'
        });
    }
    
    // 处理 POST 请求
    if (req.method === 'POST') {
        let body = '';
        
        // 异步读取请求体
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = body ? JSON.parse(body) : {};
                
                console.log('收到 POST 数据:', JSON.stringify(data));
                
                // 检查是否为 Telegram 更新
                if (data.update_id) {
                    console.log(`处理 Telegram 更新 #${data.update_id}`);
                    
                    const response = {
                        ok: true,
                        update_id: data.update_id,
                        processed: true,
                        timestamp: new Date().toISOString()
                    };
                    
                    res.status(200).json(response);
                } else {
                    res.status(200).json({
                        ok: true,
                        received: data,
                        timestamp: new Date().toISOString()
                    });
                }
                
            } catch (error) {
                console.error('解析 JSON 错误:', error);
                res.status(400).json({
                    ok: false,
                    error: '无效的 JSON',
                    message: error.message
                });
            }
        });
        
        return;
    }
    
    // 其他方法
    res.status(405).json({
        ok: false,
        error: '方法不允许',
        allowed: ['GET', 'POST', 'OPTIONS']
    });
};
