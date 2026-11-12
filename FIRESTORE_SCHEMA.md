# StudyHub Pro — Firestore Schema & Cloud Functions Architecture

## 1. Firestore Data Hierarchy

```
users/
└── {userId}/
    ├── (fields: email, displayName, username, profileLinks, preferences, createdAt)
    │
    ├── platformStats/
    │   ├── leetcode/
    │   │   ├── handle: string
    │   │   ├── totalSolved: number
    │   │   ├── easySolved: number
    │   │   ├── mediumSolved: number
    │   │   ├── hardSolved: number
    │   │   ├── acceptanceRate: number
    │   │   ├── ranking: number
    │   │   └── updatedAt: timestamp
    │   │
    │   ├── codeforces/
    │   │   ├── handle: string
    │   │   ├── rating: number
    │   │   ├── maxRating: number
    │   │   ├── rank: string
    │   │   └── updatedAt: timestamp
    │   │
    │   ├── codechef/
    │   ├── atcoder/
    │   └── gfg/
    │
    ├── dailyActivities/
    │   └── {YYYY-MM-DD}/
    │       ├── date: string
    │       ├── problemsSolved: array<DsaProblemItem>
    │       ├── tasks: array<GoalTaskItem>
    │       ├── transactions: array<TransactionItem>
    │       └── notes: string
    │
    ├── finance/
    └── studyProgress/
```

---

## 2. Cloud Functions Architecture

- **Callable Function (`syncUserPlatforms`):** Triggered when the user clicks **"Sync Now"** on the Study Tracker or upon dashboard load. Validates authentication and applies an in-memory 60-second rate limiter before querying platform APIs.
- **Scheduled Cron Function (`scheduledPlatformSync`):** Configured with PubSub cron expression `every 6 hours`. Automatically updates statistics for all active scholars in batch chunks.
- **Error Handling & Privacy:** Profiles marked private or invalid gracefully report clean error notices without throwing unhandled exceptions.

---

## 3. Firestore Security Rules

The strict production security rules are located in [firestore.rules](file:///d:/Project/StudyHub%20Pro/firestore.rules).

### Summary of Safeguards:
1. **Default Deny All:** `match /{document=**} { allow read, write: if false; }` ensures zero public or unauthorized access across the database.
2. **User Isolation:** `users/{userId}` requires `request.auth.uid == userId`. No user can read, create, update, or delete another scholar's records.
3. **Profile & Onboarding Validation:** Enforces non-empty string fields for `name`/`displayName`, `email`, and `college`/`collegeName` on user profile creation.
4. **Finance Data Protection:** `users/{userId}/transactions/{transactionId}` restricts reads, inserts, and deletes exclusively to the owning user with type and schema validation.
5. **Study & DSA Stats Protection:** `users/{userId}/platformStats/{platform}` allows read and write exclusively for the verified owner.
6. **AI API Key Privacy:** `users/{userId}/aiSettings/{settingId}` and `users/{userId}/aiKeys/{keyId}` ensure third-party API keys (OpenAI, Gemini, Anthropic) are isolated and readable only by the owner.

### Deployment:
Deploy rules to production via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

