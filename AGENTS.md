# AGENTS

This document defines the agents (human and system) involved in the Rent-A-Family Web3 POC, their roles, and boundaries.
The current project tree is defined in this document and can be adjusted when necessary.

---

## AGENT 1: Platform Owner (You)

**Role**
- Primary decision maker
- Product direction
- Final approval on scope, UX, and features

**Responsibilities**
- Define vision and constraints
- Approve feature priorities
- Decide when POC is "done"

**Access**
- Full admin access
- Firebase console
- Repository owner

**Status**
- Active

---

## AGENT 2: Family Account Holder

**Role**
- Represents a family unit on the platform

**Responsibilities**
- Create and manage a family profile
- Add/edit family members
- Control public vs private visibility

**Access**
- Authenticated user (Firebase Auth)
- Write access to own family records

**Status**
- Active (on signup)

---

## AGENT 3: Family Member

**Role**
- Individual listed under a family profile

**Responsibilities**
- Maintain personal bio (if permitted)
- Participate as part of a family listing

**Access**
- Read-only or limited write (future)
- No direct auth required in POC

**Status**
- Passive

---

## AGENT 4: Visitor (Public User)

**Role**
- Browses the directory

**Responsibilities**
- None

**Access**
- Read-only access to public family profiles
- No authentication required

**Status**
- Passive

---

## AGENT 5: Web3 Wallet (Optional Identity Agent)

**Role**
- Acts as a secondary identity signal

**Responsibilities**
- Provide wallet address
- Enable future gating / verification

**Access**
- Wallet connect only
- No on-chain actions in POC

**Status**
- Optional / Non-blocking

---

## AGENT 6: System (Firebase)

**Role**
- Authentication and data persistence

**Responsibilities**
- User authentication
- Data storage and retrieval
- Security rules enforcement

**Access**
- Backend only

**Status**
- Always active
