import { Request, Response, NextFunction } from "express";
import { UserManagementService} from "./userManagementService.js"
import { UpdateUserProfileSchema, OrganizationRegistrationSchema } from "./userManagementValidator.js";

export class userManagementController {
    constructor (private service: UserManagementService){
        this.service = service
    }

    profile = async (
        req: Request,
        res: Response,
        next:NextFunction
    ): Promise<void> => {
        
    }

    updateProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {

    }

    companyRegistration = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {

    }

    companyId = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {

    }
}