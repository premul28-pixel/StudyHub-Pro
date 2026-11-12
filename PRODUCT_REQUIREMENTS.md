# StudyHub Pro — Product Requirements Document (PRD v0.2)
## Unified DSA Learning, Coding Practice & Placement Preparation Platform

**Document Version**: 0.2  
**Target Audience**: Second-Year B.E. Computer Science & Engineering Students & Tech Interview Aspirants  
**Architectural Inspiration**: DSAtlas functional model ([https://www.dsatlas.in/dashboard](https://www.dsatlas.in/dashboard))  
**Design Identity**: Original StudyHub Pro developer-centric interface (Clean iOS/macOS design principles, high-contrast typography, accessible, responsive)

---

## 1. Executive Summary & Vision

StudyHub Pro is an integrated learning platform engineered to help students transition from foundational programming to placement-ready software engineering. It bridges theory, interactive coding practice, automated solution evaluation, mistake retrospectives, competitive programming telemetry, and placement interview roadmaps into a single cohesive ecosystem.

### Core Pillars
1. **Curriculum & Knowledge**: Structured 21-topic DSA mastery track with theory, syntax guides, patterns, and prerequisite unlocking.
2. **Coding Practice Engine**: In-browser Monaco editor supporting Java, C, and Python, connected to an isolated test-case execution engine with real verdicts (Accepted, WA, TLE, MLE, CE, RE).
3. **Mistake Review Journal**: Automated logging of non-accepted attempts with categorisation (Syntax, Logic, Edge Cases, Complexity) and spaced retry workflows.
4. **Verified Telemetry & Analytics**: Seamless cross-platform synchronization (LeetCode, Codeforces, GitHub) combined with in-platform accuracy and streak analytics.
5. **Career & Placement Roadmap**: Company-specific question sheets, core CS subject revision (OS, DBMS, Networks, OOP, SQL), and AI-guided mock preparation.
6. **Zero-Trust Multi-User Security**: Total data isolation via Firebase Auth UID ownership rules.

---

## 2. Feature Comparison Matrix

| Capability / Module | DSAtlas (Observed Model) | Current StudyHub Pro | StudyHub Pro Target (PRD v0.2) |
|---|---|---|---|
| **DSA Curriculum** | Curated topic sheets & problem links | 21 Topics, 630 Problems (10E/10M/10H) with 30/30 unlocking | 21 Topics + Rich Concept Notes + Visuals + Practice Questions |
| **In-Browser Code Editor** | Dedicated coding arena with editor | External links only (LeetCode/CF) | Monaco Editor with Java, C, Python syntax & snippets |
| **Code Execution Engine** | Server-side test case evaluation | None | Isolated sandboxed runner (Judge0 / Piston architecture) |
| **Submission Verdicts** | AC, WA, TLE, CE, RE verdicts | External verification or manual toggle | Automated test-case comparison with execution metrics |
| **Mistake Review** | Dedicated mistake tracking system | None | Automated error capture + categorization + retry queue |
| **Platform Telemetry** | Platform handle tracking | Live Codeforces & LeetCode sync | Multi-platform sync (LeetCode, CF, CC, AtCoder, GFG, GitHub) |
| **Assessments** | Timed test sheets & quizzes | None | Timed MCQ + Coding assessments with auto-grading |
| **Competitive Programming**| Contests overview & ratings | Rating history & live solve telemetry | Contest calendar, upcoming alerts, performance graph |
| **Career & Placement** | Company-wise problem sets | Onboarding company preferences only | Company question sheets, Core CS revision (OS, DBMS, CN) |
| **Projects & Portfolio** | GitHub repository showcase | Static username link | GitHub API repository browser, language tags, portfolio |
| **AI Learning Assistant** | AI hints & code explanations | Multi-provider chat (OpenAI, Gemini, Anthropic) | Context-aware DSA hints, code debugger, complexity analyzer |
| **Account & Settings** | Profile & preference settings | Personal & college details, theme, keys | Complete 5-tab settings (Account, Connections, Privacy, Appearance, Data) |
| **Multi-User Security** | Standard user isolation | Strict Firestore security rules (`isOwner`) | Strict UID isolation + audit logs + server-side validation |

---

## 3. Product Module Specifications

### Module 1: Learning Dashboard
- **Objective**: Daily home screen displaying authentic learning statistics and recommended actions.
- **Components**:
  - Solved count breakdown (Total, Easy, Medium, Hard).
  - Active Curriculum Topic status and progress towards next unlock.
  - Today's verified solves (Platform-synced + in-app coding practice).
  - Focus study sprint timer & logged sessions.
  - Spaced repetition mistake review alert (pending review items).
  - Upcoming contest reminders and daily practice recommendations.
- **Data Integrity**: Every metric is calculated dynamically from authenticated Firestore records (`dsaProgress`, `studySessions`, `submissions`, `platformStats`). No placeholder statistics.

### Module 2: DSA Knowledge System
- **Objective**: Comprehensive, topic-by-topic learning environment.
- **Topics (21 Core Areas)**:
  1. Programming Fundamentals & Time/Space Complexity
  2. Arrays & Hashing
  3. Strings & Character Encodings
  4. Prefix Sum & Mathematical Subarrays
  5. Two Pointers Technique
  6. Sliding Window (Fixed & Dynamic)
  7. Binary Search & Search Space Reduction
  8. Sorting & Partitioning (Merge, Quick, Counting)
  9. Recursion & Divide-and-Conquer
  10. Backtracking (Permutations, Combinations, N-Queens)
  11. Linked Lists (Singly, Doubly, Fast & Slow Pointers)
  12. Stacks & Monotonic Stacks
  13. Queues, Deques & Monotonic Queues
  14. Trees & Binary Tree Traversals (BFS, DFS)
  15. Binary Search Trees & Balanced Trees
  16. Heaps & Priority Queues
  17. Graphs (BFS, DFS, Dijkstra, Bellman-Ford, Topo Sort)
  18. Greedy Algorithms & Intervals
  19. Dynamic Programming (1D, 2D, Knapsack, LCS, LIS)
  20. Tries & Prefix Trees
  21. Bit Manipulation & Bitmasks
- **Per-Topic Content**:
  - Theory overview & pattern recognition cues.
  - Complexity cheatsheet (Time & Auxiliary Space).
  - Standard template code in Java, Python, and C.
  - 30 Curated problems (10 Easy, 10 Medium, 10 Hard).
  - Topic completion badge awarded upon reaching 30/30 verified solves.

### Module 3: Coding Practice & Execution Engine
- **Objective**: Native in-browser problem-solving environment.
- **User Workflow**:
  1. Select problem from Curriculum or Practice Sheets.
  2. Read problem statement, examples, constraints, and hints.
  3. Select programming language (Java default, Python, C).
  4. Write solution in Monaco Editor with syntax highlighting, autocomplete, and indentation.
  5. Test with custom input or standard test cases via **"Run Code"**.
  6. Submit solution via **"Submit Solution"**.
  7. Engine dispatches code to isolated execution service.
  8. Return verdict:
     - `Accepted (AC)`: Execution passed all test cases within time and memory constraints.
     - `Wrong Answer (WA)`: Output differed from expected test case.
     - `Time Limit Exceeded (TLE)`: Process exceeded allotted runtime (e.g., 2.0s).
     - `Memory Limit Exceeded (MLE)`: Memory exceeded allocated boundary (e.g., 256MB).
     - `Compilation Error (CE)`: Compiler failed to produce bytecode/executable.
     - `Runtime Error (RE)`: Exception thrown during execution (NullPointerException, ArrayIndexOutOfBounds, ZeroDivision).
  9. On `Accepted`: Update Firestore `dsaProgress` and `submissions` uniquely; trigger dashboard telemetry.
  10. On `Failed`: Automatically dispatch error metadata to **Mistake Management** (Module 4).

### Module 4: Mistake Review Journal
- **Objective**: Systematic retrospective tool to turn failed attempts into learning opportunities.
- **Features**:
  - Automated logging of failed submissions (`WA`, `TLE`, `RE`, `MLE`).
  - Metadata captured: Problem ID, Title, Topic, Language, Failed Code, Verdict, Failed Input/Output.
  - Student Input Fields:
    - Root cause category: `Syntax`, `Logical Error`, `Edge Case Missed`, `Time Complexity`, `Memory Issue`, `Wrong Algorithm`.
    - Retrospective notes ("Why did I fail? What was the optimal observation?").
    - Correct approach summary.
  - Review Status: `Unreviewed`, `Under Review`, `Resolved / Re-solved`.
  - Spaced Retry Queue: Surfaces past mistakes after 3 days and 7 days to verify retention.

### Module 5: My Learning Workspace
- **Objective**: Centralized progress hub.
- **Features**:
  - Roadmaps progress view.
  - Personal Notes editor (Markdown support).
  - Question Bookmarks library.
  - Practice sheets tracker (e.g., Striver SDE Sheet, Blind 75, Love Babbar 450, Company Top 50).
  - Study sprint history & focus metrics.

### Module 6: Assessments System
- **Objective**: Formal timed tests with auto-grading.
- **Features**:
  - Assessment Types: Topic Quizzes (MCQ), Mid-Term Mock Tests, Placement Mock Coding Tests.
  - Timer enforcement with auto-submit on countdown expiry.
  - Question navigation palette (Answered, Flagged, Unvisited).
  - Scorecard generation with topic-wise breakdown, percentile ranking, and solution review.

### Module 7: Analytics & Performance Insights
- **Objective**: Deep data visualization of learner progress.
- **Visualizations**:
  - Daily/Weekly/Monthly Problem Solving Heatmap.
  - Difficulty Distribution (Easy / Medium / Hard).
  - Topic Strength Radar (identifying weak vs strong topics).
  - Accuracy & First-Attempt Success Rate.
  - Platform comparison (StudyHub Pro vs LeetCode vs Codeforces).

### Module 8: Competitive Programming Hub
- **Objective**: Track rated contests and upcoming schedules.
- **Features**:
  - Real-time Contest Calendar (fetching Codeforces, AtCoder, CodeChef, LeetCode schedules).
  - Add to Google Calendar / In-app reminder triggers.
  - User rating trajectory graphs.
  - Contest post-mortem notes.

### Module 9: Placement & Career Preparation
- **Objective**: End-to-end placement readiness toolkit.
- **Features**:
  - Company Roadmaps: Tier 1 Product (Google, Microsoft, Amazon), FinTech, Startups, Service-based giants.
  - Core CS Interview Hub:
    - Operating Systems (Processes, Threads, Deadlocks, Memory Management).
    - Database Management Systems (ACID, Normalization, SQL queries, Indexes).
    - Computer Networks (OSI layers, TCP/IP, HTTP/HTTPS, DNS, WebSockets).
    - Object-Oriented Programming (Polymorphism, Inheritance, Encapsulation, Design Patterns).
  - Behavioral & HR preparation questions.

### Module 10: Projects & GitHub Portfolio
- **Objective**: Developer showcase for resumes and peer reviews.
- **Features**:
  - GitHub integration to fetch public repositories, stars, languages, and commit telemetry.
  - Highlighted "Featured Projects" section with live demo URLs, screenshots, and tech tags.

### Module 11: Coding Profiles Hub
- **Objective**: Central command for all external coding handles.
- **Categories**: DSA Practice (LeetCode, GFG), Competitive (Codeforces, CodeChef, AtCoder), Development (GitHub).
- **Features**: Unified sync button, handle verification check, individual disconnect action.

### Module 12: AI Learning Assistant
- **Objective**: Socratic mentor embedded across problems and concept notes.
- **Behavior**:
  - Code debugging and hint generation (without immediately spoiling full solutions).
  - Time & Space complexity analysis.
  - Java, C, and Python code explanations.
- **Privacy**: Server-side proxy or user-managed keys with zero client key leakage.

### Module 13: User Account & Settings
- **Structure**:
  1. `My Account`: Name, Username, Email, College, Degree, City, State, Graduation Year, Profile Photo, Password.
  2. `Connections`: External handles and OAuth integrations.
  3. `Privacy & Visibility`: Public vs Private profile, leaderboard anonymity, email alerts.
  4. `Appearance`: Light, Dark, System theme, Accent colors, font size.
  5. `Account & Data`: GDPR-compliant JSON data export, account deletion with full cleanup.

### Module 14: Help Centre & Feedback
- **Features**: Searchable guides, FAQ, multi-category feedback submission (bug, feature, complaint), admin review board.

---

## 4. Non-Functional Requirements

1. **Security**: Zero cross-user data leakage. Strict Firestore security rules verified by automated test suites.
2. **Performance**: Page load under 1.5s; bundle size optimized via route lazy loading; PWA offline precaching.
3. **Execution Safety**: Isolated code execution with 2.0s CPU timeout and 256MB memory ceiling.
4. **Reliability**: No mock fallbacks disguised as live data; clear, honest error notices during API outages.
5. **Responsiveness**: Fluid layout across desktop (1440px+), laptop (1024px), tablet (768px), and mobile (375px+).

