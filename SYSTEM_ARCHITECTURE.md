# StudyHub Pro — System Architecture Specification
## Scalable, Multi-User Full-Stack Architecture for DSA Learning & Code Execution

**Document Version**: 0.2  
**Target Environment**: Production Web (Firebase Hosting + Cloud Firestore + Serverless Execution)  
**Security Model**: Zero-Trust User Isolation via Firebase Authentication UIDs

---

## 1. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT BROWSER                                   |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  |  React 19 + Vite   |  | Monaco Code Editor |  |  Tailwind CSS + Framer UI   |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | State / Context:   |  | Services:          |  | Real-Time Firestore Sync:   |  |
|  | - AuthContext      |  | - dsaService       |  | - onSnapshot listeners      |  |
|  | - ThemeContext     |  | - codeExecution    |  | - User-scoped caching       |  |
|  | - ToastContext     |  | - platformSync     |  | - Offline PWA Cache         |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / WSS
                                           v
+------------------------------------------+----------------------------------------+
|                            BACKEND & CLOUD PLATFORM                               |
|                                                                                   |
|  +----------------------------+             +----------------------------------+  |
|  |    Firebase Authentication |             |         Cloud Firestore          |  |
|  | - Email / Password         |             | - Strict Security Rules (isOwner)|  |
|  | - JWT verification         |             | - Asia-South1 Multi-Region       |  |
|  +----------------------------+             +----------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                       Firebase Cloud Functions v2                           |  |
|  | - Code Execution Proxy & Dispatcher (Judge0 / Sandboxed Worker)             |  |
|  | - Platform Sync Engine (Codeforces, LeetCode, GitHub API)                   |  |
|  | - Scheduled Cron Tasks (Contest Scraper, Daily Streak Audit)                |  |
|  | - AI Assistant Gateway (Anthropic, OpenAI, Gemini proxy)                    |  |
|  +---------------------------------------+-------------------------------------+  |
+------------------------------------------|----------------------------------------+
                                           |
                                           v
+------------------------------------------+----------------------------------------+
|                       EXTERNAL ISOLATED SERVICES                                  |
|                                                                                   |
|  +----------------------------+  +-------------------+  +----------------------+  |
|  |   Sandboxed Code Runner    |  |    Platform APIs  |  |     AI Providers     |  |
|  | - Judge0 CE / Piston       |  | - Codeforces REST |  | - Anthropic Claude   |  |
|  | - Java 17, Python 3, C11   |  | - GitHub REST v3  |  | - OpenAI GPT-4o-mini |  |
|  | - 2.0s CPU / 256MB Cap     |  | - LeetCode Public |  | - Google Gemini      |  |
|  +----------------------------+  +-------------------+  +----------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Frontend Layer Architecture

- **Core Framework**: React 19 with TypeScript 5/7 and Vite 8 for fast sub-second HMR and tree-shaken production bundles.
- **Routing**: `react-router-dom` v7 with route-level code splitting using `React.lazy()` and `Suspense` with an iOS-style shimmer fallback.
- **Styling & Design System**: Tailwind CSS with custom iOS design tokens (`rounded-ios`, `shadow-ios-card`, `bg-ios-surface`, `text-ios-blue`), and dark/light dynamic theme tokens.
- **Code Editor Integration**:
  - `@monaco-editor/react` embedded for in-browser programming.
  - Automatic language configuration: Java (`java`), Python (`python`), C (`c`).
  - Pre-loaded solution templates with class/method stubs and standard I/O boilerplate.
  - Auto-closing brackets, code folding, mini-map, line numbers, and dark/light synchronization.
- **State & Data Caching**:
  - `AuthContext`: Manages authenticated session, user profile, and onboarding completion state.
  - User-scoped local storage: Scoped keys (`${uid}_${key}`) prevent data contamination when logging out or switching accounts.
  - Real-time listeners: Firestore `onSnapshot` ensures instantaneous reactive updates across tabs and views without manual polling.

---

## 3. Code Execution & Testing Architecture

### 3.1 Security Principles
1. **Never run user code in the frontend process**: Browsers cannot safely execute arbitrary Java, C, or Python code.
2. **Never run user code directly on the application server**: Untrusted code must execute within an ephemeral, resource-constrained sandbox.
3. **Strict Resource Caps**:
   - Maximum Execution Time: 2000ms (2.0s) CPU time.
   - Maximum Wall-Clock Time: 5000ms.
   - Maximum Memory Limit: 256 MB.
   - Maximum Output Size: 10 KB.
   - Zero outbound network access from sandbox containers.

### 3.2 Execution Workflow
```
[User writes solution]
          │
          ▼
[Clicks "Run Code" / "Submit Solution"]
          │
          ▼
[Client packages payload: { problemId, languageId, sourceCode, customInput }]
          │
          ▼
[Cloud Function or Execution Proxy /api/execute]
          │  ── Validates authentication token (request.auth.uid)
          │  ── Validates source code length (< 64KB)
          │  ── Dispatches job to isolated sandbox (Judge0 / Piston)
          ▼
[Sandbox executes code against test case stdin]
          │
          ▼
[Captures stdout, stderr, compile_output, status_id, time, memory]
          │
          ▼
[Server compares stdout with expected test case output]
          │
          ├── If stdout == expected: Verdict = ACCEPTED (AC)
          ├── If stdout != expected: Verdict = WRONG_ANSWER (WA)
          ├── If status == 5: Verdict = TIME_LIMIT_EXCEEDED (TLE)
          ├── If status == 6: Verdict = COMPILATION_ERROR (CE)
          └── If status >= 7: Verdict = RUNTIME_ERROR (RE)
          │
          ▼
[Persists to Firestore: users/{uid}/submissions/{subId}]
[If WA/TLE/RE: triggers users/{uid}/mistakes/{mistakeId}]
[If AC and unique: triggers users/{uid}/dsaProgress/{problemId}]
          │
          ▼
[Returns sanitized verdict + execution telemetry to client]
```

### 3.3 Language Identifiers (Judge0 Standard)
- **Java**: Language ID `62` (OpenJDK 13/17)
- **Python**: Language ID `71` (Python 3.8+)
- **C**: Language ID `50` (GCC 9.2+)

---

## 4. Multi-Platform Telemetry Architecture

1. **Codeforces**:
   - Endpoint: `https://codeforces.com/api/user.info` and `user.status?handle={handle}&count=100`.
   - Parses official verified ratings, contest rank, and matching accepted submissions for automated curriculum completion.
2. **LeetCode**:
   - Endpoint: Official GraphQL proxy / verified public scraper.
   - Parses total solved, easy/medium/hard breakdown, global ranking, and submission calendar.
3. **GitHub**:
   - Endpoint: `https://api.github.com/users/{username}/repos`.
   - Extracts top public repositories, primary languages, star counts, and last updated timestamps.
4. **Rate Limiting & Safety**:
   - Client and server throttle manual sync triggers to a minimum of 60 seconds.
   - Cached telemetry avoids redundant network roundtrips.

---

## 5. Security & Authorization Architecture

- **Firestore Rules**: Strict path-based ownership validation:
  ```javascript
  function isAuthenticated() { return request.auth != null && request.auth.uid != null; }
  function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
  ```
- **Secrets Management**: Third-party API keys (OpenAI, Anthropic, Gemini, Judge0) remain stored in Cloud Functions environment secrets (`defineSecret`) or in user-isolated Firestore collections (`users/{userId}/aiSettings`).
- **Input Sanitization**: All form inputs, user notes, and code submissions are validated against schema boundaries, preventing NoSQL injection and script payload injection.

