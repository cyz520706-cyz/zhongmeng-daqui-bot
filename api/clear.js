module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    try {
        console.log('清空待处理更新...');
        
        // 这里可以添加清理逻辑
        // 实际项目中可能需要调用 Telegram API 来处理待处理的更新
        
        res.status(200).json({ 
            ok: true, 
            message: '清理请求已处理',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
