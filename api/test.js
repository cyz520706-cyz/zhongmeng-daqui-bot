module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send('✅ API 测试端点正常工作！\n时间: ' + new Date().toLocaleString('zh-CN'));
};
