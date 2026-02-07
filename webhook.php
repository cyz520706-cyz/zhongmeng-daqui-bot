<?php
header('Content-Type: text/html; charset=utf-8');

// 日志函数
function logMessage($message, $level = 'info') {
    $timestamp = date('[Y-m-d H:i:s]');
    $logLine = "$timestamp [$level] $message\n";
    file_put_contents('logs.txt', $logLine, FILE_APPEND);
    echo "$logLine<br>";
}

echo "<!DOCTYPE html><html><head><title>Webhook 测试</title><style>";
echo "body { font-family: Arial; padding: 20px; background: #f0f0f0; }";
echo ".success { color: green; font-weight: bold; }";
echo ".error { color: red; }";
echo "</style></head><body>";
echo "<h1>🤖 Telegram Webhook 接收器</h1>";

// 记录访问
logMessage('有人访问 Webhook 页面', 'info');

// 如果是 POST 请求，处理 Telegram 的 Webhook
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    logMessage('收到 POST 数据: ' . substr($input, 0, 200), 'info');
    
    if (!empty($input)) {
        $data = json_decode($input, true);
        
        if ($data) {
            $updateId = $data['update_id'] ?? 'unknown';
            logMessage("处理更新 #$updateId", 'info');
            
            // 处理消息
            if (isset($data['message'])) {
                $message = $data['message'];
                $text = $message['text'] ?? '';
                $chatId = $message['chat']['id'] ?? '';
                $username = $message['from']['username'] ?? $message['from']['first_name'] ?? '用户';
                
                logMessage("收到来自 $username 的消息: $text", 'success');
                
                // 自动回复
                if (!empty($text)) {
                    $reply = "您好！我是中蒙代购机器人助手。\n";
                    $reply .= "收到您的消息: $text\n\n";
                    $reply .= "🔗 直接发送商品链接开始代购\n";
                    $reply .= "📱 如需人工客服，请说明需求";
                    
                    // 记录回复
                    logMessage("自动回复: " . str_replace("\n", " ", $reply), 'info');
                    
                    // 返回给 Telegram 的响应
                    header('Content-Type: application/json');
                    echo json_encode([
                        'method' => 'sendMessage',
                        'chat_id' => $chatId,
                        'text' => $reply,
                        'parse_mode' => 'HTML'
                    ]);
                    exit;
                }
            }
        } else {
            logMessage('JSON 解析失败', 'error');
        }
    } else {
        logMessage('收到空的 POST 请求', 'warning');
    }
    
    // 告诉 Telegram 已收到
    echo json_encode(['ok' => true]);
    
} else {
    // GET 请求显示状态
    echo "<h2>✅ Webhook 运行正常</h2>";
    echo "<p><strong>服务器时间:</strong> " . date('Y-m-d H:i:s') . "</p>";
    echo "<p><strong>Webhook URL:</strong> https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . "</p>";
    
    if (file_exists('logs.txt')) {
        echo "<h3>📜 最近日志:</h3>";
        $lines = file('logs.txt', FILE_IGNORE_NEW_LINES);
        $recent = array_slice($lines, -10);
        echo "<pre style='background:#000;color:#0f0;padding:10px;'>";
        foreach ($recent as $line) {
            echo htmlspecialchars($line) . "\n";
        }
        echo "</pre>";
    }
    
    echo "<p><a href='/'>🔙 返回管理页面</a></p>";
}

echo "</body></html>";

// 处理主页的 GET 参数
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    if ($_GET['action'] === 'addlog' && isset($_GET['msg'])) {
        logMessage($_GET['msg'], 'info');
    } elseif ($_GET['action'] === 'clearlogs') {
        file_put_contents('logs.txt', '');
        logMessage('日志已清空', 'info');
    }
}
?>
