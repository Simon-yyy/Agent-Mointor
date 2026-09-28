-- ==============================================================================
-- Flyway 迁移脚本: V25__fix_misplaced_vendors_and_hosting_providers.sql
-- 目标:
-- 1. 去重托管商名下的冗余模型，防止触发 uk_vendor_model (vendor_id, model_key)
-- 2. 彻底纠偏历史由于托管平台/分发渠道导致的模型厂商归属错位问题（归还研发原厂）
-- 3. 彻底纠偏厂商国内外地域标注 (region = '中国' / '海外')，杜绝国内大厂被显示为海外
-- 4. 关联厂商别名，收敛 Alibaba (China) 等冗余幽灵厂商
-- ==============================================================================

-- 0. 去重处理：若托管商/云渠道下的模型已在真实厂商存在，或托管商之间存在重复，先删除多余冗余记录
DELETE m1 FROM `ai_models` m1
INNER JOIN `ai_models` m2 
  ON m1.model_key = m2.model_key AND m1.id != m2.id
WHERE m1.vendor_id IN (21, 30, 52, 62, 101, 217, 229, 231)
  AND m2.vendor_id NOT IN (21, 30, 52, 62, 101, 217, 229, 231);

DELETE m1 FROM `ai_models` m1
INNER JOIN `ai_models` m2 
  ON m1.model_key = m2.model_key AND m1.id > m2.id
WHERE m1.vendor_id IN (21, 30, 52, 62, 101, 217, 229, 231)
  AND m2.vendor_id IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 1. 纠偏 model_vendors 的地域标注 (region)
-- 国内研发厂商明确为 '中国'
UPDATE `model_vendors` SET `region` = '中国' WHERE `id` IN (5, 6, 15, 16, 17, 18, 19, 20, 29, 101, 135, 147, 151, 157, 168, 169, 170, 182, 185, 191, 194, 210, 217, 223, 231);
UPDATE `model_vendors` SET `region` = '中国' 
WHERE LOWER(`name`) LIKE '%(china)%' 
   OR LOWER(`name`) LIKE '%china%' 
   OR LOWER(`name`) LIKE '%chinese%' 
   OR LOWER(`name`) LIKE '%alibaba%' 
   OR LOWER(`name`) LIKE '%deepseek%' 
   OR LOWER(`name`) LIKE '%zhipu%' 
   OR LOWER(`name`) LIKE '%moonshot%' 
   OR LOWER(`name`) LIKE '%minimax%' 
   OR LOWER(`name`) LIKE '%tencent%' 
   OR LOWER(`name`) LIKE '%baidu%' 
   OR LOWER(`name`) LIKE '%bytedance%' 
   OR LOWER(`name`) LIKE '%xiaomi%' 
   OR LOWER(`name`) LIKE '%stepfun%';

-- 海外主要研发厂商明确为 '海外'
UPDATE `model_vendors` SET `region` = '海外' WHERE `id` IN (1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 25, 125, 136, 146, 150, 153, 171, 197, 199, 205, 211, 224, 228, 229);
UPDATE `model_vendors` SET `region` = '海外' WHERE `region` = '全球' AND NOT (`region` = '中国');

-- 2. 将错位挂在云托管平台 / 分发商 / 别名厂商名下的模型，依据模型研发特征彻底归位真实原厂
-- 托管商/混挂厂商名单: 21 (Deep Infra), 30 (Alibaba Token Plan), 52 (Alibaba Coding Plan), 62 (Alibaba Token Plan China), 101 (SiliconFlow), 217 (Alibaba Coding Plan China), 229 (DigitalOcean), 231 (Alibaba China)

