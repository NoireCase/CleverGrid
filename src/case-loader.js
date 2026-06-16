(function (global) {
    function getCaseFile(entry) {
        if (typeof entry === 'string') {
            return `${entry}.js`;
        }

        if (entry && typeof entry === 'object' && entry.file) {
            return entry.file;
        }

        throw new Error('案件 manifest 条目格式不正确');
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`案件脚本加载失败：${src}`));
            document.head.appendChild(script);
        });
    }

    async function load(options) {
        const basePath = (options && options.basePath) || 'cases/';
        const manifest = global.CLEVERGRID_CASE_MANIFEST;

        if (!Array.isArray(manifest) || manifest.length === 0) {
            throw new Error('没有读取到 CLEVERGRID_CASE_MANIFEST');
        }

        for (const entry of manifest) {
            await loadScript(`${basePath}${getCaseFile(entry)}`);
        }

        return global.CLEVERGRID_CASE_REGISTRY || {};
    }

    global.CleverGridCaseLoader = { load };
})(globalThis);
