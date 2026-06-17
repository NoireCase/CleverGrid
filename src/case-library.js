(function (global) {
    const CASE_ID_PATTERN = /^case-(\d{3})$/;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function padCaseNumber(value) {
        return String(value).padStart(3, '0');
    }

    function parseCaseNumber(id) {
        const match = typeof id === 'string' ? id.match(CASE_ID_PATTERN) : null;
        return match ? Number(match[1]) : 0;
    }

    function sortIndex(index) {
        const sorted = normalizeIndex(index);
        sorted.cases.sort((left, right) => parseCaseNumber(left.id) - parseCaseNumber(right.id));
        return sorted;
    }

    function normalizeIndex(index) {
        return {
            version: Number(index && index.version) || 1,
            cases: Array.isArray(index && index.cases)
                ? index.cases.map(item => ({
                    id: item.id,
                    title: item.title || '',
                    difficulty: item.difficulty || '',
                    file: item.file || `cases/${item.id}.json`
                }))
                : []
        };
    }

    function getNextCaseId(index) {
        const normalized = normalizeIndex(index);
        const maxNumber = normalized.cases.reduce((max, item) => Math.max(max, parseCaseNumber(item.id)), 0);
        return `case-${padCaseNumber(maxNumber + 1)}`;
    }

    function normalizeCaseForLibrary(caseData, id) {
        const item = clone(caseData);
        item.id = id;
        return item;
    }

    function createIndexEntry(caseData, id) {
        return {
            id,
            title: caseData.title || '',
            difficulty: caseData.difficulty || '',
            file: `cases/${id}.json`
        };
    }

    function prepareLibraryImport(caseData, index) {
        const currentIndex = sortIndex(index || { version: 1, cases: [] });
        const id = getNextCaseId(currentIndex);
        const libraryCase = normalizeCaseForLibrary(caseData, id);
        const entry = createIndexEntry(libraryCase, id);
        const nextIndex = sortIndex({
            version: currentIndex.version || 1,
            cases: currentIndex.cases.concat(entry)
        });

        return {
            id,
            file: entry.file,
            caseData: libraryCase,
            index: nextIndex,
            indexJson: JSON.stringify(nextIndex, null, 2),
            caseJson: JSON.stringify(libraryCase, null, 2)
        };
    }

    function migrateLegacyCases(legacyCases) {
        const cases = (Array.isArray(legacyCases) ? legacyCases : []).map((item, index) => {
            const id = `case-${padCaseNumber(index + 1)}`;
            return normalizeCaseForLibrary(item, id);
        });
        const index = {
            version: 1,
            cases: cases.map(item => createIndexEntry(item, item.id))
        };

        return {
            index,
            cases,
            files: cases.map(item => ({
                path: `cases/${item.id}.json`,
                content: JSON.stringify(item, null, 2)
            })),
            indexFile: {
                path: 'case-index.json',
                content: JSON.stringify(index, null, 2)
            }
        };
    }

    async function fetchJson(path) {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`读取失败：${path}`);
        }
        return response.json();
    }

    function getPathBase(path) {
        const value = path || '';
        const slashIndex = value.lastIndexOf('/');
        return slashIndex >= 0 ? value.slice(0, slashIndex + 1) : '';
    }

    function resolvePath(basePath, filePath) {
        if (/^(https?:)?\/\//.test(filePath) || filePath.startsWith('/')) return filePath;
        return `${basePath || ''}${filePath}`;
    }

    async function loadIndex(path) {
        return sortIndex(await fetchJson(path || 'case-index.json'));
    }

    async function loadCases(options) {
        const config = options || {};
        const indexPath = config.indexPath || 'case-index.json';
        const index = await loadIndex(indexPath);
        const basePath = config.caseBasePath !== undefined ? config.caseBasePath : getPathBase(indexPath);
        const cases = [];

        for (const entry of index.cases) {
            cases.push(await fetchJson(resolvePath(basePath, entry.file)));
        }

        return { index, cases };
    }

    async function readJsonFromDirectory(directoryHandle, fileName, fallback) {
        try {
            const fileHandle = await directoryHandle.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            return JSON.parse(await file.text());
        } catch (error) {
            if (fallback !== undefined) return fallback;
            throw error;
        }
    }

    async function writeTextFile(directoryHandle, fileName, content) {
        const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    }

    async function addCaseToDirectory(caseData, directoryHandle) {
        const rootHandle = directoryHandle || await global.showDirectoryPicker({ mode: 'readwrite' });
        const index = await readJsonFromDirectory(rootHandle, 'case-index.json', { version: 1, cases: [] });
        const prepared = prepareLibraryImport(caseData, index);
        const casesHandle = await rootHandle.getDirectoryHandle('cases', { create: true });

        await writeTextFile(casesHandle, `${prepared.id}.json`, `${prepared.caseJson}\n`);
        await writeTextFile(rootHandle, 'case-index.json', `${prepared.indexJson}\n`);

        return prepared;
    }

    async function writeMigrationToDirectory(migration, directoryHandle) {
        const rootHandle = directoryHandle || await global.showDirectoryPicker({ mode: 'readwrite' });
        const casesHandle = await rootHandle.getDirectoryHandle('cases', { create: true });

        for (const file of migration.files) {
            await writeTextFile(casesHandle, file.path.replace('cases/', ''), `${file.content}\n`);
        }
        await writeTextFile(rootHandle, migration.indexFile.path, `${migration.indexFile.content}\n`);

        return migration;
    }

    global.CleverGridCaseLibrary = {
        CASE_ID_PATTERN,
        normalizeIndex,
        sortIndex,
        getNextCaseId,
        normalizeCaseForLibrary,
        createIndexEntry,
        prepareLibraryImport,
        migrateLegacyCases,
        loadIndex,
        loadCases,
        addCaseToDirectory,
        writeMigrationToDirectory
    };
})(globalThis);
