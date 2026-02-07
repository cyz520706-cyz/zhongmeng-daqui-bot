module.exports = async (req, res) => {
    // 立即设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    console.log(`[${new Date().toISOString()}] 收到 ${req.method} 请求: ${req.url}`);
    
    // 处理 GET 请求
    if (req.method === 'GET') {
        return res.status(200).json({
            ok: true,
            message: 'Webhook API 正常运行',
            timestamp: new Date().toISOString(),
            path: req.url
        });
    }
    
    // 处理 POST 请求
    if (req.method === 'POST') {
        try {
            // 获取请求体
            let body = '';
            for await (const chunk of req) {
                body += chunk;
            }
            
            const data = body ? JSON.parse(body) : {};
            console.log('POST 数据:', data);
            
            // 如果是 Telegram 更新
            if (data.update_id) {
                console.log(`处理 Telegram 更新 #${data.update_id}`);
            }
            
            return res.status(200).json({
                ok: true,
                received: data,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('处理错误:', error);
            return res.status(500).json({ ok: false, error: error.message });
        }
    }
    
    // 其他方法
    return res.status(405).json({ ok: false, error: '方法不允许' });
};
