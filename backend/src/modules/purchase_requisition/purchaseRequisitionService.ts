/*  [x] createRequisition ()
    [x] submitRequisition ()
    [x] cancelRequisition ()
    [x] resubmitRequisition ()
    [x] getRequisition ()
    [x] purchaseRequisitDetail ()
    [x] updateRequisition ()
    [x] requisitionUpdateStatus ()
    [x] prNumberGenerator ()

    ## Future Enhancement

        - Draft requisitions may expire after a configurable retention period
        (e.g., 30–60 days).
        - Expiration should be handled automatically rather than through a
        user-facing delete endpoint.
        - Expired drafts should remain as historical records if auditability
        is required.
*/
import { ConflictError, 
         NotFoundError, 
         RestrictedAccessError} from "../../shared/errors/appError.js"
import { purchaseRequisitionRepository } from "./purchaseRequisitionRepository.js"
import { PurchaseRequisitionInput, 
         PurchaseRequisitionIdParams, 
         CancelPurchaseRequisitionInput, 
         ResubmitPurchaseRequisitionInput, 
         PurchaseRequisitionUpdate, 
         PurchaseRequisitionUpdateData, 
         PurchaseRequisitionQuery} from "./purchaseRequisitionValidation.js"
import { Prisma, 
         PurchaseRequisitionStatus, 
         PurchaseRequisitionPriority, 
         PurchaseRequisition} from "../../generated/prisma/client.js"
import { randomUUID } from "node:crypto"
import { EventBus } from "../../shared/events/eventBus.js"

export interface purchaseRequisitionData {
    id: string;
    root_id: string;
    tenant_id: string;
    company_id: string;
    pr_number: string;
    generation: number;
    requested_by_user_id: string;
    purpose: string;
    justification: string;
    status: PurchaseRequisitionStatus;
    priority: PurchaseRequisitionPriority;
    currency_code: string;
    total_amount: Prisma.Decimal;
    needed_by_date: Date | null;
    created_at: Date;
}

export interface PurchaseRequisitionItemCreateData {
    tenant_id: string;
    purchase_requisition_id: string;
    line_no: number;
    item_type: string;
    description: string;
    specification: string;
    quantity: number;
    unit_of_measure: string;
    estimated_unit_cost: number;
    estimated_total_cost: number;
    category_id: string | null ;
    needed_by_date: string | null;
    status: PurchaseRequisitionStatus;
}

export interface purchaseRequisitionStatusLogData {
    tenant_id: string;
    purchase_requisition_id: string;
    from_status: string | null;
    to_status: string;
    action: string;
    acted_by_user_id: string;
    remarks: string | null;
    acted_at: Date;
    metadata_json: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
}

export class purchaseRequisitionService {
    constructor (
        private repository: purchaseRequisitionRepository,
        private eventBus: EventBus
    ) {}

