module.exports = function handler(req, res) {
    console.log('测试端点被调用');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(200).json({
        success: true,
        message: '测试端点正常工作',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
    });
};
