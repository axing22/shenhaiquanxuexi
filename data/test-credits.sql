-- 测试脚本：为当前用户添加积分和交易记录
-- 请将 YOUR_USER_UUID 替换为你的实际用户 UUID

-- 1. 插入或更新用户积分余额
INSERT INTO credits (user_uuid, balance, created_at, updated_at)
VALUES ('YOUR_USER_UUID', 1000, NOW(), NOW())
ON CONFLICT (user_uuid)
DO UPDATE SET balance = 1000, updated_at = NOW();

-- 2. 插入一些测试交易记录
INSERT INTO credit_history (user_uuid, amount, type, description, created_at)
VALUES
  ('YOUR_USER_UUID', 500, 'recharge', '购买积分套餐', NOW() - INTERVAL '5 days'),
  ('YOUR_USER_UUID', -50, 'consume', '生成AI图片', NOW() - INTERVAL '4 days'),
  ('YOUR_USER_UUID', -30, 'consume', '生成AI图片', NOW() - INTERVAL '3 days'),
  ('YOUR_USER_UUID', 500, 'recharge', '购买积分套餐', NOW() - INTERVAL '2 days'),
  ('YOUR_USER_UUID', -40, 'consume', '生成AI视频', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_UUID', 100, 'reward', '邀请好友奖励', NOW() - INTERVAL '12 hours'),
  ('YOUR_USER_UUID', -20, 'consume', '生成AI图片', NOW() - INTERVAL '6 hours'),
  ('YOUR_USER_UUID', -10, 'consume', '生成提示词', NOW() - INTERVAL '2 hours');

-- 查看结果
SELECT * FROM credits WHERE user_uuid = 'YOUR_USER_UUID';
SELECT * FROM credit_history WHERE user_uuid = 'YOUR_USER_UUID' ORDER BY created_at DESC;
