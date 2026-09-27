# Backend Clarification & Feature Request: Project Brief Specifications

**Date:** 2026-09-27  
**Status:** Open  
**Impact Area:** Module 04 (Projects) / Brief Document & Viewer

---

## 1. Context

The frontend team is upgrading the **Project Brief & PRD Editor** to a headless rich-text (Tiptap / ProseMirror) engine and GFM Markdown renderer with live checklists, tables, and code highlighting.

---

## 2. Status of Clarifications

### 2.1 Max Brief Length: Resolved
- **Finding:** Verified directly in `src/module/project/dto/create-project.dto.ts` and `update-project.dto.ts`.
- **Resolution:** No artificial length restriction exists on the backend. The frontend will render live word count and estimated reading time without blocking users.

### 2.2 Stale-Write Protection (Optimistic Concurrency Control): Open Request
- **Current Behavior:** `PATCH /workspaces/:workspaceId/projects/:projectId` overwrites `brief` unconditionally.
- **Future Need (Phase D):** If team members toggle checklist items directly in the read-only overview viewer, or if two leads edit the project brief concurrently, unconditional overwrite may cause lost edits.
- **Proposed Enhancement:** Support an optional `If-Match` header or an optional `version` / `expectedUpdatedAt` in the PATCH payload:
  ```json
  {
    "brief": "Updated markdown...",
    "expectedUpdatedAt": "2026-09-27T10:00:00.000Z"
  }
  ```
  If the project has been updated since `expectedUpdatedAt`, return `409 Conflict` so the frontend can prompt the user to merge or review incoming changes.
