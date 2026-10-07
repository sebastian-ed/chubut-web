(() => {
  const defaults = window.CHUBUT_DEFAULT_CONTENT;
  let cms = structuredClone(defaults);
  let lang = localStorage.getItem('chubut-lang') || defaults.site.defaultLanguage || 'en';
  let cmsPreviewMode = false;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function mergeDeep(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.entries(source).forEach(([key, value]) => {
      if (Array.isArray(value)) target[key] = value;
      else if (value && typeof value === 'object') target[key] = mergeDeep(target[key] && typeof target[key] === 'object' ? target[key] : {}, value);
      else if (value !== undefined && value !== null) target[key] = value;
    });
    return target;
  }

  function c(section) {
    return section?.content?.[lang] || section?.content?.en || {};
  }
  function itemContent(item) {
    return item?.content?.[lang] || item?.content?.en || {};
  }
  function label(nav) {
    return nav?.labels?.[lang] || nav?.labels?.en || '';
  }
  function youtubeId(value='') {
    const raw=String(value||'').trim(); if(!raw)return '';
    if(/^[A-Za-z0-9_-]{6,20}$/.test(raw) && !raw.includes('/'))return raw;
    try{const u=new URL(raw);if(u.hostname.includes('youtu.be'))return u.pathname.split('/').filter(Boolean)[0]||'';if(u.searchParams.get('v'))return u.searchParams.get('v');const m=u.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/);return m?.[1]||''}catch(_e){const m=raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,20})/);return m?.[1]||raw}
  }
  function mediaDefaults(type='image',context='visual'){
    const interactive=context==='videoGallery'||context==='additional';
    return {fit:'cover',positionX:'center',positionY:'center',zoom:100,frameRatio:'auto',autoplay:!interactive,mute:true,loop:true,controls:interactive,captions:false,cleanEmbed:!interactive,startAt:0,endAt:0};
  }
  function resolvedMediaOptions(type,options={},context='visual'){return {...mediaDefaults(type,context),...(options||{})}}
  function posPct(value,axis='x'){if(value==='left'||value==='top')return 0;if(value==='right'||value==='bottom')return 100;return 50}
  function frameRatioStyle(value){return value&&value!=='auto'?`aspect-ratio:${String(value).replace('/',' / ')};`:''}
  function mediaElement(type, src, className, poster='', options={}, context='visual') {
    const source=String(src||''); if(!source)return `<div class="${esc(className)} media-object media-empty"></div>`;
    const o=resolvedMediaOptions(type,options,context),x=posPct(o.positionX,'x'),y=posPct(o.positionY,'y'),zoom=Math.max(.7,Math.min(2.2,(Number(o.zoom)||100)/100));
    if(type==='youtube'){
      const id=youtubeId(source),clean=Boolean(o.cleanEmbed),controls=clean?false:Boolean(o.controls),autoplay=Boolean(o.autoplay),mute=Boolean(o.mute),loop=Boolean(o.loop);
      const params=new URLSearchParams({autoplay:autoplay?'1':'0',mute:mute?'1':'0',controls:controls?'1':'0',playsinline:'1',rel:'0',modestbranding:'1',iv_load_policy:'3',cc_load_policy:o.captions?'1':'0',fs:controls?'1':'0'});
      if(loop){params.set('loop','1');params.set('playlist',id)}
      if(Number(o.startAt)>0)params.set('start',String(Math.floor(Number(o.startAt))));
      if(Number(o.endAt)>0)params.set('end',String(Math.floor(Number(o.endAt))));
      if(clean)params.set('disablekb','1');
      const fit=o.fit==='contain'?'contain':'cover';
      const left=fit==='contain'?0:(o.positionX==='left'?0:o.positionX==='right'?-80:-40),top=fit==='contain'?0:(o.positionY==='top'?0:o.positionY==='bottom'?-30:-15);
      const width=fit==='contain'?100:180,height=fit==='contain'?100:130;
      return `<iframe class="${esc(className)} media-object visual-youtube ${clean?'youtube-clean':''}" style="width:${width}%;height:${height}%;left:${left}%;top:${top}%;transform:scale(${zoom});transform-origin:${x}% ${y}%;" src="https://www.youtube-nocookie.com/embed/${esc(id)}?${params.toString()}" allow="autoplay; encrypted-media; picture-in-picture" title="Chubut video" loading="lazy"></iframe>`;
    }
    if(type==='video'){
      return `<video class="${esc(className)} media-object visual-video" style="object-fit:${o.fit==='contain'?'contain':'cover'};object-position:${x}% ${y}%;transform:scale(${zoom});transform-origin:${x}% ${y}%;" ${o.autoplay?'autoplay':''} ${o.mute?'muted':''} ${o.loop?'loop':''} playsinline ${o.controls?'controls':''} preload="metadata" ${poster?`poster="${esc(poster)}"`:''} src="${esc(source)}"></video>`;
    }
    return `<div class="${esc(className)} media-object visual-image" style="background-image:url('${esc(source)}');background-size:${o.fit==='contain'?'contain':'cover'};background-position:${x}% ${y}%;background-repeat:no-repeat;transform:scale(${zoom});transform-origin:${x}% ${y}%;"></div>`;
  }
  function primaryMedia(section,className,options={}) {
    const m=section?.media||{};const type=m.type||(m.youtubeId?'youtube':(m.video?'video':'image'));
    const src=type==='youtube'?(m.youtubeId||m.src||''):type==='video'?(m.video||m.src||''):(m.image||m.src||'');
    return mediaElement(type,src,className,m.image||'',{...(m.options||{}),...(options||{})},'visual');
  }
  function itemVisual(item,className) {
    const type=item?.mediaType||'image';const src=item?.mediaSrc||(type==='image'?item?.image:'')||item?.image||'';
    return mediaElement(type,src,className,item?.image||'',item?.mediaOptions||{},'visual');
  }
  function renderAdditionalMedia(section){
    if(section?.type==='heroVideo')return '';
    const items=section?.mediaGallery||[];if(!items.length)return '';
    const mode=section.mediaGalleryMode||'grid';
    return `<section class="section additional-media-section mode-${esc(mode)}" aria-label="${lang==='es'?'Galería multimedia':'Media gallery'}"><div class="wrap additional-media-grid">${items.map((m,i)=>{const o=resolvedMediaOptions(m.type||'image',m.options||{},'additional');return `<figure class="additional-media-card additional-${esc(m.type||'image')}" style="${frameRatioStyle(o.frameRatio)}">${mediaElement(m.type||'image',m.src||'','additional-media-object',m.poster||'',m.options||{},'additional')}<figcaption>${String(i+1).padStart(2,'0')}</figcaption></figure>`}).join('')}</div></section>`;
  }

  function fontQuery(font) {
    return encodeURIComponent(font).replace(/%20/g, '+');
  }

  function applyTheme() {
    const t = cms.theme || defaults.theme;
    const root = document.documentElement;
    const vars = {
      '--bg': t.background, '--surface': t.surface, '--surface-alt': t.surfaceAlt, '--text': t.text,
      '--muted': t.muted, '--line': t.line, '--accent': t.accent, '--accent-text': t.accentText,
      '--max-width': `${Number(t.maxWidth) || 1440}px`, '--radius': `${Number(t.radius) || 0}px`, '--section-space': `${Number(t.sectionSpace) || 132}px`,
      '--body-font': `'${t.bodyFont || 'DM Sans'}',system-ui,sans-serif`, '--heading-font': `'${t.headingFont || 'Instrument Serif'}',Georgia,serif`
    };
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    const fontLink = $('#googleFonts');
    if (fontLink) fontLink.href = `https://fonts.googleapis.com/css2?family=${fontQuery(t.bodyFont || 'DM Sans')}:wght@300;400;500;600;700&family=${fontQuery(t.headingFont || 'Instrument Serif')}:ital@0;1&display=swap`;
    document.body.dataset.motion = t.motion || 'smooth';
  }

  function renderHeader() {
    const navItems = (cms.navigation || []).filter(Boolean);
    const nav = navItems.filter(n => !n.featured).map(n => `<a href="${esc(n.href || '#')}">${esc(label(n))}</a>`).join('');
    const featured = navItems.find(n => n.featured);
    const site = cms.site || defaults.site;
    $('#siteHeader').innerHTML = `
      <div class="header-bar">
        <a class="brand" href="#top" aria-label="${esc(site.name)} home"><strong>${esc(site.name)}</strong><span>${esc(site.strap)}</span></a>
        <nav class="desktop-nav" aria-label="Primary navigation">${nav}</nav>
        <div class="header-actions">
          <div class="language-switch"><button data-lang="en">EN</button><span>/</span><button data-lang="es">ES</button></div>
          ${featured ? `<a class="header-cta" href="${esc(featured.href)}">${esc(label(featured))}<span>↗</span></a>` : ''}
          <button class="menu-button" id="menuButton" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
        </div>
      </div>`;

    $('#menuPanel').innerHTML = `
      <div class="menu-panel-inner">
        <div class="menu-panel-top"><span>${esc(site.strap)}</span><button id="menuClose" aria-label="Close menu">×</button></div>
        <nav>${navItems.map((n, i) => `<a href="${esc(n.href || '#')}"><span>0${i + 1}</span><strong>${esc(label(n))}</strong><b>↗</b></a>`).join('')}</nav>
        <p>${lang === 'es' ? 'Fauna atlántica. Estepa patagónica. Bosques antiguos. Una provincia extraordinaria.' : 'Atlantic wildlife. Patagonian steppe. Ancient forests. One extraordinary province.'}</p>
      </div>`;

    $$('.language-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.onclick = () => setLanguage(btn.dataset.lang);
    });
    const panel = $('#menuPanel');
    const button = $('#menuButton');
    const close = () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); button?.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); };
    button.onclick = () => { const open = !panel.classList.contains('open'); panel.classList.toggle('open', open); panel.setAttribute('aria-hidden', String(!open)); button.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open); };
    $('#menuClose').onclick = close;
    $$('a', panel).forEach(a => a.onclick = close);
  }

  function renderHero(s) {
    const x = c(s), st = s.settings || {}, youtubeId = s.media?.youtubeId || '';
    return `<section class="hero-video" id="${esc(st.anchor || s.id)}" style="--hero-overlay:${Math.min(90, Math.max(0, Number(st.overlay) || 58)) / 100};--hero-height:${Number(st.minHeight) || 92}svh">
      <div class="hero-video-media" aria-hidden="true">
        ${mediaElement('youtube',youtubeId,'hero-youtube-embed','',s.media?.options||{},'hero')}
      </div>
      <div class="hero-video-overlay"></div>
      <div class="hero-content wrap align-${esc(st.align || 'left')}">
        <div class="hero-copy reveal">
          <span class="eyebrow light">${x.eyebrow || ''}</span>
          <h1>${x.title || ''}</h1>
          <p>${esc(x.body || '')}</p>
          <div class="hero-buttons">
            ${x.cta ? `<a class="button button-light" href="${esc(x.ctaHref || '#')}">${esc(x.cta)} <span>↘</span></a>` : ''}
            ${x.secondary ? `<a class="text-link light" href="${esc(x.secondaryHref || '#')}">${esc(x.secondary)} <span>→</span></a>` : ''}
          </div>
        </div>
        <div class="hero-meta"><span>CHUBUT</span><strong>${esc(x.meta || '')}</strong></div>
      </div>
      <a class="scroll-cue" href="#discover"><span>${lang === 'es' ? 'EXPLORAR' : 'EXPLORE'}</span><i></i></a>
    </section>`;
  }

  function renderQuickLinks(s) {
    const st = s.settings || {};
    return `<section class="quick-links" id="${esc(st.anchor || s.id)}"><div class="wrap quick-links-grid" style="--cols:${Number(st.columns) || 3}">${(s.items || []).map(item => { const x = itemContent(item); return `<a href="${esc(item.href || '#')}" class="quick-link"><span>${esc(item.icon || '')}</span><div><small>${esc(x.eyebrow || '')}</small><strong>${esc(x.title || '')}</strong></div><b>→</b></a>`; }).join('')}</div></section>`;
  }

  function renderEditorialIntro(s) {
    const x = c(s), st = s.settings || {};
    return `<section class="editorial-section" id="${esc(st.anchor || s.id)}">
      <div class="wrap editorial-heading reveal"><span class="section-index">01</span><div><span class="eyebrow">${x.eyebrow || ''}</span><h2>${x.title || ''}</h2><p>${esc(x.body || '')}</p>${x.cta ? `<a class="under-link" href="${esc(x.ctaHref || '#')}">${esc(x.cta)} <span>↗</span></a>` : ''}</div></div>
      <div class="editorial-image-block reveal ${st.imagePosition === 'left' ? 'media-left' : ''}">
        ${primaryMedia(s,'editorial-image')}
        <div class="editorial-note"><small>${lang === 'es' ? 'PATAGONIA, SIN FILTROS' : 'PATAGONIA, UNFILTERED'}</small><h3>${x.sideTitle || ''}</h3><p>${esc(x.sideBody || '')}</p></div>
      </div>
    </section>`;
  }

  function renderCardGrid(s) {
    const x = c(s), st = s.settings || {};
    return `<section class="section cards-section" id="${esc(st.anchor || s.id)}"><div class="wrap section-head reveal"><div><span class="eyebrow">${x.eyebrow || ''}</span><h2>${x.title || ''}</h2></div><p>${esc(x.body || '')}</p></div>
      <div class="wrap card-grid reveal" style="--cols:${Number(st.columns) || 4}">${(s.items || []).map((item, i) => { const y = itemContent(item); return `<a class="image-card ratio-${esc(st.cardRatio || 'portrait')}" href="${esc(item.href || '#')}">${itemVisual(item,'image-card-media')}<div class="image-card-overlay"></div><span class="card-number">${String(i + 1).padStart(2, '0')}</span><div class="image-card-copy"><small>${esc(y.eyebrow || '')}</small><h3>${esc(y.title || '')}</h3><p>${esc(y.body || '')}</p></div><b>↗</b></a>`; }).join('')}</div></section>`;
  }

  function renderSplitFeature(s) {
    const x = c(s), st = s.settings || {};
    const media = `<div class="split-media reveal">${primaryMedia(s,'split-media-object')}<span>${esc(x.eyebrow || '')}</span></div>`;
    const copy = `<div class="split-copy reveal"><span class="eyebrow">${x.eyebrow || ''}</span><h2>${x.title || ''}</h2><p>${esc(x.body || '')}</p><div class="feature-facts"><div><small>${esc(x.fact1Label || '')}</small><strong>${esc(x.fact1Value || '')}</strong></div><div><small>${esc(x.fact2Label || '')}</small><strong>${esc(x.fact2Value || '')}</strong></div></div></div>`;
    return `<section class="split-feature tone-${esc(st.tone || 'dark')}" id="${esc(st.anchor || s.id)}">${st.imageSide === 'right' ? copy + media : media + copy}</section>`;
  }

  function renderVideoGallery(s) {
    const x = c(s), st = s.settings || {}, items = s.items || [], first = items[0];
    const firstMedia = first ? videoMedia(first, true) : '';
    return `<section class="section video-section" id="${esc(st.anchor || s.id)}"><div class="wrap section-head reveal"><div><span class="eyebrow">${x.eyebrow || ''}</span><h2>${x.title || ''}</h2></div><p>${esc(x.body || '')}</p></div>
      <div class="wrap video-stage-wrap reveal">
        <div class="video-stage" id="videoStage" style="${frameRatioStyle(resolvedMediaOptions(first?.type==='youtube'?'youtube':'video',first?.mediaOptions||{},'videoGallery').frameRatio)}">${firstMedia}<div class="video-stage-overlay"></div><div class="video-stage-copy"><small id="videoStageEyebrow">${esc(first ? itemContent(first).eyebrow || '' : '')}</small><h3 id="videoStageTitle">${esc(first ? itemContent(first).title || '' : '')}</h3></div></div>
        <div class="video-thumbs" style="--cols:${Number(st.columns) || 3}">${items.map((item, i) => { const y = itemContent(item); return `<button type="button" class="video-thumb ${i === 0 ? 'active' : ''}" data-video-index="${i}"><span class="video-thumb-image" style="background-image:url('${esc(item.image || '')}')"><i>▶</i></span><small>${esc(y.eyebrow || '')}</small><strong>${esc(y.title || '')}</strong></button>`; }).join('')}</div>
      </div></section>`;
  }

  function videoMedia(item, autoplay = false) {
    if (!item) return '';
    const type=item.type==='youtube'?'youtube':'video',opts={...(item.mediaOptions||{})};
    if(autoplay && opts.autoplay===undefined)opts.autoplay=true;
    return mediaElement(type,item.src||'','stage-media',item.image||'',opts,'videoGallery');
  }

  function renderDestinationGrid(s) {
    const x = c(s), st = s.settings || {};
    return `<section class="section destination-section" id="${esc(st.anchor || s.id)}"><div class="wrap section-head reveal"><div><span class="eyebrow">${x.eyebrow || ''}</span><h2>${x.title || ''}</h2></div><p>${esc(x.body || '')}</p></div>
      <div class="wrap destination-grid reveal" style="--cols:${Number(st.columns) || 4}">${(s.items || []).map((item, i) => { const y = itemContent(item); return `<article class="destination-card size-${esc(item.size || 'normal')}">${itemVisual(item,'destination-media')}<div class="destination-shade"></div><span class="destination-number">${String(i + 1).padStart(2, '0')}</span><div class="destination-copy"><small>${esc(y.eyebrow || '')}</small><h3>${esc(y.title || '')}</h3><p>${esc(y.body || '')}</p></div></article>`; }).join('')}</div></section>`;
  }

  function renderFullBleed(s) {
    const x = c(s), st = s.settings || {};
    return `<section class="full-bleed" id="${esc(st.anchor || s.id)}" style="--story-overlay:${Math.min(90, Math.max(0, Number(st.overlay) || 48)) / 100}"><div class="full-bleed-media">${primaryMedia(s,'full-bleed-media-object')}</div><div class="full-bleed-shade"></div><div class="wrap full-bleed-copy align-${esc(st.align || 'left')} reveal"><span class="eyebrow light">${x.eyebrow || ''}</span><h2>${x.title || ''}</h2><p>${esc(x.body || '')}</p>${x.cta ? `<a class="button button-light" href="${esc(x.ctaHref || '#')}">${esc(x.cta)} <span>↗</span></a>` : ''}</div></section>`;
  }

  function renderPlanner(s) {
    const x = c(s), st = s.settings || {};
    return `<section class="section planner-section" id="${esc(st.anchor || s.id)}"><div class="wrap planner-grid"><div class="planner-copy reveal"><span class="eyebrow">${x.eyebrow || ''}</span><h2>${x.title || ''}</h2><p>${esc(x.body || '')}</p><div class="planner-notes"><div><span>01</span><p><strong>${esc(x.note1Title || '')}</strong><small>${esc(x.note1Body || '')}</small></p></div><div><span>02</span><p><strong>${esc(x.note2Title || '')}</strong><small>${esc(x.note2Body || '')}</small></p></div></div></div>
      <form class="trip-form reveal" id="tripForm"><div class="form-head"><small>${esc(x.formEyebrow || '')}</small><strong>${esc(x.formTitle || '')}</strong></div><label><span>${esc(x.nameLabel || '')}</span><input name="name" required maxlength="160" placeholder="${esc(x.namePlaceholder || '')}"></label><label><span>${esc(x.interestLabel || '')}</span><select name="interest">${(s.formOptions || []).map(o => `<option value="${esc(o.value)}">${esc(o.labels?.[lang] || o.labels?.en || o.value)}</option>`).join('')}</select></label><button class="button button-accent" type="submit">${esc(x.submit || '')} <span>↗</span></button><p class="form-note" id="formNote"></p></form></div></section>`;
  }

  const renderers = { heroVideo: renderHero, quickLinks: renderQuickLinks, editorialIntro: renderEditorialIntro, cardGrid: renderCardGrid, splitFeature: renderSplitFeature, videoGallery: renderVideoGallery, destinationGrid: renderDestinationGrid, fullBleed: renderFullBleed, planner: renderPlanner };

  function renderSections() {
    $('#main').innerHTML = (cms.sections || []).filter(s => s.enabled !== false).map(s => renderers[s.type] ? renderers[s.type](s) + renderAdditionalMedia(s) : '').join('');
  }

  function renderFooter() {
    const site = cms.site || defaults.site;
    const items = cms.navigation || [];
    $('#siteFooter').innerHTML = `<div class="wrap footer-top"><div class="footer-brand"><a class="brand brand-footer" href="#top"><strong>${esc(site.name)}</strong><span>${esc(site.strap)}</span></a><p>${esc(site.footerText?.[lang] || site.footerText?.en || '')}</p></div><nav>${items.slice(0, 3).map(n => `<a href="${esc(n.href || '#')}">${esc(label(n))}</a>`).join('')}</nav><nav>${items.slice(3).map(n => `<a href="${esc(n.href || '#')}">${esc(label(n))}</a>`).join('')}</nav><div class="footer-lang"><small>${lang === 'es' ? 'IDIOMA' : 'LANGUAGE'}</small><button data-lang="en">English</button><button data-lang="es">Español</button></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} CHUBUT · PATAGONIA ARGENTINA</span><span>${lang === 'es' ? 'OCÉANO / ESTEPA / ANDES / TIEMPO PROFUNDO' : 'OCEAN / STEPPE / ANDES / DEEP TIME'}</span><a href="admin/">CMS ↗</a></div>`;
    $$('.footer-lang button').forEach(btn => { btn.classList.toggle('active', btn.dataset.lang === lang); btn.onclick = () => setLanguage(btn.dataset.lang); });
  }

  function setupVideoGallery() {
    const section = (cms.sections || []).find(s => s.type === 'videoGallery' && s.enabled !== false);
    if (!section) return;
    $$('.video-thumb').forEach(btn => btn.onclick = () => {
      const index = Number(btn.dataset.videoIndex || 0), item = section.items?.[index];
      if (!item) return;
      const stage = $('#videoStage');
      const old = $('.stage-media', stage);
      if (old) old.remove();
      stage.insertAdjacentHTML('afterbegin', videoMedia(item, true));
      stage.style.aspectRatio = resolvedMediaOptions(item.type==='youtube'?'youtube':'video',item.mediaOptions||{},'videoGallery').frameRatio==='auto' ? '' : resolvedMediaOptions(item.type==='youtube'?'youtube':'video',item.mediaOptions||{},'videoGallery').frameRatio.replace('/',' / ');
      $$('.video-thumb').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      const y = itemContent(item);
      $('#videoStageEyebrow').textContent = y.eyebrow || '';
      $('#videoStageTitle').textContent = y.title || '';
    });
  }

  function setupForm() {
    const form = $('#tripForm');
    if (!form) return;
    const planner = (cms.sections || []).find(s => s.type === 'planner' && s.enabled !== false);
    form.onsubmit = async e => {
      e.preventDefault();
      const note = $('#formNote'), submit = $('button[type="submit"]', form), x = c(planner);
      note.textContent = ''; submit.disabled = true;
      const fd = new FormData(form);
      try {
        await window.ChubutDB.saveLead({ name: String(fd.get('name') || '').trim(), interest: String(fd.get('interest') || ''), language: lang, source: 'public-home' });
        note.textContent = x.success || 'Saved.'; note.className = 'form-note success'; form.reset();
      } catch (err) {
        note.textContent = window.ChubutDB.configured ? (x.error || 'Error') : (lang === 'es' ? 'Supabase todavía no está configurado.' : 'Supabase is not configured yet.');
        note.className = 'form-note error';
      } finally { submit.disabled = false; }
    };
  }

  function setupReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || cms.theme?.motion === 'off') { els.forEach(el => el.classList.add('visible')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); } }), { threshold: .08, rootMargin: '0px 0px -40px' });
    els.forEach(el => io.observe(el));
  }

  function setupHeaderScroll() {
    const header = $('#siteHeader');
    const update = () => header.classList.toggle('scrolled', window.scrollY > 42);
    if (!window.__chubutHeaderScrollBound) { addEventListener('scroll', update, { passive: true }); window.__chubutHeaderScrollBound = true; } update();
  }

  function applySeo() {
    const seo = cms.site?.seo?.[lang] || cms.site?.seo?.en || {};
    document.documentElement.lang = lang;
    document.title = seo.title || defaults.site.seo.en.title;
    $('#metaDescription')?.setAttribute('content', seo.description || '');
    $('[data-ui="skip"]')?.replaceChildren(document.createTextNode(lang === 'es' ? 'Ir al contenido' : 'Skip to content'));
  }

  function setLanguage(next) {
    if (!['en', 'es'].includes(next)) next = 'en';
    lang = next; localStorage.setItem('chubut-lang', next); renderAll();
  }

  function renderAll() {
    applyTheme(); applySeo(); renderHeader(); renderSections(); renderFooter(); setupVideoGallery(); setupForm(); setupReveal(); setupHeaderScroll();
  }

  addEventListener('message', event => {
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'chubut:cms-preview' && msg.payload) {
      cmsPreviewMode = true;
      cms = mergeDeep(structuredClone(defaults), msg.payload);
      if (msg.lang === 'en' || msg.lang === 'es') lang = msg.lang;
      const y = window.scrollY;
      renderAll();
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
    if (msg.type === 'chubut:cms-preview-focus' && msg.anchor) {
      requestAnimationFrame(() => document.getElementById(msg.anchor)?.scrollIntoView({behavior:'smooth',block:'start'}));
    }
  });

  async function boot() {
    try {
      const remote = await window.ChubutDB.loadHomeContent();
      if (!cmsPreviewMode && remote) cms = mergeDeep(structuredClone(defaults), window.CHUBUT_MIGRATE_CONTENT ? window.CHUBUT_MIGRATE_CONTENT(remote) : remote);
    } catch (err) { console.warn('Using bundled content:', err); }
    if (!cms.site?.languages?.includes(lang)) lang = cms.site?.defaultLanguage || 'en';
    renderAll();
  }

  boot();
})();
