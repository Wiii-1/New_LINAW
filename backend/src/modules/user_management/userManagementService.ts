import { NotFoundError } from "../../shared/errors/appError.js";
import { UserManagementRepository } from "./userManagementRepository.js";
import type {
    OrganizationRegistration,
    UpdateUserProfile,
} from "./userManagementValidator.js";

export class UserManagementService {

    constructor(
        private repository: UserManagementRepository
    ) {}

    // get

    async profile(userId: string) {
        const user = await this.repository.findById(userId);

        if (!user) {
            throw new NotFoundError("User Not Found");
        }

        return user;
    }

    // patch

    async updateProfile(
        userId: string,
        input: UpdateUserProfile
    ) {

        /*
            1. check for user if it existing

            2. check if it's really the user that's wanna update it's own profile

            3. structure it into an object and pass it to the repository layer

            4. return
        */

        // 1. Check if the user exists
        const isExist = await this.repository.findById(userId);

        if (!isExist) {
            throw new NotFoundError("User Not Found");
        }

        // 2. User identity is already established through the
        // authenticated userId passed by the controller.

        // 3. Structure the update data
        const updateData = {
            userId,
            ...input,
        };

        const updatedUser = await this.repository.updateProfile(updateData);

        // 4. Return
        return updatedUser;
    }

    // post

    async companyRegister(
        userId: string,
        input: OrganizationRegistration
    ) {
        /*
            1. check user's tenant id

            2. get user's id

            3. register the company

            4. assign the user to the company membership
            using:
            - user_id
            - company_id
            - tenant_id
            - owner role

            5. return company id, name, and success
        */

        // 1. Check user's existing information
        const user = await this.repository.findById(userId);

        if (!user) {
            throw new NotFoundError("User Not Found");
        }

        // 2. Get authenticated user's id and tenant information
        const userData = {
            userId: user.id,
            tenantId: user.tenant_id,
        };

        // 3. Register the company
        const company = await this.repository.createCompany({
            ...input,
            tenantId: userData.tenantId,
        });

        // 4. Register the user as a company member
        //    with the appropriate owner/admin role.
        await this.repository.createCompanyMembership({
            userId: userData.userId,
            companyId: company.id,
            tenantId: userData.tenantId,
            roleId: role.owner,
        });

        // 5. Publish event
        await this.eventBus.publish({
            type: "organization.registered",
            payload: {
                companyId: company.id,
                tenantId,
                userId,
            },
        });

        // 6. Return
        return {
            companyId: company.id,
            companyName: company.display_name,
            success: true,
        };
    }
}