import { CaseDocument } from '../types';

/**
 * Filters documents that correspond to a specific stage sub-task.
 * Matches by explicit attachedTaskId, specific task ID keywords, or task requiredDocs.
 */
export const getTaskMatchingDocuments = (
  task: { id: string; name: string; requiredDocs?: string[] },
  documents: CaseDocument[]
): CaseDocument[] => {
  if (!documents || documents.length === 0) return [];

  const matchedDocs: CaseDocument[] = [];
  const seenIds = new Set<string>();

  documents.forEach(doc => {
    if (!doc || !doc.id || seenIds.has(doc.id)) return;

    // 1. Direct attachment by task ID
    if ((doc as any).attachedTaskId === task.id) {
      matchedDocs.push(doc);
      seenIds.add(doc.id);
      return;
    }

    const docName = (doc.name || '').toLowerCase();
    const docCat = (doc.category || '').toLowerCase();
    const docSummary = (doc.aiSummary || '').toLowerCase();

    // 2. Specific task heuristics based on petition workflow
    let isMatch = false;

    if (task.id === 'st1-2') {
      // Upload existing CV and academic degree certificates
      isMatch = (
        docName.includes('resume') ||
        docName.includes('cv') ||
        docName.includes('degree') ||
        docName.includes('certificate') ||
        docName.includes('diploma') ||
        docName.includes('transcript') ||
        docCat.includes('identity') ||
        docCat.includes('personal') ||
        docCat.includes('education') ||
        docCat.includes('academic') ||
        docSummary.includes('resume') ||
        docSummary.includes('degree')
      );
    } else if (task.id === 'st1-3') {
      // Review and sign engagement retainer agreement
      isMatch = (
        docName.includes('agreement') ||
        docName.includes('retainer') ||
        docName.includes('engagement') ||
        docName.includes('contract') ||
        docCat.includes('agreement')
      );
    } else if (task.id === 'st2-2' || task.id === 'st2-5') {
      // Recommender CVs or signed recommendation letters
      isMatch = (
        docName.includes('recommend') ||
        docName.includes('recommender') ||
        docName.includes('reference') ||
        docName.includes('letter') ||
        docCat.includes('letter') ||
        docCat.includes('recommend') ||
        docSummary.includes('recommendation')
      );
    } else if (task.id === 'st3-1' || task.id === 'st3-4') {
      // Client completes USCIS questionnaire / signed forms
      isMatch = (
        docName.includes('questionnaire') ||
        docName.includes('i-140') ||
        docName.includes('i140') ||
        docName.includes('g-1145') ||
        docName.includes('eta-9089') ||
        docName.includes('form') ||
        docCat.includes('form')
      );
    } else if (task.id === 'st4-2') {
      // Draft Petition Memorandum
      isMatch = (
        docName.includes('petition') ||
        docName.includes('memorandum') ||
        docName.includes('dhanasar') ||
        docName.includes('brief')
      );
    } else if (task.id === 'st5-1') {
      // Organize final package & Exhibit PDF Index
      isMatch = (
        docName.includes('index') ||
        docName.includes('package') ||
        docName.includes('compiled')
      );
    } else if (task.id === 'st6-4') {
      // Upload Form I-797C Receipt Notice
      isMatch = (
        docName.includes('797') ||
        docName.includes('receipt') ||
        docName.includes('notice') ||
        docName.includes('uscis')
      );
    } else if (task.id === 'opt-2') {
      // Form I-485 / I-693 Medical
      isMatch = (
        docName.includes('485') ||
        docName.includes('693') ||
        docName.includes('medical')
      );
    }

    // 3. Fallback: match by requiredDocs labels
    if (!isMatch && task.requiredDocs && task.requiredDocs.length > 0) {
      isMatch = task.requiredDocs.some(req => {
        const reqTerm = req.toLowerCase();
        // check individual words of requiredDoc (e.g. "Curriculum", "Vitae", "Degree", "Certificate")
        const words = reqTerm.split(/\s+/).filter(w => w.length > 3);
        const matchFull = docName.includes(reqTerm) || docCat.includes(reqTerm);
        const matchWords = words.some(w => docName.includes(w) || docCat.includes(w));
        return matchFull || matchWords;
      });
    }

    if (isMatch) {
      matchedDocs.push(doc);
      seenIds.add(doc.id);
    }
  });

  return matchedDocs;
};