-- 2.1 归位至 Anthropic (ID = 2)
UPDATE `ai_models` 
SET `vendor_id` = 2 
WHERE (LOWER(`display_name`) LIKE '%claude%' OR LOWER(`model_key`) LIKE '%claude%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.2 归位至 Alibaba (阿里通义) (ID = 6)
UPDATE `ai_models` 
SET `vendor_id` = 6 
WHERE (LOWER(`display_name`) LIKE '%qwen%' 
       OR LOWER(`display_name`) LIKE '%wan2%' 
       OR LOWER(`display_name`) LIKE '%tongyi%'
       OR LOWER(`display_name`) LIKE '%qwq%'
       OR LOWER(`display_name`) LIKE '%gte-%'
       OR LOWER(`model_key`) LIKE '%qwen%' 
       OR LOWER(`model_key`) LIKE '%wan2%'
       OR LOWER(`model_key`) LIKE '%qwq%'
       OR LOWER(`model_key`) LIKE '%gte-%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.3 归位至 DeepSeek (深度求索) (ID = 5)
UPDATE `ai_models` 
SET `vendor_id` = 5 
WHERE (LOWER(`display_name`) LIKE '%deepseek%' OR LOWER(`model_key`) LIKE '%deepseek%');

-- 2.4 归位至 OpenAI (ID = 1)
UPDATE `ai_models` 
SET `vendor_id` = 1 
WHERE (LOWER(`display_name`) LIKE '%gpt%' 
       OR LOWER(`display_name`) LIKE '%o1%' 
       OR LOWER(`display_name`) LIKE '%o3%' 
       OR LOWER(`display_name`) LIKE '%dall-e%'
       OR LOWER(`model_key`) LIKE '%gpt%' 
       OR LOWER(`model_key`) LIKE '%openai%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.5 归位至 Meta AI (ID = 4)
UPDATE `ai_models` 
SET `vendor_id` = 4 
WHERE (LOWER(`display_name`) LIKE '%llama%' OR LOWER(`model_key`) LIKE '%llama%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.6 归位至 Google DeepMind (ID = 3)
UPDATE `ai_models` 
SET `vendor_id` = 3 
WHERE (LOWER(`display_name`) LIKE '%gemini%' 
       OR LOWER(`display_name`) LIKE '%gemma%' 
       OR LOWER(`model_key`) LIKE '%gemini%' 
       OR LOWER(`model_key`) LIKE '%gemma%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.7 归位至 字节跳动 (豆包/Seed) (ID = 15)
UPDATE `ai_models` 
SET `vendor_id` = 15 
WHERE (LOWER(`display_name`) LIKE '%seed%' 
       OR LOWER(`display_name`) LIKE '%doubao%' 
       OR LOWER(`model_key`) LIKE '%seed%' 
       OR LOWER(`model_key`) LIKE '%doubao%' 
       OR LOWER(`model_key`) LIKE '%bytedance%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.8 归位至 百度 (文心一言/PaddlePaddle) (ID = 16)
UPDATE `ai_models` 
SET `vendor_id` = 16 
WHERE (LOWER(`display_name`) LIKE '%ernie%' 
       OR LOWER(`display_name`) LIKE '%paddle%' 
       OR LOWER(`model_key`) LIKE '%ernie%' 
       OR LOWER(`model_key`) LIKE '%paddle%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.9 归位至 腾讯 (混元) (ID = 17)
UPDATE `ai_models` 
SET `vendor_id` = 17 
WHERE (LOWER(`display_name`) LIKE '%hunyuan%' 
       OR LOWER(`display_name`) LIKE 'hy3%' 
       OR LOWER(`display_name`) LIKE 'hy4%' 
       OR LOWER(`model_key`) LIKE '%hunyuan%' 
       OR LOWER(`model_key`) LIKE '%tencent-hy%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.10 归位至 智谱 AI (GLM) (ID = 18)
UPDATE `ai_models` 
SET `vendor_id` = 18 
WHERE (LOWER(`display_name`) LIKE '%glm%' 
       OR LOWER(`model_key`) LIKE '%glm%' 
       OR LOWER(`model_key`) LIKE '%zai-org%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.11 归位至 月之暗面 (Kimi) (ID = 19)
UPDATE `ai_models` 
SET `vendor_id` = 19 
WHERE (LOWER(`display_name`) LIKE '%kimi%' 
       OR LOWER(`display_name`) LIKE '%moonshot%' 
       OR LOWER(`model_key`) LIKE '%kimi%' 
       OR LOWER(`model_key`) LIKE '%moonshot%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.12 归位至 MiniMax (ID = 20)
UPDATE `ai_models` 
SET `vendor_id` = 20 
WHERE (LOWER(`display_name`) LIKE '%minimax%' OR LOWER(`model_key`) LIKE '%minimax%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.13 归位至 Mistral AI (ID = 11)
UPDATE `ai_models` 
SET `vendor_id` = 11 
WHERE (LOWER(`display_name`) LIKE '%mistral%' 
       OR LOWER(`display_name`) LIKE '%mixtral%' 
       OR LOWER(`display_name`) LIKE '%ministral%' 
       OR LOWER(`display_name`) LIKE '%codestral%' 
       OR LOWER(`model_key`) LIKE '%mistral%' 
       OR LOWER(`model_key`) LIKE '%mixtral%'
       OR LOWER(`model_key`) LIKE '%ministral%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.14 归位至 xAI (ID = 7)
UPDATE `ai_models` 
SET `vendor_id` = 7 
WHERE (LOWER(`display_name`) LIKE '%grok%' OR LOWER(`model_key`) LIKE '%grok%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.15 归位至 NVIDIA (ID = 10)
UPDATE `ai_models` 
SET `vendor_id` = 10 
WHERE (LOWER(`display_name`) LIKE '%nemotron%' 
       OR LOWER(`model_key`) LIKE '%nemotron%' 
       OR LOWER(`model_key`) LIKE '%nvidia%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.16 归位至 Stability AI (ID = 14)
UPDATE `ai_models` 
SET `vendor_id` = 14 
WHERE (LOWER(`display_name`) LIKE '%stable diffusion%' 
       OR LOWER(`display_name`) LIKE '%stable audio%' 
       OR LOWER(`display_name`) LIKE '%sdxl%' 
       OR LOWER(`model_key`) LIKE '%stable-diffusion%' 
       OR LOWER(`model_key`) LIKE '%sdxl%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.17 归位至 小米 (ID = 168)
UPDATE `ai_models` 
SET `vendor_id` = 168 
WHERE (LOWER(`display_name`) LIKE '%mimo%' OR LOWER(`model_key`) LIKE '%mimo%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.18 归位至 阶跃星辰 (ID = 182)
UPDATE `ai_models` 
SET `vendor_id` = 182 
WHERE (LOWER(`display_name`) LIKE '%step%' OR LOWER(`model_key`) LIKE '%stepfun%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 2.19 归位至 Arcee (ID = 222)
UPDATE `ai_models` 
SET `vendor_id` = 222 
WHERE (LOWER(`display_name`) LIKE '%arcee%' OR LOWER(`model_key`) LIKE '%arcee%')
  AND `vendor_id` IN (21, 30, 52, 62, 101, 217, 229, 231);

-- 3. 关联别名并清理幽灵厂商状态
-- 将 Alibaba (China)、Alibaba Token Plan 等别名显式写入 vendor_aliases 表指向 Alibaba (ID = 6)
INSERT IGNORE INTO `vendor_aliases` (`source_id`, `upstream_vendor_id`, `vendor_id`, `is_primary`, `created_at`)
VALUES 
(2, 'alibaba (china)', 6, 1, NOW(3)),
(2, 'alibaba-token-plan', 6, 1, NOW(3)),
(2, 'alibaba-coding-plan', 6, 1, NOW(3)),
(2, 'digitalocean', 229, 0, NOW(3)),
(2, 'deepinfra', 21, 0, NOW(3)),
(2, 'siliconflow (china)', 101, 0, NOW(3));

-- 将空的冗余托管商在 model_vendors 中更新状态为 INACTIVE
UPDATE `model_vendors` 
SET `status` = 'INACTIVE' 
WHERE `id` IN (231, 62, 217) 
  AND (SELECT COUNT(*) FROM `ai_models` WHERE `vendor_id` = `model_vendors`.`id`) = 0;
