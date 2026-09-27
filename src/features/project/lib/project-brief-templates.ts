export interface ProjectBriefTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string;
}

export const PROJECT_BRIEF_TEMPLATES: ProjectBriefTemplate[] = [
  {
    id: 'prd',
    title: 'Product PRD',
    subtitle: 'Objectives, in-scope features, non-goals, and success metrics',
    icon: 'FileText',
    content: `# Product Specification

## 1. Problem Statement
Describe the core user pain points, business context, and operational bottlenecks being addressed.

## 2. Target Audience & Stakeholders
- **Primary User**: End-users who interact with this initiative on a daily basis.
- **Project Lead & Managers**: Team leads tracking deliverable velocity and completion status.

## 3. Scope & Objectives
### In-Scope Deliverables
- Milestone 1: Core domain models, API routes, and RBAC permission checks
- Milestone 2: Responsive user interface with real-time feedback
- Milestone 3: Telemetry badges, analytics rollups, and audit logging

### Out of Scope (Non-Goals)
- Third-party webhook integrations (scheduled for Phase 2)
- Multi-region database replication (handled by infrastructure team)

## 4. Success Criteria & KPIs
- [ ] 95%+ completion rate across core user workflows
- [ ] p95 API response times under 200ms
- [ ] 100% compliance with role-based access control policies
`,
  },
  {
    id: 'rfc',
    title: 'Technical RFC',
    subtitle: 'System architecture, API design, security, and rollout plan',
    icon: 'Layers',
    content: `# Technical RFC: System Architecture

## 1. Context & Motivation
Explain the technical motivation, architectural trade-offs, and scalability targets for this project.

## 2. Proposed Architecture & Data Flow
1. **Client Layer**: Next.js 16 App Router with TanStack Query caching and optimistic UI updates.
2. **Gateway & Security**: JWT authentication with workspace-level Role-Based Access Control (RBAC).
3. **Data Persistence**: Prisma ORM with relational integrity constraints and transaction boundaries.

## 3. API Contract & Data Model
\`\`\`typescript
interface InitiativePayload {
  id: string;
  key: string;
  status: 'ACTIVE' | 'ARCHIVED';
  updatedAt: string;
}
\`\`\`

## 4. Risk Analysis & Mitigation
- **Cache Invalidation**: Multi-level cache invalidation keyed by workspace and project IDs.
- **Concurrency**: Soft-delete markers with optimistic concurrency control.

## 5. Rollout & Verification Checklist
- [ ] Database migrations tested in staging environment
- [ ] Unit and integration test coverage above 85%
- [ ] Clean production Turbopack build verified
`,
  },
  {
    id: 'charter',
    title: 'Milestone Charter',
    subtitle: 'Sprint goals, core deliverables, dependencies, and timeline',
    icon: 'Target',
    content: `# Milestone Delivery Charter

## Executive Summary
Concise summary explaining what this initiative achieves and its business impact.

## Target Deliverables
- **Phase 1: Foundation**: API contracts, database schema, and security guards
- **Phase 2: User Experience**: Enterprise-grade components, layout-matched skeletons, and interactive state
- **Phase 3: Hardening**: Strict type safety, linting verification, and production build checks

## Technical Dependencies
- Workspace RBAC permission system
- Next.js 16 Turbopack development server

## Definition of Done (DoD)
- [ ] All Acceptance Criteria fulfilled
- [ ] 0 TypeScript compilation errors (\`tsc --noEmit\`)
- [ ] 0 ESLint warnings or errors
- [ ] Verified across light and dark color schemes
`,
  },
];

export function calculateBriefStats(content?: string | null) {
  if (!content || !content.trim()) {
    return { words: 0, minutes: 0 };
  }
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, minutes };
}
