# AI Case Generation Standard

This document is the official generation standard for AI-created CleverGrid cases.

It is intended for GPT, Gemini, Claude, Codex, and any other AI tool that generates case JSON for CleverGrid.

## 1. Purpose

AI-generated cases must be ready for the current CleverGrid production flow:

1. Paste or upload the JSON in `tools/uploader.html`.
2. Pass JSON parsing.
3. Pass Validator format checks.
4. Pass Solver unique solution validation.
5. Join the Case Library as `cases/case-xxx.json`.

The AI should generate a single case JSON object that can be imported directly by the Uploader.

Do not output explanatory text, Markdown, or code fences when the user asks for the final case JSON.

## 2. Current Rule Support

Current supported rule types:

- `same`
- `notSame`

Current unsupported rule types:

- `either`
- `oneOf`
- `xor`
- `adjacent`
- `before`
- `after`
- `conditional`
- natural-language reasoning rules

AI must not generate unsupported rule types.

Natural-language clues may be flavorful, but every clue needed by Solver must be represented as one or more `same` / `notSame` rules.

## 3. Required Structure

Minimum valid draft structure:

```json
{
  "title": "",
  "difficulty": "",
  "suspects": [],
  "weapons": [],
  "locations": [],
  "clues": [],
  "rules": [],
  "solution": {}
}
```

Required fields:

- `title`
- `difficulty`
- `suspects`
- `weapons`
- `locations`
- `clues`
- `rules`
- `solution`

Recommended fields:

- `version`
- `intro`
- `fullTruth`

Draft JSON does not need a formal `id`. The Case Library will generate `case-001`, `case-002`, and so on when the case is added.

## 4. Entity Requirements

The three entity lists must have the same length:

- `suspects`
- `weapons`
- `locations`

Every entity must have:

- `id`
- `name`

Every id must be unique within its own list.

Recommended id pattern for a 4-person case:

```text
Suspects: S1, S2, S3, S4
Weapons:  W1, W2, W3, W4
Locations: L1, L2, L3, L4
```

Entity examples:

```json
{ "id": "S1", "name": "Night Guard" }
```

```json
{ "id": "W1", "name": "Copper Key" }
```

```json
{ "id": "L1", "name": "Main Hall" }
```

## 5. Rule Examples

Correct examples:

```json
{
  "type": "same",
  "left": "S1",
  "right": "W2"
}
```

This means `S1` and `W2` belong to the same truth row.

```json
{
  "type": "notSame",
  "left": "S3",
  "right": "L1"
}
```

This means `S3` and `L1` do not belong to the same truth row.

Wrong examples:

```json
{
  "type": "either"
}
```

```json
{
  "type": "adjacent"
}
```

These rule types are not supported in the current version.

Rule requirements:

- `left` must reference an existing suspect, weapon, or location id.
- `right` must reference an existing suspect, weapon, or location id.
- `left` and `right` must not come from the same entity category.
- Each rule should have a stable `id`, such as `R1`, `R2`, `R3`.

## 6. Solution Requirements

Always use object format:

```json
{
  "suspect": "S1",
  "weapon": "W2",
  "location": "L3"
}
```

Do not use the old array format:

```json
["S1", "W2", "L3"]
```

Do not use the legacy Base64 string format.

The `solution` must reference existing entity ids and must match the unique answer found by Solver.

## 7. Common Errors

The Uploader can detect common issues such as:

- missing `title`
- duplicate id
- `solution` references a missing entity
- mismatched entity counts
- old `solution` array format
- unsupported rule type
- rule references a missing entity
- rule connects two ids from the same category
- rules have no solution
- rules allow multiple solutions
- unique Solver result does not match `solution`

## 8. AI Checklist

Before returning the final JSON, check:

```text
□ suspects / weapons / locations counts match
□ all ids are unique
□ every entity has id and name
□ solution uses object format
□ solution references existing ids
□ only same / notSame rules are used
□ no future rule types are used
□ rules are enough for a unique solution
□ fullTruth, if included, matches rules and solution
□ the case can pass Uploader
□ the case can pass Solver
```

## 9. AI Prompt Template

Use this prompt when asking an AI tool to generate a CleverGrid case:

```text
Generate one CleverGrid case JSON object.

Output pure JSON only.
Do not output explanations.
Do not output Markdown.
Do not wrap the JSON in a code block.
Do not include comments.

The case must follow these rules:
- It must be importable by tools/uploader.html.
- It must include title, difficulty, suspects, weapons, locations, clues, rules, solution, and fullTruth.
- suspects, weapons, and locations must have the same count.
- Every suspect, weapon, and location must have a unique id and a name.
- Use suspect ids S1, S2, S3, S4.
- Use weapon ids W1, W2, W3, W4.
- Use location ids L1, L2, L3, L4.
- Use only supported rule types: same and notSame.
- Do not use either, oneOf, xor, adjacent, before, after, conditional, or natural-language-only rules.
- Every rule must reference existing ids.
- Rule left and right must come from different entity categories.
- solution must use object format: { "suspect": "S1", "weapon": "W2", "location": "L3" }.
- Do not use solution array format.
- Do not use Base64 solution format.
- fullTruth must list the complete suspect-to-weapon-to-location mapping.
- rules must be strong enough for Solver to find exactly one fullTruth.
- solution must match the unique Solver result.

Return only the final JSON object.
```
