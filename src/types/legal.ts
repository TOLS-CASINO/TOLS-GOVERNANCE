export interface ContractSignature {
  id: string; contractType: string; documentName: string; documentUrl?: string; docusignId?: string; signers: string; status: string; expiresAt?: string; signedAt?: string; createdAt: string
}
export interface AuditLog {
  id: string; userId?: string; userRole?: string; action: string; resource: string; resourceId?: string; details?: string; ipAddress?: string; createdAt: string
}
export interface LegalData {
  contracts: ContractSignature[]; auditLogs: AuditLog[]
}