    async createRequisition (input: PurchaseRequisitionInput) {
        /*
            1. receive input for requisition and receives user id

            2. find and verify user and gather information

            3. forwards to repository layer

            4. returns confirmation that it was saved
        */

        const { 
            purpose,
            justification,
            priority,
            currency_code,
            needed_by_date,
            items,
            tenantId,
            userId
        } = input


        const user = await this.repository.findByUserId(userId)

        if (!user) {
            throw new NotFoundError ("User does not exist")
        }

        const id = randomUUID()
        const created_at = new Date()
        const generation = 1

        const pr_number = this.prNumberGenerator(created_at, id, generation )

        const requested_by_user_id =  userId

        const membership =
            await this.repository.findActiveByUserId(userId);

        if (!membership) {
            throw new Error("User has no active company membership");
        }

        const companyId = membership.company_id;

        if (!companyId) {
            throw new Error("User has no active company membership");
        }

        const total_amount = items.reduce(
            (total, item) => total + item.quantity * item.estimated_unit_cost,
            0
        );

        const dataCreate: purchaseRequisitionData = {
            id,
            root_id: id,
            tenant_id: tenantId,
            company_id: companyId,
            pr_number,
            generation: 1,
            requested_by_user_id,
            purpose,
            justification,
            status: PurchaseRequisitionStatus.DRAFT,
            priority,
            currency_code,
            total_amount: new Prisma.Decimal(total_amount),
            needed_by_date: needed_by_date ? new Date(needed_by_date): null,
            created_at
        };

        const dataItems: PurchaseRequisitionItemCreateData[] = []

        let line_no = 1

        for(const item of items) {

            const dataItem: PurchaseRequisitionItemCreateData = {
                tenant_id: tenantId,
                purchase_requisition_id: id,
                line_no: line_no,
                item_type: item.item_type,
                description:item.description,
                specification: item.specification,
                quantity: item.quantity,
                unit_of_measure: item.unit_of_measure,
                estimated_unit_cost: item.estimated_unit_cost,
                estimated_total_cost: total_amount,
                category_id: item.category_id ?? null,
                needed_by_date: item.needed_by_date ?? null,
                status: PurchaseRequisitionStatus.DRAFT                
            }

            dataItems.push(dataItem)
            line_no++;
        }

        const metadata = await this.repository.findDetailsById(id)

        if (!metadata) {
            throw new NotFoundError(
                "Purchase requisition not found"
            );
        }

        const acted_at = new Date()

        const statusLogs: purchaseRequisitionStatusLogData = {
            tenant_id: tenantId,
            purchase_requisition_id: id,
            from_status: null,
            to_status: PurchaseRequisitionStatus.DRAFT,
            action: "CREATED",
            acted_by_user_id: userId,
            remarks: null,
            acted_at,
            metadata_json: metadata           
            
        }

        const requisition = await this.repository.createRequisition(dataCreate);

        await this.repository.createItems(dataItems)

        await this.repository.createStatusLog(statusLogs)

        return requisition


    }

    async submitRequisition (data: PurchaseRequisitionIdParams) {
        /*
            1. receives Requisition id and user Id

            2. finds and validates requisition id and user id.
                - throws an error if one of doesn't exist

            3. Update the purchase requisition status to SUBMITTED/PENDING.

            4. After the requisition is successfully updated, publish the
            PurchaseRequisitionSubmitted event.

            5. Return confirmation.
        */

        const {
            userId,
            requisitionId,
        } = data

        const requisition = await this.repository.findByRequisitionId(requisitionId)

        if(!requisition) {
            throw new NotFoundError ( "Purchase requisition not found" )
        }

        this.assetAuthor (requisition, userId)

        if (requisition.status !== PurchaseRequisitionStatus.DRAFT) {
            throw new ConflictError ("Only draft requisitions can be submitted")
        }

        const submitted_at = new Date()

        const submission = await this.repository.updateStatus(
            requisitionId,
            {
                status: "SUBMITTED",
                submitted_at
            }
        )

        const metadata = await this.repository.findDetailsById(requisitionId)

        if (!metadata) {
            throw new NotFoundError(
                "Purchase requisition not found"
            );
        }

        const acted_at = new Date()

        const tenant = await this.repository.findByUserId(userId)

        if(!tenant){
            throw new NotFoundError("tenant id not found")
        }

        const tenant_id = tenant.tenant_id

        const statusLogs: purchaseRequisitionStatusLogData = {
            tenant_id,
            purchase_requisition_id: requisitionId,
            from_status: null,
            to_status: PurchaseRequisitionStatus.SUBMITTED,
            action: "CREATED",
            acted_by_user_id: userId,
            remarks: null,
            acted_at,
            metadata_json: metadata           
            
        }

        await this.repository.createStatusLog(statusLogs)

        this.eventBus.publish (
            "purchaseRequisition.submitted", 
            {
                purchaseRequisitionId: submission.id,
                tenantId: submission.tenant_id,
                companyId: submission.company_id,
                userId: submission.requested_by_user_id,
                submittedAt: submission.submitted_at,
            }
        )

        return {
            requisition_id: submission.id,
            requisition_status: submission.status,
            submitted_at: submission.submitted_at
        }
        
    }

