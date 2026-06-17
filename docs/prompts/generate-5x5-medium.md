# Generate 5x5 Medium CleverGrid Case

Use this prompt to generate a 5x5 medium CleverGrid case.

```text
Generate one CleverGrid 5x5 medium case JSON object.

Output pure JSON only.
Do not output Markdown.
Do not wrap the JSON in a code block.
Do not output explanations.
Do not include comments.

The case must follow docs/ai-case-generation.md.

Required fields:
- title
- difficulty
- suspects
- weapons
- locations
- clues
- rules
- solution
- fullTruth

Case size:
- exactly 5 suspects
- exactly 5 weapons
- exactly 5 locations

Use ids:
- suspects: S1, S2, S3, S4, S5
- weapons: W1, W2, W3, W4, W5
- locations: L1, L2, L3, L4, L5

Difficulty target:
- set difficulty exactly to "medium"
- increase the number of rules compared with 4x4 cases
- use a balanced mix of same and notSame rules
- keep clue wording clear enough for players to follow
- do not overcomplicate the case
- avoid unsupported future logic

Rule requirements:
- current allowed rule types are only same and notSame
- do not use either
- do not use oneOf
- do not use xor
- do not use adjacent
- do not use before
- do not use after
- do not use conditional
- do not use natural-language-only reasoning rules
- every rule must reference existing ids
- rule left and right must come from different entity categories
- rules must be strong enough for Solver to get exactly one fullTruth

Solution requirements:
- solution must use object format
- solution must include suspect, weapon, location
- do not use old array format
- do not use Base64 format
- solution must match the unique Solver result

fullTruth requirements:
- fullTruth must list the complete suspect-to-weapon-to-location mapping
- every suspect appears exactly once
- every weapon appears exactly once
- every location appears exactly once

Return only the final JSON object.
```
