import type { AppContext } from "../../shared/types/hono.js";
import { Context } from "hono";
import { UserManagementService } from "./userManagementService.js";
import { UpdateUserProfileSchema, OrganizationRegistrationSchema } from "./userManagementValidator.js";


export class userManagementController {
    constructor (private service: UserManagementService){
        this.service = service
    }

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

        const data = { userId, userProfileUpdate}

        const Profile = await this.service.updateProfile(data)

        return c.json({
            success: true,
            message: "Profile has been updated successfully",
            Profile
        }, 201)
    }

    companyRegistration = async (
        c: Context<AppContext>
    ) => {

        const companyRegister = OrganizationRegistrationSchema.parse( await c.req.json())

        const company = await this.service.companyRegister(companyRegister)

        return c.json({
            success: true,
            message: "Company has been successfully registered",
            company
        }, 201)

    }
}