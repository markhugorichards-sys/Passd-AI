/* Passd-AI Cookie Consent v1.0 — public/cookie-consent.js */
(function(){
  var GA='G-PE2Q65SS7G'; // ← swap with your GA4 ID later
  var K='passd_consent',V='1';
  var CSS='#pcb{position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#0d1f3c;border-top:1px solid #1e3a5f;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;color:#e2e8f0;padding:16px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;box-shadow:0 -4px 24px rgba(0,0,0,.4)}#pcb p{flex:1;min-width:220px;line-height:1.5;margin:0}#pcb a{color:#3b82f6}#pcb .pbr{display:flex;gap:10px;flex-wrap:wrap}#pcb button{cursor:pointer;border:none;border-radius:6px;padding:9px 18px;font-size:13px;font-weight:600;white-space:nowrap}#pcb button:hover{opacity:.85}#pca{background:#3b82f6;color:#fff}#pcr{background:#1e3a5f;color:#e2e8f0}#pcm{background:transparent;color:#94a3b8;border:1px solid #1e3a5f!important;padding:8px 14px!important}#pmm{display:none;position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.7);align-items:center;justify-content:center}#pmm.open{display:flex}#pmb{background:#0d1f3c;border:1px solid #1e3a5f;border-radius:12px;max-width:480px;width:90%;padding:28px;color:#e2e8f0}#pmb h2{font-size:1.1rem;margin-bottom:16px;color:#fff}.ptr{display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-bottom:1px solid #1e3a5f}.ptr:last-of-type{border-bottom:none}.pti strong{display:block;font-size:.9rem;margin-bottom:3px;color:#fff}.pti span{font-size:.8rem;color:#94a3b8;line-height:1.4}.ptog{position:relative;width:42px;height:24px;flex-shrink:0;margin-top:2px}.ptog input{opacity:0;width:0;height:0}.psl{position:absolute;inset:0;background:#1e3a5f;border-radius:24px;cursor:pointer;transition:.2s}.psl:before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;background:#94a3b8;border-radius:50%;transition:.2s}.ptog input:checked+.psl{background:#3b82f6}.ptog input:checked+.psl:before{transform:translateX(18px);background:#fff}.ptog input:disabled+.psl{opacity:.5;cursor:not-allowed}#psp{background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:10px 22px;font-size:.9rem;font-weight:600;cursor:pointer;margin-top:20px;width:100%}';
  function getC(){try{var r=localStorage.getItem(K);if(!r)return null;var p=JSON.parse(r);return p.version===V?p:null;}catch(e){return null;}}
  function saveC(a,m){var c={version:V,timestamp:new Date().toISOString(),analytics:!!a,marketing:!!m};localStorage.setItem(K,JSON.stringify(c));apply(c);}
  function apply(c){
    if(typeof gtag==='function'){gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied'});}
    if(c.analytics&&!window._pgaL){window._pgaL=true;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};gtag('js',new Date());gtag('config',GA,{anonymize_ip:true});}
  }
  function hide(){var b=document.getElementById('pcb');if(b)b.style.display='none';}
  function openM(){document.getElementById('pmm').classList.add('open');}
  function closeM(){document.getElementById('pmm').classList.remove('open');}
  function render(){
    var s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
    var b=document.createElement('div');b.id='pcb';
    b.innerHTML='<p>We use cookies to improve your experience. <a href="/cookies.html">Cookie Policy</a> &nbsp;|&nbsp; <a href="/privacy.html">Privacy Policy</a></p><div class="pbr"><button id="pca">Accept all</button><button id="pcr">Reject non-essential</button><button id="pcm">Manage</button></div>';
    document.body.appendChild(b);
    var m=document.createElement('div');m.id='pmm';m.setAttribute('role','dialog');
    m.innerHTML='<div id="pmb"><h2>Cookie Preferences</h2><div class="ptr"><div class="pti"><strong>Strictly Necessary</strong><span>Required for the site to work. Always active.</span></div><label class="ptog"><input type="checkbox" checked disabled><span class="psl"></span></label></div><div class="ptr"><div class="pti"><strong>Analytics</strong><span>Helps us understand usage. Data is anonymised.</span></div><label class="ptog"><input type="checkbox" id="pa"><span class="psl"></span></label></div><div class="ptr"><div class="pti"><strong>Marketing</strong><span>Enables relevant ads on other sites.</span></div><label class="ptog"><input type="checkbox" id="pm"><span class="psl"></span></label></div><button id="psp">Save preferences</button></div>';
    document.body.appendChild(m);
    document.getElementById('pca').onclick=function(){saveC(true,true);hide();};
    document.getElementById('pcr').onclick=function(){saveC(false,false);hide();};
    document.getElementById('pcm').onclick=openM;
    document.getElementById('psp').onclick=function(){saveC(document.getElementById('pa').checked,document.getElementById('pm').checked);closeM();hide();};
    m.onclick=function(e){if(e.target===m)closeM();};
  }
  window.passdCookieSettings=function(){var b=document.getElementById('pcb');if(b)b.style.display='flex';openM();};
  window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
  var ex=getC();
  if(ex){apply(ex);}else{if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',render);}else{render();}}
})();
