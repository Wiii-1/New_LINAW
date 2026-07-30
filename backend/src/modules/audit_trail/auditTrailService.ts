import { AuditTrailRepository } from "./auditTrailRepository.js";
import { searchAudit, auditIntegrity } from "./auditTrailValidator.js";


export class auditTrailService {
    constructor (private repository: AuditTrailRepository) {}

    
}