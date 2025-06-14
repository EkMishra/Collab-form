import prisma from '../lib/prisma.js';

export const createUser = async (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  try {
    const user = await prisma.user.create({
      data: { name, role }
    });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const joinForm = async (req, res) => {
  const { inviteCode } = req.params;

  try {
    const form = await prisma.form.findUnique({
      where: { inviteCode },
      include: {
        fields: true,
        response: true
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join form' });
  }
};
