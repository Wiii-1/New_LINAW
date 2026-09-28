import type { AppContext } from "../../shared/types/hono";
import { Hono } from "hono";
import { authenticate } from "../../shared/middleware/authenticate";
import { OrganizationAdministrationController } from "./organizationAdministratorController";
import { OrganizationAdministrationService } from "./organizationAdministrationService";
import { OrganizationAdministrationRepository } from "./organizationAdministrationRepository";



export function createOrganizationAdministration () {
    const router = new Hono<AppContext>();
    const service = new OrganizationAdministrationService(new OrganizationAdministrationRepository()) 
    const controller = new OrganizationAdministrationController(service)

    router.use(authenticate)

    // Organization Member Management

    router.post("/members", controller.addMember)
    
    router.get("/members", controller.getMember)
    router.get("/members/:userId", controller.getUser)

    router.patch("/members/:userId", controller.updateMember)

    router.delete("/members/:userId", controller.removeMember)


    // Organizatoin Role & Permission Management

    router.post("/roles", controller.role)
    router.post("/members/:userid/roles", controller.assignRoleToMember)
    router.post("/roles/:roleId/permissions", controller.assignPermissionsToRole)

    router.get("/roles", controller.getRoles)
    router.get("/roles/:roleId", controller.getRole)
    router.get("/roles/:roleId/permissions", controller.getRolePermissions)
    router.get("/permissions", controller.getPermissions)

    router.patch("/roles/:roleId", controller.updateRole)

    router.delete("/roles/:roleId", controller.deleteRole)
    router.delete("/roles/:roleId/permissions/:permissionId", controller.deletePermissionsFromRole)
    router.delete("/members/:userId/roles/:roleId", controller.removeRoleFromMember)


    // Organization Settings

    router.get("/settings", controller.settings)
    router.patch("/settings", controller.updateSettings)

    // Administrative Audit trail

    //router.get("/audit-trail", controller.auditTrail)

    return router
}