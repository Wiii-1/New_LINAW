import { Request, Response, NextFunction } from "express";
import { userManagementService} from "./userManagementService.js"
import { UserProfileSchema, OrganizationRegistrationSchema } from "./userManagementValidator.js";

export class userManagementController {
    constructor (private service: userManagementService){
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