// 最简单的版本，确保一定能工作
export default async function handler(req, res) {
    console.log(`[${new Date().toISOString()}] 收到请求: ${req.method} ${req.url}`);
    
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // 处理 GET 请求
    if (req.method === 'GET') {
        return res.status(200).json({
            ok: true,
            message: 'Webhook API 已启动',
            timestamp: new Date().toISOString(),
            description: '中蒙代购机器人 Webhook 端点',
            usage: {
                POST: '接收 Telegram 机器人消息',
                GET: '检查 API 状态'
            }
        });
    }
    
    // 处理 POST 请求
    if (req.method === 'POST') {
        try {
            // 获取请求体
            const body = req.body || {};
            
            console.log('POST 数据:', JSON.stringify(body, null, 2));
            
            // 如果是测试请求
            if (body.test === true) {
                return res.status(200).json({
                    ok: true,
                    message: '测试请求成功',
                    received: body,
                    timestamp: new Date().toISOString()
                });
            }
            
            // 处理 Telegram 更新
            if (body.update_id) {
                console.log(`处理 Telegram 更新 #${body.update_id}`);
                
                const message = body.message || body.callback_query?.message || body.edited_message;
                if (message) {
                    console.log(`消息来自: ${message.from?.first_name} (${message.from?.id})`);
                }
                
                // 立即响应 200，表示接收成功
                return res.status(200).json({ 
                    ok: true,
                    update_id: body.update_id,
                    processed: true,
                    timestamp: new Date().toISOString()
                });
            }
            
            // 其他 POST 请求
            return res.status(200).json({
                ok: true,
                received: body,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('处理 POST 请求时出错:', error);
            return res.status(500).json({ 
                ok: false, 
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // 其他 HTTP 方法
    return res.status(405).json({
        ok: false,
        error: '方法不允许',
        allowed: ['GET', 'POST', 'OPTIONS']
    });
}
