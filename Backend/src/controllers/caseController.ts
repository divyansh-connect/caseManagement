import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { z } from 'zod';

const createCaseSchema = z.object({
  clientId: z.string(),
  petitionCategory: z.enum(['EB-2 NIW', 'EB-1A', 'O-1', 'Immigration Editorial Services', 'Mexico TR Visa']),
  fieldCategory: z.string().min(2),
  assignedWriter: z.string().optional(),
  assignedReviewer: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  targetFilingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  uscisServiceCenter: z.enum(['Nebraska (NSC)', 'Texas (TSC)']),
  premiumProcessing: z.boolean()
});

const updateStageSchema = z.object({
  stageId: z.number().int().min(1).max(14)
});

export const getCases = async (req: Request, res: Response) => {
  try {
    const cases = await prisma.case.findMany({
      include: {
        client: true,
        documents: true,
        recommenders: true
      },
      orderBy: { lastUpdated: 'desc' }
    });
    return res.json({ success: true, data: cases });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createCase = async (req: Request, res: Response) => {
  const result = createCaseSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Validation Failed', details: result.error.errors });
  }

  const { clientId, petitionCategory, fieldCategory, assignedWriter, assignedReviewer, riskLevel, targetFilingDate, uscisServiceCenter, premiumProcessing } = result.data;

  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const count = await prisma.case.count();
    const caseNumber = `NIW-2026-00${count + 1}`;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        clientId,
        petitionCategory,
        fieldCategory,
        assignedWriter: assignedWriter || null,
        assignedReviewer: assignedReviewer || null,
        riskLevel,
        targetFilingDate,
        uscisServiceCenter,
        premiumProcessing,
        currentStage: 1
      }
    });

    return res.status(201).json({ success: true, data: newCase });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateStage = async (req: Request, res: Response) => {
  const { caseNumber } = req.params;
  const result = updateStageSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Validation Failed', details: result.error.errors });
  }

  try {
    const existing = await prisma.case.findUnique({ where: { caseNumber } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }

    const updatedCase = await prisma.case.update({
      where: { caseNumber },
      data: {
        currentStage: result.data.stageId
      }
    });

    return res.json({ success: true, data: updatedCase });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createRecommender = async (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { name, title, organization, relationship } = req.body;
  try {
    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    const newRec = await prisma.recommender.create({
      data: {
        caseId,
        name,
        title,
        organization: organization || 'US Research Institute',
        relationship,
        status: 'Outreach Sent',
        cvReceived: true,
        keyContributionsMentioned: ['Attests to candidate original algorithmic contributions', 'Validates national merit']
      }
    });
    return res.status(201).json({ success: true, data: newRec });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
