'use strict';

window.UISchema = {
    schemas: [],
    examples: [],
    templates: {},

    /**
     * Gets a schema
     *
     * @param {String} type
     *
     * @return {Object} Schema
     */
    getSchema: (type, includeI18N = true) => {
        for(let schema of UISchema.schemas) {
            if(schema['@type'] !== type) { continue; }

            schema = JSON.parse(JSON.stringify(schema));
        
            if(!includeI18N) {
                delete schema['@i18n'];
            }

            return schema;
        }

        return null;
    },

    /**
     * Gets an example
     *
     * @param {String} type
     *
     * @return {Object} Example
     */
    getExample: (type) => {
        for(let example of UISchema.examples) {
            if(example['@type'] === type) { return example; }
        }

        return null;
    },
    
    /**
     * Gets a template
     *
     * @param {String} type
     *
     * @return {String} Template
     */
    getTemplate: (type) => {
        return UISchema.templates[type];
    },

    /**
     * Resizes an iframe
     *
     * @param {HTMLElement} iframe
     */
    resizeIframe: (iframe) => {
        function update() {
            iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
        }

        iframe.onload = update;

        for(img of Array.from(iframe.contentWindow.document.querySelectorAll('img'))) {
            img.onload = update;
        }
    },

    /**
     * Renders a module
     *
     * @param {Object} module
     *
     * @return {String} HTML
     */
    renderModule: (module) => {
        return Mustache.render(UISchema.templates[module['@type']], module, UISchema.templates);
    },

    /**
     * Renders a module as a preview in an iframe
     *
     * @param {Object} module
     * @param {HTMLElement} iframe
     */
    renderModuleIframe: (module, iframe, autoResize = false) => {
        let moduleHTML = UISchema.renderModule(module);
        let html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=0.6">
                    <meta charset="utf8">
                    <link rel="stylesheet" type="text/css" href="/css/uischema.org.css">
                    <link rel="stylesheet" type="text/css" href="/css/style.css">
                </head>

                <body>
                    ${moduleHTML}
                </body>
            </html>
        `;

        html = html.replace(/\n/g, '');
        html = html;

        iframe.scrolling = 'no';
        iframe.srcdoc = html;

        if(autoResize) {
            UISchema.resizeIframe(iframe);
        }
    },

    /**
     * Escapes HTML
     *
     * @param {String} html
     *
     * @return {String} HTML
     */
    escapeHTML: (html) => {
        let text = document.createTextNode(html);
        let p = document.createElement('p');
        
        p.appendChild(text);
        
        return p.innerHTML;
    },

    /**
     * Performs a HTTP GET request
     *
     * @param {String} url
     *
     * @return {*} Result
     */
    get: (url) => {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', url, true);

            request.onload = () => {
                let response = request.response;

                try {
                    response = JSON.parse(response);
                } catch(e) {
                    // Never mind
                }

                if(request.status >= 200 && request.status < 400) {
                    resolve(response);
                } else {
                    reject(new Error(response));
                }
            };

            request.onerror = (e) => {
                reject(e);
            };

            request.send();
        });
    },

    /**
     * Initialises the app
     */
    init: async () => {
        // Resources
        UISchema.schemas = await UISchema.get('/schemas.json');
        UISchema.examples = await UISchema.get('/examples.json');
        UISchema.templates = await UISchema.get('/templates.json');

        // Render previews
        for(let navItem of Array.from(document.querySelectorAll('.site-nav__item'))) {
            let type = navItem.dataset.uiSchema;
            let example = UISchema.getExample(type);

            if(!example) { continue; }

            let exampleContainer = document.createElement('div');
            exampleContainer.className = 'site-nav__item__preview'; 
            navItem.appendChild(exampleContainer);

            let exampleIframe = document.createElement('iframe');
            exampleIframe.className = 'site-nav__item__preview__iframe';
            exampleContainer.appendChild(exampleIframe);
     
            UISchema.renderModuleIframe(example, exampleIframe);
        }

        if(typeof UISchema.onready === 'function') {
            UISchema.onready();
        }
    }
};

UISchema.init();
