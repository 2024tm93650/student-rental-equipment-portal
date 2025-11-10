# Good vs Bad Prompts — Guide & Examples

This file documents effective (good) and ineffective (bad) prompts you can use when working with an AI assistant to build, maintain, or enhance the Student Rental Equipment Portal application. It includes principles, templates, an evaluation rubric, 25 good prompt examples tailored to typical webapp tasks, and 20 bad prompt examples showing anti-patterns.

> Note: These prompts are generic enough to apply to many projects but include examples targeted to a student rental equipment portal (full-stack web app with React client and Node/Express server).

## Why this matters
Good prompts save time, reduce ambiguity, and produce code/instructions that integrate cleanly with your repo. Bad prompts produce unclear, incomplete, or incorrect outputs that require extra rounds of correction.

## Quick contract (what a good prompt should define)
- Inputs: files or repo area to change, data shapes, example input data.
- Outputs: file names, function signatures, test expectations, CLI commands, or documentation to produce.
- Constraints: language, frameworks, style, performance, security, licensing.
- Success criteria: build/test pass, lint rules, minimal manual edits.

## Principles of a good prompt
- Give concise but sufficient context: repo type, frameworks, and where to apply changes.
- Specify the exact output format (file path, code block, or tests to add).
- Provide examples of inputs and expected outputs where relevant.
- Set constraints (e.g., "no new dependencies", "use TypeScript", "follow repo ESLint rules").
- Ask for tests or validation steps and include how you'll verify them locally.
- When iterating, reference existing file paths or code snippets.

## Anti-patterns / Bad prompt traits
- Vague: "Make it better" without specifying what "better" means.
- Over-broad: Asking to "rewrite the app" with no constraints or scope.
- Missing context: Not providing repo language, framework, or file paths.
- Conflicting instructions: e.g., "use no dependencies" + "use a specific library".
- Asking for copyrighted text verbatim.

---

## Good prompt templates (use and adapt)
1) Feature implementation template
"In this repository (Node/Express backend in `server/` and React client in `client/`), add [feature name]. Implement server route(s) at `server/routes/...`, controller in `server/controllers/...`, and client UI in `client/src/pages/...`. Use existing code style and no new dependencies. Provide the exact files changed and include unit tests (Jest) for the server route. Explain how to run tests locally." 

2) Bugfix template
"Project: student-rental-equipment-portal. There's a bug where [short description]. Reproduce steps: [steps]. Inspect `server/controllers/requestController.js` and `client/src/pages/Request.tsx`. Propose a fix, modify files, and add a unit test reproducing the bug and confirming the fix." 

3) Refactor + tests template
"Refactor `server/models/Request.js` to ES6 class-style and add Jest tests covering validation & serialization. Keep API unchanged. Show diffs and run `npm test` output." 

4) Small PR template
"Create a small PR that implements [feature]. Include a concise commit message, updated `README.md` with new instructions, and tests that pass. Limit changes to under N files." 

---

## Good prompt examples (25) — explicit, actionable
1. "In `server/controllers/equipmentController.js`, add a new route `GET /api/equipment/stats` that returns counts by category and availability. Add route in `server/routes/equipment.js`, update controller, and add unit tests (Jest) asserting JSON shape `{ category: string, total: number, available: number }[]`. No new dependencies." 

2. "Implement server-side pagination for `GET /api/equipment` with query params `page` and `limit`. Update `server/controllers/equipmentController.js`, and the client `client/src/pages/EquipmentList.tsx` to request pages and render controls. Provide code changes and an integration test that simulates two pages." 

3. "Add authentication to the client using the existing `client/context/AuthContext.tsx` so that the `Navbar` shows user name after login. Use current API endpoints in `server/routes/auth.js`. Show component changes and a small unit test for `AuthContext` behavior." 

4. "Create a `POST /api/requests` server route that validates input using the project's existing validation middleware. Update `server/controllers/requestController.js`, add a test for missing required fields, and ensure the response codes follow HTTP conventions (400 on validation error)." 

5. "Write a seed script `scripts/seedMongoDB.js` to populate 100 equipment docs (random categories and availability). Use the project's existing Mongoose models and include an option to run with `node scripts/seedMongoDB.js --dry-run` that prints counts instead of writing." 

6. "Add CORS configuration to `server/index.js` to allow requests from `http://localhost:3000` only in development. Show exact lines changed and the reasoning." 

7. "Implement file upload for equipment images: update `client/src/pages/AddEquipment.tsx` to provide an image input, and `server/routes/equipment.js` to accept multipart/form-data and store files in `server/uploads/`. Keep it minimal (no cloud storage) and add server-side validation for image type/size." 

8. "Create an end-to-end test with Cypress for the request flow: register user, login, place a request, and verify it appears in `MyRequests`. Add the test under `client/cypress/integration/request_flow.spec.js`. Keep test selectors stable by adding data-testid attributes to relevant components." 

9. "Refactor `client/src/components/PrivateRoute.tsx` to support role-based access (e.g., admin only). Update `client/src/pages/UserManagement.tsx` to require admin role. Provide unit tests for `PrivateRoute` behavior." 

10. "Add rate limiting middleware to the server at `server/middleware/rateLimit.js` to limit POSTs to `/api/auth/login` to 5 per minute per IP. Use no external packages (implement basic in-memory) and include notes about production limitations." 

11. "Add a comprehensive API documentation section in `API_DOCUMENTATION.md` for the Requests endpoints including sample requests/responses and error codes." 

