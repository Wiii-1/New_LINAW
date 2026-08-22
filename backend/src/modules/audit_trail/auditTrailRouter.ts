import { Router } from "express"
import { auditTrailController } from "./auditTrailController.js"
import { AuditTrailService } from "./auditTrailService.js"
import { AuditTrailRepository } from "./auditTrailRepository.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { BlockchainAdapter } from "../../shared/blockchain/blockchainAdapter.js"
import { registerAuditTrailEvents } from "./auditTrailEventHandler.js"

import { Authorize } from "../../shared/Auhorization/authorize.js"
import { systemPermissions } from "../../shared/Auhorization/seeds/systemPermissions.js"
import { criticalRateLimit } from "../../shared/middleware/rateLimit/critical-rate-limit.js"

const router = Router()
const service = new AuditTrailService( new AuditTrailRepository(), new BlockchainAdapter())
registerAuditTrailEvents(service)
const controller = new auditTrailController(service)

router.use( criticalRateLimit )
router.use( authenticate )

router.get("/search", Authorize(systemPermissions.auditTrail.search), controller.searchAuditRecord)
router.get("/:auditId/verify", Authorize(systemPermissions.auditTrail.verify),controller.verifyAuditIntegrity)

export default router;