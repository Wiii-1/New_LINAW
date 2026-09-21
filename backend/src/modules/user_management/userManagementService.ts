import { EventBus } from "../../shared/events/eventBus.js";
import { UserManagementRepository  } from "./userManagementRepository.js";
import { GetSchema, OrganizationRegistration, UpdateUserProfile } from "./userManagementValidator.js";

export class UserManagementService {
    constructor (
        private repository: UserManagementRepository,
        private eventBus: EventBus
    ) {}


    async companyRegistration (
        input: OrganizationRegistration
    ) {
        /*
        
        */
    }

    // patch 
    async updateProfile (
        input: UpdateUserProfile
    ) {
        /*
        
        */
    }
    
    // Get
    async company (
        input: GetSchema
    ) {
        /*
        
        */
    }

    async profile (
        input: GetSchema
    ) {
        /*
        
        */
    }    
}