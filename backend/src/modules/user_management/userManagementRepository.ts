import { prisma } from "../../config/database.js";

export class UserManagementRepository {

    async findById(
        userId: string
    ) {
        return prisma.user.findUnique({
            where: {
                id: userId
            }
        });
    }

    async updateProfile(
        data: {
            userId: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            job_title?: string;
        }
    ) {
        return prisma.user.update({
            where: {
                id: data.userId
            },
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                job_title: data.job_title
            }
        });
    }

    async createCompany(
        data: {
            tenantId: string;
            legal_name: string;
            display_name: string;
            tax_id?: string;
            address: string;
            contact_email: string;
            contact_phone?: string;
        }
    ) {
        return prisma.company.create({
            data: {
                tenant_id: data.tenantId,
                legal_name: data.legal_name,
                display_name: data.display_name,
                tax_id: data.tax_id,
                address: data.address,
                contact_email: data.contact_email,
                contact_phone: data.contact_phone
            }
        });
    }

    async createCompanyMembership(
        data: {
            userId: string;
            companyId: string;
            tenantId: string;
        }
    ) {
        return prisma.companyMembership.create({
            data: {
                user_id: data.userId,
                company_id: data.companyId,
                tenant_id: data.tenantId,
                employment_status: "ACTIVE"
            }
        });
    }

    async createUserRole(
        data: {
            userId: string;
            companyId: string;
            tenantId: string;
            roleId: string;
        }
    ) {
        return prisma.userRole.create({
            data: {
                user_id: data.userId,
                company_id: data.companyId,
                tenant_id: data.tenantId,
                role_id: data.roleId
            }
        });
    }

    async findRoleByCode(code: string) {
        return prisma.role.findFirst({
            where: {
                code,
                is_system: true,
            },
        });
    }

    async findSystemRoleByCode(code: string) {
        return prisma.role.findFirst({
            where: {
                code,
                is_system: true,
                tenant_id: null,
            },
        });
    }
}