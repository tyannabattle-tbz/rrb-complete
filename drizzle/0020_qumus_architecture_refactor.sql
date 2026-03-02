-- QUMUS Architecture Refactoring: Add Canryn Production Radio Infrastructure

-- Add broadcastChannelIds column to emergency_alerts if it doesn't exist
ALTER TABLE emergency_alerts ADD COLUMN IF NOT EXISTS broadcastChannelIds TEXT NOT NULL DEFAULT '[]';

-- Drop regions column if it exists (we're replacing it with broadcastChannelIds)
ALTER TABLE emergency_alerts DROP COLUMN IF EXISTS regions;

-- Create radio_stations table for Canryn Production infrastructure
CREATE TABLE IF NOT EXISTS radio_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  operatorName VARCHAR(255),
  description TEXT,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  totalListeners INT DEFAULT 0,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create radio_channels table for individual channels within stations
CREATE TABLE IF NOT EXISTS radio_channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stationId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(64),
  genre VARCHAR(128),
  status ENUM('active', 'scheduled', 'offline') DEFAULT 'active',
  currentListeners INT DEFAULT 0,
  totalListeners INT DEFAULT 0,
  streamUrl VARCHAR(2048),
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (stationId) REFERENCES radio_stations(id) ON DELETE CASCADE
);

-- Create alert_broadcast_log table for tracking alert broadcasts through radio channels
CREATE TABLE IF NOT EXISTS alert_broadcast_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alertId INT NOT NULL,
  channelId INT NOT NULL,
  status ENUM('pending', 'broadcasting', 'delivered', 'failed') DEFAULT 'pending',
  listenersReached INT DEFAULT 0,
  interruptedRegularContent BOOLEAN DEFAULT FALSE,
  error TEXT,
  broadcastStartedAt TIMESTAMP NULL,
  broadcastEndedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alertId) REFERENCES emergency_alerts(id) ON DELETE CASCADE,
  FOREIGN KEY (channelId) REFERENCES radio_channels(id)
);
