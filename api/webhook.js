module.exports = function handler(req, res) {
    console.log('Webhook 函数被调用:', req.method, req.url);
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ message: 'OK' });
    }
    
    // GET 请求 - 健康检查
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'Webhook API 运行正常',
            timestamp: new Date().toISOString(),
            status: 'online'
        });
    }
    
    // POST 请求 - 处理数据
    if (req.method === 'POST') {
        let body = '';
        
        // 读取请求体
        req.on('data', function(chunk) {
            body += chunk;
        });
        
        req.on('end', function() {
            try {
                const data = JSON.parse(body || '{}');
                console.log('收到 POST 数据:', JSON.stringify(data));
                
                // 检查是否为 Telegram 更新
                if (data.update_id) {
                    console.log('处理 Telegram 更新 #' + data.update_id);
                    
                    // 返回成功响应
                    return res.status(200).json({
                        ok: true,
                        update_id: data.update_id,
                        processed: true,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // 普通 POST 请求
                    return res.status(200).json({
                        ok: true,
                        received: data,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('解析 JSON 错误:', error.message);
                return res.status(400).json({
                    ok: false,
                    error: 'Invalid JSON: ' + error.message
                });
            }
        });
        
        return;
    }
    
    // 其他方法
    return res.status(405).json({
        ok: false,
        error: 'Method not allowed',
        allowed: ['GET', 'POST', 'OPTIONS']
    });
};
