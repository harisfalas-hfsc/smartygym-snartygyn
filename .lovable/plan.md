

## Fix Plan: Display Skipped Count in Audit Email Summary

### Problem
The audit email summary shows "150 Passed, 1 Warning, 0 Failed, 152 Total" which appears to be wrong math because the **Skipped** count (1) is included in Total but not displayed in the header.

### Root Cause
The email template at line 3029 shows `checks.length` as Total, but the header only displays Pass/Warning/Fail - it omits the Skipped count, making the math look incorrect.

### Solution
Update the email template to show all 4 status counts so the math is transparent.

---

### Implementation

**File:** `supabase/functions/run-system-health-audit/index.ts`

**Change 1:** Add Skipped count to email header (around lines 3015-3031)

Current:
```html
<div style="display: flex; justify-content: space-around; margin-bottom: 30px; text-align: center;">
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #16a34a;">${passed}</div>
    <div style="color: #6b7280;">Passed</div>
  </div>
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #d97706;">${warnings}</div>
    <div style="color: #6b7280;">Warnings</div>
  </div>
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #dc2626;">${failed}</div>
    <div style="color: #6b7280;">Failed</div>
  </div>
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #1f2937;">${checks.length}</div>
    <div style="color: #6b7280;">Total</div>
  </div>
</div>
```

Updated (add Skipped column):
```html
<div style="display: flex; justify-content: space-around; margin-bottom: 30px; text-align: center;">
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #16a34a;">${passed}</div>
    <div style="color: #6b7280;">Passed</div>
  </div>
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #d97706;">${warnings}</div>
    <div style="color: #6b7280;">Warnings</div>
  </div>
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #dc2626;">${failed}</div>
    <div style="color: #6b7280;">Failed</div>
  </div>
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #6b7280;">${skipped}</div>
    <div style="color: #6b7280;">Skipped</div>
  </div>
  <div style="padding: 15px;">
    <div style="font-size: 36px; font-weight: bold; color: #1f2937;">${checks.length}</div>
    <div style="color: #6b7280;">Total</div>
  </div>
</div>
```

---

### Expected Outcome

After this fix, the email header will show:
**150 Passed | 1 Warning | 0 Failed | 1 Skipped | 152 Total**

The math will now be transparent: 150 + 1 + 0 + 1 = 152 ✓

---

### About the SEO Warning

The warning "SEO Metadata Coverage - Auto-generated SEO for 2 items" is **not a problem**. It means:
- 2 workouts were missing SEO meta titles/descriptions
- The audit auto-fix generated them automatically
- This is informational feedback, not an error

If you want to suppress this warning (treat auto-fix success as "pass" instead of "warning"), I can also adjust that logic.

---

### Files to Modify

1. `supabase/functions/run-system-health-audit/index.ts` - Add Skipped column to email header template (lines ~3015-3031)

