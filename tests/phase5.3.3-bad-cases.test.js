const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const badCasesDir = path.join(__dirname, 'bad-cases');
global.window = global;

function load(file) {
    vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}

load('src/solver.js');
load('src/validator.js');

const expectations = {
    'missing-title.json': {
        stage: 'format',
        errorIncludes: 'title'
    },
    'missing-solution.json': {
        stage: 'format',
        errorIncludes: '缺少 solution'
    },
    'duplicate-id.json': {
        stage: 'format',
        errorIncludes: '重复 id'
    },
    'invalid-solution-ref.json': {
        stage: 'format',
        errorIncludes: 'solution.suspect'
    },
    'old-solution-array.json': {
        stage: 'format',
        errorIncludes: '旧版 solution 数组格式'
    },
    'unsupported-rule-type.json': {
        stage: 'format',
        errorIncludes: 'type 必须是 same 或 notSame'
    },
    'multi-solution.json': {
        stage: 'solver',
        status: 'multiple',
        countGreaterThan: 1
    },
    'no-solution.json': {
        stage: 'solver',
        status: 'none',
        count: 0
    },
    'wrong-solution.json': {
        stage: 'solver',
        status: 'unique',
        matchesSolution: false
    }
};

function readBadCase(fileName) {
    return JSON.parse(fs.readFileSync(path.join(badCasesDir, fileName), 'utf8'));
}

function runValidationPipeline(caseData) {
    const format = global.CleverGridValidator.validateUploadedCase(caseData);
    const answer = global.CleverGridValidator.validateUploadedCaseAnswer(caseData);
    const unique = global.CleverGridValidator.validateUploadedUniqueSolution(caseData);
    const wouldBeAccepted = format.ok
        && answer.ok
        && unique.status === 'unique'
        && unique.matchesSolution === true;

    return { format, answer, unique, wouldBeAccepted };
}

function assertFormatFailure(fileName, results, expectation) {
    const { format } = results;

    assert.strictEqual(format.ok, false, `${fileName} should fail format validation`);
    assert.ok(
        format.errors.some(error => error.includes(expectation.errorIncludes)),
        `${fileName} should include error text: ${expectation.errorIncludes}\nActual errors: ${format.errors.join('\n')}`
    );
}

function assertSolverFailure(fileName, results, expectation) {
    const { format, answer, unique } = results;

    assert.strictEqual(format.ok, true, `${fileName} should pass format validation before solver check: ${format.errors.join('; ')}`);
    assert.strictEqual(unique.status, expectation.status, `${fileName} should return solver status ${expectation.status}`);

    if (Number.isFinite(expectation.count)) {
        assert.strictEqual(unique.count, expectation.count, `${fileName} should return count ${expectation.count}`);
    }

    if (Number.isFinite(expectation.countGreaterThan)) {
        assert.ok(unique.count > expectation.countGreaterThan, `${fileName} should return count > ${expectation.countGreaterThan}`);
    }

    if (typeof expectation.matchesSolution === 'boolean') {
        assert.strictEqual(unique.matchesSolution, expectation.matchesSolution, `${fileName} should return matchesSolution ${expectation.matchesSolution}`);
    }

    if (fileName === 'wrong-solution.json') {
        assert.strictEqual(answer.ok, false, 'wrong-solution.json should also fail answer validation');
    }
}

const files = fs.readdirSync(badCasesDir)
    .filter(fileName => fileName.endsWith('.json'))
    .sort();

const expectedFiles = Object.keys(expectations).sort();
assert.deepStrictEqual(files, expectedFiles, 'bad-cases directory should contain the expected test set');

let passCount = 0;

files.forEach(fileName => {
    const caseData = readBadCase(fileName);
    const expectation = expectations[fileName];
    const results = runValidationPipeline(caseData);

    assert.strictEqual(results.wouldBeAccepted, false, `${fileName} should not pass the full upload validation pipeline`);

    if (expectation.stage === 'format') {
        assertFormatFailure(fileName, results, expectation);
    } else {
        assertSolverFailure(fileName, results, expectation);
    }

    passCount += 1;
    console.log(`PASS ${path.basename(fileName, '.json')}`);
});

console.log(`Total: ${passCount} / ${expectedFiles.length}`);
