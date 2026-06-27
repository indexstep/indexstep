-- Seed 25 default badges
-- Run after the migration above

INSERT INTO "Badge" ("id", "name", "description", "icon", "color", "badgeType", "tier", "criteria", "isActive", "createdAt") VALUES
-- Common tier
(cuid(), 'First Blood', 'Submitted your first guide.', '🩸', '#ef4444', 'milestone', 'common', '{"minTutorials": 1}', true, now()),
(cuid(), 'Threat Spotter', 'Found a guide with threat score ≥ 50.', '🎯', '#f97316', 'milestone', 'common', '{"minThreatScore": 50}', true, now()),
(cuid(), 'IOC Eye', 'Extracted 10+ IOCs from a single guide.', '👁️', '#06b6d4', 'milestone', 'common', '{"minIocsSingle": 10}', true, now()),
(cuid(), 'Night Owl', 'Submitted a guide between 12am and 4am.', '🦉', '#6366f1', 'system', 'common', '{"nightSubmission": true}', true, now()),
(cuid(), 'Verified Analyst', 'Verified your account.', '✅', '#22c55e', 'system', 'common', '{"verified": true}', true, now()),

-- Rare tier
(cuid(), 'Sample Swarm', 'Submitted 10 guides.', '🐜', '#f97316', 'milestone', 'rare', '{"minTutorials": 10}', true, now()),
(cuid(), 'Static Master', 'Ran 25 static analyses.', '🔍', '#3b82f6', 'milestone', 'rare', '{"minStatic": 25}', true, now()),
(cuid(), 'Dynamic Dynamo', 'Ran 25 dynamic analyses.', '⚡', '#eab308', 'milestone', 'rare', '{"minDynamic": 25}', true, now()),
(cuid(), 'IOC Harvest', 'Extracted 50+ IOCs across all submissions.', '🌾', '#22c55e', 'milestone', 'rare', '{"minTotalIocs": 50}', true, now()),
(cuid(), 'ATT&CK Mapper', 'Mapped a guide to 3+ MITRE tactics.', '🗺️', '#8b5cf6', 'milestone', 'rare', '{"minTactics": 3}', true, now()),
(cuid(), 'API Power User', 'Made 100+ API calls in a single day.', '⚙️', '#64748b', 'system', 'rare', '{"dailyApiCalls": 100}', true, now()),
(cuid(), 'Streak Runner', 'Used the platform 7 days in a row.', '🔥', '#f97316', 'system', 'rare', '{"minDayStreak": 7}', true, now()),
(cuid(), 'File Type Explorer', 'Submitted 5 different file types.', '🗂️', '#14b8a6', 'milestone', 'rare', '{"minFileTypes": 5}', true, now()),

-- Epic tier
(cuid(), 'Virus Vault', 'Submitted 50 guides.', '🏦', '#a855f7', 'milestone', 'epic', '{"minTutorials": 50}', true, now()),
(cuid(), 'Full Spectrum', 'Completed 10 full-analysis runs.', '🌐', '#22c55e', 'milestone', 'epic', '{"minFull": 10}', true, now()),
(cuid(), 'Threat Magnifier', 'Found a guide with threat score ≥ 95.', '🔬', '#a855f7', 'milestone', 'epic', '{"minThreatScore": 95}', true, now()),
(cuid(), 'IOC King', 'Extracted 200+ IOCs across all submissions.', '👑', '#f59e0b', 'milestone', 'epic', '{"minTotalIocs": 200}', true, now()),
(cuid(), 'Tactics Grandmaster', 'Mapped guides to 10+ unique MITRE techniques.', '🏆', '#f59e0b', 'milestone', 'epic', '{"minTechniques": 10}', true, now()),
(cuid(), 'Early Bird', 'Joined during the beta period.', '🐦', '#06b6d4', 'system', 'epic', '{"earlyUser": true}', true, now()),
(cuid(), 'Community Helper', 'First to report a guide that helped the community.', '🤝', '#22c55e', 'system', 'epic', '{"communityHelp": true}', true, now()),
(cuid(), 'Jack of All Trades', 'Submitted at least one PE, ELF, APK, PDF, and Office guide.', '🎭', '#a855f7', 'milestone', 'epic', '{"fileTypeCombo": ["pe", "elf", "apk", "pdf", "office"]}', true, now()),

-- Legendary tier
(cuid(), 'Malware Mogul', 'Submitted 100 guides. You run a zoo.', '🦁', '#f59e0b', 'milestone', 'legendary', '{"minTutorials": 100}', true, now()),
(cuid(), 'Zero Day Hunter', 'Identified a previously unknown threat.', '🕵️', '#f59e0b', 'system', 'legendary', '{"firstOfKind": true}', true, now()),
(cuid(), 'Century Club', 'Maintained a 100-day submission streak.', '💯', '#f59e0b', 'system', 'legendary', '{"minDayStreak": 100}', true, now()),

ON CONFLICT DO NOTHING;