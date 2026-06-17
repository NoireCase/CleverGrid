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

function makeCase(overrides) {
    return {
        id: 'test-case',
        version: 1,
        title: '测试案件',
        difficulty: '测试',
        suspects: [
            { id: 'S1', name: '嫌疑人一' },
            { id: 'S2', name: '嫌疑人二' },
            { id: 'S3', name: '嫌疑人三' }
        ],
        weapons: [
            { id: 'W1', name: '物品一' },
            { id: 'W2', name: '物品二' },
            { id: 'W3', name: '物品三' }
        ],
        locations: [
            { id: 'L1', name: '地点一' },
            { id: 'L2', name: '地点二' },
            { id: 'L3', name: '地点三' }
        ],
        clues: [
            'S1 与 W1 对应。',
            'S1 在 L1。',
            'S2 与 W2 对应。',
            'S2 在 L2。'
        ],
        rules: [
            { id: 'R1', type: 'same', left: 'S1', right: 'W1', sourceClueIndex: 0 },
            { id: 'R2', type: 'same', left: 'S1', right: 'L1', sourceClueIndex: 1 },
            { id: 'R3', type: 'same', left: 'S2', right: 'W2', sourceClueIndex: 2 },
            { id: 'R4', type: 'same', left: 'S2', right: 'L2', sourceClueIndex: 3 }
        ],
        solution: { suspect: 'S1', weapon: 'W1', location: 'L1' },
        fullTruth: [
            ['S1', 'W1', 'L1'],
            ['S2', 'W2', 'L2'],
            ['S3', 'W3', 'L3']
        ],
        ...overrides
    };
}

function validateUnique(caseData) {
    const format = global.CleverGridValidator.validateUploadedCase(caseData);
    assert.deepStrictEqual(format.errors, [], `format errors: ${format.errors.join('; ')}`);
    return global.CleverGridValidator.validateUploadedUniqueSolution(caseData);
}

const uniqueResult = validateUnique(makeCase());
assert.strictEqual(uniqueResult.status, 'unique');
assert.strictEqual(uniqueResult.count, 1);
assert.strictEqual(uniqueResult.solutions[0].text, 'S1 / W1 / L1');

const multipleResult = validateUnique(makeCase({
    rules: [
        { id: 'R1', type: 'same', left: 'S1', right: 'W1', sourceClueIndex: 0 }
    ]
}));
assert.strictEqual(multipleResult.status, 'multiple');
assert.ok(multipleResult.count > 1);
assert.ok(multipleResult.solutions.length <= 5);

const noneResult = validateUnique(makeCase({
    rules: [
        { id: 'R1', type: 'same', left: 'S1', right: 'W1', sourceClueIndex: 0 },
        { id: 'R2', type: 'notSame', left: 'S1', right: 'W1', sourceClueIndex: 1 }
    ]
}));
assert.strictEqual(noneResult.status, 'none');
assert.strictEqual(noneResult.count, 0);

const mismatchResult = validateUnique(makeCase({
    solution: { suspect: 'S1', weapon: 'W2', location: 'L1' },
    fullTruth: [
        ['S1', 'W2', 'L1'],
        ['S2', 'W1', 'L2'],
        ['S3', 'W3', 'L3']
    ]
}));
assert.strictEqual(mismatchResult.status, 'unique');
assert.strictEqual(mismatchResult.matchesSolution, false);
assert.ok(mismatchResult.messages.some(message => message.includes('不一致')));

const unsupportedCase = makeCase();
delete unsupportedCase.rules;
const unsupportedFormat = global.CleverGridValidator.validateUploadedCase(unsupportedCase);
assert.deepStrictEqual(unsupportedFormat.errors, []);
const unsupportedResult = global.CleverGridValidator.validateUploadedUniqueSolution(unsupportedCase);
assert.strictEqual(unsupportedResult.status, 'unsupported');

console.log('Phase 5.2 uploader solver tests passed.');
