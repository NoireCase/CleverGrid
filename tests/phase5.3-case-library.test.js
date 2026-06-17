const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
global.window = global;
global.fetch = async url => {
    const filePath = path.join(root, String(url).replace(/^\.\//, ''));
    return {
        ok: fs.existsSync(filePath),
        async json() {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    };
};

function load(file) {
    vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}

load('src/case-library.js');

const library = global.CleverGridCaseLibrary;

function makeCase(title) {
    return {
        id: 'draft-case',
        title,
        difficulty: 'easy',
        suspects: [{ id: 'S1', name: 'A' }],
        weapons: [{ id: 'W1', name: 'B' }],
        locations: [{ id: 'L1', name: 'C' }],
        clues: ['S1-W1-L1'],
        solution: { suspect: 'S1', weapon: 'W1', location: 'L1' },
        fullTruth: [['S1', 'W1', 'L1']]
    };
}

const emptyImport = library.prepareLibraryImport(makeCase('空库案件'), { version: 1, cases: [] });
assert.strictEqual(emptyImport.id, 'case-001');
assert.strictEqual(emptyImport.caseData.id, 'case-001');

let index = {
    version: 1,
    cases: [
        { id: 'case-001', title: 'A', difficulty: 'easy', file: 'cases/case-001.json' },
        { id: 'case-002', title: 'B', difficulty: 'easy', file: 'cases/case-002.json' },
        { id: 'case-003', title: 'C', difficulty: 'easy', file: 'cases/case-003.json' }
    ]
};
const nextImport = library.prepareLibraryImport(makeCase('第四案'), index);
assert.strictEqual(nextImport.id, 'case-004');

let rollingIndex = { version: 1, cases: [] };
['一', '二', '三'].forEach(title => {
    const result = library.prepareLibraryImport(makeCase(title), rollingIndex);
    rollingIndex = result.index;
});
assert.deepStrictEqual(rollingIndex.cases.map(item => item.id), ['case-001', 'case-002', 'case-003']);
assert.strictEqual(new Set(rollingIndex.cases.map(item => item.id)).size, 3);

const unsorted = library.sortIndex({
    version: 1,
    cases: [
        { id: 'case-003', title: 'C', difficulty: 'easy', file: 'cases/case-003.json' },
        { id: 'case-001', title: 'A', difficulty: 'easy', file: 'cases/case-001.json' },
        { id: 'case-002', title: 'B', difficulty: 'easy', file: 'cases/case-002.json' }
    ]
});
assert.deepStrictEqual(unsorted.cases.map(item => item.id), ['case-001', 'case-002', 'case-003']);

library.loadCases({ indexPath: 'case-index.json' }).then(({ index: loadedIndex, cases }) => {
    assert.strictEqual(loadedIndex.cases.length, 5);
    assert.strictEqual(cases.length, 5);
    assert.strictEqual(cases[0].id, 'case-001');

    global.CLEVERGRID_CASE_MANIFEST = undefined;
    global.CLEVERGRID_CASE_REGISTRY = undefined;
    load('cases/manifest.js');
    for (const id of global.CLEVERGRID_CASE_MANIFEST) {
        load(`cases/${id}.js`);
    }
    const legacyCases = global.CLEVERGRID_CASE_MANIFEST.map(id => global.CLEVERGRID_CASE_REGISTRY[id]);
    const migration = library.migrateLegacyCases(legacyCases);

    assert.strictEqual(migration.index.cases.length, legacyCases.length);
    assert.strictEqual(migration.index.cases[0].id, 'case-001');
    assert.strictEqual(migration.files[0].path, 'cases/case-001.json');
    assert.strictEqual(JSON.parse(migration.files[0].content).id, 'case-001');

    console.log('Phase 5.3 case library tests passed.');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
