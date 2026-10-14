import { Hono } from "hono";
import type { AppContext } from "../../shared/types/hono";
import { authenticate } from "../../shared/middleware/authenticate";
import { SupplierManagementGovernanceController } from "./SupplierManagementGovernance/supplierManagementGovernanceController.js";
import { SupplierManagementGovernanceService } from "./SupplierManagementGovernance/supplierManagementGovernanceService.js";
import { SupplierManagementGovernanceRepository } from "./SupplierManagementGovernance/supplierManagementGovernanceRepository.js";
import { SupplierManagementInvitationController } from "./SupplierManagementInvitation/supplierManagementInvitationController";
import { SupplierManagementInvitationService } from "./SupplierManagementInvitation/supplierManagementInvitationService";
import { SupplierManagementInvitationRepository } from "./SupplierManagementInvitation/supplierManagementInvitationRepository";
import { SupplierManagementPortalController } from "./supplierManagementPortal/supplierManagementPortalController";
import { SupplierManagementPortalService } from "./supplierManagementPortal/supplierManagementPortalService";
import { SupplierManagementPortalRepository } from "./supplierManagementPortal/supplierManagementPortalRepository";
import { EventBus } from "../../shared/events/eventBus";

export function createSupplierManagement() {
    const router = new Hono<AppContext>();

    const governanceService = new SupplierManagementGovernanceService(
        new SupplierManagementGovernanceRepository()
    );

    const invitationService = new SupplierManagementInvitationService(
        new SupplierManagementInvitationRepository()
    );

    const portalService = new SupplierManagementPortalService(
        new SupplierManagementPortalRepository(),
        new EventBus()
    );

    const governanceController = new SupplierManagementGovernanceController(
        governanceService
    );

    const invitationController = new SupplierManagementInvitationController(
        invitationService
    );

    const portalController = new SupplierManagementPortalController(
        portalService
    );

    router.use(authenticate);

    // ==========================================
    // SUPPLIER GOVERNANCE
    // ==========================================

    // GET
    router.get("/suppliers", governanceController.getSuppliers);
    router.get("/suppliers/:supplierId", governanceController.getSupplier);

    // DELETE
    router.delete(
        "/suppliers/:supplierId/relationship",
        governanceController.removeSupplierRelationship
    );

    // ==========================================
    // SUPPLIER INVITATIONS
    // ==========================================

    // POST
    router.post("/supplier-invitations", invitationController.createInvitation);
    router.post(
        "/supplier-invitations/:invitationId/resend",
        invitationController.MailgunInvitation
    );
    router.post(
        "/supplier-invitations/:invitationId/accept",
        invitationController.acceptInvitation
    );

    // GET
    router.get(
        "/supplier-invitations",
        invitationController.getInvitations
    )

    router.get(
        "/supplier-invitations/:invitationId",
        invitationController.getInvitation
    );

    router.get(
        "/supplier-invitations/validate/:token",
        invitationController.validateInvitation
    );

    // ==========================================
    // SUPPLIER PORTAL
    // ==========================================

    // GET
    router.get("/supplier-portal/rfqs", portalController.getAvailableRFQs);
    router.get("/supplier-portal/rfqs/:rfqId", portalController.getRFQ);
    router.get("/supplier-portal/quotations", portalController.getQuotations);
    router.get(
        "/supplier-portal/quotations/:quotationId",
        portalController.getQuotation
    );

    // POST
    router.post(
        "/supplier-portal/rfqs/:rfqId/quotations",
        portalController.submitQuotation
    );

    return router;
}
