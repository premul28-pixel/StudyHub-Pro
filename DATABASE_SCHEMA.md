# StudyHub Pro — Database Schema Specification (Cloud Firestore)

**Document Version**: 0.2  
**Database**: Cloud Firestore (Native Mode, `asia-south1`)  
**Design Philosophy**: Strict multi-user normalization, subcollection data isolation, and read/write optimization.

---

## 1. Top-Level Hierarchy Overview

```
firestore/
├── problems/                      (Global: Curated & community DSA problems)
│   └── {problemId}
├── topics/                        (Global: 21 DSA topic definitions)
│   └── {topicId}
├── practiceSheets/                (Global: Curated sheets like SDE Sheet, Blind 75)
│   └── {sheetId}
├── contests/                      (Global: Scraped & scheduled contests)
│   └── {contestId}
├── assessments/                   (Global: Standardized assessment tests)
│   └── {assessmentId}
│
└── users/                         (User-Scoped: Root user document)
    └── {userId}/
        ├── topicProgress/         (User's completion state per topic)
        │   └── {topicId}
        ├── dsaProgress/           (Unique solved problems status)
        │   └── {problemId}
        ├── submissions/           (Full history of every code run & submit)
        │   └── {submissionId}
        ├── mistakes/              (Mistake notebook & failed submission journal)
        │   └── {mistakeId}
        ├── notes/                 (Personal and problem-linked notes)
        │   └── {noteId}
        ├── bookmarks/             (Bookmarked questions & resources)
        │   └── {bookmarkId}
        ├── studySessions/         (Focus timer sprints & study records)
        │   └── {sessionId}
        ├── assessments/           (User's completed assessment scorecards)
        │   └── {userAssessmentId}
        ├── platformStats/         (Verified platform telemetry per site)
        │   └── {platformId}       (leetcode, codeforces, codechef, atcoder, gfg)
        ├── projects/              (User's GitHub portfolio repositories)
        │   └── {projectId}
        ├── aiSettings/            (User's encrypted / isolated API keys)
        │   └── {providerId}
        └── feedback/              (User's bug reports & feature requests)
            └── {feedbackId}
```

---

## 2. Collection Schemas

### 2.1 `users/{userId}` (Root User Document)
```typescript
interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  
  // Profile & College Details
  collegeDetails: {
    collegeName: string;
    college: string;
    city: string;
    state: string;
    district?: string;
    pinCode?: string;
    graduationYear: string;
    degree?: string;
    department?: string;
  };
  
  // Platform Handles
  codingProfiles?: {
    leetcode?: string;
    codeforces?: string;
    codechef?: string;
    atcoder?: string;
    gfg?: string;
    github?: string;
  };
  
  // Career Preferences
  careerPreferences?: {
    targetCompanies: string[];
    primaryLanguage: 'Java' | 'Python' | 'C++' | 'C';
    skillLevel: 'Beginner' | 'Intermediate' | 'Pro';
  };
  
  // Settings & Flags
  onboardingComplete: boolean;
  hasCompletedOnboarding: boolean;
  currentOnboardingStep: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 2.2 `users/{userId}/dsaProgress/{problemId}`
Records the verified solved state for each problem.
```typescript
interface DsaProgressDocument {
  id: string; // matches problemId
  title: string;
  topicId: string;
  topicName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'StudyHub' | 'LeetCode' | 'Codeforces' | 'GeeksforGeeks';
  url: string;
  status: 'solved' | 'attempted' | 'bookmarked';
  solvedAt?: string; // ISO 8601
  firstSolvedLanguage?: string;
  attemptsCount: number;
  date: string; // YYYY-MM-DD
  updatedAt: string;
}
```

### 2.3 `users/{userId}/submissions/{submissionId}`
Complete log of every code run and evaluation.
```typescript
interface SubmissionDocument {
  id: string;
  problemId: string;
  problemTitle: string;
  topicId: string;
  language: 'java' | 'python' | 'c';
  languageId: number; // e.g. 62, 71, 50
  sourceCode: string;
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Compilation Error' | 'Runtime Error' | 'Internal Error';
  executionTimeMs?: number;
  memoryKb?: number;
  testCasesPassed: number;
  totalTestCases: number;
  compileOutput?: string;
  errorMessage?: string;
  createdAt: string; // ISO 8601
  date: string; // YYYY-MM-DD
}
```

### 2.4 `users/{userId}/mistakes/{mistakeId}`
Dedicated mistake review notebook entry.
```typescript
interface MistakeDocument {
  id: string;
  problemId: string;
  problemTitle: string;
  topicId: string;
  topicName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  submissionId: string;
  failedCode: string;
  verdict: 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  category: 'Syntax' | 'Logical Error' | 'Edge Case' | 'Time Complexity' | 'Memory Issue' | 'Wrong Algorithm' | 'Uncategorized';
  userNotes?: string;
  correctApproach?: string;
  reviewStatus: 'unreviewed' | 'under_review' | 'resolved';
  reviewCount: number;
  nextReviewDate: string; // YYYY-MM-DD for spaced repetition
  createdAt: string;
  updatedAt: string;
}
```

### 2.5 `users/{userId}/topicProgress/{topicId}`
Tracks sequential unlocking and progress across the 21 topics.
```typescript
interface TopicProgressDocument {
  topicId: string; // e.g. 'topic-1'
  order: number; // 1 to 21
  name: string;
  solvedCount: number;
  totalCount: number; // 30
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  isLocked: boolean;
  isCompleted: boolean;
  unlockedAt?: string;
  completedAt?: string;
  updatedAt: string;
}
```

### 2.6 `users/{userId}/notes/{noteId}`
Personal learning notes linked to topics or individual problems.
```typescript
interface NoteDocument {
  id: string;
  title: string;
  content: string; // Markdown
  topicId?: string;
  problemId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 2.7 `users/{userId}/assessments/{userAssessmentId}`
Scores and responses for timed tests.
```typescript
interface UserAssessmentDocument {
  id: string;
  assessmentId: string;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctAnswersCount: number;
  answers: {
    questionId: string;
    selectedOption?: number;
    codeSubmissionId?: string;
    isCorrect: boolean;
    marksAwarded: number;
  }[];
  completedAt: string;
}
```

### 2.8 `problems/{problemId}` (Global Problems Collection)
Standardized problem definitions used by practice engine.
```typescript
interface ProblemDocument {
  id: string;
  title: string;
  slug: string;
  topicId: string;
  topicName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleTestCases: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  hiddenTestCases: {
    input: string;
    output: string;
  }[];
  starterTemplates: {
    java: string;
    python: string;
    c: string;
  };
  timeLimitMs: number; // default 2000
  memoryLimitMb: number; // default 256
  companyTags: string[];
  order: number;
}
```

---

## 3. Firestore Security Enforcement Rules

All private data must require `isOwner(userId)`.
Global collections (`problems`, `topics`, `practiceSheets`, `contests`, `assessments`) permit authenticated read access (`isAuthenticated()`), but restrict write access to admin/system operations.

