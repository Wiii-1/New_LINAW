<<<<<<< Updated upstream
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
=======
import { UserManagementRepository } from "./userManagementRepository.js"

export class UserManagementService {

    constructor(
        private repository: UserManagementRepository
    ) {}

    // get

    async profile () {
>>>>>>> Stashed changes
        /*
        
        */
    }

<<<<<<< Updated upstream
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
=======
    async company() {
>>>>>>> Stashed changes
        /*
        
        */
    }

<<<<<<< Updated upstream
    async profile (
        input: GetSchema
    ) {
        /*
        
        */
    }    
=======
    // patch

    async updateProfile () {
        /*
        
        */
    }

    // post 

    async companyRegister () {
        /*
        
        */
    }
 

>>>>>>> Stashed changes
}