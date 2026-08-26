import { ApprovalWorkflowRepository } from "./approvalWorkflowRepository.js";
import { EventBus } from "../../shared/events/eventBus.js";

export class ApprovalWorkflowService {
	constructor (
		private repository: ApprovalWorkflowRepository,
		private eventBus: EventBus
	){}

	async CreateApprovalWorkflow () {}

	async approveRequisition () {}

	async rejectRequisition () {}

	async cancelRequisition () {}

	async getApprovalWorkflows () {}

	async approvalRequest () {}	
}
