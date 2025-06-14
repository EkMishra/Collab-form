import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import redis from "./redis.js";
import prisma from "./prisma.js";

// Duplicate Redis clients for adapter
const pubClient = redis.duplicate();
const subClient = redis.duplicate();

await pubClient.connect();
await subClient.connect();

// Store the Socket.IO instance
let ioInstance = null;
export const getIO = () => ioInstance;

// Initialize and configure Socket.IO server
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust in production
    },
  });

  ioInstance = io; // Save instance for controller access
  io.adapter(createAdapter(pubClient, subClient));

  // 🔁 Redis Key Expiration — Unlock fields on lock expiration
  subClient.pSubscribe("__keyevent@0__:expired", async (message) => {
    if (message.startsWith("lock:")) {
      const [, formId, fieldKey] = message.split(":");
      console.log(`⏰ Lock expired → ${formId}:${fieldKey}`);
      io.to(formId).emit("field_unlocked", { fieldKey });
    }
  });

  // 🎯 Socket connection logic
  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on("join_form", ({ formId }) => {
      socket.join(formId);
      console.log(`➕ Socket ${socket.id} joined form ${formId}`);
    });

    socket.on("leave_form", ({ formId }) => {
      socket.leave(formId);
      console.log(`➖ Socket ${socket.id} left form ${formId}`);
    });

    socket.on("field_lock", async ({ formId, fieldKey, userId }) => {
      const lockKey = `lock:${formId}:${fieldKey}`;
      const existing = await redis.get(lockKey);
      console.log(`🔐 Lock attempt: ${lockKey} by ${userId}`);

      if (!existing || existing === userId) {
        await redis.set(lockKey, userId, { EX: 10 });
        socket.to(formId).emit("field_locked", { fieldKey, userId });
        socket.emit("field_lock_acquired", { fieldKey });
      } else {
        socket.emit("field_lock_denied", { fieldKey, lockedBy: existing });
      }
    });

    socket.on("field_unlock", async ({ formId, fieldKey, userId }) => {
      const lockKey = `lock:${formId}:${fieldKey}`;
      const current = await redis.get(lockKey);
      console.log(`🔓 Unlock attempt: ${lockKey} by ${userId}`);

      if (current === userId) {
        await redis.del(lockKey);
        io.to(formId).emit("field_unlocked", { fieldKey });
      }
    });

    socket.on("lock_heartbeat", async ({ formId, fieldKey, userId }) => {
      const lockKey = `lock:${formId}:${fieldKey}`;
      const current = await redis.get(lockKey);

      if (current === userId) {
        await redis.expire(lockKey, 10);
        console.log(`🔁 Heartbeat: Lock renewed for ${lockKey} by ${userId}`);
        socket.emit("lock_renewed", { fieldKey });
      } else {
        console.warn(`⚠️ Heartbeat failed: ${lockKey} not held by ${userId}`);
        socket.emit("lock_missing", { fieldKey });
      }
    });

    socket.on("field_update", async ({ formId, fieldKey, value }) => {
      try {
        const exists = await prisma.form.findUnique({ where: { id: formId } });
        if (!exists) {
          console.warn(`🚫 Invalid formId: ${formId}`);
          return;
        }

        const redisKey = `form:${formId}:fields`;
        await redis.hSet(redisKey, fieldKey, value);
        await redis.expire(redisKey, 3600); // 1 hour

        console.log(`✅ field_update: ${formId}:${fieldKey} = ${value}`);
        io.to(formId).emit("field_update", { fieldKey, value });

      } catch (err) {
        console.error("❌ field_update error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
