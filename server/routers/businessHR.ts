/**
 * Human Resources Router — Canryn Production
 * Employee management, departments, payroll, time tracking
 * Covers all 6 subsidiaries with QUMUS autonomous oversight
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as bizDb from "../db-business";

export const hrRouter = router({
  // Employees
  getEmployees: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => bizDb.getEmployees(input?.subsidiary)),

  getEmployee: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => bizDb.getEmployeeById(input)),

  createEmployee: protectedProcedure
    .input(z.object({
      employeeNumber: z.string().min(1),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      title: z.string().optional(),
      departmentId: z.number().optional(),
      subsidiary: z.string().optional(),
      hireDate: z.string(),
      employmentType: z.enum(['full_time', 'part_time', 'contractor', 'intern']).optional(),
      salary: z.string().optional(),
      payFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'annual']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { hireDate, ...rest } = input;
      const id = await bizDb.createEmployee({ ...rest, hireDate: new Date(hireDate) });
      return { success: true, id };
    }),

  updateEmployee: protectedProcedure
    .input(z.object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      title: z.string().optional(),
      departmentId: z.number().optional(),
      subsidiary: z.string().optional(),
      status: z.enum(['active', 'on_leave', 'terminated', 'retired']).optional(),
      employmentType: z.enum(['full_time', 'part_time', 'contractor', 'intern']).optional(),
      salary: z.string().optional(),
      payFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'annual']).optional(),
      terminationDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, terminationDate, ...data } = input;
      await bizDb.updateEmployee(id, {
        ...data,
        ...(terminationDate ? { terminationDate: new Date(terminationDate) } : {}),
      });
      return { success: true };
    }),

  // Departments
  getDepartments: protectedProcedure
    .input(z.object({ subsidiary: z.string().optional() }).optional())
    .query(async ({ input }) => bizDb.getDepartments(input?.subsidiary)),

  createDepartment: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      subsidiary: z.string().optional(),
      managerId: z.number().optional(),
      description: z.string().optional(),
      budget: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await bizDb.createDepartment(input);
      return { success: true, id };
    }),

  updateDepartment: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      code: z.string().optional(),
      subsidiary: z.string().optional(),
      managerId: z.number().optional(),
      description: z.string().optional(),
      budget: z.string().optional(),
      headcount: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await bizDb.updateDepartment(id, data);
      return { success: true };
    }),

  // Time Tracking
  getTimeTracking: protectedProcedure
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input }) => bizDb.getTimeTracking(input?.employeeId)),

  createTimeEntry: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      date: z.string(),
      hoursWorked: z.string(),
      overtime: z.string().optional(),
      projectCode: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { date, ...rest } = input;
      await bizDb.createTimeEntry({ ...rest, date: new Date(date) });
      return { success: true };
    }),

  // Payroll
  getPayroll: protectedProcedure
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input }) => bizDb.getPayroll(input?.employeeId)),

  createPayrollEntry: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      payPeriodStart: z.string(),
      payPeriodEnd: z.string(),
      grossPay: z.string(),
      deductions: z.string(),
      netPay: z.string(),
      taxWithheld: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { payPeriodStart, payPeriodEnd, ...rest } = input;
      await bizDb.createPayrollEntry({
        ...rest,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
      });
      return { success: true };
    }),

  updatePayrollEntry: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'processed', 'paid', 'voided']).optional(),
      paidDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, paidDate, ...data } = input;
      await bizDb.updatePayrollEntry(id, {
        ...data,
        ...(paidDate ? { paidDate: new Date(paidDate) } : {}),
      });
      return { success: true };
    }),
});
