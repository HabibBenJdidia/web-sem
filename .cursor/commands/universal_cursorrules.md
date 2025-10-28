
# Purpose: Global development rules to guide Cursor AI in any project

## 🎯 General Objectives
- Always write **clean, modular, and maintainable** code.
- Follow **industry best practices** (naming conventions, security, scalability).
- Adapt explanations and code style to the project’s **main tech stack**.
- Before generating code, **analyze the existing files** to ensure consistency.
- ⚠️ Do **not automatically create or rewrite** a `README.md` file unless it is missing or explicitly requested by the user.
- Avoid unnecessary comments or over-engineering.

---

## 🏗️ Code Generation Rules
1. When generating new files:
   - Use the existing **project structure and naming style**.
   - Include import/export paths consistent with current architecture.
   - Add short, meaningful docstrings or comments when helpful.

2. When editing files:
   - Keep the **original logic and indentation** intact.
   - Do not rewrite unrelated sections.
   - Suggest improvements only if they **increase readability or performance**.

3. When creating API endpoints:
   - Validate inputs.
   - Handle errors gracefully.
   - Return consistent JSON responses.
   - Log meaningful events.

---

## 🧠 Project Understanding
- Before coding, scan all files for:
  - Project structure (`src`, `backend`, `frontend`, etc.)
  - Framework or library in use (Flask, Express, React, Spring, etc.)
  - Configuration or environment files.
- Maintain architectural patterns already present (e.g., MVC, service layer, monorepo).

---

## 🧩 Testing & Quality
- Always add or update **unit tests** when modifying logic.
- Prefer **pytest** for Python, **Jest** for JS/TS, **JUnit** for Java.
- Keep test names descriptive (`should_do_something_when_condition`).
- Ensure all tests are idempotent and fast.

---

## 🧰 Style & Formatting
- Use the project’s configured **formatter/linter** (e.g., Black, ESLint, Prettier).
- Follow standard naming:
  - Variables/functions → `snake_case` (Python), `camelCase` (JS), `PascalCase` (classes).
- Use environment variables for secrets, never hardcode credentials.


## 🔒 Security
- Sanitize all external inputs.
- Follow secure defaults (HTTPS, prepared statements, JWT expiration, CSRF protection).

---

## 💬 Collaboration
- Write code that others can read and maintain.
- Leave TODOs or FIXMEs only with clear context.
- Commit messages should be **imperative and concise**:
  - Example: `fix: correct API response structure` or `feat: add login endpoint`.

---

## 🚀 Deployment Readiness
- Ensure configs support **multiple environments** (dev, stg, prod).
- Avoid local paths or hardcoded ports.
- Validate that logs and environment variables are correctly used.

---
- ⚠️ Do **not automatically create or rewrite** a `README.md` file unless it is missing or explicitly requested by the user.
- Avoid unnecessary comments or over-engineering.- ⚠️ Do **not automatically create or rewrite** a `README.md` file unless it is missing or explicitly requested by the user.
- Avoid unnecessary comments or over-engineering.- ⚠️ Do **not automatically create or rewrite** a `README.md` file unless it is missing or explicitly requested by the user.
- Avoid unnecessary comments or over-engineering.


_End of universal rules._
