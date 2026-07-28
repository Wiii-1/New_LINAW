import { Router } from "express"
import { auditTrailController } from "./auditTrailController.js"
import { auditTrailServices } from "./auditTrailService.js"
import { auditTrailRepository } from "./auditTrailRepository.js"
import { authenticate } from "../../shared/middleware/authenticate.js"

const router = Router()
const service = new auditTrailServices( new auditTrailRepository())
const controller = new auditTrailController(service)

router.get("/serach", controller.searchAuditRecord)
router.get("/:auditId/verify", controller.verifyAuditIntegrity)