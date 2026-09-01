import { ApprovalWorkflowRepository,
         ApprovalLevelData,
         ApprovalWorkflowDefinitionData,
       } from "./approvalWorkflowRepository.js";
import { EventBus } from "../../shared/events/eventBus.js";
import { ApprovalWorkflowIdParams, 
         RejectApprovalWorkflowBody,
         ApprovalWorkflowQuery,
         CreateLevels,
         CreateWorkflow
        } from "./approvalWorkflowValidator.js"
import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors/appError.js";
import { Decimal } from "@prisma/client/runtime/client"

type AuthenticatedUser = {
    userId: string
}

type CreateApprovalWorkflowRequest = {
    purchaseRequisitionId: string
    tenantId: string
    companyId: string
    userId: string
    submitted_At: Date
}

type CancellationOfApprovalRequest = {
    purchaseRequisitionId: string
    tenantId: string
    companyId: string
    userId: string
    cancalledAt: Date    
}

export class ApprovalWorkflowService {
    constructor (
        private repository: ApprovalWorkflowRepository,
        private eventBus: EventBus
    ) {}

    /*
    ==========================================
    PRIVATE METHODS
    ==========================================

    Add private methods only when a piece of
    business logic is repeated or deserves to
    be isolated from the main service method.

    Possible private methods:
    - findApplicableWorkflow()
    - findApplicableWorkflowLevel()
    - validateUserWorkflowAccess()
    - validateApprovalAuthority()
    */

   private findApplicableWorkflow (

   ) {
      /*

      */
   }

   private findApplicableWorkflowlevel (

   ) {
      /*
      
      */
   }

   private validateUserWorkflowAccess (

   ) {
      /*
      
      */
   }

   private async checkMembership(userId: string) {
      const membership =
         await this.repository.findActiveByUserId(userId)

      if (!membership) {
         throw new NotFoundError(
               "User has no active company membership"
         )
      }

      return membership
   }

    
    async createApprovalRequest (event: CreateApprovalWorkflowRequest) {

        /*
            1. Validates if the purchase requisition exists
               and belongs to the tenant/company from the event.

            2. Determines the entity type of the request.
               Example:
               entity_type = "purchase_requisition"

            3. Finds the active ApprovalWorkflow that applies
               to the tenant/company and entity type.

            4. Determines the applicable workflow level based
               on the purchase requisition's estimated amount.

            5. Sets the initial approval request state:
               - current_level = 1
               - status = pending
               - requester_user_id = event.userId
               - entity_id = event.purchaseRequisitionId

            6. Compiles the approval request data into an object.

            7. Passes the object to the repository for creation.

            8. Returns the created approval request.
        */

      const isExist = await this.repository.findRequisitionById(event.purchaseRequisitionId)

      if (!isExist) {
         throw new NotFoundError("Purchase Requisition does not exist")
      }



    }   

    async cancelApprovalRequest (event: CancellationOfApprovalRequest) {

        /*
            Triggered when the Purchase Requisition module
            publishes a purchase-requisition.cancelled event.

            1. Finds the ApprovalRequest using:
               - tenant_id
               - company_id
               - entity_type
               - entity_id

            2. Validates that the approval request exists.

            3. Updates the ApprovalRequest status to cancelled.

            4. Sets resolved_at.

            5. Returns the updated approval request.
        */

    } 

    async approveRequest (input: ApprovalWorkflowIdParams) {

        /*
            1. Finds the ApprovalRequest using the provided
               approval request ID.

            2. Validates that the approval request exists
               and belongs to the authenticated user's tenant.

            3. Validates that the approval request is currently
               pending and can still be acted upon.

            4. Finds the current ApprovalWorkflowLevel.

            5. Verifies that the authenticated user has the
               required role/authority to approve the current level.

            6. Creates an ApprovalAction with:
               - action = approved
               - acted_by_user_id
               - current level
               - acted_at

            7. Determines whether another required workflow
               level still exists.

            8. If another level exists:
               - advances current_level
               - keeps status = pending

            9. If there are no remaining required levels:
               - sets status = approved
               - sets resolved_at

            10. Publishes an approval event when the request
                reaches its final approved state.

            11. Returns the updated approval request.
        */

    }

