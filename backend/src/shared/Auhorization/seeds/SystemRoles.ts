export type SystemRoles = 
 | "Organization Admin"
 | "Employee"
 | "Procurement Officer"
 

 export const systemRoles = [
    {
        code: "ADMIN",
        name: "Administrator",
        description: "System administrator.",
    },
    {
        code: "PURCHASING_OFFICER",
        name: "Purchasing Officer",
        description: "Manages purchase requisitions.",
    },
    {
        code: "AUDITOR",
        name: "Auditor",
        description: "Reviews and verifies audit records.",
    },
] as const;