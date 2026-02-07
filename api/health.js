module.exports = function handler(req, res) {
    console.log('健康检查被调用');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(200).json({
        status: 'healthy',
        service: 'telegram-webhook',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });
};
