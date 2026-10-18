import { NotFoundError } from "../../shared/errors/appError.js";
import type { EventBus } from "../../shared/events/eventBus.js";
import type { SupplierQuotationSubmittedEvent } from "../../shared/events/supplierQuotationSubmittedEvent";
import { PurchaseOrderManagementRepository } from "./purchaseOrderManagementRepository";
import type { 
    CreateRFQ,
    ListPurchaseOrdersQuery,
    ListRFQsQuery,
    ProcurementQueueQuery,
    RFQIdParams,
    QuotationParams,
    PurchaseOrderIdParams,
    UpdatePurchaseOrder,
    UpdateRFQ
 } from "./purchaseOrderManagementValidator";

import { ConflictError } from "../../shared/errors/appError.js";

interface OrderPurchaseOrderContext {
    user_id: string;
    tenant_id: string;
    company_id: string;
    poId: string;
}

interface CreateRFQInput {
    user_id: string
    tenant_id: string
    company_id: string
    body: CreateRFQ
}

interface ServicePoQuery {
    user_id: string
    tenant_id: string
    company_id: string
    query?: ListPurchaseOrdersQuery
}

interface ServiceRfqsQuery {
    user_id: string
    tenant_id: string
    company_id: string
    query?: ListRFQsQuery
}

interface ServiceProcurementQueueQuery {
    tenant_id: string;
    company_id: string;
    query?: ProcurementQueueQuery;
}

interface ServiceRfqIdParam {
    user_id: string
    tenant_id: string
    company_id: string
    params: RFQIdParams
}

interface ServiceQuotationParam {
    user_id: string
    tenant_id: string
    company_id: string
    params: QuotationParams    
}

interface ServicesPurchaseOrderIdParam {
    user_id: string
    tenant_id: string
    company_id: string
    params: PurchaseOrderIdParams    
}

interface ServiceUpdateRfqInput {
    user_id: string
    tenant_id: string
    company_id: string
    params: RFQIdParams
    body: UpdateRFQ    
}

interface ServiceUpdatePurchaseOrderInput {
    user_id: string
    tenant_id: string
    company_id: string
    params: PurchaseOrderIdParams
    body: UpdatePurchaseOrder
}

interface ServiceDeleteRfqsInput {
    user_id: string
    tenant_id: string
    company_id: string
    params: RFQIdParams    
}

interface ServiceDeletePurchaseOrderInput {
    user_id: string
    tenant_id: string
    company_id: string
    params: PurchaseOrderIdParams    
}

interface ApprovedPRContext {
    purchaseRequisition_id?: string
    approvalWorkflow_id?: string
    tenant_id?: string
    company_id?: string
    user_id?: string
}

export class PurchaseOrderManagementService {
    constructor(
        private repository: PurchaseOrderManagementRepository,
        private eventBus: EventBus
    ) {}

    private NumberGenerator (
        creationDate: Date,
        uniqueIdentifier: string,
        revision: number
    ): string {

        const date = creationDate
            .toISOString()
            .slice(0,10)
            .replaceAll("-", "");
        
        return `${uniqueIdentifier}-${date}-${revision}`;

    }    

