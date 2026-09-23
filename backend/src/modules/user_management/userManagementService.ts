import { UserManagementRepository } from "./userManagementRepository.js"
import type { OrganizationRegistration, UpdateUserProfile } from "./userManagementValidator.js";



export class UserManagementService {

    constructor(
        private repository: UserManagementRepository
    ) {}

    // get

    async profile (input: string) {
        /*
        
        */
    }

    // patch

    async updateProfile (input: UpdateUserProfile ) {
        /*
        
        */
    }

    // post 

    async companyRegister (input: OrganizationRegistration ) {
        /*
        
        */
    }
 

}