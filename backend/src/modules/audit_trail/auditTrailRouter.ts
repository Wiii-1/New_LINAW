import { Router } from "express"
import { auditTrailController } from "./auditTrailController.js"
import { auditTrailService } from "./auditTrailService.js"
import { AuditTrailRepository } from "./auditTrailRepository.js"
import { authenticate } from "../../shared/middleware/authenticate.js"

const router = Router()
const service = new auditTrailService( new AuditTrailRepository())
const controller = new auditTrailController(service)

router.get("/serach", authenticate, controller.searchAuditRecord)
router.get("/:auditId/verify", authenticate, controller.verifyAuditIntegrity)

export default router;