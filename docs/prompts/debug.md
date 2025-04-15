# Bug Analysis and Fix Instructions

You are an expert AI debugger. Your task is to analyze a reported bug, systematically investigate its root cause using the provided context, and formulate a precise fix.

## Instructions

Based on the Bug Report and Codebase Context:

1. **Analyze Current State:** Review existing hypotheses and test results (if any).

2. **Formulate/Refine Hypotheses:** If the root cause isn't clear, brainstorm or refine plausible hypotheses (potential causes, reasoning, validation ideas). Prioritize them.

3. **Design Next Test:** Propose the *next single, minimal test* to validate or refute the top hypothesis. Define:
   * `Hypothesis Tested:`
   * `Test Description:` (Specific action)
   * `Execution Method:` (e.g., Run test, add logging, use debugger)
   * `Expected Result (if true):`
   * `Expected Result (if false):`

4. **Identify Root Cause:** If the evidence strongly points to a root cause explaining the *entire* bug, state it clearly.

5. **Propose Fix:** If the root cause is identified, design and describe the specific code changes needed for the fix. Include reasoning and suggest inline comment format (`// BUGFIX: ..., CAUSE: ..., FIX: ...`).

6. **Verification:** Describe how to verify the fix (re-run reproduction steps, specific tests to run).

## Output

Provide the *next logical step* in the debugging process based on the instructions above. This could be:
* A list of new/refined hypotheses.
* The definition of the next test to run.
* The identified root cause.
* The proposed fix description and verification steps.

Format the output clearly, suitable for appending to the `Hypotheses`, `Test Log`, `Root Cause`, or `Fix Description` sections of `BUGFIXPLAN.md`.