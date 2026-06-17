# CleverGrid AI Prompt Library

This folder contains reusable prompt templates for generating CleverGrid case JSON.

Use these prompts with GPT, Gemini, Claude, Codex, or another AI model when creating new cases.

## Prompt Files

| File | Purpose | Recommended Use |
| --- | --- | --- |
| `generate-4x4-easy.md` | Generate a 4x4 easy case | First-time case generation, onboarding, simple playable cases. |
| `generate-4x4-medium.md` | Generate a 4x4 medium case | Standard cases with clearer deduction but some indirect clues. |
| `generate-4x4-hard.md` | Generate a 4x4 hard case | Denser deduction using more exclusion clues. |
| `generate-5x5-medium.md` | Generate a 5x5 medium case | Larger cases without making the logic too complex. |
| `generate-5x5-hard.md` | Generate a 5x5 hard case | Larger, denser cases before Rule System V2 exists. |

## Required Workflow

After generating a case:

1. Open `tools/uploader.html`.
2. Paste the generated JSON.
3. Run validation.
4. Confirm JSON parsing, format validation, answer validation, and unique solution validation all pass.
5. Only then use "加入案件库".

If validation fails, ask the AI to fix the JSON based on the Uploader error messages.

Do not manually add a failed case to the library.

## Current Rule Limit

All prompt templates follow the current rule support documented in `docs/ai-case-generation.md`.

All prompt templates use the standard internal difficulty values:

- `easy`
- `medium`
- `hard`
- `expert`

Do not store Chinese difficulty labels in generated JSON.

Current allowed rule types:

- `same`
- `notSame`

Do not generate future rule types until Rule System V2 supports them.