    async rejectRequest (input: RejectApprovalWorkflowBody) {

        /*
            1. Finds the ApprovalRequest using the provided ID.

            2. Validates that the approval request exists
               and belongs to the authenticated user's tenant.

            3. Validates that the approval request is currently
               pending and can still be acted upon.

            4. Finds the current ApprovalWorkflowLevel.

            5. Verifies that the authenticated user has the
               required role/authority to reject the current level.

            6. Creates an ApprovalAction with:
               - action = rejected
               - acted_by_user_id
               - current level
               - remarks
               - acted_at

            7. Updates the ApprovalRequest:
               - status = rejected
               - resolved_at = now()

            8. Publishes an approval-rejected event.

            9. Returns the updated approval request.
        */

    }

    async cancelRequest (input: ApprovalWorkflowIdParams) {

        /*
            Triggered directly through the Approval Workflow API.

            1. Finds the ApprovalRequest using the provided ID.

            2. Validates that the approval request exists
               and belongs to the authenticated user's tenant.

            3. Validates that the request can still be cancelled.

            4. Updates the ApprovalRequest:
               - status = cancelled
               - resolved_at = now()

            5. Creates an ApprovalAction if cancellation
               needs to be recorded as an approval action.

            6. Publishes an approval-request-cancelled event
               if other modules need to react.

            7. Returns the updated approval request.
        */

    }

    async getApprovalWorkflows (input: ApprovalWorkflowQuery) {

        /*
            1. Uses the authenticated user ID to determine
               the user's tenant/company context.

            2. Applies the optional status filter.

            3. Sends a query request to the repository for
               approval requests belonging to the user's
               authorized tenant/company.

            4. If this endpoint represents an approver's
               dashboard, filters the requests according to
               the user's approval authority/current workflow level.

            5. Structures the returned data.

            6. Returns the approval requests.
        */

    }

    async approvalRequest (input: AuthenticatedUser) {

        /*
            1. Uses the authenticated user to determine the
               user's tenant/company context.

            2. Finds the requested ApprovalRequest.

            3. Validates that the request belongs to the
               authenticated user's authorized tenant/company.

            4. Retrieves the related workflow, current level,
               and approval actions when needed.

            5. Structures the returned data.

            6. Returns the approval request details.
        */        

    }

    async createLevel (input: CreateLevels) {

        /*
            [x]1. Uses the authenticated user to determine
               which tenant/company the level belongs to.

            [x]2. Validates that the referenced ApprovalWorkflow
               exists and belongs to the user's tenant/company.

            [x]3. Validates that the role referenced by roleCode
               exists and belongs to the appropriate tenant.

            []4. Validates the level configuration:
               - level number is valid
               - amount range is valid
               - min amount does not exceed max amount
               - level number is not duplicated

            [x]5. Optionally validates that the amount range does
               not conflict with another level in the workflow.

            [x]6. Structures the received data into an object.

            []7. Passes the write request to the repository.

            []8. Returns the created workflow level.
        */        
      const {
         workflowCode,
         levelNo,
         roleCode,
         minAmount,
         maxAmount,
         isRequired,
         userId
      } = input

      
      const membership = await this.checkMembership(userId)

      const tenantId = membership.company.tenant_id
      const companyId = membership.company_id

      const workflow =
         await this.repository.findApprovalWorkflowDefinition(
            workflowCode,
            membership.company.tenant_id
         )

      if (!workflow) {
         throw new NotFoundError(
            "Approval workflow does not exist"
         )
      }
      
      const role = await this.repository.findRoleByCodeAndTenant(
         roleCode,
         tenantId
      )

      if (!role) {
         throw new NotFoundError("Approval role does not exist")
      }
      
      if (!Number.isInteger(levelNo) || levelNo < 1) {
         throw new ValidationError("Level number must be a positive integer")
      }

      if (minAmount < 0 || maxAmount < 0 ) {
         throw new ValidationError(
            "Amount values cannot be negative"
         )         
      }

      if (minAmount > maxAmount) {
         throw new ValidationError(
            "Minimum amount cannot exceed maximum amount"
         )         
      }

      // level duplicate validation

      const exisitingLevel = await this.repository.findLevelByWorkflowAndNumber(
         workflow.id,
         levelNo
      )

      if (exisitingLevel) {
         throw new ConflictError(
            "Workflow level already exists"
         )         
      }

      const conflictingLevel =
         await this.repository.findOverlappingLevel(
            workflow.id,
            membership.company.tenant_id,
            minAmount,
            maxAmount,
         )      

      if (conflictingLevel) {
         throw new ConflictError(
            `Amount range conflicts with workflow level ${conflictingLevel.level_no}`
         )         
      }

      const levelData: ApprovalLevelData = {
         tenant_id: tenantId,
         company_id: companyId,
         workflow_id: workflow.id,
         level_no: levelNo,
         role_id: role.id,
         min_amount: new Decimal(minAmount),
         max_amount: new Decimal(maxAmount),
         is_required: isRequired,
      }

      const createdLevel =
         await this.repository.createLevelOfApproval(levelData)

      return createdLevel
    }

