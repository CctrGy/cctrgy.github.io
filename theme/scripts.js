const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen ? 'Cerrar menú' : 'Abrir menú';
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = 'theme/images/favicon.png';
document.head.appendChild(favicon);

const originalText = new WeakMap();
const pageName = location.pathname.split('/').pop() || 'index.html';

function translatableTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

async function setLanguage(language) {
  try {
    const response = await fetch(`languajes/${language}.json`);
    if (!response.ok) throw new Error(`Language file not found: ${language}`);
    const dictionary = await response.json();

    translatableTextNodes().forEach((node) => {
      if (!originalText.has(node)) originalText.set(node, node.textContent);
      const source = originalText.get(node);
      const cleanSource = source.trim();
      const translated = dictionary.strings[cleanSource];
      if (translated) node.textContent = source.replace(cleanSource, translated);
    });

    document.documentElement.lang = dictionary.meta.code;
    document.title = dictionary.titles[pageName] || document.title;
    document.querySelector('.language-select')?.setAttribute('aria-label', dictionary.strings.Idioma || 'Idioma');
    localStorage.setItem('portfolio-language', language);
  } catch (error) {
    console.warn('No se pudo cargar el idioma. Abre la web mediante un servidor local.', error);
  }
}

if (navigation) {
  const languageControl = document.createElement('label');
  languageControl.className = 'language-control';
  languageControl.innerHTML = '<span class="sr-only">Idioma</span><select class="language-select" aria-label="Idioma"><option value="es">ES</option><option value="en">EN</option><option value="ca">CA</option><option value="fr">FR</option></select>';
  navigation.insertBefore(languageControl, navigation.querySelector('.nav-cta'));

  const languageSelect = languageControl.querySelector('select');
  const savedLanguage = localStorage.getItem('portfolio-language') || 'es';
  languageSelect.value = savedLanguage;
  languageSelect.addEventListener('change', (event) => setLanguage(event.target.value));
  setLanguage(savedLanguage);
}