12. "Improve performance of equipment list: implement server-side filtering by category and text search, and add an index suggestion for MongoDB. Show query code and recommended index operations." 

13. "Implement a graceful shutdown handler in `server/index.js` that closes MongoDB connections and HTTP server on SIGINT/SIGTERM. Provide a small test script demonstrating behavior." 

14. "Write Jest unit tests for `server/models/Equipment.js` covering validation and helper methods. Add `npm test` output demonstrating tests pass." 

15. "Add ESLint configuration for the client if missing; fix 10 of the most common lint issues in `client/src/` and explain any rules you changed." 

16. "Implement a 'request approval' flow: add `PUT /api/requests/:id/approve` that only admins can call. Update `server/middleware/auth.js` or create `authorize.js`. Update UI `RequestManagement.tsx` to show approve button for admins." 

17. "Create a small Dockerfile for the server folder that builds and runs the app. Keep it multi-stage if needed and explain how to run locally. Avoid adding secrets." 

18. "Add input sanitization to prevent NoSQL injection on server query params in `server/controllers/equipmentController.js` and add tests showing sanitized inputs are safe." 

19. "Create scripts in `package.json` to run server and client concurrently for development (e.g., `npm run dev`). Show the exact script entries and any required environment variables." 

20. "Add a health-check endpoint `GET /api/health` that responds with `{ status: 'ok', uptime: <seconds>, db: 'connected' }`. Add a small smoke test script that calls it and logs result." 

21. "Implement search with debouncing on the client `EquipmentList` component to reduce requests; include a small unit test for the debounce helper." 

22. "Write a migration script that adds a new boolean field `isArchived` to `Equipment` documents and sets it to `false` for all existing documents. Place it in `scripts/migrate_add_isArchived.js` and ensure it can be run safely." 

23. "Add proper HTTP error handling middleware to `server/middleware/errorHandler.js` and ensure all controllers call next(err) on unexpected errors. Update one controller to demonstrate integration and add tests asserting 500 responses are handled." 

24. "Create sample Postman collection for all API endpoints and include it under `docs/postman_collection.json` with environment variables for `baseUrl` and `authToken`." 

25. "Add analytics event hooks in `client/src/pages/Request.tsx` that call a small `analytics.track(eventName, payload)` function. Implement a noop analytics implementation controlled by env var `REACT_APP_ANALYTICS_ENABLED`." 

---

## Bad prompt examples (20) — vague or problematic (do not use as-is)
1. "Make the app better." (No scope, no constraints.)
2. "Rewrite the server to use a different framework." (Too broad; missing migration plan.)
3. "Add tests everywhere." (Unclear which tests, which framework, and priority.)
4. "Fix the bug in requests." (No reproduction steps or file references.)
5. "Make the UI pretty." (Subjective; no design system or constraints.)
6. "Add security." (Too vague; what threats? Which part?)
7. "Make it faster." (No metrics or targets.)
8. "Add signup with Google" (No OAuth client IDs, scopes, or flow described.)
9. "Change all var to let/const." (Might be fine, but scope unclear and risky.)
10. "Add pagination." (No API or UI integration details.)
11. "Use SQL instead of MongoDB." (Huge migration; no justification or plan.)
12. "Implement role-based auth — do it however you want." (No policy or roles defined.)
13. "Generate documentation." (No format or target audience; could be incomplete.)
14. "Remove all console.logs." (Harmless but noisy; could lose important debug logs.)
15. "Add logging and monitoring." (Which platform? What retention? What events?)
16. "Refactor controllers." (Undefined scope; might break behavior.)
17. "Make it mobile friendly." (Needs breakpoints, UX, scope.)
18. "Add tests for everything quickly." (Unrealistic time/effort expectations.)
19. "Optimize database." (No workload or query samples provided.)
20. "Add some features users want." (Who are the users? Which features?)

These bad prompts either lack scope, are ambiguous, or request large changes without constraints. They often lead to wasted iterations.

---

## Prompt evaluation rubric (quick)
- 5/5 — Actionable: includes repo area, files or routes, constraints, and test/verification steps.
- 3/5 — Partial: mentions a goal and area but omits tests or constraints.
- 1/5 — Unusable: vague, conflicting, or impossible-without-more-info.

## Checklist to include in a good prompt
- [ ] Repo path/area to modify (e.g., `server/controllers/...`).
- [ ] Desired files & exact routes or components to change.
- [ ] Input/output examples (request/response, props/state shapes).
- [ ] Constraints (no new deps, language, style, security).
- [ ] Tests to add and how to run them.
- [ ] Success criteria (build passes, tests green, linting rules satisfied).

## How to use this guide
- Start with a brief context sentence: repo language, frameworks, and the feature/bug.
- Use one of the templates above and adapt specifics.
- When in doubt, provide an example payload and desired result.
- For iterative work, reference exact file paths and commit partial diffs if you have them.

---

## Example follow-up prompt (after a first iteration)
"Thanks — the server route looks good. Please also add pagination to the `GET /api/equipment` route (query params `page` and `limit`) and update `client/src/pages/EquipmentList.tsx` to support a 'Load more' UI. Keep page size default 20. Add unit tests for the server pagination logic."

---

## Closing notes
Use this file as a living document. As you learn what prompts yield the best results for this project, add them to this file with the actual results (what the assistant returned) and a short note on whether the output required follow-up. That will help future iterations be faster and higher quality.

---

*Generated: good/bad prompt guide for the Student Rental Equipment Portal.*