    async orderPurchaseOrder(input: OrderPurchaseOrderContext) {
        const purchaseOrder = await this.repository.findPoById({
            po_id: input.poId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        if (!purchaseOrder) {
            throw new NotFoundError("Purchase order does not exist");
        }

        if (purchaseOrder.status !== "ISSUED") {
            throw new ConflictError(
                "Only issued purchase orders can be ordered",
            );
        }

        const orderedPurchaseOrder = await this.repository.orderPurchaseOrder({
            po_id: input.poId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        if (!orderedPurchaseOrder) {
            throw new ConflictError(
                "Purchase order could not be transitioned to ORDERED",
            );
        }

        return orderedPurchaseOrder;
    }

    async createRFQS (input: CreateRFQInput) {
        const purchaseRequisition =
            await this.repository.findApprovedPurchaseRequisitionForRFQ({
                purchaseRequisition_id: input.body.purchase_requisition_id,
                tenant_id: input.tenant_id,
                company_id: input.company_id,
            });

        if (!purchaseRequisition) {
            throw new NotFoundError(
                "Approved purchase requisition does not exist",
            );
        }

        if (purchaseRequisition.rfqs.length > 0) {
            throw new ConflictError(
                "A purchase requisition already has an RFQ",
            );
        }

        const id = crypto.randomUUID()
        const created_at = new Date()
        const generation = 1

        const rfq_number = this.NumberGenerator(created_at, id, generation )        

        const data = {
            id: id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            rfq_number: rfq_number,
            purchase_requisition_id: input.body.purchase_requisition_id,
            created_by_user_id: input.user_id,
            title: input.body.title,
            description: input.body.description,
            status: "DRAFT",
            closing_date: input.body.closing_date,
            created_at: created_at,

            items: input.body.rfq_items.map((item) => ({
                tenant_id: input.tenant_id,
                line_no: item.line_no,
                description: item.description,
                quantity: item.quantity,
                unit_of_measure: item.unit_of_measure,
                specification: item.specification,
            })),            
        }

        return await this.repository.createRFQS(data)

    }

    async publishRFQS(input: ServiceRfqIdParam) {

        const rfq = await this.repository.findRfqById({
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,            
        })

        if (!rfq) {
            throw new NotFoundError("RFQ does not exist")
        }

        if (rfq.status !== "DRAFT") {
            throw new ConflictError("Only draft RFQs can be published")
        }

        const PublishContext = {
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            rfq_id: input.params.rfqId
        }

        const publishedRfq = await this.repository.publishRfq(PublishContext)

        if (!publishedRfq) {
            throw new NotFoundError("RFQ not found");
        }        

        await this.eventBus.publish("rfq.published", {
            rfq_number: publishedRfq.rfq_number,
            tenant_id: input.tenant_id,
            company_id: input.company_id,

            title: publishedRfq.title,
            description: publishedRfq.description,

            quotation_deadline: publishedRfq.closing_date,

            items: publishedRfq.items.map((item) => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit_of_measure,
            })),
        })

        return {
            message: "RFQ successfully published",
        }
    }

    async selectSupplier(input: ServiceQuotationParam) {
        const quotation = await this.repository.findQuotationById({
            quotation_id: input.params.quotationId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        const rfq = await this.repository.findRfqById({
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        if (!quotation || !rfq) {
            throw new NotFoundError("Quotation or RFQ does not exist");
        }

        if (quotation.rfq_id !== rfq.id) {
            throw new NotFoundError("Quotation does not belong to this RFQ");
        }

        if (rfq.status !== "PUBLISHED") {
            throw new ConflictError("Only published RFQs can have quotations selected");
        }

        const createdAt = new Date();
        const id = crypto.randomUUID();
        const poNumber = this.NumberGenerator(createdAt, id, 1);

        const purchaseOrder = await this.repository.selectSupplier({
            id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            user_id: input.user_id,
            rfq_id: rfq.id,
            quotation_id: quotation.id,
            supplier_id: quotation.supplier_id,
            po_number: poNumber,
            order_date: createdAt,
            expected_delivery_date: undefined,
        });

        if (!purchaseOrder) {
            throw new ConflictError(
                "The quotation could not be selected. It may no longer be available."
            );
        }

        return purchaseOrder;
    }

    async handleSupplierQuotationSubmitted(
        event: SupplierQuotationSubmittedEvent,
    ) {
        return this.repository.markQuotationPosted({
            quotation_id: event.quotation_id,
            tenant_id: event.tenant_id,
            company_id: event.company_id,
        });
    }

    async handleApprovedPurchaseRequisition(
        event: ApprovedPRContext,
    ) {
        const { purchaseRequisition_id, approvalWorkflow_id, tenant_id, company_id } = event;

        if (!purchaseRequisition_id || !approvalWorkflow_id || !tenant_id || !company_id) {
            throw new NotFoundError(
                "Missing required information to handle approved purchase requisition",
            );
        }

        const purchaseRequisition =
            await this.repository.findApprovedPurchaseRequisition({
                purchaseRequisition_id: purchaseRequisition_id,
                approvalWorkflow_id: approvalWorkflow_id,
                tenant_id: tenant_id,
                company_id: company_id,
            });

        if (!purchaseRequisition) {
            throw new NotFoundError(
                "Approved purchase requisition does not exist",
            );
        }

        if (purchaseRequisition.rfqs.length > 0) {
            throw new ConflictError(
                "A purchase requisition already has an RFQ",
            );
        }

        return {
            purchaseRequisition_id: purchaseRequisition.id,
            pr_number: purchaseRequisition.pr_number,
            tenant_id: purchaseRequisition.tenant_id,
            company_id: purchaseRequisition.company_id,
            items: purchaseRequisition.items,
        };
    }

    async getProcurementQueue(input: ServiceProcurementQueueQuery) {
        return this.repository.getProcurementQueue({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            query: input.query,
        });
    }

    async getList(input: ServicePoQuery) {
        return await this.repository.getList({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            query: input.query,
        })
    }

    async countList(input: ServicePoQuery) {
        return this.repository.countList({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            query: input.query,
        });
    }

    async getRFQS(input: ServiceRfqsQuery) {
        return await this.repository.getRFQS({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            query: input.query,
        })
    }

    async countRFQS(input: ServiceRfqsQuery) {
        return this.repository.countRFQS({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            query: input.query,
        });
    }

    async getQuotationList(input: ServiceRfqIdParam) {
        const rfq = await this.repository.findRfqById({
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        if (!rfq) {
            throw new NotFoundError("RFQ does not exist");
        }

        return await this.repository.getQuotationList({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            rfq_id: input.params.rfqId,
        })
    }

    async getQuotation(input: ServiceQuotationParam) {
        const quotation = await this.repository.getQuotation({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            rfq_id: input.params.rfqId,
            quotation_id: input.params.quotationId,
        })

        if (!quotation) {
            throw new NotFoundError("Quotation does not exist");
        }

        return quotation;
    }

    async getPO(input: ServicesPurchaseOrderIdParam) {
        const purchaseOrder = await this.repository.getPO({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            po_id: input.params.poId,
        })

        if (!purchaseOrder) {
            throw new NotFoundError("Purchase order does not exist");
        }

        return purchaseOrder;
    }
    async updateRFQS (input: ServiceUpdateRfqInput) {
        const rfq = await this.repository.findRfqById({
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        if (!rfq) {
            throw new NotFoundError("RFQ does not exist");
        }

        if (rfq.status !== "DRAFT") {
            throw new ConflictError("Only draft RFQs can be updated");
        }

        const data = {
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            title: input.body.title,
            description: input.body.description,
            closing_date: input.body.closing_date,
            
            items: input.body.rfq_items?.map((item) => ({
                line_no: item.line_no,
                description: item.description,
                quantity: item.quantity,
                unit_of_measure: item.unit_of_measure,
                specification: item.specification,
            })) 
        }

        return await this.repository.updateRFQS(data)
    }

    async updatePO (input: ServiceUpdatePurchaseOrderInput) {
        const purchaseOrder = await this.repository.findPoById({
            po_id: input.params.poId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        if (!purchaseOrder) {
            throw new NotFoundError("Purchase order does not exist");
        }

        if (purchaseOrder.status !== "ISSUED") {
            throw new ConflictError("Only issued purchase orders can be updated");
        }
        
        const data = {
            po_id: input.params.poId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            expected_delivery_date: input.body.expected_delivery_date,
            currency_code: input.body.currency_code,

            items: input.body.items?.map((item) =>({
                line_no: item.line_no,
                description: item.description,
                quantity: item.quantity,
                unit_of_measure: item.unit_of_measure,
                unit_price: item.unit_price
            }))
        }

        return await this.repository.updatePO(data)
    }

    async deleteRfq (input: ServiceDeleteRfqsInput) {

        const rfq = await this.repository.findRfqById({
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,            
        })

        if(!rfq) {
            throw new NotFoundError("RFQ does not Exist")
        }

        if (rfq.status !== "DRAFT") {
            throw new ConflictError("Only draft RFQs can be deleted")
        }

        const data = {
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,               
        }

        return await this.repository.deleteRfq(data)

    }

    async deletePurchaseOrder (input: ServiceDeletePurchaseOrderInput) {

        const po = await this.repository.findPoById({
            po_id: input.params.poId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,            
        })        

        if (!po) {
            throw new NotFoundError("Purchase order does not exist")
        }

        if (["ORDERED", "COMPLETED", "CANCELLED"].includes(po.status)) {
            throw new ConflictError("Purchase order cannot be cancelled in its current state")
        }

        const data = {
            po_id: input.params.poId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,              
        }

        return await this.repository.deletePo(data)

    }

}

