'use strict';

/**
 * Initialises the schema viewer
 */
function init() {
    let type = document.querySelector('.site-schema').dataset.uiSchema;
    let schema = UISchema.getSchema(type);

    // Render code fields
    document.querySelector('.site-schema__definition').innerHTML = JSON.stringify(UISchema.getSchema(type, false), null, 4);
    document.querySelector('.site-schema__template').innerHTML = UISchema.escapeHTML(UISchema.getTemplate(type));
    
    if(schema['@role'] !== 'partial') {
        UISchema.renderModuleIframe(UISchema.getExample(type), document.querySelector('.site-schema__example'), true);
    }
}

UISchema.onready = init;
