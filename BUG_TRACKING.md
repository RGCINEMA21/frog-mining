# 🐸 Frog Mining — Bug Tracking

---

## Bug List

### BUG-001

| Field | Value |
|-------|-------|
| **ID** | BUG-001 |
| **Title** | Floating +1 text memory leak |
| **Severity** | Low |
| **Status** | Fixed |
| **Reporter** | Internal |
| **Date** | 2026-07-26 |
| **Description** | Floating +1 text elements not cleaned up after animation |
| **Steps to Reproduce** | 1. Tap frog rapidly 2. Observe memory usage |
| **Expected** | Elements removed after animation |
| **Actual** | Elements accumulate in DOM |
| **Fix** | Added setTimeout cleanup in HomeScreen.js |
| **Fixed In** | v0.2.0 |

### BUG-002

| Field | Value |
|-------|-------|
| **ID** | BUG-002 |
| **Title** | AudioContext not resuming |
| **Severity** | Low |
| **Status** | Fixed |
| **Reporter** | Internal |
| **Date** | 2026-07-26 |
| **Description** | Sound doesn't play after browser tab switch |
| **Steps to Reproduce** | 1. Play game 2. Switch to another tab 3. Return 4. Tap frog |
| **Expected** | Sound plays |
| **Actual** | No sound |
| **Fix** | Added user interaction listener to resume AudioContext |
| **Fixed In** | v0.2.0 |

### BUG-003

| Field | Value |
|-------|-------|
| **ID** | BUG-003 |
| **Title** | Leaderboard player position missing |
| **Severity** | Medium |
| **Status** | Fixed |
| **Reporter** | Internal |
| **Date** | 2026-07-26 |
| **Description** | Player position not shown when not in top 50 |
| **Steps to Reproduce** | 1. Play with low score 2. Open leaderboard |
| **Expected** | "Your position: #XX" shown |
| **Actual** | No position shown |
| **Fix** | Updated player position calculation in LeaderboardManager |
| **Fixed In** | v0.2.0 |

---

## Template for New Bugs

```markdown
### BUG-XXX

| Field | Value |
|-------|-------|
| **ID** | BUG-XXX |
| **Title** | [Brief description] |
| **Severity** | Critical/High/Medium/Low |
| **Status** | Open/In Progress/Fixed/Verified |
| **Reporter** | [Name/Email] |
| **Date** | YYYY-MM-DD |
| **Device** | [Device model + OS] |
| **Browser** | [Browser + version] |
| **Description** | [What happened] |
| **Steps to Reproduce** | 1. [Step 1] 2. [Step 2] 3. [Step 3] |
| **Expected** | [What should happen] |
| **Actual** | [What actually happened] |
| **Screenshot** | [If available] |
| **Fix** | [How it was fixed] |
| **Fixed In** | [Version] |
```

---

## Bug Statistics

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 0 | 0 | 0 |
| High | 0 | 0 | 0 |
| Medium | 1 | 1 | 0 |
| Low | 2 | 2 | 0 |
| **Total** | **3** | **3** | **0** |

---

## Bug Resolution Timeline

```
v0.2.0 (2026-07-26)
├── BUG-001: Fixed (Low)
├── BUG-002: Fixed (Low)
└── BUG-003: Fixed (Medium)

Status: All known bugs fixed ✅
```
