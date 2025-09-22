/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { formatISO } from 'date-fns';

const seedData = {
  users: [
    { id: 'employee-1', name: 'Erin Employee', email: 'erin@example.com', role: 'EMPLOYEE', dept: 'Marketing' },
    { id: 'manager-1', name: 'Manny Manager', email: 'manny@example.com', role: 'MANAGER', dept: 'Marketing' },
    { id: 'finance-1', name: 'Fiona Finance', email: 'fiona@example.com', role: 'FINANCE', dept: 'Finance' },
    { id: 'admin-1', name: 'Ada Admin', email: 'ada@example.com', role: 'ADMIN', dept: 'Operations' }
  ],
  costCenters: [
    { id: 'cc-100', name: 'Marketing', code: 'MKT-100' },
    { id: 'cc-200', name: 'Engineering', code: 'ENG-200' }
  ],
  glCodes: [
    { id: 'gl-6000', name: 'Travel Expenses', code: '6000' },
    { id: 'gl-6100', name: 'Meals & Entertainment', code: '6100' }
  ],
  policies: [
    {
      id: 'policy-1',
      name: 'Global Travel Policy',
      retirementDeadlineDays: 7,
      receiptRequiredOverAmount: 25,
      perDiemCaps: { MEALS: 80, LODGING: 200 },
      categories: [
        { category: 'MEALS', perDiem: 80, receiptRequiredOverAmount: 20 },
        { category: 'TRANSPORT', perDiem: 150, receiptRequiredOverAmount: 30 },
        { category: 'LODGING', perDiem: 200, receiptRequiredOverAmount: 50 }
      ]
    }
  ],
  advances: [
    {
      id: 'adv-seed-1',
      employeeId: 'employee-1',
      purpose: 'Regional marketing sprint',
      amountRequested: 1500,
      currency: 'USD',
      project: 'EA Launch',
      costCenterId: 'cc-100',
      glCodeId: 'gl-6000',
      status: 'DISBURSED',
      approvals: [
        { role: 'MANAGER', status: 'APPROVED', actorId: 'manager-1', actedAt: formatISO(new Date()) },
        { role: 'FINANCE', status: 'APPROVED', actorId: 'finance-1', actedAt: formatISO(new Date()) }
      ],
      disbursedAt: formatISO(new Date()),
      disbursementRef: 'PAY-1234',
      expectedStartDate: formatISO(new Date()),
      expectedEndDate: formatISO(new Date()),
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date())
    }
  ]
};

const outputPath = path.join(process.cwd(), 'seed-data.json');
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
console.log(`Seed data written to ${outputPath}`);
