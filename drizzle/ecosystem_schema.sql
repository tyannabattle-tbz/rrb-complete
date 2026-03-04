-- Growth Campaigns Schema
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'listener_acquisition', 'retention', 'engagement'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed'
  target_listeners INTEGER,
  current_listeners INTEGER DEFAULT 0,
  start_date BIGINT,
  end_date BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Community Forums Schema
CREATE TABLE IF NOT EXISTS forum_threads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  category TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES forum_threads(id)
);

-- Voting System Schema
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array
  total_votes INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  expires_at BIGINT
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  created_at BIGINT NOT NULL,
  FOREIGN KEY (poll_id) REFERENCES polls(id)
);

-- Emergency Drills Schema
CREATE TABLE IF NOT EXISTS emergency_drills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'mesh_network', 'broadcast', 'communication'
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'active', 'completed'
  scheduled_at BIGINT,
  started_at BIGINT,
  completed_at BIGINT,
  participants INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 0,
  created_at BIGINT NOT NULL
);

-- Donor Growth Schema
CREATE TABLE IF NOT EXISTS donor_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  target_donors INTEGER,
  current_donors INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- AI Bot Configuration
CREATE TABLE IF NOT EXISTS ai_bots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'engagement', 'support', 'promotion', 'moderation'
  status TEXT NOT NULL DEFAULT 'active',
  enabled BOOLEAN DEFAULT TRUE,
  config TEXT NOT NULL, -- JSON configuration
  created_at BIGINT NOT NULL
);

-- Social Media Integration
CREATE TABLE IF NOT EXISTS social_media_posts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'facebook', 'instagram', 'tiktok'
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'posted', 'failed'
  scheduled_at BIGINT,
  posted_at BIGINT,
  engagement_count INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL
);