    async cancelRequisition (input: CancelPurchaseRequisitionInput) {
        /*
            1. receives requisition id and user id for cancellation

            2. find and verifies requisition id
                - throws if requisition id does not exist
            
            3. verifiy if the current user is an employee of the organization and the one 
               who created the requisition
                - throws a forbidden error if they're not an employee of the organization or author
            
            4. Check the current status of the purchase requisition.
                - Cancellation is allowed if the requisition is still in a
                    cancellable state (e.g., DRAFT or SUBMITTED/POSTED).
                - Cancellation is NOT allowed once the requisition is
                    UNDER_REVIEW or has progressed to a later stage.

            5. if the requisition is not cancellable throw an exception

            6. update requisition to cancelled

            7. Record the cancellation details for audit purposes.
                - cancelledBy
                - cancelledAt
                - cancellationReason (if required)
            
            8. Publish a PurchaseRequisitionCancelled event after the 
               cancellation is successfully saved.
            
            9. return the updated status cancelled
        */

        const {
            remarks,
            requisitionId,
            userId,
 
        } = input

        const requisition = await this.repository.findByRequisitionId(requisitionId)

        if(!requisition) {
            throw new NotFoundError ("Purchase requisition not found")
        }

        const membership =
            await this.repository.findActiveByUserId(userId);

        if (!membership) {
            throw new Error("User has no active company membership");
        }
        
        this.assetAuthor (requisition, userId)

        const cancellableStatuses: PurchaseRequisitionStatus[] = [
            PurchaseRequisitionStatus.DRAFT,
            PurchaseRequisitionStatus.SUBMITTED
        ];

        if (!cancellableStatuses.includes(requisition.status)) {
            throw new ConflictError ("Purchase requisition cannot be cancelled in its current status")
        }

        const cancelled_at = new Date()
        
        await this.repository.updateStatus(
            requisitionId,
            {
                status: "CANCELLED",
                cancelled_at
            }
        )

        const tenant = await this.repository.findByUserId(userId)

        if(!tenant){
            throw new NotFoundError("tenant id not found")
        }

        const tenant_id = tenant.tenant_id         

        const metadata = await this.repository.findDetailsById(requisitionId)

        if (!metadata) {
            throw new NotFoundError(
                "Purchase requisition not found"
            );
        }

        const acted_at = new Date()       

        const statusLogs: purchaseRequisitionStatusLogData = {
            tenant_id,
            purchase_requisition_id: requisitionId,
            from_status: null,
            to_status: PurchaseRequisitionStatus.CANCELLED,
            action: "CREATED",
            acted_by_user_id: userId,
            remarks,
            acted_at,
            metadata_json: metadata           
            
        }

        await this.repository.createStatusLog(statusLogs)

        this.eventBus.publish(
            "purchaseRequisition.cancelled",
            {
                purchaseRequisitionId: requisition.id,
                tenantId: requisition.tenant_id,
                companyId: requisition.company_id,
                userId: requisition.requested_by_user_id,
                cancelled_at: requisition.cancelled_at,
            }
        )

        return {
            status: requisition.status
        }
    }

