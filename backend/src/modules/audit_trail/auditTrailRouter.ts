import { Router } from "express"
import { auditTrailController } from "./auditTrailController.js"
import { AuditTrailService } from "./auditTrailService.js"
import { AuditTrailRepository } from "./auditTrailRepository.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { BlockchainAdapter } from "../../shared/blockchain/blockchainAdapter.js"
import { registerAuditTrailEvents } from "./auditTrailEventHandler.js"
import { checkRateLimit } from "../../shared/middleware/rateLimit/rate-limiter.js"

const router = Router()
const service = new AuditTrailService( new AuditTrailRepository(), new BlockchainAdapter())
registerAuditTrailEvents(service)
const controller = new auditTrailController(service)

router.use( checkRateLimit)
router.use( authenticate )

router.get("/search", controller.searchAuditRecord)
router.get("/:auditId/verify", controller.verifyAuditIntegrity)

export default router;