/**
 * FCC Compliance Documentation Templates
 * Ready-to-use templates for franchisees to prepare FCC filings
 */

import { router, publicProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';

export const fccTemplatesRouter = router({
  // Form 323 Preparation Template
  getForm323Template: publicProcedure.query(async () => {
    return {
      template: {
        title: 'FCC Form 323 Preparation Template',
        description: 'Step-by-step guide to completing Form 323',
        sections: [
          {
            section: 'Section 1: Station Information',
            fields: [
              {
                field: 'Call Sign',
                example: 'WRRB-FM',
                required: true,
                instructions: 'Enter the station call sign as assigned by FCC',
              },
              {
                field: 'Facility ID Number',
                example: '12345',
                required: true,
                instructions: 'Enter the FCC Facility ID Number',
              },
              {
                field: 'Service',
                example: 'Commercial FM Radio',
                required: true,
                instructions: 'Select the appropriate service category',
              },
              {
                field: 'City of License',
                example: 'New York, NY',
                required: true,
                instructions: 'Enter the city where the station is licensed',
              },
            ],
          },
          {
            section: 'Section 2: Ownership Information',
            fields: [
              {
                field: 'Licensee Name',
                example: 'RRB Broadcasting, LLC',
                required: true,
                instructions: 'Enter the legal name of the licensee entity',
              },
              {
                field: 'Licensee FRN',
                example: '0123456789',
                required: true,
                instructions: 'Enter the FCC Registration Number (FRN) for the licensee',
              },
              {
                field: 'Ownership Structure',
                example: 'LLC',
                required: true,
                instructions: 'Select: Sole Proprietor, Partnership, Corporation, LLC, Other',
              },
            ],
          },
          {
            section: 'Section 3: Attributable Interest Holders',
            fields: [
              {
                field: 'Individual Name',
                example: 'Jane Smith',
                required: true,
                instructions: 'Full legal name of owner',
              },
              {
                field: 'Individual FRN',
                example: '0123456789',
                required: true,
                instructions: 'FCC Registration Number for individual',
              },
              {
                field: 'Voting Percentage',
                example: '100%',
                required: true,
                instructions: 'Percentage of voting stock held',
              },
              {
                field: 'Gender',
                example: 'Female',
                required: true,
                instructions: 'Select: Male, Female, Other',
              },
              {
                field: 'Ethnicity/Race',
                example: 'African American',
                required: true,
                instructions: 'Select primary ethnicity/race category',
              },
            ],
          },
          {
            section: 'Section 4: Positional Interests',
            fields: [
              {
                field: 'Position',
                example: 'General Manager',
                required: false,
                instructions: 'Officer, Director, General Partner, etc.',
              },
              {
                field: 'Individual Name',
                example: 'John Doe',
                required: false,
                instructions: 'Name of person holding position',
              },
              {
                field: 'Individual FRN',
                example: '0123456789',
                required: false,
                instructions: 'FCC Registration Number',
              },
            ],
          },
          {
            section: 'Section 5: Certification',
            fields: [
              {
                field: 'Certifying Official',
                example: 'Jane Smith',
                required: true,
                instructions: 'Name of person certifying the form',
              },
              {
                field: 'Title',
                example: 'Owner/Manager',
                required: true,
                instructions: 'Title of certifying official',
              },
              {
                field: 'Date',
                example: '2026-02-22',
                required: true,
                instructions: 'Date of certification',
              },
            ],
          },
        ],
      },
    };
  }),

  // Ownership Documentation Checklist
  getOwnershipDocumentationChecklist: publicProcedure.query(async () => {
    return {
      checklist: {
        title: 'Ownership Documentation Checklist',
        description: 'Required documents to support FCC Form 323 filing',
        documents: [
          {
            id: 'doc-articles',
            document: 'Articles of Organization / Incorporation',
            required: true,
            description: 'Legal formation documents for the licensee entity',
            notes: 'Must show current ownership structure',
          },
          {
            id: 'doc-bylaws',
            document: 'Bylaws / Operating Agreement',
            required: true,
            description: 'Governance documents showing voting rights',
            notes: 'Must clearly define ownership percentages',
          },
          {
            id: 'doc-ownership-cert',
            document: 'Ownership Certification',
            required: true,
            description: 'Certification of current ownership',
            notes: 'Must be dated within 90 days of filing',
          },
          {
            id: 'doc-stock-ledger',
            document: 'Stock Ledger / Member Register',
            required: true,
            description: 'Current list of all owners and percentages',
            notes: 'Must show all transfers and changes',
          },
          {
            id: 'doc-board-minutes',
            document: 'Board Minutes / Member Meetings',
            required: false,
            description: 'Recent meeting minutes showing ownership decisions',
            notes: 'Helpful for demonstrating governance',
          },
          {
            id: 'doc-frn-letters',
            document: 'FCC Registration Number (FRN) Letters',
            required: true,
            description: 'FRN assignment letters for all owners',
            notes: 'Available from FCC LMS',
          },
          {
            id: 'doc-id-verification',
            document: 'Identity Verification',
            required: true,
            description: 'Government-issued ID for all owners',
            notes: 'Copy of driver\'s license or passport',
          },
          {
            id: 'doc-demographic-cert',
            document: 'Demographic Certification',
            required: true,
            description: 'Certification of gender and ethnicity/race',
            notes: 'Self-reported by owners',
          },
        ],
      },
    };
  }),

  // Demographic Information Form
  getDemographicInformationForm: publicProcedure.query(async () => {
    return {
      form: {
        title: 'Demographic Information Form',
        description: 'Collect demographic data for all owners',
        instructions: 'Complete this form for each owner/attributable interest holder',
        fields: [
          {
            section: 'Personal Information',
            items: [
              {
                field: 'Full Legal Name',
                type: 'text',
                required: true,
              },
              {
                field: 'FCC Registration Number (FRN)',
                type: 'text',
                required: true,
              },
              {
                field: 'Date of Birth',
                type: 'date',
                required: false,
              },
            ],
          },
          {
            section: 'Gender',
            items: [
              {
                field: 'Gender',
                type: 'select',
                options: ['Female', 'Male', 'Other', 'Prefer not to answer'],
                required: true,
              },
            ],
          },
          {
            section: 'Ethnicity and Race',
            items: [
              {
                field: 'Ethnicity/Race (Primary)',
                type: 'select',
                options: [
                  'African American / Black',
                  'Asian American',
                  'Hispanic / Latino',
                  'Native American / Alaska Native',
                  'Native Hawaiian / Pacific Islander',
                  'Caucasian / White',
                  'Multi-racial',
                  'Other',
                  'Prefer not to answer',
                ],
                required: true,
              },
              {
                field: 'Ethnicity/Race (Secondary - if applicable)',
                type: 'select',
                options: [
                  'African American / Black',
                  'Asian American',
                  'Hispanic / Latino',
                  'Native American / Alaska Native',
                  'Native Hawaiian / Pacific Islander',
                  'Caucasian / White',
                  'Multi-racial',
                  'Other',
                  'Not applicable',
                ],
                required: false,
              },
            ],
          },
          {
            section: 'Ownership Details',
            items: [
              {
                field: 'Voting Percentage',
                type: 'number',
                required: true,
                validation: 'Must be between 0 and 100',
              },
              {
                field: 'Ownership Type',
                type: 'select',
                options: [
                  'Majority Interest (50%+)',
                  'General Partner',
                  'Limited Partner',
                  'LLC/PLLC Member',
                  'Stockholder',
                  'Officer/Director',
                  'Other',
                ],
                required: true,
              },
            ],
          },
          {
            section: 'Certification',
            items: [
              {
                field: 'I certify that the above information is true and correct',
                type: 'checkbox',
                required: true,
              },
              {
                field: 'Signature',
                type: 'signature',
                required: true,
              },
              {
                field: 'Date',
                type: 'date',
                required: true,
              },
            ],
          },
        ],
      },
    };
  }),

  // Ownership Change Notification Template
  getOwnershipChangeNotification: publicProcedure.query(async () => {
    return {
      template: {
        title: 'Ownership Change Notification Template',
        description: 'Template for notifying FCC of ownership changes',
        instructions: 'File within 30 days of ownership change',
        sections: [
          {
            section: 'Change Information',
            fields: [
              {
                field: 'Date of Change',
                example: '2026-03-01',
                required: true,
              },
              {
                field: 'Type of Change',
                example: 'New owner added / Ownership percentage changed',
                required: true,
              },
              {
                field: 'Description of Change',
                example: 'Jane Smith acquired 25% ownership from John Doe',
                required: true,
              },
            ],
          },
          {
            section: 'Previous Ownership',
            fields: [
              {
                field: 'Previous Owner Name',
                required: true,
              },
              {
                field: 'Previous Voting Percentage',
                required: true,
              },
              {
                field: 'Previous Ownership Type',
                required: true,
              },
            ],
          },
          {
            section: 'New Ownership',
            fields: [
              {
                field: 'New Owner Name',
                required: true,
              },
              {
                field: 'New Voting Percentage',
                required: true,
              },
              {
                field: 'New Ownership Type',
                required: true,
              },
              {
                field: 'Gender',
                required: true,
              },
              {
                field: 'Ethnicity/Race',
                required: true,
              },
            ],
          },
          {
            section: 'Documentation',
            fields: [
              {
                field: 'Attach bill of sale / transfer agreement',
                required: true,
              },
              {
                field: 'Attach updated ownership documentation',
                required: true,
              },
              {
                field: 'Attach updated bylaws / operating agreement',
                required: true,
              },
            ],
          },
        ],
      },
    };
  }),

  // FCC Filing Instructions
  getFccFilingInstructions: publicProcedure.query(async () => {
    return {
      instructions: {
        title: 'Step-by-Step FCC Filing Instructions',
        description: 'Complete guide to filing Form 323 via FCC LMS',
        steps: [
          {
            step: 1,
            title: 'Obtain FCC Registration Numbers (FRNs)',
            instructions: [
              'Visit FCC LMS: https://enterpriseefiling.fcc.gov',
              'Create account or log in',
              'Request FRN for licensee entity',
              'Request FRN for each owner',
              'Save all FRN numbers',
            ],
          },
          {
            step: 2,
            title: 'Gather Documentation',
            instructions: [
              'Collect all required documents (see checklist)',
              'Verify all documents are current (within 90 days)',
              'Prepare demographic information for all owners',
              'Organize documents in chronological order',
            ],
          },
          {
            step: 3,
            title: 'Complete Form 323',
            instructions: [
              'Download Form 323 from FCC website',
              'Fill in station information',
              'List all attributable interest holders',
              'Enter demographic information',
              'List all positional interests',
              'Certify accuracy of information',
            ],
          },
          {
            step: 4,
            title: 'Upload to FCC LMS',
            instructions: [
              'Log in to FCC LMS',
              'Navigate to Form 323 filing section',
              'Upload completed form',
              'Upload supporting documentation',
              'Verify all files are readable',
              'Submit for processing',
            ],
          },
          {
            step: 5,
            title: 'Confirmation & Record Keeping',
            instructions: [
              'Save FCC confirmation receipt',
              'Record filing date and receipt number',
              'Maintain copies of all filed documents',
              'Set reminder for next filing deadline',
              'Keep documentation for 7 years',
            ],
          },
        ],
        timeline: {
          preparation: '2-4 weeks',
          filing: '1-2 hours',
          fccProcessing: '4-8 weeks',
          total: '6-12 weeks',
        },
      },
    };
  }),

  // Compliance Training Module
  getComplianceTrainingModule: adminProcedure.query(async () => {
    return {
      training: {
        title: 'FCC Compliance Training Module',
        description: 'Comprehensive training for franchisees on FCC requirements',
        modules: [
          {
            module: 'Module 1: FCC Basics',
            duration: '30 minutes',
            topics: [
              'What is the FCC and why does it matter?',
              'Overview of broadcast licensing',
              'FCC Form 323 requirements',
              'Key deadlines and penalties',
            ],
          },
          {
            module: 'Module 2: Ownership Structures',
            duration: '45 minutes',
            topics: [
              'Sole proprietor ownership',
              'Partnership structures',
              'LLC and corporation ownership',
              'Attributable interests',
              'Positional interests',
            ],
          },
          {
            module: 'Module 3: Demographic Reporting',
            duration: '30 minutes',
            topics: [
              'Gender categories',
              'Ethnicity/race categories',
              'Self-identification process',
              'Accuracy and certification',
              'Privacy and confidentiality',
            ],
          },
          {
            module: 'Module 4: Filing Process',
            duration: '60 minutes',
            topics: [
              'Obtaining FCC Registration Numbers (FRNs)',
              'Completing Form 323',
              'Using FCC LMS',
              'Uploading documentation',
              'Confirmation and follow-up',
            ],
          },
          {
            module: 'Module 5: Compliance & Audits',
            duration: '45 minutes',
            topics: [
              'Maintaining accurate records',
              'Reporting ownership changes',
              'FCC audit procedures',
              'Common violations',
              'Penalties and enforcement',
            ],
          },
        ],
        assessment: {
          type: 'Quiz',
          passingScore: 80,
          certificate: 'FCC Compliance Certified',
        },
      },
    };
  }),

  // Generate Custom Template
  generateCustomTemplate: adminProcedure
    .input(
      z.object({
        franchiseeId: z.string(),
        ownershipStructure: z.string(),
        numberOfOwners: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        templateGenerated: true,
        franchiseeId: input.franchiseeId,
        customTemplate: {
          title: `Custom FCC Compliance Template for ${input.franchiseeId}`,
          ownershipStructure: input.ownershipStructure,
          numberOfOwners: input.numberOfOwners,
          sections: [
            'Station Information',
            'Licensee Information',
            `Ownership Information (${input.numberOfOwners} owners)`,
            'Demographic Information',
            'Certification',
          ],
          downloadFormats: ['PDF', 'Word', 'Excel'],
          estimatedCompletionTime: '2-4 hours',
        },
      };
    }),
});