    async resubmitRequisition (input: ResubmitPurchaseRequisitionInput) {
        /*
            1. Receive the original requisition ID, authenticated user ID, and the
            revised requisition data.

            2. Find the original requisition.
            - Throw an exception if the requisition does not exist.

            3. Verify that the authenticated user is authorized to resubmit the
            requisition.
            - The requisition must belong to the requesting user.
            - Throw a forbidden error if the user is not authorized.

            4. Find the latest revision belonging to the requisition.

            5. Verify that the latest revision is in a `REJECTED` state.
            - Throw an exception if the requisition cannot be resubmitted.

            6. Determine the next revision number.

            7. Generate the new `pr_number` using the requisition number format and
            the new revision number.

            8. Construct the new Purchase Requisition revision using the submitted
            data and the revision information.

            9. Send the new revision to the repository for persistence.

            10. Return the necessary information for the newly created revision.
        */

        const { 
            purpose,
            justification,
            priority,
            currency_code,
            needed_by_date,
            items,
            requisitionId,
            userId,
            remarks
        } = input


        const user = await this.repository.findByUserId(userId)

        if (!user) {
            throw new NotFoundError ("User does not exist")
        }

        const requisition = await this.repository.findByRequisitionId(requisitionId)

        if (!requisition) {
            throw new NotFoundError ("Purchase requisition not found")
        }

        const membership =
            await this.repository.findActiveByUserId(userId);

        if (!membership) {
            throw new Error("User has no active company membership");
        }
        
        this.assetAuthor (requisition, userId)
        
        const latest = await this.repository.findLatestRevision(requisition.root_id)

        if (!latest) {
            throw new NotFoundError(
                "Purchase requisition revision not found"
            );
        }
        
        const resubmittableStatuses: PurchaseRequisitionStatus[] = [
            PurchaseRequisitionStatus.REJECTED
        ];

        if (!resubmittableStatuses.includes(latest.status)) {
            throw new ConflictError ("Purchase requisition cannot be submitted in its current status")
        }
        
        const nextGeneration = latest.generation + 1;

        const id = randomUUID()
        const created_at = new Date()
        const generation = nextGeneration

        const pr_number = this.prNumberGenerator(created_at, id, generation )

        const companyId = membership.company_id;

        if (!companyId) {
            throw new Error("User has no active company membership");
        }

        const total_amount = items.reduce(
            (total, item) => total + item.quantity * item.estimated_unit_cost,
            0
        );

        const requested_by_user_id =  userId

        const tenant = await this.repository.findByUserId(userId)

        if(!tenant){
            throw new NotFoundError("tenant id not found")
        }

        const tenant_id = tenant.tenant_id        

        const dataCreate: purchaseRequisitionData = {
            id,
            root_id: id,
            tenant_id,
            company_id: companyId,
            pr_number,
            generation: 1,
            requested_by_user_id,
            purpose,
            justification,
            status: PurchaseRequisitionStatus.DRAFT,
            priority,
            currency_code,
            total_amount: new Prisma.Decimal(total_amount),
            needed_by_date: needed_by_date ? new Date(needed_by_date): null,
            created_at
        };

        const dataItems: PurchaseRequisitionItemCreateData[] = []

        let line_no = 1

        for(const item of items) {

            const dataItem: PurchaseRequisitionItemCreateData = {
                tenant_id,
                purchase_requisition_id: id,
                line_no: line_no,
                item_type: item.item_type,
                description:item.description,
                specification: item.specification,
                quantity: item.quantity,
                unit_of_measure: item.unit_of_measure,
                estimated_unit_cost: item.estimated_unit_cost,
                estimated_total_cost: total_amount,
                category_id: item.category_id ?? null,
                needed_by_date: item.needed_by_date ?? null,
                status: PurchaseRequisitionStatus.DRAFT                
            }

            dataItems.push(dataItem)
            line_no++;
        }

                const metadata = await this.repository.findDetailsById(requisitionId)

        if (!metadata) {
            throw new NotFoundError(
                "Purchase requisition not found"
            );
        }

        const acted_at = new Date()       

        const statusLogs: purchaseRequisitionStatusLogData = {
            tenant_id,
            purchase_requisition_id: requisitionId,
            from_status: null,
            to_status: PurchaseRequisitionStatus.CANCELLED,
            action: "CREATED",
            acted_by_user_id: userId,
            remarks,
            acted_at,
            metadata_json: metadata           
            
        }      

        await this.repository.createRequisition(dataCreate)

        await this.repository.createItems(dataItems)

        await this.repository.createStatusLog(statusLogs)

        return {
            requisition_id: requisition.id,
            requisition_status: requisition.status,
            submitted_at: requisition.submitted_at
        }        

    }

    async getRequisition (input: PurchaseRequisitionQuery) {
        /*
            1. It receives requisition id and user id 

            2. verifies requisition id
                - throws an exception if it doesn't exist
            
            3. verifies user id
                - if the user is exisiting
                - if user is an employee under this organization
                - if the user has the clearance to see the requisition
    
            4. gathers data related to requisition id

            5. returns the gathered data
        */
        const {
            userId,
            tenantId,
            status,
            requesterId,
            pr_number,
        } = input;

        const user = await this.repository.findByUserId(userId);

        if (!user) {
            throw new NotFoundError("User does not exist");
        }

        const membership =
            await this.repository.findActiveByUserId(userId);

        if (!membership) {
            throw new Error("User has no active company membership");
        }

        return this.repository.findRequisitionsForQuery({
            userId,
            tenantId,
            status,
            requesterId,
            pr_number,
        });
    }

