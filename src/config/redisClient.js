// d:\Project\NodeJS\QuotasMAF02\src\config\redisClient.js
const Redis = require("ioredis");

// Default connection (connects to 127.0.0.1:6379)
// You can configure this with environment variables or a config file
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,

  //this connect to server
//   host: process.env.REDIS_HOST || "10.0.100.31",
//   port: process.env.REDIS_PORT || 6379,
  // password: process.env.REDIS_PASSWORD || undefined, // Uncomment if your Redis instance has a password
  // db: process.env.REDIS_DB || 0, // Default Redis database
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000); // delay will be 50, 100, 150, 200, ..., 2000
    return delay;
  },
  maxRetriesPerRequest: 3, // Only retry 3 times
});

redisClient.on("connect", () => {
  console.log("Successfully connected to Redis!");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Optional: Ping Redis to check connection on startup
async function checkRedisConnection() {
  try {
    const pong = await redisClient.ping();
    console.log("Redis PING response:", pong); // Should be 'PONG'
  } catch (error) {
    console.error("Redis PING failed:", error);
  }
}

checkRedisConnection();

module.exports = redisClient;
