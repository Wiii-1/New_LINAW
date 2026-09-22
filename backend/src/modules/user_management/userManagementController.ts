<<<<<<< Updated upstream
import { Request, Response, NextFunction } from "express";
import { UserManagementService} from "./userManagementService.js"
=======
import type { AppContext } from "../../shared/types/hono.js";
import { Context } from "hono";
import { UserManagementService } from "./userManagementService.js";
>>>>>>> Stashed changes
import { UpdateUserProfileSchema, OrganizationRegistrationSchema } from "./userManagementValidator.js";

export class userManagementController {
    constructor (private service: UserManagementService){
        this.service = service
    }

    profile = async (
        c: Context<AppContext>
    ) => {
        
    }

    updateProfile = async (
        c: Context<AppContext>
    ) => {

    }

    companyRegistration = async (
        c: Context<AppContext>
    ) => {

    }

    companyId = async (
        c: Context<AppContext>
    ) => {

    }
}