    async purchaseRequisitionDetail (input: PurchaseRequisitionIdParams) {
        /*
            1. It receives requisition id and user id 

            2. verifies requisition id
                - throws an exception if it doesn't exist
            
            3. verifies user id
                - if the user is exisiting
                - if user is an employee under this organization
                - if the user has the clearance to see the requisition
            
            4. gathers data related to requisition id

            5. returns the gathered data
        */
        
        const {
            requisitionId,
            userId
        } = input    
        
        const requisition = await this.repository.findByRequisitionId(requisitionId)

        if(!requisition) {
            throw new NotFoundError ("Purchase requisition does not exist")
        }

        const user = await this.repository.findByUserId(userId)

        if(!user) {
            throw new NotFoundError (" User does not Exist")
        }

        const membership =
            await this.repository.findActiveByUserId(userId);

        if (!membership) {
            throw new Error("User has no active company membership");
        }
        
        const details = await this.repository.findDetailsById(requisitionId)

        return details

    }

    async updateRequisition(    
        requisitionId: string,
        userId: string,
        updateData: PurchaseRequisitionUpdateData
    ) 
    {
        // 1. Find the requisition
        const requisition =
            await this.repository.findByRequisitionId(requisitionId);

        if (!requisition) {
            throw new NotFoundError(
                "Purchase requisition does not exist"
            );
        }

        // 2. Find the user
        const user =
            await this.repository.findByUserId(userId);

        if (!user) {
            throw new NotFoundError(
                "User does not exist"
            );
        }

        // 3. Verify active organization/company membership
        const membership =
            await this.repository.findActiveByUserId(userId);

        if (!membership) {
            throw new RestrictedAccessError(
                "User does not have an active company membership"
            );
        }

        // 4. Verify authorship
        if (requisition.requested_by_user_id !== userId) {
            throw new RestrictedAccessError(
                "You are not authorized to update this requisition"
            );
        }

        // 5. Verify that the requisition is still editable
        if (requisition.status !== "DRAFT") {
            throw new ConflictError(
                "Purchase requisition cannot be updated in its current status"
            );
        }

        // 6. Perform the update


        const repositoryUpdateData = {
            ...updateData,
            requested_by_user_id: userId
        };

        const updatedRequisition =
            await this.repository.update(
                requisitionId,
                repositoryUpdateData
            );

        // 7. Return the updated requisition
        return updatedRequisition;
    }

    private assetAuthor (
        requisitionId: PurchaseRequisition,
        userId: string
    ): void {
        if (requisitionId.requested_by_user_id !== userId){
            throw new RestrictedAccessError(
                "You are not authorized to modify this requisition"
            )
        }
    }

    private prNumberGenerator (
        creationDate: Date,
        uniqueIdentifier: string,
        revision: number
    ): string {

        const date = creationDate
            .toISOString()
            .slice(0,10)
            .replaceAll("-", "");
        
        return `PR-${uniqueIdentifier}-${date}-${revision}`;

                /*
            1. Receive the information required to generate a Purchase Requisition number.
            - Purchase Requisition creation date.
            - Unique sequence/identifier for the original requisition.
            - Revision number.

            2. Format the creation date using the required date format.

            3. Generate or receive the unique sequence/identifier used by the Purchase
            Requisition number.

            4. Append the revision number to identify the current revision.

            5. Construct the final `pr_number` using the defined format.

            6. Return the generated `pr_number`.

            The generator should only be responsible for constructing the Purchase
            Requisition number.

            It should not:
            - Validate the user's permissions.
            - Retrieve the Purchase Requisition.
            - Update the database.
            - Create a Purchase Requisition.
            - Handle revision state.
            - Publish events.
        */

    }
}