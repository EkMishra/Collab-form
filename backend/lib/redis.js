// lib/redis.js
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

await redis.connect();

// ✅ Enable keyspace notifications for "expired" events (used for syncing, locks, etc.)
try {
  await redis.configSet('notify-keyspace-events', 'Ex');
  console.log('✅ Redis keyspace notifications enabled (Ex)');
} catch (err) {
  console.error('❌ Failed to enable Redis keyspace notifications:', err);
}

export default redis;
