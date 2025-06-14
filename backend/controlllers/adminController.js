import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';

export const createForm = async (req, res) => {
  const { title, createdById } = req.body;
  const inviteCode = uuidv4().slice(0, 6);

  try {
    const form = await prisma.form.create({
      data: {
        title,
        createdById,
        inviteCode,
      },
    });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create form' });
  }
};

export const addFieldToForm = async (req, res) => {
  const { label, fieldType, options, order } = req.body;
  const formId = req.params.id;

  // console.log('Received field data:', {
  //   label,
  //   fieldType,
  //   options,
  //   order,
  //   formId,
  // });

  try {
    const field = await prisma.formField.create({
      data: {
        label,
        fieldType,
        options: options ?? null,
        order,
        form: { connect: { id: formId } },
      },
    });
    res.json(field);
  } catch (err) {
    console.error('Error adding field:', err);
    res.status(500).json({ error: 'Failed to add field' });
  }
};

export const getFormById = async (req, res) => {
  const formId = req.params.id;

  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          orderBy: {
            order: 'asc', 
          },
        },
        response: true,   
        createdBy: true,  
      },
    });
 
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json(form);
  } catch (err) {
    console.error(" Error fetching form:", err);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
};


export const getFormResponse = async (req, res) => {
  const formId = req.params.id;

  try {
    const response = await prisma.formResponse.findUnique({
      where: { formId },
    });
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get response' });
  }
};

export const getAllFormsWithStatus = async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      include: {
        createdBy: true,
        response: true,
        fields: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = forms.map(form => ({
      id: form.id,
      title: form.title,
      createdAt: form.createdAt,
      inviteCode: form.inviteCode,
      finalized: form.finalized,
      createdBy: form.createdBy.name,
      fieldCount: form.fields.length,
      hasResponse: !!form.response,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching all forms:", err);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};
