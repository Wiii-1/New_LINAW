import type { AppContext } from "../../shared/types/hono";
import { Context } from "hono"
import { PurchaseOrderManagementService } from "./purchaseOrderManagementService"
import { CreatePurchaseOrderSchema, CreateRFQSchema, ListPurchaseOrdersQuerySchema, ListRFQsQuerySchema, PurchaseOrderIdParamsSchema, QuotationParamsSchema, RFQIdParamsSchema, UpdatePurchaseOrderSchema, UpdateRFQSchema } from "./purchaseOrderManagementValidator";
import { NotFoundError } from "../../shared/errors";


export class PurchaseOrderManagementController {
    constructor ( 
        private service : PurchaseOrderManagementService
    ) {}

    createPurchaseOrder = async (
        c: Context<AppContext>
    ) => {

        const body = CreatePurchaseOrderSchema.parse( await c.req.json())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }         

        const input = {
            user_id,
            tenant_id,
            company_id,
            body
        }

        const createdPO = await this.service.createPurchaseOrder(input)

        return c.json({
            success: true,
            message: "Successfully Created Purchase Order",
            createdPO
        }, 201)
    }

    createRFQS  = async (
        c: Context<AppContext>
    ) => {

        const body = CreateRFQSchema.parse( await c.req.json())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        } 

        const input = {
            user_id,
            tenant_id,
            company_id,
            body
        }

        const createRfq = await this.service.createRFQS(input)

        return c.json({
            success: true, 
            message: "Successful",
            createRfq
        }, 201)

    }

    publishRfqs = async (
        c: Context<AppContext>
    ) => {

        const params = RFQIdParamsSchema.parse(c.req.param())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }         

        const input = {
            user_id,
            tenant_id,
            company_id,
            params
        }

        const published = await this.service.publishRFQS(input)

        return c.json({
            success: true,
            message: "Successfully published RFQS",
            published
        }, 201)
    }

    selectSupplier = async (
        c: Context<AppContext>
    ) => {

        const params = QuotationParamsSchema.parse(c.req.param())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }         

        const input = {
            user_id,
            tenant_id,
            company_id,
            params
        }

        const selectedSupplier = await this.service.selectSupplier(input)

        return c.json({
            success: true,
            message: "Supplier has been selected",
            selectedSupplier
        },201)
    }

    getList = async (
        c: Context<AppContext>
    ) => {
        const query = ListPurchaseOrdersQuerySchema.parse(c.req.query())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }         

        const input = {
            user_id,
            tenant_id,
            company_id,
            query
        }

        const list = await this.service.getList(input)

        return c.json({
            success: true,
            message: "Success list is returned",
            list
        }, 201)
    }

    getRfqs = async (
        c: Context<AppContext>
    ) => {

        const query = ListRFQsQuerySchema.parse(c.req.param())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }        

        const input = {
            user_id,
            tenant_id,
            company_id,
            query
        }

        const list = await this.service.getRFQS(input)

        return c.json({
            success: true,
            list
        },201)

    }

    getQuotationList = async (
        c: Context<AppContext>
    ) => {
        
        const params = RFQIdParamsSchema.parse(c.req.param())
        
        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }

        const input = {
            user_id,
            tenant_id,
            company_id,
            params
        }

        const QuotationList = await this.service.getQuotationList(input)

        return c.json({
            success: true,
            QuotationList
        },201 )
    }

    getQuotation = async (
        c: Context<AppContext>
    ) => {

        const params = QuotationParamsSchema.parse(c.req.param())

        const {user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }        

        const input = {
            user_id,
            tenant_id,
            company_id,
            params
        }

        const Quotation = await this.service.getQuotation(input)

        return c.json({
            success: true,
            Quotation
        }, 201)
    }

    getPO= async (
        c: Context<AppContext>
    ) => {

        const params = PurchaseOrderIdParamsSchema.parse(c.req.param())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }

        const input = {
            user_id,
            tenant_id,
            company_id,
            params
        }

        const PO = await this.service.getPO(input)

        return c.json({
            success: true,
            PO
        },201)

    }

    updateRfq = async (
        c: Context<AppContext>
    ) => {

        const params = RFQIdParamsSchema.parse(c.req.param())

        const body = UpdateRFQSchema.parse( await c.req.json())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }        

        const input = {
            user_id,
            tenant_id,
            company_id,
            params,
            body
        }

        const updated = await this.service.updateRFQS(input)

        return c.json({
            success: true,
            message: "Sucessful",
            updated
        }, 201)
    }

    updatePo = async (
        c: Context<AppContext>
    ) => {

        const params = PurchaseOrderIdParamsSchema.parse(c.req.param())

        const body = UpdatePurchaseOrderSchema.parse(await c.req.json())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }        

        const input = {
            user_id,
            tenant_id,
            company_id,
            body,
            params
        }

        const updated = await this.service.updatePO(input)

        return c.json({
            success: true,
            updated
        }, 201)
    }

    deleteRfq = async (
        c: Context<AppContext>
    ) => {

        const params = RFQIdParamsSchema.parse(c.req.param())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }        

        const input = {
            user_id,
            tenant_id,
            company_id,
            params
        }
        
        const deleted = await this.service.deleteRfq(input)

        return c.json({
            success: true,
            deleted
        }, 201)

    }

    deletePurchaseOrder = async (
        c: Context<AppContext>
    ) => {

        const  params = PurchaseOrderIdParamsSchema.parse(c.req.param())

        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }        

        const input = {
            user_id,
            tenant_id,
            company_id,
            params
        }

        const deletedPO = await this.service.deletePurchaseOrder(input)

        return c.json({
            success: true,
            deletedPO
        },201)

    }
}