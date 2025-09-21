// i18n.js - Система интернационализации
class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.defaultLang = 'en';
        
        // Инициализация
        this.init();
    }

    // Инициализация системы
    async init() {
        // Определяем язык из URL или localStorage
        this.currentLang = this.detectLanguage();
        
        // Загружаем переводы
        await this.loadTranslations();
        
        // Применяем переводы
        this.updateContent();
        
        // Настраиваем обработчики событий
        this.setupEventListeners();
        
        console.log(`🌍 I18n initialized with language: ${this.currentLang}`);
    }

    // Определение языка
    detectLanguage() {
        // 1. Из URL параметра ?lang=ru
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && ['en', 'ru', 'it'].includes(urlLang)) {
            localStorage.setItem('preferredLanguage', urlLang);
            return urlLang;
        }
        
        // 2. Из localStorage
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && ['en', 'ru', 'it'].includes(savedLang)) {
            return savedLang;
        }
        
        // 3. Из браузера
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'ru', 'it'].includes(browserLang)) {
            return browserLang;
        }
        
        // 4. По умолчанию
        return this.defaultLang;
    }

    // Загрузка переводов
    async loadTranslations() {
        const languages = ['en', 'ru', 'it'];
        
        for (const lang of languages) {
            try {
                const response = await fetch(`translations/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                } else {
                    console.warn(`Failed to load translations for ${lang}`);
                }
            } catch (error) {
                console.error(`Error loading translations for ${lang}:`, error);
                
                // Fallback - встроенные переводы
                if (lang === 'en') {
                    this.translations[lang] = this.getDefaultTranslations();
                }
            }
        }
    }

    // Встроенные переводы как fallback
    getDefaultTranslations() {
        return {
            "menu": {
                "language": "Language",
                "contact": "Contact me",
                "review": "Review",
                "download": "Download"
            },
            "hero": {
                "title": "Fast. Easy. Free",
                "description": "Create hundreds of standard documents with a few keystrokes. Let machines do the routine work for you.",
                "download": "Download"
            },
            "about": {
                "header": "About Template Master",
                "1st": "Imagine that you need to type the text for dozens of greeting cards, changing only the names and addresses. Or maybe you are sending out wedding invitations? Or you need to send a multi-page legal document to hundreds of recipients, making dozens of edits in each copy. Boring routine work. This is exactly what machines are for.",
                "2nd": "With the Template Master application, you only need a document template and a spreadsheet with data for replacements. You can read how to create a template in the instructions by clicking the corresponding button in the program. The program can generate the header for the spreadsheet itself, you will only have to enter the data.",
                "3rd": "If you need to generate one document, and you have a template, the program can do this too. Currently, Template Master can work with DOCX and ODT documents, as well as XLSX and ODS spreadsheets. And, it is also a completely free application."
            },
            "screenshots": {
                "header": "See Template Master in Action",
                "main": "Main interface - simple and intuitive"
            }
        };
    }

    // Получение перевода по ключу
    getTranslation(key, lang = null) {
        const targetLang = lang || this.currentLang;
        const translations = this.translations[targetLang] || this.translations[this.defaultLang];
        
        if (!translations) return key;
        
        // Поддержка вложенных ключей: "menu.language"
        const keys = key.split('.');
        let result = translations;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return key; // Ключ не найден
            }
        }
        
        return result || key;
    }

    // Обновление всего контента
    updateContent() {
        // Обновляем тексты
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.getTranslation(key);
            
            // Обновляем контент в зависимости от типа элемента
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        document.querySelectorAll('.footer--privacy').forEach(link => {
            link.href = `privacy-${this.currentLang}.html`;
        });

        // Обновляем изображения
        document.querySelectorAll('[data-i18n-src]').forEach(img => {
            const key = img.dataset.i18nSrc;
            const imagePath = this.getTranslation(key);
            if (imagePath && imagePath !== key) {
                img.src = imagePath;
            }
        });

        // Обновляем атрибуты alt для изображений
        document.querySelectorAll('[data-i18n-alt]').forEach(img => {
            const key = img.dataset.i18nAlt;
            const altText = this.getTranslation(key);
            if (altText && altText !== key) {
                img.alt = altText;
            }
        });

        // Обновляем активный язык в меню
        this.updateLanguageMenu();
        
        // Обновляем атрибут lang у html
        document.documentElement.lang = this.currentLang;
    }

    // Обновление меню языков
    updateLanguageMenu() {
        const langLinks = document.querySelectorAll('[data-lang]');
        const currentLangText = document.querySelector('[data-i18n="menu.language"]');
        
        // Убираем active класс со всех
        langLinks.forEach(link => link.classList.remove('active'));
        
        // Добавляем active для текущего языка
        const currentLink = document.querySelector(`[data-lang="${this.currentLang}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
            
            // Обновляем текст в dropdown кнопке (опционально)
            if (currentLangText && currentLangText.tagName === 'A') {
                const langNames = {
                    'en': 'English',
                    'ru': 'Русский',
                    'it': 'Italiano'
                };
                // currentLangText.textContent = langNames[this.currentLang];
            }
        }
    }

    // Смена языка
    async changeLanguage(newLang) {
        if (!['en', 'ru', 'it'].includes(newLang) || newLang === this.currentLang) {
            return;
        }

        console.log(`🔄 Changing language from ${this.currentLang} to ${newLang}`);
        
        this.currentLang = newLang;
        
        // Сохраняем в localStorage
        localStorage.setItem('preferredLanguage', newLang);
        
        // Обновляем URL без перезагрузки
        const url = new URL(window.location);
        url.searchParams.set('lang', newLang);
        window.history.replaceState({}, '', url);
        
        // Обновляем контент
        this.updateContent();
        
        // Генерируем событие смены языка
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { 
                oldLang: this.currentLang, 
                newLang: newLang 
            } 
        }));
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработка кликов по ссылкам смены языка
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-lang]')) {
                e.preventDefault();
                const newLang = e.target.dataset.lang;
                this.changeLanguage(newLang);
            }
        });

        // Обработка изменений URL (если пользователь меняет вручную)
        window.addEventListener('popstate', () => {
            const urlLang = new URLSearchParams(window.location.search).get('lang');
            if (urlLang && urlLang !== this.currentLang) {
                this.changeLanguage(urlLang);
            }
        });
    }

    // Публичные методы для внешнего использования
    getCurrentLanguage() {
        return this.currentLang;
    }

    getSupportedLanguages() {
        return ['en', 'ru', 'it'];
    }

    // Перевод для использования в JS коде
    t(key, params = {}) {
        let translation = this.getTranslation(key);
        
        // Поддержка параметров: "Hello {name}" + {name: "John"} = "Hello John"
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        
        return translation;
    }
}

// Глобальная инициализация
let i18n;

document.addEventListener('DOMContentLoaded', async () => {
    i18n = new I18n();
    
    // Делаем доступным глобально для отладки
    window.i18n = i18n;
});

// Экспорт для модулей (если используются)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}