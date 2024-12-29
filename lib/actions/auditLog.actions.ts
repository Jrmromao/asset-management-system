'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/db'
import { z } from 'zod'
import { getClientIp } from 'request-ip'
import { headers } from 'next/headers'
import {auth} from "@/auth";

// Validation schema for AuditLog
const auditLogSchema = z.object({
    action: z.string().min(1, 'Action is required'),
    entity: z.string().min(1, 'Entity is required'),
    entityId: z.string().optional(),
    details: z.string().optional(),
    companyId: z.string().min(1, 'Company ID is required'),
    licenseId: z.string().optional(),
    accessoryId: z.string().optional(),
    dataAccessed: z.any().optional(), // JSON data
})

type AuditLogInput = z.infer<typeof auditLogSchema>

// Helper function to get IP address
const getIpAddress = () => {
    const headersList = headers()
    const xForwardedFor = headersList.get('x-forwarded-for')
    return xForwardedFor?.split(',')[0] || 'unknown'
}

/**
 * Create a new audit log entry
 */

const currentUser = ''


export async function createAuditLog(data: AuditLogInput) {
    try {
        // Validate user session
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Validate input data
        const validatedData = auditLogSchema.parse(data)

        // Get IP address
        const ipAddress = getIpAddress()

        // Create audit log
        const auditLog = await prisma.auditLog.create({
            data: {
                ...validatedData,
                userId: session.user.id || '',
                ipAddress,
            },
        })

        revalidatePath('/audit-logs')
        return { success: true, data: auditLog }
    } catch (error) {
        console.error('Error creating audit log:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors }
        }
        return { success: false, error: 'Failed to create audit log' }
    }
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLog(entityId: string) {
    try {
        const session = await auth();
        if (!session?.user?.companyId) {
            return { error: "Not authenticated" };
        }

        const auditLog = await prisma.auditLog.findMany({
            where: {entityId}
        })

        if (!auditLog) {
            throw new Error('Audit log not found')
        }

        return { success: true, data: auditLog }
    } catch (error) {
        console.error('Error fetching audit log:', error)
        return { success: false, error: 'Failed to fetch audit log' }
    }
}

/**
 * Get all audit logs for a company with pagination
 */
export async function getAuditLogs(
    companyId: string,
    page = 1,
    limit = 10,
    filters?: {
        action?: string
        entity?: string
        startDate?: Date
        endDate?: Date
    }
) {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }


        // Build where clause based on filters
        const where = {
            companyId,
            ...(filters?.action && { action: filters.action }),
            ...(filters?.entity && { entity: filters.entity }),
            ...(filters?.startDate && filters?.endDate && {
                createdAt: {
                    gte: filters.startDate,
                    lte: filters.endDate,
                },
            }),
        }

        // Get total count for pagination
        const total = await prisma.auditLog.count({ where })

        // Get paginated results
        const auditLogs = await prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        })

        return {
            success: true,
            data: auditLogs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
            },
        }
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return { success: false, error: 'Failed to fetch audit logs' }
    }
}

/**
 * Update an audit log entry
 * Note: In most cases, audit logs should not be updateable for integrity
 * This is included for completeness but should be used with caution
 */
export async function updateAuditLog(id: string, data: Partial<AuditLogInput>) {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Verify the audit log exists and belongs to user's company
        const existingLog = await prisma.auditLog.findUnique({
            where: { id },
        })

        if (!existingLog || existingLog.companyId !== session.user.companyId) {
            throw new Error('Unauthorized or audit log not found')
        }

        // Validate update data
        const validatedData = auditLogSchema.partial().parse(data)

        // Update audit log
        const updatedLog = await prisma.auditLog.update({
            where: { id },
            data: validatedData,
        })

        revalidatePath('/audit-logs')
        return { success: true, data: updatedLog }
    } catch (error) {
        console.error('Error updating audit log:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors }
        }
        return { success: false, error: 'Failed to update audit log' }
    }
}

/**
 * Delete an audit log entry
 * Note: In most cases, audit logs should not be deletable for integrity
 * This is included for completeness but should be used with caution
 */
export async function deleteAuditLog(id: string) {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Verify the audit log exists and belongs to user's company
        const existingLog = await prisma.auditLog.findUnique({
            where: { id },
        })

        if (!existingLog || existingLog.companyId !== session.user.companyId) {
            throw new Error('Unauthorized or audit log not found')
        }

        // Delete audit log
        await prisma.auditLog.delete({
            where: { id },
        })

        revalidatePath('/audit-logs')
        return { success: true }
    } catch (error) {
        console.error('Error deleting audit log:', error)
        return { success: false, error: 'Failed to delete audit log' }
    }
}

/**
 * Export audit logs to CSV
 */
export async function exportAuditLogs(
    companyId: string,
    filters?: {
        action?: string
        entity?: string
        startDate?: Date
        endDate?: Date
    }
) {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Build where clause based on filters
        const where = {
            companyId,
            ...(filters?.action && { action: filters.action }),
            ...(filters?.entity && { entity: filters.entity }),
            ...(filters?.startDate && filters?.endDate && {
                createdAt: {
                    gte: filters.startDate,
                    lte: filters.endDate,
                },
            }),
        }

        // Get all audit logs for export
        const auditLogs = await prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Transform data for CSV format
        const csvData = auditLogs.map(log => ({
            id: log.id,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId || '',
            details: log.details || '',
            userName: log.user.name,
            userEmail: log.user.email,
            createdAt: log.createdAt.toISOString(),
            ipAddress: log.ipAddress || '',
        }))

        return { success: true, data: csvData }
    } catch (error) {
        console.error('Error exporting audit logs:', error)
        return { success: false, error: 'Failed to export audit logs' }
    }
}