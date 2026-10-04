import { NotFoundError } from "../../shared/errors";
import type { EventBus } from "../../shared/events/eventBus";
import { PurchaseOrderManagementRepository } from "./purchaseOrderManagementRepository";
import type { 
    CreatePurchaseOrder,
    CreateRFQ,
    ListPurchaseOrdersQuery,
    ListRFQsQuery,
    RFQIdParams,
    QuotationParams,
    PurchaseOrderIdParams,
    UpdatePurchaseOrder,
    UpdateRFQ
 } from "./purchaseOrderManagementValidator";

interface CreatePurchaseOrderInput {
    user_id: string
    tenant_id: string
    company_id: string
    body: CreatePurchaseOrder
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

    async createPurchaseOrder (input: CreatePurchaseOrderInput) {

        const id = crypto.randomUUID();
        const created_at = new Date();
        const generation = 1;

        const po_number = this.NumberGenerator(
            created_at,
            id,
            generation,
        );

        const data = {
            id: id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,

            po_number,
            issued_by_user_id: input.user_id,
            status: "DRAFT",

            supplier_id: input.body.supplier_id,
            rfq_id: input.body.rfq_id,
            purchase_requisition_id: input.body.purchase_requisition_id,
            supplier_quotation_id: input.body.supplier_quotation_id,

            currency_code: input.body.currency_code,
            total_amount: input.body.total_amount,

            order_date: input.body.order_date,
            expected_delivery_date: input.body.expected_delivery_date,

            items: input.body.items.map((item) => ({
                tenant_id: input.tenant_id,
                purchase_order_id: id,
                line_no: item.line_no,
                description: item.description,
                quantity: item.quantity,
                unit_of_measure: item.unit_of_measure,
                unit_price: item.unit_price,
                total_price: item.total_price,
                status: "ACTIVE",
            })),
        };

        return this.repository.createPurchaseOrder(data);
    }

    async createRFQS (input: CreateRFQInput) {

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

    async selectSupplier (input:ServiceQuotationParam) {

        const Quotation = await this.repository.findQuotationById({
            quotation_id: input.params.quotationId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,            
        })

        const RFQ = await this.repository.findRfqById({
            rfq_id: input.params.rfqId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,            
        })

        if (!Quotation || !RFQ) {
            throw new NotFoundError("Quotation or RFQ does not exist")
        }

        if (Quotation.rfq_id !== RFQ.id) {
            throw new NotFoundError("Quotation does not belong to this RFQ")
        }

        const data = {
            tenant_id: input.tenant_id,
            company_id: Quotation.company_id,
            rfq_id: Quotation.rfq_id,
            quotation_id: input.params.quotationId,
            supplier_id: Quotation.supplier_id,            
        }

        return await this.repository.selectSupplier(data)

    }

    async getList(input: ServicePoQuery) {
        return await this.repository.getList({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            query: input.query,
        })
    }

    async getRFQS(input: ServiceRfqsQuery) {
        return await this.repository.getRFQS({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            query: input.query,
        })
    }

    async getQuotationList(input: ServiceRfqIdParam) {
        return await this.repository.getQuotationList({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            rfq_id: input.params.rfqId,
        })
    }

    async getQuotation(input: ServiceQuotationParam) {
        return await this.repository.getQuotation({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            rfq_id: input.params.rfqId,
            quotation_id: input.params.quotationId,
        })
    }

    async getPO(input: ServicesPurchaseOrderIdParam) {
        return await this.repository.getPO({
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            po_id: input.params.poId,
        })
    }
    async updateRFQS (input: ServiceUpdateRfqInput) {

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

        const data = {
            po_id: input.params.poId,
            tenant_id: input.tenant_id,
            company_id: input.company_id,              
        }

        return await this.repository.deletePo(data)

    }

}

