export default function handler(req, res) {
    res.status(200).json({
        ok: true,
        message: '✅ 测试端点工作正常',
        time: new Date().toLocaleString('zh-CN'),
        url: req.url,
        method: req.method,
        env: {
            node_version: process.version,
            platform: process.platform
        }
    });
}
