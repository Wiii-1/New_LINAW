import { Router } from "express"
import { auditTrailController } from "./auditTrailController.js"
import { AuditTrailService } from "./auditTrailService.js"
import { AuditTrailRepository } from "./auditTrailRepository.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { BlockchainAdapter } from "../../shared/blockchain/blockchainAdapter.js"
import { registerAuditTrailEvents } from "./auditTrailEventHandler.js"

const router = Router()
const service = new AuditTrailService( new AuditTrailRepository(), new BlockchainAdapter())
registerAuditTrailEvents(service)
const controller = new auditTrailController(service)

router.get("/search", authenticate, controller.searchAuditRecord)
router.get("/:auditId/verify", authenticate, controller.verifyAuditIntegrity)

export default router;