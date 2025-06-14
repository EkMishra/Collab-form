// lib/syncRedisToDB.js
import redis from "./redis.js";
import prisma from "./prisma.js";

export const syncRedisToDB = async () => {
  try {
    const keys = await redis.keys("form:*:fields");

    for (const redisKey of keys) {
      const parts = redisKey.split(":");
      const formId = parts[1];

      // Validate that formId exists in DB
      const form = await prisma.form.findUnique({ where: { id: formId } });
      if (!form) {
        console.warn(`⚠️ Skipping invalid formId from Redis: ${formId}`);
        continue;
      }

      const fields = await redis.hGetAll(redisKey); // { fieldKey: value, ... }
      if (!fields || Object.keys(fields).length === 0) continue;

      const existing = await prisma.formResponse.findUnique({
        where: { formId },
      });

      if (!existing) {
        await prisma.formResponse.create({
          data: {
            formId,
            responses: fields,
          },
        });
      } else {
        await prisma.formResponse.update({
          where: { formId },
          data: {
            responses: {
              ...existing.responses,
              ...fields,
            },
          },
        });
      }

      console.log(`🔄 Synced form ${formId} to DB`);
    }
  } catch (err) {
    console.error("❌ Error syncing Redis to DB:", err);
  }
};
