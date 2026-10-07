window.CHUBUT_DEFAULT_CONTENT = {
  version: 7,
  site: {
    name: "CHUBUT",
    strap: "PATAGONIA · ARGENTINA",
    defaultLanguage: "en",
    languages: ["en", "es"],
    seo: {
      en: { title: "Chubut Patagonia — Official Travel Inspiration", description: "Discover Chubut, Patagonia — wildlife, ancient forests, vast steppe and unforgettable journeys at the edge of Argentina." },
      es: { title: "Chubut Patagonia — Inspiración oficial de viaje", description: "Descubrí Chubut, Patagonia — fauna, bosques antiguos, estepa infinita y viajes inolvidables en Argentina." }
    },
    footerText: {
      en: "Ocean, steppe, Andes and deep time. One extraordinary province.",
      es: "Océano, estepa, Andes y tiempo profundo. Una provincia extraordinaria."
    }
  },
  theme: {
    background: "#050505",
    surface: "#0d0d0d",
    surfaceAlt: "#151515",
    text: "#f3f0e9",
    muted: "#a6a39d",
    line: "#292929",
    accent: "#d4c7b0",
    accentText: "#080808",
    bodyFont: "DM Sans",
    headingFont: "Instrument Serif",
    maxWidth: 1440,
    radius: 0,
    sectionSpace: 132,
    motion: "smooth",
    headerMode: "overlay"
  },
  navigation: [
    { id: "nav-discover", href: "#discover", labels: { en: "Discover", es: "Descubrí" } },
    { id: "nav-experiences", href: "#experiences", labels: { en: "Experiences", es: "Experiencias" } },
    { id: "nav-destinations", href: "#destinations", labels: { en: "Destinations", es: "Destinos" } },
    { id: "nav-motion", href: "#motion", labels: { en: "Stories", es: "Historias" } },
    { id: "nav-plan", href: "#plan", labels: { en: "Plan your trip", es: "Planificá tu viaje" }, featured: true }
  ],
  sections: [
    {
      id: "hero",
      type: "heroVideo",
      label: "Hero · YouTube",
      enabled: true,
      settings: { anchor: "top", minHeight: 92, align: "left", overlay: 58 },
      media: { youtubeId: "BEUNR-ijIZs" },
      content: {
        en: { eyebrow: "CHUBUT · PATAGONIA, ARGENTINA", title: "Patagonia,<br><em>at full scale.</em>", body: "Whales at arm’s length. Ancient forests. Open steppe. A coastline alive with wildlife and a province made for journeys that stay with you.", cta: "Discover Chubut", ctaHref: "#discover", secondary: "Plan your trip", secondaryHref: "#plan", meta: "PENÍNSULA VALDÉS · ATLANTIC PATAGONIA" },
        es: { eyebrow: "CHUBUT · PATAGONIA, ARGENTINA", title: "Patagonia,<br><em>a escala real.</em>", body: "Ballenas a pocos metros. Bosques antiguos. Estepa abierta. Una costa llena de vida y una provincia hecha para viajes que quedan con vos.", cta: "Descubrí Chubut", ctaHref: "#discover", secondary: "Planificá tu viaje", secondaryHref: "#plan", meta: "PENÍNSULA VALDÉS · PATAGONIA ATLÁNTICA" }
      }
    },
    {
      id: "quick-links",
      type: "quickLinks",
      label: "Trip shortcuts",
      enabled: true,
      settings: { anchor: "trip-shortcuts", columns: 3 },
      items: [
        { id: "ql1", href: "#experiences", icon: "01", content: { en: { eyebrow: "WHAT TO DO", title: "Find your experience" }, es: { eyebrow: "QUÉ HACER", title: "Encontrá tu experiencia" } } },
        { id: "ql2", href: "#destinations", icon: "02", content: { en: { eyebrow: "WHERE TO GO", title: "Explore the province" }, es: { eyebrow: "DÓNDE IR", title: "Explorá la provincia" } } },
        { id: "ql3", href: "#plan", icon: "03", content: { en: { eyebrow: "PLAN YOUR TRIP", title: "Build your journey" }, es: { eyebrow: "PLANIFICÁ TU VIAJE", title: "Armá tu recorrido" } } }
      ]
    },
    {
      id: "intro",
      type: "editorialIntro",
      label: "Editorial introduction",
      enabled: true,
      settings: { anchor: "discover", imagePosition: "right" },
      media: { image: "https://commons.wikimedia.org/wiki/Special:FilePath/Peninsula%20Valdes%20-%20Argentina.jpg?width=2400" },
      content: {
        en: { eyebrow: "A PROVINCE OF EXTRAORDINARY CONTRASTS", title: "One province.<br><em>Four worlds.</em>", body: "From the Atlantic coast to the Andes, Chubut brings together marine wildlife, ancient forests, geological wonders, paleontology and living Welsh-Patagonian culture.", cta: "See what makes Chubut different", ctaHref: "#experiences", sideTitle: "Big nature.<br>Small distances<br>between wonders.", sideBody: "Move from ocean encounters to open steppe, dramatic canyons and Andean forests in a single province." },
        es: { eyebrow: "UNA PROVINCIA DE CONTRASTES EXTRAORDINARIOS", title: "Una provincia.<br><em>Cuatro mundos.</em>", body: "Desde la costa atlántica hasta los Andes, Chubut reúne fauna marina, bosques antiguos, maravillas geológicas, paleontología y una cultura galesa-patagónica viva.", cta: "Descubrí qué hace diferente a Chubut", ctaHref: "#experiences", sideTitle: "Naturaleza enorme.<br>Maravillas<br>más cerca.", sideBody: "Pasá de encuentros con el océano a la estepa abierta, cañadones dramáticos y bosques andinos dentro de una misma provincia." }
      }
    },
    {
      id: "experiences",
      type: "cardGrid",
      label: "Experience cards",
      enabled: true,
      settings: { anchor: "experiences", columns: 4, cardRatio: "portrait" },
      content: {
        en: { eyebrow: "WAYS TO EXPERIENCE CHUBUT", title: "Choose what pulls<br><em>you outside.</em>", body: "Chubut is not one landscape or one kind of trip. Follow wildlife, mountain roads, geological formations or cultural stories." },
        es: { eyebrow: "FORMAS DE VIVIR CHUBUT", title: "Elegí lo que te haga<br><em>salir afuera.</em>", body: "Chubut no es un solo paisaje ni una sola forma de viajar. Seguí la fauna, los caminos de montaña, la geología o las historias culturales." }
      },
      items: [
        { id: "exp1", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ballena%20Franca%20Austral%20-%20Puerto%20Pir%C3%A1mides.jpg?width=1600", href: "#wildlife", content: { en: { eyebrow: "WILDLIFE", title: "Meet the Atlantic giants", body: "Whales, orcas, penguins and sea lions along one remarkable coast." }, es: { eyebrow: "FAUNA", title: "Conocé a los gigantes del Atlántico", body: "Ballenas, orcas, pingüinos y lobos marinos en una costa extraordinaria." } } },
        { id: "exp2", image: "https://commons.wikimedia.org/wiki/Special:FilePath/R%C3%ADo%20Men%C3%A9ndez%20en%20el%20Parque%20Nacional%20Los%20Alerces.jpg?width=1600", href: "#andes", content: { en: { eyebrow: "THE ANDES", title: "Walk into ancient forests", body: "Clear lakes, mountain valleys and landscapes built for slow travel." }, es: { eyebrow: "LOS ANDES", title: "Entrá en bosques antiguos", body: "Lagos transparentes, valles de montaña y paisajes para viajar sin apuro." } } },
        { id: "exp3", image: "https://commons.wikimedia.org/wiki/Special:FilePath/PIEDRA%20PARADA.JPG?width=1600", href: "#destinations", content: { en: { eyebrow: "DEEP TIME", title: "Read the land", body: "Canyons, fossils and volcanic formations shaped across millions of years." }, es: { eyebrow: "TIEMPO PROFUNDO", title: "Leé el territorio", body: "Cañadones, fósiles y formaciones volcánicas moldeadas durante millones de años." } } },
        { id: "exp4", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Campo%20de%20Tulipanes.jpg?width=1600", href: "#destinations", content: { en: { eyebrow: "CULTURE & VALLEYS", title: "Find Patagonia in bloom", body: "Welsh heritage, small towns, local flavours and unforgettable valleys." }, es: { eyebrow: "CULTURA Y VALLES", title: "Encontrá una Patagonia en flor", body: "Herencia galesa, pueblos, sabores locales y valles inolvidables." } } }
      ]
    },
    {
      id: "wildlife",
      type: "splitFeature",
      label: "Wildlife feature",
      enabled: true,
      settings: { anchor: "wildlife", imageSide: "left", tone: "dark" },
      media: { image: "https://commons.wikimedia.org/wiki/Special:FilePath/Southern%20right%20whale%20and%20calf%20at%20Valdes%20Peninsula.jpg?width=2200" },
      content: {
        en: { eyebrow: "WILDLIFE / PENÍNSULA VALDÉS", title: "Meet Patagonia<br><em>face to face.</em>", body: "Península Valdés is one of the world’s great wildlife destinations. Southern right whales, penguins, sea lions, elephant seals and orcas share this protected coast.", fact1Label: "LANDSCAPE", fact1Value: "Ocean + steppe", fact2Label: "PACE", fact2Value: "Slow & immersive" },
        es: { eyebrow: "FAUNA / PENÍNSULA VALDÉS", title: "Mirá a la Patagonia<br><em>cara a cara.</em>", body: "Península Valdés es uno de los grandes destinos de fauna del mundo. Ballenas francas australes, pingüinos, lobos, elefantes marinos y orcas comparten esta costa protegida.", fact1Label: "PAISAJE", fact1Value: "Océano + estepa", fact2Label: "RITMO", fact2Value: "Lento e inmersivo" }
      }
    },
    {
      id: "andes",
      type: "splitFeature",
      label: "Andes feature",
      enabled: true,
      settings: { anchor: "andes", imageSide: "right", tone: "contrast" },
      media: { image: "https://commons.wikimedia.org/wiki/Special:FilePath/R%C3%ADo%20Men%C3%A9ndez%20en%20el%20Parque%20Nacional%20Los%20Alerces.jpg?width=2200" },
      content: {
        en: { eyebrow: "THE ANDES / LOS ALERCES", title: "Where forests<br><em>meet the mountains.</em>", body: "Los Alerces, Trevelin and the valleys around Esquel combine deep forests, clear lakes, Welsh heritage and memorable road trips.", fact1Label: "LANDSCAPE", fact1Value: "Forest + lakes", fact2Label: "STYLE", fact2Value: "Road trip ready" },
        es: { eyebrow: "LOS ANDES / LOS ALERCES", title: "Donde el bosque<br><em>encuentra la montaña.</em>", body: "Los Alerces, Trevelin y los valles alrededor de Esquel combinan bosques profundos, lagos transparentes, herencia galesa y rutas memorables.", fact1Label: "PAISAJE", fact1Value: "Bosque + lagos", fact2Label: "ESTILO", fact2Value: "Ideal para road trip" }
      }
    },
    {
      id: "motion",
      type: "videoGallery",
      label: "Chubut in motion",
      enabled: true,
      settings: { anchor: "motion", columns: 3 },
      content: {
        en: { eyebrow: "CHUBUT IN MOTION", title: "Don’t just see it.<br><em>Feel it.</em>", body: "A cinematic introduction to the landscapes, wildlife and journeys that make Chubut different." },
        es: { eyebrow: "CHUBUT EN MOVIMIENTO", title: "No lo mires solamente.<br><em>Sentilo.</em>", body: "Una introducción cinematográfica a los paisajes, la fauna y los recorridos que hacen diferente a Chubut." }
      },
      items: [
        { id: "vid1", type: "video", src: "assets/videos/orcas-patagonia.mp4", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Orcas%20in%20Punta%20Norte%20Valdes%20Peninsula%20-%20panoramio.jpg?width=1200", content: { en: { eyebrow: "01 · ORCAS / PUNTA NORTE", title: "Wild Patagonia, in motion." }, es: { eyebrow: "01 · ORCAS / PUNTA NORTE", title: "Patagonia salvaje, en movimiento." } } },
        { id: "vid2", type: "video", src: "assets/videos/laberinto-patagonia.mp4", image: "https://media.airedesantafe.com.ar/p/186fae15d57fed69fc1fac1898be31d1/adjuntos/268/imagenes/003/870/0003870395/1200x0/smart/laberinto-patagonia-el-hoyojpg.jpg", content: { en: { eyebrow: "02 · LABERINTO PATAGONIA", title: "Lose the map. Find the place." }, es: { eyebrow: "02 · LABERINTO PATAGONIA", title: "Perdé el mapa. Encontrá el lugar." } } },
        { id: "vid3", type: "youtube", src: "CE_aJyFEb_k", image: "https://commons.wikimedia.org/wiki/Special:FilePath/R%C3%ADo%20Men%C3%A9ndez%20en%20el%20Parque%20Nacional%20Los%20Alerces.jpg?width=1200", content: { en: { eyebrow: "03 · LOS ALERCES", title: "A landscape measured in centuries." }, es: { eyebrow: "03 · LOS ALERCES", title: "Un paisaje medido en siglos." } } }
      ]
    },
    {
      id: "destinations",
      type: "destinationGrid",
      label: "Destination grid",
      enabled: true,
      settings: { anchor: "destinations", columns: 4 },
      content: {
        en: { eyebrow: "DESTINATIONS", title: "Go further.<br><em>Stay longer.</em>", body: "Build a journey around wildlife, mountains, geology, culture and food. Each corner of Chubut changes the scale of the trip." },
        es: { eyebrow: "DESTINOS", title: "Andá más lejos.<br><em>Quedate más.</em>", body: "Armá un viaje alrededor de la fauna, las montañas, la geología, la cultura y los sabores. Cada rincón de Chubut cambia la escala del recorrido." }
      },
      items: [
        { id: "dest1", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Familia%20de%20Ping%C3%BCinos.jpg?width=1800", size: "tall", content: { en: { eyebrow: "ATLANTIC COAST", title: "Punta Tombo", body: "A coast defined by the rhythm and scale of wildlife." }, es: { eyebrow: "COSTA ATLÁNTICA", title: "Punta Tombo", body: "Una costa definida por el ritmo y la escala de la fauna." } } },
        { id: "dest2", image: "https://commons.wikimedia.org/wiki/Special:FilePath/PIEDRA%20PARADA.JPG?width=1800", size: "normal", content: { en: { eyebrow: "CENTRAL CHUBUT", title: "Piedra Parada", body: "Monumental geology in the open Patagonian steppe." }, es: { eyebrow: "CHUBUT CENTRAL", title: "Piedra Parada", body: "Geología monumental en plena estepa patagónica." } } },
        { id: "dest3", image: "https://commons.wikimedia.org/wiki/Special:FilePath/R%C3%ADo%20Men%C3%A9ndez%20en%20el%20Parque%20Nacional%20Los%20Alerces.jpg?width=1800", size: "normal", content: { en: { eyebrow: "PATAGONIAN ANDES", title: "Los Alerces", body: "Ancient forests, clear water and mountain roads." }, es: { eyebrow: "ANDES PATAGÓNICOS", title: "Los Alerces", body: "Bosques antiguos, agua transparente y caminos de montaña." } } },
        { id: "dest4", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Campo%20de%20Tulipanes.jpg?width=1800", size: "wide", content: { en: { eyebrow: "VALLE 16 DE OCTUBRE", title: "Trevelin", body: "Welsh-Patagonian heritage in a valley shaped by mountains and seasons." }, es: { eyebrow: "VALLE 16 DE OCTUBRE", title: "Trevelin", body: "Herencia galesa-patagónica en un valle marcado por las montañas y las estaciones." } } }
      ]
    },
    {
      id: "story",
      type: "fullBleed",
      label: "Full bleed story",
      enabled: true,
      settings: { anchor: "story", align: "left", overlay: 48 },
      media: { image: "https://commons.wikimedia.org/wiki/Special:FilePath/Punta%20Delgada%201994%2001.jpg?width=2600" },
      content: {
        en: { eyebrow: "YOUR CHUBUT STORY", title: "Come for the landscape.<br><em>Leave with a story.</em>", body: "The best journeys here are built around contrasts: ocean and mountains, silence and wildlife, heritage and deep time.", cta: "Plan your journey", ctaHref: "#plan" },
        es: { eyebrow: "TU HISTORIA EN CHUBUT", title: "Vení por el paisaje.<br><em>Volvete con una historia.</em>", body: "Los mejores viajes acá se construyen sobre contrastes: océano y montaña, silencio y fauna, herencia y tiempo profundo.", cta: "Planificá tu viaje", ctaHref: "#plan" }
      }
    },
    {
      id: "plan",
      type: "planner",
      label: "Trip planner form",
      enabled: true,
      settings: { anchor: "plan", formTone: "light" },
      content: {
        en: { eyebrow: "PLAN YOUR JOURNEY", title: "Start with what<br><em>you want to feel.</em>", body: "Wildlife, nature, adventure, culture, science or food. Tell us what brings you to Patagonia and start shaping your route.", note1Title: "Choose your focus", note1Body: "Coast, Andes, steppe or a little of everything.", note2Title: "Leave room for wonder", note2Body: "Distances are part of the experience in Patagonia.", formEyebrow: "TRIP STARTER", formTitle: "What kind of Chubut are you looking for?", nameLabel: "Your name", namePlaceholder: "Name", interestLabel: "What calls you most?", submit: "Build my route", success: "Thanks. Your travel interest was saved.", error: "We couldn’t save it right now. Please try again." },
        es: { eyebrow: "PLANIFICÁ TU VIAJE", title: "Empezá por lo que<br><em>querés sentir.</em>", body: "Fauna, naturaleza, aventura, cultura, ciencia o gastronomía. Contanos qué te trae a la Patagonia y empezá a darle forma a tu recorrido.", note1Title: "Elegí tu foco", note1Body: "Costa, Andes, estepa o un poco de todo.", note2Title: "Dejá lugar para la sorpresa", note2Body: "Las distancias también son parte de la experiencia patagónica.", formEyebrow: "PUNTO DE PARTIDA", formTitle: "¿Qué tipo de Chubut estás buscando?", nameLabel: "Tu nombre", namePlaceholder: "Nombre", interestLabel: "¿Qué te atrae más?", submit: "Armar mi ruta", success: "Gracias. Guardamos tu interés de viaje.", error: "No pudimos guardarlo ahora. Intentá nuevamente." }
      },
      formOptions: [
        { value: "wildlife", labels: { en: "Wildlife", es: "Fauna" } },
        { value: "nature", labels: { en: "Nature & landscapes", es: "Naturaleza y paisajes" } },
        { value: "adventure", labels: { en: "Adventure", es: "Aventura" } },
        { value: "culture", labels: { en: "Culture & heritage", es: "Cultura y patrimonio" } },
        { value: "food", labels: { en: "Food & local life", es: "Gastronomía y vida local" } }
      ]
    }
  ]
};

// Lightweight migration from the earlier V5/V6 payload shape.
// It preserves key editorial copy and the YouTube hero, while intentionally
// adopting the new V7 dark design system and block-based CMS structure.
window.CHUBUT_MIGRATE_CONTENT = function (remote) {
  if (!remote || typeof remote !== 'object') return null;
  if (Number(remote.version) >= 7 && Array.isArray(remote.sections)) return remote;
  const next = structuredClone(window.CHUBUT_DEFAULT_CONTENT);
  if (remote.brand?.name) next.site.name = remote.brand.name;
  if (remote.brand?.strap) next.site.strap = remote.brand.strap;
  if (remote.hero?.whaleYoutubeId) next.sections.find(s => s.id === 'hero').media.youtubeId = remote.hero.whaleYoutubeId;
  const mapping = {
    hero: { heroTitle: 'title', heroCopy: 'body', heroKicker: 'eyebrow', heroCta: 'cta', heroPlanLink: 'secondary' },
    intro: { introTitle: 'title', introCopy: 'body', introEyebrow: 'eyebrow', introCta: 'cta' },
    experiences: { experienceTitle: 'title', experienceLead: 'body', experienceEyebrow: 'eyebrow' },
    destinations: { placesTitle: 'title', placesLead: 'body', placesEyebrow: 'eyebrow' },
    motion: { cinemaTitle: 'title', cinemaLead: 'body', cinemaEyebrow: 'eyebrow' },
    plan: { planTitle: 'title', planCopy: 'body', planEyebrow: 'eyebrow' }
  };
  ['en','es'].forEach(lang => {
    const old = remote.translations?.[lang] || {};
    Object.entries(mapping).forEach(([sectionId, keys]) => {
      const section = next.sections.find(s => s.id === sectionId);
      if (!section) return;
      Object.entries(keys).forEach(([oldKey,newKey]) => { if (old[oldKey]) section.content[lang][newKey] = old[oldKey]; });
    });
    if (old.seoTitle) next.site.seo[lang].title = old.seoTitle;
    if (old.seoDescription) next.site.seo[lang].description = old.seoDescription;
  });
  return next;
};
