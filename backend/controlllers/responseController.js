import prisma from '../lib/prisma.js';
import redis from '../lib/redis.js';
import { getIO } from "../lib/socket.js";


export const updateFormResponse = async (req, res) => {
  const { id } = req.params;
  const { fieldKey, value } = req.body;

  if (!fieldKey || typeof value === 'undefined') {
    return res.status(400).json({ error: 'Field key and value required' });
  }

  try {
    const existing = await prisma.formResponse.findUnique({
      where: { formId: id }
    });

    if (!existing) {
      const newResponse = await prisma.formResponse.create({
        data: {
          formId: id,
          responses: { [fieldKey]: value }
        }
      });
      return res.status(201).json(newResponse);
    }

    const updated = await prisma.formResponse.update({
      where: { formId: id },
      data: {
        responses: {
          ...existing.responses,
          [fieldKey]: value
        }
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update form response' });
  }
};

export const finalizeForm = async (req, res) => {
  const { formId } = req.body;

  if (!formId) {
    return res.status(400).json({ error: "Form ID is required" });
  }

  try {
    const redisKey = `form:${formId}:fields`;
    const fields = await redis.hGetAll(redisKey);

    if (!fields || Object.keys(fields).length === 0) {
      return res.status(404).json({ error: "No data found in Redis for this form" });
    }

    // Upsert form response
    const existing = await prisma.formResponse.findUnique({ where: { formId } });

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

    
    await prisma.form.update({
      where: { id: formId },
      data: { finalized: true },
    });

    
    const io = getIO();
    io.to(formId).emit("form_finalized", {
      message: "This form has been finalized and locked.",
      formId,
    });

    res.status(200).json({ message: "Form responses finalized and saved to DB." });
  } catch (err) {
    console.error("❌ Error finalizing form:", err);
    res.status(500).json({ error: "Failed to finalize form responses" });
  }
};

