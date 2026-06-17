const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
global.window = global;

function load(file) {
    vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}

load('src/solver.js');
load('src/validator.js');

function makeCase(difficulty) {
    return {
        id: 'difficulty-test',
        version: 1,
        title: 'Difficulty Test',
        difficulty,
        suspects: [
            { id: 'S1', name: 'Suspect 1' },
            { id: 'S2', name: 'Suspect 2' },
            { id: 'S3', name: 'Suspect 3' }
        ],
        weapons: [
            { id: 'W1', name: 'Weapon 1' },
            { id: 'W2', name: 'Weapon 2' },
            { id: 'W3', name: 'Weapon 3' }
        ],
        locations: [
            { id: 'L1', name: 'Location 1' },
            { id: 'L2', name: 'Location 2' },
            { id: 'L3', name: 'Location 3' }
        ],
        clues: [
            'S1 has W1.',
            'S1 is at L1.',
            'S2 has W2.',
            'S2 is at L2.'
        ],
        rules: [
            { id: 'R1', type: 'same', left: 'S1', right: 'W1' },
            { id: 'R2', type: 'same', left: 'S1', right: 'L1' },
            { id: 'R3', type: 'same', left: 'S2', right: 'W2' },
            { id: 'R4', type: 'same', left: 'S2', right: 'L2' }
        ],
        solution: { suspect: 'S1', weapon: 'W1', location: 'L1' },
        fullTruth: [
            ['S1', 'W1', 'L1'],
            ['S2', 'W2', 'L2'],
            ['S3', 'W3', 'L3']
        ]
    };
}

['easy', 'medium', 'hard', 'expert'].forEach(difficulty => {
    const result = global.CleverGridValidator.validateUploadedCase(makeCase(difficulty));
    assert.strictEqual(result.ok, true, `${difficulty} should pass`);
    assert.deepStrictEqual(result.warnings, [], `${difficulty} should not warn`);
    console.log(`PASS difficulty ${difficulty}`);
});

const legacyResult = global.CleverGridValidator.validateUploadedCase(makeCase('入门级'));
assert.strictEqual(legacyResult.ok, true, 'legacy Chinese difficulty should pass');
assert.ok(legacyResult.warnings.some(message => message.includes('旧版 difficulty 文案')), 'legacy Chinese difficulty should warn');
assert.strictEqual(global.CleverGridValidator.normalizeUploadedCase(makeCase('入门级')).difficulty, 'easy', 'legacy Chinese difficulty should normalize to easy');
console.log('PASS difficulty legacy warning');

const unknownResult = global.CleverGridValidator.validateUploadedCase(makeCase('unknown'));
assert.strictEqual(unknownResult.ok, false, 'unknown difficulty should fail');
assert.ok(unknownResult.errors.some(message => message.includes('difficulty 必须是 easy / medium / hard / expert')), 'unknown difficulty should explain allowed values');
console.log('PASS difficulty unknown failure');

console.log('Phase 5.3.5 difficulty tests passed.');