    async createWorkflowDefinition (input: CreateWorkflow) {

        /*
            []1. Uses the authenticated user to determine
               which tenant/company the workflow belongs to.

            []2. Validates that the authenticated user has
               permission to configure approval workflows.

            []3. Validates the workflow configuration.

            []4. Validates that the workflow code is not already
               used by the tenant.

            []5. Sets system-controlled fields:
               - tenant_id
               - company_id
               - is_system = false
               - is_active = true

            []6. Structures the received data into an object.

            []7. Passes the write request to the repository.

            [] 8. Returns the created workflow.
        */        

      const { 
         workflowCode,
         name,
         description,
         entityType,
         userId
      } = input

      // 1. determine tenant / company exist
      const membership = await this.checkMembership(userId)

      const tenantId = membership.company.tenant_id
      const companyId = membership.company_id      


      // 2. Authorization
      // TODO: validate that this user has permission
      
      // to configure approval workflows.
      
      // 3. Validate configuration
      if (!workflowCode.trim()) {
         throw new ValidationError(
               "Workflow code is required"
         );
      }

      if (!name.trim()) {
         throw new ValidationError(
               "Workflow name is required"
         );
      }

      if (!entityType.trim()) {
         throw new ValidationError(
               "Entity type is required"
         );
      }

      // 4. revent duplicate workflow code within tenant
      
      const existingWorkflow = await this.repository.findApprovalWorkflowDefinition(
         workflowCode,
         tenantId
      )

      if (existingWorkflow) {
         throw new ConflictError ("Workflow code already exists")
      }

      // 5 + 6. Construct tenant-owned definition

      const workflowData: ApprovalWorkflowDefinitionData = {
         tenant_id: tenantId,
         company_id: companyId,
         workflow_code: workflowCode,
         name,
         description: description ?? null,
         entity_type: entityType,
         is_system: false,
         is_active: true,
      };

      // 7. Persist
      const createdWorkflow =
         await this.repository.createApprovalWorkflowDefinition(
               workflowData
         );

      // 8. Return
      return createdWorkflow;      

    }

    async workflowCodes () {

        /*
            1. Uses the authenticated user to determine
               which tenant/company they belong to.

            2. Sends a query request to the repository for
               the workflow configurations belonging to
               the user's authorized tenant/company.

            3. Retrieves the workflow code, name, description,
               entity type, and active state.

            4. Structures the data received from the query.

            5. Returns the workflow configurations.
        */        

      
    }

    async workflowLevels () {

        /*
            1. Uses the authenticated user to determine
               which tenant/company they belong to.

            2. Sends a query request to the repository for
               workflow levels belonging to the authorized
               tenant/company.

            3. If a workflow ID is provided, retrieves only
               the levels belonging to that workflow.

            4. Retrieves the relevant level information:
               - level number
               - role
               - min amount
               - max amount
               - required state

            5. Structures the data received from the query.

            6. Returns the workflow levels.
        */        

      
   }
}

