import type { AppContext } from "../../shared/types/hono.js";
import { Context } from "hono";
import { UserManagementService } from "./userManagementService.js";
import { UpdateUserProfileSchema, OrganizationRegistrationSchema } from "./userManagementValidator.js";


export class userManagementController {
    constructor (private service: UserManagementService){}

    profile = async (
        c: Context<AppContext>
    ) => {
        
        const userId = c.get("user").user_id

        const user = await this.service.profile(userId)

        return c.json({
            success: true,
            message: " User found",
            user
        }, 201)
    }

    updateProfile = async (
        c: Context<AppContext>
    ) => {
        
        const userId = c.get("user").user_id

        const userProfileUpdate = UpdateUserProfileSchema.parse( await c.req.json())

        const Profile = await this.service.updateProfile(userId, userProfileUpdate)

        return c.json({
            success: true,
            message: "Profile has been updated successfully",
            Profile
        }, 201)
    }

    companyRegistration = async (
        c: Context<AppContext>
    ) => {
        const userId = c.get("user").user_id

        const companyRegister = OrganizationRegistrationSchema.parse( await c.req.json())

        const company = await this.service.companyRegister(userId, companyRegister)

        return c.json({
            success: true,
            message: "Company has been successfully registered",
            company
        }, 201)

    }
}