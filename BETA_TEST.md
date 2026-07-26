# 🐸 Frog Mining — Closed Beta Test Plan

---

## 1. Overview

| Field | Value |
|-------|-------|
| **Version** | v0.2.0 |
| **Type** | Closed Beta |
| **Start Date** | TBD |
| **Duration** | 7–14 days |
| **Testers** | 10–20 (Phase 1) → 50 (Phase 2) → 100 (Phase 3) |
| **Platform** | Mobile Browser (Android/iOS) |

---

## 2. Beta Goals

### Primary Goals

| Goal | Measurement |
|------|-------------|
| Game is easy to understand | > 90% understand within 5 seconds |
| UI is comfortable | Rating > 4/5 |
| Tap is responsive | No lag complaints |
| Auto Mining works correctly | 0 data loss incidents |
| Leaderboard is clear | > 80% understand ranking |
| Mail claim is easy | > 90% success rate |
| Account is stable | 0 account loss incidents |

### Secondary Goals

| Goal | Measurement |
|------|-------------|
| Performance is smooth | 60fps on mid-range devices |
| No crashes | 0 crash reports |
| Sound is enjoyable | Rating > 3.5/5 |
| Animations are smooth | No stuttering reports |

---

## 3. Test Phases

### Phase 1: Internal (10–20 testers)

```
Duration: 3–5 days
Focus: Core functionality, critical bugs
Gate: No Critical bugs before Phase 2
```

### Phase 2: Extended (50 testers)

```
Duration: 5–7 days
Focus: UX, performance, edge cases
Gate: No High bugs before Phase 3
```

### Phase 3: Pre-Release (100 testers)

```
Duration: 5–7 days
Focus: Stability, final polish
Gate: Ready for production
```

---

## 4. Tester Instructions

### Getting Started

```
1. Open the beta URL on your mobile browser
2. Enter a username (3-20 characters, letters/numbers only)
3. Tap "Mulai Bermain"
4. Start tapping the frog!
5. Play for at least 10 minutes
6. Fill out the feedback form
```

### What to Test

| Feature | How to Test |
|---------|-------------|
| **Tap** | Tap the frog rapidly, slowly, and normally |
| **Score** | Verify score increases correctly |
| **Auto Mining** | If you have diamonds, try activating |
| **Leaderboard** | Check your ranking, switch tabs |
| **Mail** | Look for reward mails, try claiming |
| **Profile** | Check your stats are correct |
| **Settings** | Try sound toggle, logout |
| **Refresh** | Refresh page, verify data persists |
| **Multi-tab** | Open in two tabs, check behavior |

---

## 5. Data Collection

### Automatic Metrics

| Metric | Source | Frequency |
|--------|--------|-----------|
| Session duration | Game.js | Per session |
| Total taps | ScoreManager | Real-time |
| Score | GameDataManager | Real-time |
| Auto Mining usage | AutoMiningManager | Per activation |
| Leaderboard position | LeaderboardManager | Per update |
| Mail claims | MailManager | Per claim |
| Errors | Console logs | Continuous |

### Manual Feedback

| Question | Type | Required |
|----------|------|----------|
| How easy was the game to understand? | 1-5 rating | Yes |
| How comfortable is the UI? | 1-5 rating | Yes |
| How responsive is the tap? | 1-5 rating | Yes |
| How smooth are animations? | 1-5 rating | Yes |
| How clear is the leaderboard? | 1-5 rating | Yes |
| How easy is mail claiming? | 1-5 rating | Yes |
| How enjoyable is the sound? | 1-5 rating | Yes |
| Any bugs encountered? | Text | No |
| Any suggestions? | Text | No |
| Would you recommend this game? | Yes/No | Yes |

---

## 6. Bug Severity Levels

### Critical (P0)

```
Definition: Game is unplayable or data is lost.
Examples:
- Account data lost after refresh
- Score becomes negative
- App crashes on startup
- Cannot tap frog at all
Resolution: Fix immediately, block next phase
```

### High (P1)

```
Definition: Major feature broken but workaround exists.
Examples:
- Auto Mining doesn't add score
- Leaderboard shows wrong ranking
- Mail claim doesn't add diamonds
- Sound doesn't play
Resolution: Fix within 24 hours
```

### Medium (P2)

```
Definition: Feature works but with issues.
Examples:
- Animation stutters occasionally
- UI layout broken on specific device
- Timer shows wrong countdown
- Filter doesn't work correctly
Resolution: Fix within 1 week
```

### Low (P3)

```
Definition: Minor issues, cosmetic.
Examples:
- Typo in text
- Color slightly off
- Spacing inconsistency
- Slow animation
Resolution: Fix when convenient
```

---

## 7. Monitoring Checklist

### Daily Monitoring

- [ ] Check for crash reports
- [ ] Review error logs
- [ ] Monitor response times
- [ ] Check data integrity
- [ ] Review tester feedback
- [ ] Prioritize bugs

### Performance Monitoring

- [ ] Memory usage stable
- [ ] CPU usage normal
- [ ] No memory leaks
- [ ] Animations smooth
- [ ] Tap response fast

### Data Monitoring

- [ ] Score calculations correct
- [ ] Diamond balances accurate
- [ ] Leaderboard rankings correct
- [ ] Mail delivery working
- [ ] Auto Mining timing accurate

---

## 8. Exit Criteria

### Must Pass (All Required)

- [ ] Zero Critical bugs
- [ ] Zero data loss incidents
- [ ] Score always accurate
- [ ] Leaderboard ranking correct
- [ ] Mail claim working 100%
- [ ] Auto Mining timing accurate
- [ ] Account stable across sessions
- [ ] UI comfortable on mobile (avg > 4/5)

### Should Pass (Recommended)

- [ ] Zero High bugs
- [ ] Performance smooth on mid-range devices
- [ ] Sound enjoyable (avg > 3.5/5)
- [ ] No crashes reported
- [ ] Positive recommendation rate > 80%

---

## 9. Beta Report Template

### Summary

```
Total Testers: ___
Testing Duration: ___ days
Total Sessions: ___
Total Taps: ___
Total Score Earned: ___
Auto Mining Activations: ___
Mail Claims: ___
```

### Bug Summary

```
Critical: ___ (Fixed: ___)
High: ___ (Fixed: ___)
Medium: ___ (Fixed: ___)
Low: ___ (Fixed: ___)
Total: ___
```

### Feedback Summary

```
UI Rating: ___/5
Animation Rating: ___/5
Sound Rating: ___/5
Gameplay Rating: ___/5
Ease of Use Rating: ___/5
Performance Rating: ___/5
Recommendation Rate: ___%
```

### Recommendations

```
[List recommendations for next development phase]
```

---

## 10. Beta Tester Agreement

By participating in this beta test, you agree to:

1. Keep the beta URL private
2. Not share screenshots publicly
3. Report bugs honestly
4. Provide constructive feedback
5. Understand this is a test version

Thank you for helping make Frog Mining better! 🐸
