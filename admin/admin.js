(() => {
  const db = window.ChubutDB;
  const defaults = window.CHUBUT_DEFAULT_CONTENT;
  let state = structuredClone(defaults);
  let dirty = false;
  let editingIndex = null;
  let draftSection = null;
  let drawerTab = 'content';
  let mediaAssets = [];
  let leads = [];
  let revisions = [];
  let livePreviewLang = 'en';
  let livePreviewDevice = 'desktop';
  let livePreviewTimer = null;
  const previewableViews = new Set(['dashboard','content','design','navigation','settings']);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v = '') => String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clone = v => structuredClone(v);
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;

  const titles = {dashboard:'Inicio',content:'Contenido',design:'Diseño',navigation:'Navegación',media:'Medios',forms:'Consultas',history:'Revisiones',settings:'Ajustes',preview:'Vista previa'};
  const typeMeta = {
    heroVideo:['▶','Hero con video','Video YouTube full screen con copy y CTA.'],
    quickLinks:['↗','Accesos rápidos','Atajos de planificación en columnas.'],
    editorialIntro:['¶','Intro editorial','Título grande, texto y fotografía editorial.'],
    cardGrid:['▦','Grilla de experiencias','Tarjetas fotográficas editables.'],
    splitFeature:['◧','Feature dividido','Imagen + contenido en dos columnas.'],
    videoGallery:['▷','Galería de videos','Player principal y miniaturas.'],
    destinationGrid:['▤','Grilla de destinos','Mosaico visual de destinos.'],
    fullBleed:['□','Historia full bleed','Imagen a pantalla completa con contenido.'],
    planner:['✦','Formulario / planner','Bloque editorial con formulario de consultas.']
  };

  const themeColorLabels = {background:'Fondo principal',surface:'Superficie',surfaceAlt:'Superficie secundaria',text:'Texto principal',muted:'Texto secundario',line:'Líneas / bordes',accent:'Acento',accentText:'Texto sobre acento'};
  const fontOptionsBody = ['DM Sans','Inter','Manrope','Plus Jakarta Sans','Montserrat','Lato','Source Sans 3','Space Grotesk'];
  const fontOptionsHeading = ['Instrument Serif','Newsreader','Fraunces','Cormorant Garamond','Playfair Display','DM Serif Display','Libre Baskerville'];

  function mergeDeep(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.entries(source).forEach(([k,v]) => {
      if (Array.isArray(v)) target[k] = v;
      else if (v && typeof v === 'object') target[k] = mergeDeep(target[k] && typeof target[k] === 'object' ? target[k] : {}, v);
      else if (v !== undefined && v !== null) target[k] = v;
    });
    return target;
  }

  function getPath(obj, path) { return path.split('.').reduce((o,k) => o?.[k], obj); }
  function setPath(obj, path, value) {
    const keys = path.split('.'); let cur = obj;
    keys.slice(0,-1).forEach(k => { if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; });
    cur[keys.at(-1)] = value;
  }

  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2300); }
  function markDirty() { dirty = true; $('#dirtyBadge').classList.remove('hidden'); $('#saveState').textContent = 'Sin publicar'; scheduleLivePreview(); }
  function clearDirty() { dirty = false; $('#dirtyBadge').classList.add('hidden'); $('#saveState').textContent = 'Publicado'; }

  function previewState() {
    const next = clone(state);
    if (editingIndex !== null && draftSection && $('#editorDrawer')?.classList.contains('open') && next.sections?.[editingIndex]) next.sections[editingIndex] = clone(draftSection);
    return next;
  }
  function pushLivePreview(focusAnchor = '') {
    const frame = $('#livePreviewFrame');
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type:'chubut:cms-preview', payload:previewState(), lang:livePreviewLang }, '*');
    if (focusAnchor) setTimeout(() => frame.contentWindow?.postMessage({ type:'chubut:cms-preview-focus', anchor:focusAnchor }, '*'), 70);
  }
  function scheduleLivePreview() {
    clearTimeout(livePreviewTimer);
    livePreviewTimer = setTimeout(() => pushLivePreview(), 90);
  }
  function updateLivePreviewVisibility(view) {
    const visible = previewableViews.has(view);
    $('#livePreviewPanel')?.classList.toggle('is-hidden', !visible);
    $('#adminWorkspace')?.classList.toggle('preview-off', !visible);
    if (visible) { requestAnimationFrame(resizeLivePreview); scheduleLivePreview(); }
  }
  function resizeLivePreview() {
    const stage = $('#livePreviewStage'), frame = $('#livePreviewFrame');
    if (!stage || !frame || stage.clientWidth < 20 || stage.clientHeight < 20) return;
    const widths = { desktop:1440, tablet:834, mobile:390 };
    const targetWidth = widths[livePreviewDevice] || 1440;
    const gap = 0;
    const scale = Math.min(1, Math.max(.28, (stage.clientWidth - gap) / targetWidth));
    const virtualHeight = Math.max(720, stage.clientHeight / scale);
    frame.style.width = `${targetWidth}px`;
    frame.style.height = `${virtualHeight}px`;
    frame.style.transform = `scale(${scale})`;
    frame.style.left = `${Math.max(0,(stage.clientWidth-targetWidth*scale)/2)}px`;
  }
  function setLivePreviewDevice(device) {
    livePreviewDevice = ['desktop','tablet','mobile'].includes(device) ? device : 'desktop';
    $$('[data-preview-device]').forEach(b => b.classList.toggle('active', b.dataset.previewDevice === livePreviewDevice));
    resizeLivePreview();
  }
  function setLivePreviewLanguage(next) {
    livePreviewLang = next === 'es' ? 'es' : 'en';
    $$('[data-preview-lang]').forEach(b => b.classList.toggle('active', b.dataset.previewLang === livePreviewLang));
    scheduleLivePreview();
  }

  function switchView(view) {
    $$('.admin-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    $$('.admin-view').forEach(p => p.classList.toggle('active', p.dataset.viewPanel === view));
    $('#viewTitle').textContent = titles[view] || 'CMS';
    if (view === 'media') loadMedia();
    if (view === 'forms') loadLeads();
    if (view === 'history') loadHistory();
    if (view === 'preview') refreshPreview();
    updateLivePreviewVisibility(view);
    $('.admin-sidebar').classList.remove('open');
  }

  function renderDashboard() {
    const sections = state.sections || [];
    const visible = sections.filter(s => s.enabled !== false).length;
    const stats = [
      ['SECCIONES', sections.length, `${visible} publicadas`],
      ['MEDIOS', mediaAssets.length, 'en Supabase Storage'],
      ['CONSULTAS', leads.length, 'últimos registros'],
      ['IDIOMAS', state.site?.languages?.length || 2, 'English + Español']
    ];
    $('#statsGrid').innerHTML = stats.map(x => `<div class="stat-card"><small>${x[0]}</small><strong>${x[1]}</strong><span>${x[2]}</span></div>`).join('');
    $('#dashboardSections').innerHTML = sections.slice(0,7).map(s => `<div class="mini-section"><span class="type-icon">${typeMeta[s.type]?.[0] || '□'}</span><div><strong>${esc(s.label || typeMeta[s.type]?.[1] || s.type)}</strong><small>${esc(s.type)} · #${esc(s.settings?.anchor || s.id)}</small></div><span>${s.enabled === false ? 'Oculta' : 'Visible'}</span></div>`).join('');
    $('#activityList').innerHTML = `<div class="activity-row"><span class="activity-dot ${db.configured?'good':''}"></span><div><strong>${db.configured?'Supabase conectado':'Supabase sin configurar'}</strong><small>${db.configured?'Contenido persistente y autenticación activos.':'Configurá URL y anon key para habilitar el CMS.'}</small></div></div><div class="activity-row"><span class="activity-dot good"></span><div><strong>Hero simplificado</strong><small>Solo video YouTube en portada.</small></div></div><div class="activity-row"><span class="activity-dot good"></span><div><strong>Sistema bilingüe</strong><small>English por defecto + Español.</small></div></div>`;
  }

  function renderSections() {
    const list = $('#sectionList');
    list.innerHTML = (state.sections || []).map((s,i) => `<article class="section-row" draggable="true" data-section-index="${i}"><span class="drag-handle" title="Arrastrar">⋮⋮</span><span class="section-type-icon">${typeMeta[s.type]?.[0] || '□'}</span><div class="section-row-main"><strong>${esc(s.label || typeMeta[s.type]?.[1] || s.type)}</strong><small>${esc(typeMeta[s.type]?.[1] || s.type)} · #${esc(s.settings?.anchor || s.id)}</small></div><span class="status-pill ${s.enabled===false?'off':''}">${s.enabled===false?'Oculta':'Visible'}</span><div class="row-actions"><button class="icon-btn" data-action="edit" title="Editar">✎</button><button class="icon-btn" data-action="toggle" title="Mostrar/ocultar">${s.enabled===false?'◉':'◌'}</button><button class="icon-btn" data-action="duplicate" title="Duplicar">⧉</button><button class="icon-btn danger" data-action="delete" title="Eliminar">×</button></div></article>`).join('');

    $$('.section-row', list).forEach(row => {
      row.addEventListener('dragstart', e => { row.classList.add('dragging'); e.dataTransfer.setData('text/plain', row.dataset.sectionIndex); });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', e => e.preventDefault());
      row.addEventListener('drop', e => {
        e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); const to = Number(row.dataset.sectionIndex); if (from === to) return;
        const [moved] = state.sections.splice(from,1); state.sections.splice(to,0,moved); markDirty(); renderSections(); renderDashboard();
      });
      row.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]'); if (!btn) return; const i = Number(row.dataset.sectionIndex); const action = btn.dataset.action;
        if (action === 'edit') openSectionEditor(i);
        if (action === 'toggle') { state.sections[i].enabled = state.sections[i].enabled === false; markDirty(); renderSections(); renderDashboard(); }
        if (action === 'duplicate') { const copy = clone(state.sections[i]); copy.id = uid(copy.type); copy.label = `${copy.label || typeMeta[copy.type]?.[1]} — copia`; state.sections.splice(i+1,0,copy); markDirty(); renderSections(); renderDashboard(); toast('Sección duplicada'); }
        if (action === 'delete') { if (confirm(`¿Eliminar “${state.sections[i].label || state.sections[i].type}”?`)) { state.sections.splice(i,1); markDirty(); renderSections(); renderDashboard(); } }
      });
    });
  }

  function renderDesign() {
    $('#themeColors').innerHTML = Object.keys(themeColorLabels).map(key => `<label class="field"><span>${themeColorLabels[key]}</span><div class="color-field"><input type="color" data-theme="${key}" value="${esc(state.theme[key] || '#000000')}"><input type="text" data-theme="${key}" value="${esc(state.theme[key] || '')}"></div></label>`).join('');
    $('#themeFonts').innerHTML = `${selectField('Fuente de texto','bodyFont',state.theme.bodyFont,fontOptionsBody)}${selectField('Fuente de títulos','headingFont',state.theme.headingFont,fontOptionsHeading)}`;
    $('#themeLayout').innerHTML = `${numberField('Ancho máximo','maxWidth',state.theme.maxWidth,980,1800,10,'px')}${numberField('Espacio entre secciones','sectionSpace',state.theme.sectionSpace,60,220,2,'px')}${numberField('Radio de bordes','radius',state.theme.radius,0,32,1,'px')}<label class="field"><span>Movimiento</span><select data-theme="motion"><option value="smooth" ${state.theme.motion==='smooth'?'selected':''}>Suave</option><option value="off" ${state.theme.motion==='off'?'selected':''}>Desactivado</option></select></label>`;
    $$('[data-theme]').forEach(el => el.addEventListener('input', () => { const key = el.dataset.theme; let value = el.value; if (el.type === 'number' || el.type === 'range') value = Number(value); state.theme[key] = value; if (el.type === 'color') { const text = el.parentElement.querySelector('input[type=text]'); if (text) text.value = value; } if (el.type === 'text' && el.parentElement?.querySelector('input[type=color]')) { const color = el.parentElement.querySelector('input[type=color]'); if (/^#[0-9a-f]{6}$/i.test(value)) color.value = value; } markDirty(); }));
  }
  function selectField(labelText,key,value,opts){return `<label class="field"><span>${labelText}</span><select data-theme="${key}">${opts.map(o=>`<option ${o===value?'selected':''}>${o}</option>`).join('')}</select></label>`}
  function numberField(labelText,key,value,min,max,step,suffix){return `<label class="field"><span>${labelText}</span><input type="number" data-theme="${key}" min="${min}" max="${max}" step="${step}" value="${Number(value)||0}"><small>${suffix||''}</small></label>`}

  function renderNavigation() {
    $('#navList').innerHTML = (state.navigation || []).map((n,i) => `<article class="repeater-card" data-nav-index="${i}"><div class="repeater-card-head"><strong>Enlace ${i+1}</strong><div><button class="icon-btn" data-nav-action="up">↑</button><button class="icon-btn" data-nav-action="down">↓</button><button class="icon-btn danger" data-nav-action="delete">×</button></div></div><div class="repeater-fields"><label class="field"><span>English</span><input data-nav-path="labels.en" value="${esc(n.labels?.en||'')}"></label><label class="field"><span>Español</span><input data-nav-path="labels.es" value="${esc(n.labels?.es||'')}"></label><label class="field"><span>Enlace</span><input data-nav-path="href" value="${esc(n.href||'')}"></label><label class="field checkbox-field"><input type="checkbox" data-nav-path="featured" ${n.featured?'checked':''}><span>CTA</span></label></div></article>`).join('');
    $$('.repeater-card[data-nav-index]').forEach(card => {
      const i=Number(card.dataset.navIndex);
      $$('[data-nav-path]',card).forEach(el=>el.addEventListener('input',()=>{setPath(state.navigation[i],el.dataset.navPath,el.type==='checkbox'?el.checked:el.value);markDirty()}));
      $$('[data-nav-action]',card).forEach(btn=>btn.onclick=()=>{const a=btn.dataset.navAction;if(a==='delete'){state.navigation.splice(i,1)}if(a==='up'&&i>0){[state.navigation[i-1],state.navigation[i]]=[state.navigation[i],state.navigation[i-1]]}if(a==='down'&&i<state.navigation.length-1){[state.navigation[i+1],state.navigation[i]]=[state.navigation[i],state.navigation[i+1]]}markDirty();renderNavigation()});
    });
  }

  function renderSettings() {
    $('#siteIdentity').innerHTML = `<label class="field"><span>Nombre</span><input data-site="name" value="${esc(state.site.name||'')}"></label><label class="field"><span>Bajada</span><input data-site="strap" value="${esc(state.site.strap||'')}"></label><label class="field"><span>Idioma por defecto</span><select data-site="defaultLanguage"><option value="en" ${state.site.defaultLanguage==='en'?'selected':''}>English</option><option value="es" ${state.site.defaultLanguage==='es'?'selected':''}>Español</option></select></label><label class="field"><span>Footer · English</span><textarea data-site="footerText.en">${esc(state.site.footerText?.en||'')}</textarea></label><label class="field"><span>Footer · Español</span><textarea data-site="footerText.es">${esc(state.site.footerText?.es||'')}</textarea></label>`;
    $('#seoEn').innerHTML = `<label class="field"><span>Title</span><input data-site="seo.en.title" value="${esc(state.site.seo?.en?.title||'')}"></label><label class="field"><span>Description</span><textarea data-site="seo.en.description">${esc(state.site.seo?.en?.description||'')}</textarea></label>`;
    $('#seoEs').innerHTML = `<label class="field"><span>Título</span><input data-site="seo.es.title" value="${esc(state.site.seo?.es?.title||'')}"></label><label class="field"><span>Descripción</span><textarea data-site="seo.es.description">${esc(state.site.seo?.es?.description||'')}</textarea></label>`;
    $$('[data-site]').forEach(el => el.addEventListener('input',()=>{setPath(state.site,el.dataset.site,el.value);markDirty()}));
  }

  async function loadMedia(){
    if(!db.configured){mediaAssets=[];renderMedia();return}
    try{mediaAssets=await db.listMedia();renderMedia();renderDashboard();updateMediaDatalist()}catch(e){toast('Error cargando medios: '+e.message)}
  }
  function updateMediaDatalist(){let d=$('#mediaUrls');if(!d){d=document.createElement('datalist');d.id='mediaUrls';document.body.appendChild(d)}d.innerHTML=mediaAssets.map(a=>`<option value="${esc(a.url)}">${esc(a.name||'')}</option>`).join('')}
  function renderMedia(){const q=($('#mediaSearch')?.value||'').toLowerCase();const list=mediaAssets.filter(a=>(a.name||'').toLowerCase().includes(q));$('#mediaCount').textContent=`${list.length} archivos`;$('#mediaGrid').innerHTML=list.length?list.map((a,i)=>{const idx=mediaAssets.indexOf(a);const video=(a.mime_type||'').startsWith('video/');return `<article class="media-card"><div class="media-preview" ${video?'':`style="background-image:url('${esc(a.url)}')"`}>${video?`<video src="${esc(a.url)}" muted preload="metadata"></video>`:''}</div><div class="media-info"><strong>${esc(a.name||'Archivo')}</strong><small>${esc(a.mime_type||'')} ${a.size_bytes?`· ${Math.round(a.size_bytes/1024)} KB`:''}</small></div><div class="media-actions"><button data-media-copy="${idx}">Copiar URL</button><button data-media-delete="${idx}">Eliminar</button></div></article>`}).join(''):`<div class="panel"><p style="margin:0;font-size:11px;color:#777">Todavía no hay medios cargados en la biblioteca.</p></div>`;
    $$('[data-media-copy]').forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(mediaAssets[Number(b.dataset.mediaCopy)].url);toast('URL copiada')});
    $$('[data-media-delete]').forEach(b=>b.onclick=async()=>{const a=mediaAssets[Number(b.dataset.mediaDelete)];if(!confirm(`¿Eliminar ${a.name}?`))return;try{await db.deleteMedia(a);mediaAssets=mediaAssets.filter(x=>x!==a);renderMedia();renderDashboard();toast('Medio eliminado')}catch(e){toast('Error: '+e.message)}});
  }

  async function loadLeads(){if(!db.configured){leads=[];renderLeads();return}try{leads=await db.listLeads(200);renderLeads();renderDashboard()}catch(e){toast('Error: '+e.message)}}
  function renderLeads(){$('#leadsTable').innerHTML=leads.length?leads.map(l=>`<tr><td>${new Date(l.created_at).toLocaleString('es-AR')}</td><td>${esc(l.name||'')}</td><td>${esc(l.interest||'')}</td><td>${esc(l.language||'')}</td><td>${esc(l.source||'')}</td></tr>`).join(''):`<tr><td colspan="5">Sin consultas todavía.</td></tr>`}
  async function loadHistory(){if(!db.configured){revisions=[];renderHistory();return}try{revisions=await db.listRevisions(50);renderHistory()}catch(e){toast('Error: '+e.message)}}
  function renderHistory(){$('#historyList').innerHTML=revisions.length?revisions.map(r=>`<article class="history-row"><div><strong>${esc(r.note||'Publicación')}</strong><small>${new Date(r.created_at).toLocaleString('es-AR')} · ${esc(r.id.slice(0,8))}</small></div><button class="btn ghost" data-restore="${r.id}">Restaurar</button></article>`).join(''):`<div class="panel"><p style="margin:0;font-size:11px;color:#777">No hay revisiones. Se crean automáticamente al publicar.</p></div>`;$$('[data-restore]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Restaurar esta revisión y publicarla como versión actual?'))return;try{const payload=await db.getRevision(b.dataset.restore);state=mergeDeep(clone(defaults),payload);renderAllAdmin();markDirty();await saveAll('Restauración de revisión');toast('Revisión restaurada')}catch(e){toast('Error: '+e.message)}})}

  function openSectionEditor(i){editingIndex=i;draftSection=clone(state.sections[i]);drawerTab='content';$('#drawerTitle').textContent=draftSection.label||typeMeta[draftSection.type]?.[1]||'Editar sección';$('#drawerKicker').textContent=(typeMeta[draftSection.type]?.[1]||draftSection.type).toUpperCase();renderDrawer();$('#editorDrawer').classList.add('open');$('#drawerBackdrop').classList.add('open');$('#editorDrawer').setAttribute('aria-hidden','false');pushLivePreview(draftSection.settings?.anchor||draftSection.id)}
  function closeDrawer(){editingIndex=null;draftSection=null;$('#editorDrawer').classList.remove('open');$('#drawerBackdrop').classList.remove('open');$('#editorDrawer').setAttribute('aria-hidden','true');scheduleLivePreview()}
  function renderDrawer(){
    $$('.drawer-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.drawerTab===drawerTab));
    const body=$('#drawerBody');
    if(drawerTab==='content') body.innerHTML=contentEditorHtml();
    if(drawerTab==='media') body.innerHTML=mediaEditorHtml();
    if(drawerTab==='layout') body.innerHTML=layoutEditorHtml();
    if(drawerTab==='advanced') body.innerHTML=`<div class="drawer-group"><h3>JSON avanzado</h3><p style="font-size:9px;color:#777">Para ajustes no cubiertos por la interfaz. Un JSON inválido no se aplicará.</p><textarea class="advanced-json" id="advancedJson">${esc(JSON.stringify(draftSection,null,2))}</textarea></div>`;
    bindDrawerFields();
    $('#advancedJson')?.addEventListener('input',e=>{try{draftSection=JSON.parse(e.target.value);scheduleLivePreview()}catch(_err){}});
    scheduleLivePreview();
  }
  function contentEditorHtml(){
    const en=draftSection.content?.en||{}, es=draftSection.content?.es||{}; const keys=[...new Set([...Object.keys(en),...Object.keys(es)])];
    const bilingual=`<div class="drawer-group"><div class="drawer-group-head"><h3>Contenido bilingüe</h3><span class="kicker">EN / ES</span></div><div class="drawer-language-grid"><div class="lang-box"><strong>English</strong>${keys.map(k=>fieldHtml(labelForKey(k),`content.en.${k}`,en[k],k)).join('')}</div><div class="lang-box"><strong>Español</strong>${keys.map(k=>fieldHtml(labelForKey(k),`content.es.${k}`,es[k],k)).join('')}</div></div></div>`;
    const items=Array.isArray(draftSection.items)?`<div class="drawer-group"><div class="drawer-group-head"><h3>Items / tarjetas</h3><button class="btn ghost" id="addItem">+ Agregar</button></div><div class="drawer-items">${draftSection.items.map((it,i)=>itemEditorHtml(it,i)).join('') || '<p style="font-size:9px;color:#777">No hay items. Agregá el primero.</p>'}</div></div>`:'';
    const options=Array.isArray(draftSection.formOptions)?`<div class="drawer-group"><h3>Opciones del formulario</h3>${draftSection.formOptions.map((o,i)=>`<div class="repeater-fields" style="margin-bottom:8px"><label class="field"><span>Valor</span><input data-draft="formOptions.${i}.value" value="${esc(o.value)}"></label><label class="field"><span>EN</span><input data-draft="formOptions.${i}.labels.en" value="${esc(o.labels?.en||'')}"></label><label class="field"><span>ES</span><input data-draft="formOptions.${i}.labels.es" value="${esc(o.labels?.es||'')}"></label><button class="icon-btn danger" data-option-delete="${i}">×</button></div>`).join('') || '<p style="font-size:9px;color:#777">No hay opciones.</p>'}<button class="btn ghost" id="addOption">+ Opción</button></div>`:'';
    return `<div class="drawer-group"><h3>Identificación</h3><div class="form-grid"><label class="field"><span>Nombre interno</span><input data-draft="label" value="${esc(draftSection.label||'')}"></label><label class="field checkbox-field"><input type="checkbox" data-draft="enabled" ${draftSection.enabled!==false?'checked':''}><span>Sección visible</span></label></div></div>${bilingual}${items}${options}`;
  }
  function fieldHtml(label,path,value,key){const long=/title|body|copy|description|side|note|formTitle/i.test(key);const href=/href/i.test(key);return `<label class="field"><span>${esc(label)}</span>${long?`<textarea data-draft="${path}">${esc(value??'')}</textarea>`:`<input ${href?'type="text"':''} data-draft="${path}" value="${esc(value??'')}">`}</label>`}
  function itemEditorHtml(it,i){const primitive=Object.entries(it).filter(([k,v])=>k!=='content'&&k!=='id'&&['string','number','boolean'].includes(typeof v));const keys=[...new Set([...Object.keys(it.content?.en||{}),...Object.keys(it.content?.es||{})])];return `<div class="drawer-item"><div class="drawer-item-head"><strong>Item ${i+1} · ${esc(it.content?.en?.title||it.id||'')}</strong><div><button class="icon-btn" data-item-action="up" data-item-index="${i}">↑</button><button class="icon-btn" data-item-action="down" data-item-index="${i}">↓</button><button class="icon-btn" data-item-action="duplicate" data-item-index="${i}">⧉</button><button class="icon-btn danger" data-item-action="delete" data-item-index="${i}">×</button></div></div><div class="drawer-item-body">${primitive.length?`<div class="form-grid">${primitive.map(([k,v])=>`<label class="field"><span>${labelForKey(k)}</span><input ${k==='image'?'list="mediaUrls"':''} data-draft="items.${i}.${k}" value="${esc(v)}"></label>`).join('')}</div>`:''}<div class="drawer-language-grid"><div class="lang-box"><strong>English</strong>${keys.map(k=>fieldHtml(labelForKey(k),`items.${i}.content.en.${k}`,it.content?.en?.[k]||'',k)).join('')}</div><div class="lang-box"><strong>Español</strong>${keys.map(k=>fieldHtml(labelForKey(k),`items.${i}.content.es.${k}`,it.content?.es?.[k]||'',k)).join('')}</div></div></div></div>`}
  function labelForKey(k){return ({eyebrow:'Eyebrow / categoría',title:'Título',body:'Texto',cta:'CTA',ctaHref:'Enlace CTA',secondary:'CTA secundario',secondaryHref:'Enlace secundario',meta:'Meta',sideTitle:'Título lateral',sideBody:'Texto lateral',fact1Label:'Dato 1 · etiqueta',fact1Value:'Dato 1 · valor',fact2Label:'Dato 2 · etiqueta',fact2Value:'Dato 2 · valor',image:'Imagen',href:'Enlace',src:'Video / YouTube ID',size:'Tamaño',type:'Tipo',icon:'Ícono',formEyebrow:'Form · eyebrow',formTitle:'Form · título',nameLabel:'Form · nombre',namePlaceholder:'Form · placeholder',interestLabel:'Form · interés',submit:'Form · botón',success:'Mensaje éxito',error:'Mensaje error',note1Title:'Nota 1 · título',note1Body:'Nota 1 · texto',note2Title:'Nota 2 · título',note2Body:'Nota 2 · texto'})[k]||k.replace(/([A-Z])/g,' $1')}
  function mediaEditorHtml(){const media=draftSection.media||{};const fields=Object.keys(media).map(k=>`<label class="field"><span>${labelForKey(k)}</span><input ${/image/i.test(k)?'list="mediaUrls"':''} data-draft="media.${k}" value="${esc(media[k]||'')}"><small>${/youtube/i.test(k)?'Pegá solamente el ID del video de YouTube.':'Podés pegar una URL o elegir una URL subida a Supabase.'}</small></label>`).join('');return `<div class="drawer-group"><h3>Medios principales</h3><div class="form-stack">${fields||'<p style="font-size:10px;color:#777">Esta sección usa medios dentro de sus items. Editalos en Contenido.</p>'}</div></div><div class="drawer-group"><h3>Biblioteca rápida</h3><p style="font-size:9px;color:#777">Las URLs de la biblioteca aparecen como sugerencias en los campos de imagen. También podés copiar una URL desde la sección Medios.</p><button class="btn ghost" id="goMediaFromDrawer">Abrir biblioteca</button></div>`}
  function layoutEditorHtml(){const s=draftSection.settings||{};return `<div class="drawer-group"><h3>Configuración de estructura</h3><div class="form-grid">${Object.entries(s).map(([k,v])=>layoutField(k,v)).join('')}</div></div><div class="drawer-group"><h3>Identificador</h3><label class="field"><span>Anchor / ID</span><input data-draft="settings.anchor" value="${esc(s.anchor||draftSection.id)}"><small>Se usa en los enlaces del menú, por ejemplo #destinations.</small></label></div>`}
  function layoutField(k,v){const selects={align:['left','center','right'],imageSide:['left','right'],tone:['dark','contrast'],cardRatio:['portrait','landscape'],formTone:['light','dark']};if(selects[k])return `<label class="field"><span>${labelForKey(k)}</span><select data-draft="settings.${k}">${selects[k].map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select></label>`;if(typeof v==='number')return `<label class="field"><span>${labelForKey(k)}</span><input type="number" data-draft="settings.${k}" value="${v}"></label>`;if(typeof v==='boolean')return `<label class="field checkbox-field"><input type="checkbox" data-draft="settings.${k}" ${v?'checked':''}><span>${labelForKey(k)}</span></label>`;return `<label class="field"><span>${labelForKey(k)}</span><input data-draft="settings.${k}" value="${esc(v??'')}"></label>`}
  function bindDrawerFields(){
    $$('[data-draft]').forEach(el=>el.addEventListener('input',()=>{let value=el.type==='checkbox'?el.checked:el.value;if(el.type==='number')value=Number(value);setPath(draftSection,el.dataset.draft,value);scheduleLivePreview()}));
    $$('[data-item-action]').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.itemIndex),a=btn.dataset.itemAction,arr=draftSection.items||[];if(a==='delete')arr.splice(i,1);if(a==='duplicate'){const cp=clone(arr[i]);cp.id=uid('item');arr.splice(i+1,0,cp)}if(a==='up'&&i>0)[arr[i-1],arr[i]]=[arr[i],arr[i-1]];if(a==='down'&&i<arr.length-1)[arr[i+1],arr[i]]=[arr[i],arr[i+1]];renderDrawer()});
    $('#addItem')?.addEventListener('click',()=>{draftSection.items=draftSection.items||[];const base=draftSection.items[0]?clone(draftSection.items[0]):{id:uid('item'),content:{en:{title:'New item'},es:{title:'Nuevo item'}}};base.id=uid('item');if(base.content?.en)base.content.en.title='New item';if(base.content?.es)base.content.es.title='Nuevo item';draftSection.items.push(base);renderDrawer()});
    $$('[data-option-delete]').forEach(btn=>btn.onclick=()=>{draftSection.formOptions.splice(Number(btn.dataset.optionDelete),1);renderDrawer()});
    $('#addOption')?.addEventListener('click',()=>{draftSection.formOptions.push({value:'new',labels:{en:'New option',es:'Nueva opción'}});renderDrawer()});
    $('#goMediaFromDrawer')?.addEventListener('click',()=>{closeDrawer();switchView('media')});
  }

  function openAddModal(){const grid=$('#templateGrid');grid.innerHTML=Object.entries(typeMeta).map(([type,m])=>`<button class="template-card" data-template="${type}"><i>${m[0]}</i><strong>${m[1]}</strong><small>${m[2]}</small></button>`).join('');$('#modalBackdrop').classList.remove('hidden');$$('[data-template]').forEach(b=>b.onclick=()=>addSectionType(b.dataset.template))}
  function closeModal(){$('#modalBackdrop').classList.add('hidden')}
  function addSectionType(type){const base=(defaults.sections||[]).find(s=>s.type===type);const section=base?clone(base):{id:uid(type),type,label:type,enabled:true,settings:{anchor:uid('section')},content:{en:{title:'New section'},es:{title:'Nueva sección'}}};section.id=uid(type);section.label=`${typeMeta[type]?.[1]||type} — nuevo`;section.settings=section.settings||{};section.settings.anchor=section.id;state.sections.push(section);markDirty();renderSections();renderDashboard();closeModal();openSectionEditor(state.sections.length-1)}

  async function saveAll(note='Publicación desde CMS'){if(!db.configured){toast('Supabase no está configurado');return}try{$('#saveState').textContent='Publicando…';$('#saveAll').disabled=true;await db.saveHomeContent(state,note);clearDirty();toast('Cambios publicados');loadHistory();refreshPreview()}catch(e){toast('Error al publicar: '+e.message);$('#saveState').textContent='Error'}finally{$('#saveAll').disabled=false}}
  function refreshPreview(){const f=$('#previewFrame');if(f)f.src=`../?cms_preview=${Date.now()}`}
  function reloadLivePreview(){const f=$('#livePreviewFrame');if(!f)return;f.src=`../?cms_live_preview=${Date.now()}`;}
  function renderAllAdmin(){renderDashboard();renderSections();renderDesign();renderNavigation();renderSettings();renderMedia();renderLeads();renderHistory()}

  async function loadContent(){try{const remote=await db.loadHomeContent();state=remote?mergeDeep(clone(defaults),window.CHUBUT_MIGRATE_CONTENT?window.CHUBUT_MIGRATE_CONTENT(remote):remote):clone(defaults);livePreviewLang=state.site?.defaultLanguage==='es'?'es':'en';clearDirty();await Promise.all([loadMedia(),loadLeads(),loadHistory()]);renderAllAdmin();setLivePreviewLanguage(livePreviewLang);updateLivePreviewVisibility('dashboard');scheduleLivePreview()}catch(e){toast('Error cargando contenido: '+e.message)}}
  async function setSession(session){const logged=Boolean(session?.user);$('#authScreen').classList.toggle('hidden',logged);if(logged){$('#userEmail').textContent=session.user.email||'Usuario';$('#accountButton').textContent=(session.user.email||'A').slice(0,1).toUpperCase();await loadContent()}}
  async function boot(){
    $('#connectionDot').className=db.configured?'online':'offline';$('#connectionText').textContent=db.configured?'Supabase conectado':'Supabase sin configurar';
    if(!db.configured){$('#configNotice').classList.remove('hidden');$('#authCopy').textContent='El panel necesita Supabase para autenticación y persistencia.';$('#login').disabled=true;return}
    const {data}=await db.client.auth.getSession();await setSession(data.session);db.client.auth.onAuthStateChange((_e,session)=>setSession(session));
  }

  // global events
  $$('.admin-nav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
  $$('[data-go]').forEach(b=>b.onclick=()=>switchView(b.dataset.go));
  $('#mobileSidebar').onclick=()=>$('.admin-sidebar').classList.toggle('open');
  $('#saveAll').onclick=()=>saveAll();
  $('#addSection').onclick=openAddModal; $('#modalClose').onclick=closeModal; $('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal()});
  $('#drawerClose').onclick=$('#drawerCancel').onclick=$('#drawerBackdrop').onclick=closeDrawer;
  $$('.drawer-tabs button').forEach(b=>b.onclick=()=>{drawerTab=b.dataset.drawerTab;renderDrawer()});
  $('#drawerDone').onclick=()=>{if(drawerTab==='advanced'){try{draftSection=JSON.parse($('#advancedJson').value)}catch(e){toast('JSON inválido: '+e.message);return}}state.sections[editingIndex]=clone(draftSection);markDirty();renderSections();renderDashboard();closeDrawer();toast('Cambios aplicados. Publicá para guardarlos.')};
  $('#resetTheme').onclick=()=>{if(confirm('¿Restaurar el diseño visual por defecto?')){state.theme=clone(defaults.theme);markDirty();renderDesign();toast('Diseño restaurado')}};
  $('#addNav').onclick=()=>{state.navigation.push({id:uid('nav'),href:'#section',labels:{en:'New link',es:'Nuevo enlace'},featured:false});markDirty();renderNavigation()};
  $('#mediaSearch').addEventListener('input',renderMedia);
  $('#mediaUpload').addEventListener('change',async e=>{const files=[...e.target.files];if(!files.length)return;for(const file of files){try{toast(`Subiendo ${file.name}…`);await db.uploadMedia(file)}catch(err){toast(`Error en ${file.name}: ${err.message}`)}}e.target.value='';await loadMedia();toast('Carga finalizada')});
  $('#refreshLeads').onclick=loadLeads; $('#refreshHistory').onclick=loadHistory; $('#refreshPreview').onclick=refreshPreview;
  $('#reloadLivePreview').onclick=reloadLivePreview;
  $$('[data-preview-lang]').forEach(b=>b.onclick=()=>setLivePreviewLanguage(b.dataset.previewLang));
  $$('[data-preview-device]').forEach(b=>b.onclick=()=>setLivePreviewDevice(b.dataset.previewDevice));
  $('#livePreviewFrame').addEventListener('load',()=>{resizeLivePreview();setTimeout(()=>pushLivePreview(),120)});
  if ('ResizeObserver' in window) new ResizeObserver(()=>resizeLivePreview()).observe($('#livePreviewStage')); else addEventListener('resize',resizeLivePreview);
  $('#accountButton').onclick=()=>$('#accountMenu').classList.toggle('hidden'); $('#logout').onclick=()=>db.client.auth.signOut();
  $('#login').onclick=async()=>{try{$('#authStatus').textContent='Ingresando…';const {error}=await db.client.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});if(error)throw error;$('#authStatus').textContent=''}catch(e){$('#authStatus').textContent=e.message}};
  addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});

  boot();
})();
