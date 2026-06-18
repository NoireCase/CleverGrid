(function () {
    const DEFAULT_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

    const ICONS = {
        archive: '<rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path>',
        bath: '<path d="M10 4 8 6"></path><path d="M17 19v2"></path><path d="M2 12h20"></path><path d="M7 19v2"></path><path d="M9 5 7.6 6.4A2 2 0 0 0 7 7.8V12"></path><path d="M21 12v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-4"></path>',
        bed: '<path d="M2 4v16"></path><path d="M2 10h20"></path><path d="M6 4v6"></path><path d="M22 10v10"></path><path d="M6 10V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"></path>',
        beer: '<path d="M17 11h1a3 3 0 0 1 0 6h-1"></path><path d="M9 12v6"></path><path d="M13 12v6"></path><path d="M14 7.5c0 1-1 1.5-2 1.5s-2-.5-2-1.5S11 6 12 6s2 .5 2 1.5Z"></path><path d="M6 9h10v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"></path>',
        book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path>',
        bookOpen: '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>',
        brainCircuit: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5A3 3 0 0 0 15 5"></path><path d="M6.401 6.5A3 3 0 0 1 9 5"></path><path d="M12 19v-4"></path><path d="M12 9V5"></path><path d="M8 16h8"></path>',
        building2: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>',
        castle: '<path d="M22 20v-7l-2-2V4h-3v3l-2-2-3 3-3-3-2 2V4H4v7l-2 2v7Z"></path><path d="M18 20v-6"></path><path d="M6 20v-6"></path><path d="M12 20v-4"></path>',
        candle: '<path d="M9 2c0 2 3 2 3 5 0 1.7-1.3 3-3 3S6 8.7 6 7c0-3 3-3 3-5Z"></path><path d="M9 10v12"></path><path d="M5 22h8"></path>',
        circleHelp: '<circle cx="12" cy="12" r="10"></circle><path d="M9.1 9a3 3 0 1 1 5.8 1c-.7 1.2-2.9 1.7-2.9 3"></path><path d="M12 17h.01"></path>',
        coffee: '<path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M16 8h1a4 4 0 0 1 0 8h-1"></path><path d="M6 8h10v7a5 5 0 0 1-5 5 5 5 0 0 1-5-5Z"></path><path d="M6 2v2"></path>',
        cylinder: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"></path><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"></path>',
        doorOpen: '<path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 20V4a1 1 0 0 0-1.2-1L5 4.5V20"></path>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path>',
        dumbbell: '<path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1"></path><path d="m3 3 1 1"></path><path d="m18 22 4-4"></path><path d="m2 6 4-4"></path><path d="m3 10 7-7"></path><path d="m14 21 7-7"></path>',
        eraser: '<path d="m7 21-4.3-4.3a2.4 2.4 0 0 1 0-3.4L13.3 2.7a2.4 2.4 0 0 1 3.4 0l4.6 4.6a2.4 2.4 0 0 1 0 3.4L11 21"></path><path d="M22 21H7"></path><path d="m5 11 8 8"></path>',
        flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1.8-2 2.2-2 4a4 4 0 0 0 8 0c0-3-2-4.5-4-7-.5 2.5-2 4.9-4 6.5"></path>',
        flaskConical: '<path d="M10 2v7.3L5 20a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L14 9.3V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path>',
        forkKnife: '<path d="M3 2v7"></path><path d="M7 2v7"></path><path d="M5 2v20"></path><path d="M17 2v20"></path><path d="M21 15V2a4 4 0 0 0-4 4v9Z"></path>',
        glasses: '<circle cx="6" cy="15" r="4"></circle><circle cx="18" cy="15" r="4"></circle><path d="M10 15h4"></path><path d="M2.5 13 2 8"></path><path d="m22 8-.5 5"></path>',
        hammer: '<path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"></path><path d="M17.6 15.6 22 11.2 12.8 2 8.4 6.4"></path><path d="m14.4 4.4-6 6"></path>',
        house: '<path d="m3 11 9-9 9 9"></path><path d="M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10"></path><path d="M9 22V12h6v10"></path>',
        key: '<circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path>',
        knife: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path><path d="m13 19 6-6"></path><path d="m16 16 4 4"></path><path d="m19 21 2-2"></path>',
        lampDesk: '<path d="m14 5-3 3 2 7 8-8-7-2Z"></path><path d="m14 5 3-3 4 4-3 3"></path><path d="M9.5 10.5 4 16"></path><path d="M4 16l3 3"></path><path d="M2 22h10"></path><path d="M7 19v3"></path>',
        landmark: '<path d="m3 22 1.5-1.5"></path><path d="M19.5 20.5 21 22"></path><path d="M4 7h16"></path><path d="M6 7v13"></path><path d="M10 7v13"></path><path d="M14 7v13"></path><path d="M18 7v13"></path><path d="M2 20h20"></path><path d="m12 2 8 5H4Z"></path>',
        library: '<path d="m16 6 4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path>',
        mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
        martini: '<path d="M8 22h8"></path><path d="M12 11v11"></path><path d="m19 3-7 8-7-8Z"></path>',
        pencil: '<path d="M21.2 8.4 8.4 21.2 3 22l.8-5.4L16.6 3.8a2 2 0 0 1 2.8 0l1.8 1.8a2 2 0 0 1 0 2.8Z"></path><path d="m14.5 5.5 4 4"></path>',
        penLine: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>',
        redo2: '<path d="m15 14 5-5-5-5"></path><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path>',
        school: '<path d="m4 6 8-4 8 4"></path><path d="m18 10 4 2v8H2v-8l4-2"></path><path d="M14 22v-4a2 2 0 0 0-4 0v4"></path><path d="M18 5v17"></path><path d="M6 5v17"></path><circle cx="12" cy="9" r="2"></circle>',
        scissors: '<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M20 4 8.1 15.9"></path><path d="M14.5 14.5 20 20"></path><path d="M8.1 8.1 12 12"></path>',
        search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',
        shirt: '<path d="M20.4 3.6 16 2a4 4 0 0 1-8 0L3.6 3.6a2 2 0 0 0-1.1 2.5L4 10l4-1v13h8V9l4 1 1.5-3.9a2 2 0 0 0-1.1-2.5Z"></path>',
        sword: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path><path d="m13 19 6-6"></path><path d="m16 16 4 4"></path><path d="m19 21 2-2"></path>',
        target: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
        towerControl: '<path d="M18.2 12.3 21 22H3l2.8-9.7"></path><path d="M8 13h8"></path><path d="M12 13v9"></path><path d="M7 5h10l1 7H6Z"></path><path d="M10 5V2"></path><path d="M14 5V2"></path>',
        trash2: '<path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>',
        trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.7V17c0 .6-.4 1-1 1h6c-.6 0-1-.4-1-1v-2.3"></path><path d="M18 2H6v7a6 6 0 0 0 12 0Z"></path>',
        tv: '<rect width="20" height="15" x="2" y="7" rx="2"></rect><path d="m17 2-5 5-5-5"></path>',
        undo2: '<path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5A5.5 5.5 0 0 1 20 14.5v0A5.5 5.5 0 0 1 14.5 20H11"></path>',
        upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M17 8l-5-5-5 5"></path><path d="M12 3v12"></path>',
        user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
        userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m16 11 2 2 4-4"></path>',
        userCog: '<circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle><path d="M9 15H6a4 4 0 0 0-4 4v2"></path><path d="m21.7 16.4-.9-.3"></path><path d="m15.2 13.9-.9-.3"></path><path d="m16.6 18.7.3-.9"></path><path d="m19.1 12.2.3-.9"></path>',
        userRound: '<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>',
        userSearch: '<circle cx="10" cy="7" r="4"></circle><path d="M10.3 15H7a4 4 0 0 0-4 4v2"></path><circle cx="17" cy="17" r="3"></circle><path d="m21 21-1.9-1.9"></path>',
        waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5S12 7 14.5 7 17 5 19.5 5c1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"></path>'
    };

    const TOOL_ICON_MAP = {
        pen: 'penLine',
        pencil: 'pencil',
        eraser: 'eraser',
        undo: 'undo2',
        redo: 'redo2',
        save: 'download',
        load: 'upload',
        auto: 'brainCircuit',
        trash: 'trash2'
    };

    const OBJECT_ICON_MAP = {
        suspect: {
            default: 'user',
            A: 'userCog',
            B: 'userRound',
            C: 'userSearch',
            S1: 'user',
            S2: 'userRound',
            S3: 'userSearch',
            S4: 'userCheck',
            S5: 'userCog',
            '神奇的奥瑞林': 'userCog',
            '米德耐特三世': 'userRound',
            '奥比斯迪亚夫人': 'userSearch',
            '暴躁的管理员': 'userCog',
            '历史系学生': 'userRound',
            '神秘的收藏家': 'userSearch',
            '越前龙马': 'user',
            '手冢国光': 'userCheck',
            '乾贞治': 'userCog',
            '不二周助': 'userRound',
            '喜羊羊': 'user',
            '懒羊羊': 'userRound',
            '灰太狼': 'userSearch',
            '慢羊羊': 'userCog',
            '柯南': 'userSearch',
            '小兰': 'userCheck',
            '毛利小五郎': 'userCog',
            '服部平次': 'userRound',
            '琴酒': 'userSearch'
        },
        location: {
            default: 'mapPin',
            BATH: 'bath',
            BED: 'bed',
            THEATER: 'tv',
            '巨大的浴室': 'bath',
            '卧室': 'bed',
            '放映室': 'tv',
            '珍本藏书室': 'library',
            '阅览大厅': 'landmark',
            '地下档案库': 'archive',
            '网球场': 'target',
            '社办': 'doorOpen',
            '更衣室': 'shirt',
            '天台': 'building2',
            '狼堡': 'castle',
            '羊村学校': 'school',
            '小河边': 'waves',
            '实验室': 'flaskConical',
            '侦探所': 'house',
            '咖啡厅': 'coffee',
            '饭店天台': 'building2',
            '米花公园': 'mapPin',
            '东都铁塔': 'towerControl'
        },
        weapon: {
            default: 'hammer',
            FORK: 'forkKnife',
            PIPE: 'cylinder',
            CANDLE: 'candle',
            '一把餐叉': 'forkKnife',
            '一根铅管': 'cylinder',
            '有分量的蜡烛': 'candle',
            '沉重的字典': 'book',
            '拆信刀': 'knife',
            '古董台灯': 'lampDesk',
            '红色球拍': 'trophy',
            '蓝色球拍': 'trophy',
            '绷带': 'scissors',
            '特制乾汁': 'flaskConical',
            '平底锅': 'hammer',
            '青草蛋糕': 'flame',
            '隐形药水': 'flaskConical',
            '捕兽夹': 'key',
            '追踪眼镜': 'glasses',
            '空手道': 'dumbbell',
            '啤酒': 'beer',
            '武士刀': 'sword',
            '狙击枪': 'target'
        }
    };

    function render(name, options = {}) {
        const iconName = ICONS[name] ? name : 'circleHelp';
        const className = options.className ? ` ${options.className}` : '';
        const label = options.label ? ` aria-label="${escapeAttr(options.label)}"` : ' aria-hidden="true"';
        return `<svg class="lucide-icon lucide-${toKebab(iconName)}${className}" ${DEFAULT_ATTRS}${label} focusable="false">${ICONS[iconName]}</svg>`;
    }

    function resolveObjectIcon(obj, type) {
        const group = OBJECT_ICON_MAP[type] || {};
        return group[obj && obj.id] || group[obj && obj.name] || group.default || 'circleHelp';
    }

    function escapeAttr(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }

    function toKebab(value) {
        return String(value).replace(/[A-Z]/g, char => `-${char.toLowerCase()}`).replace(/^-/, '');
    }

    window.CleverGridIcons = {
        icons: ICONS,
        objectIconMap: OBJECT_ICON_MAP,
        toolIconMap: TOOL_ICON_MAP,
        render,
        resolveObjectIcon
    };
})();
