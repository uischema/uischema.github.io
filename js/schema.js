'use strict';

/**
 * Initialises the schema viewer
 */
function init() {
    let type = document.querySelector('.site-schema').dataset.uiSchema;

    // Render code fields
    document.querySelector('.site-schema__definition').innerHTML = JSON.stringify(UISchema.getSchema(type, false), null, 4);
    document.querySelector('.site-schema__template').innerHTML = UISchema.escapeHTML(UISchema.getTemplate(type));
    
    UISchema.renderModuleIframe(UISchema.getExample(type), document.querySelector('.site-schema__example'), true);
}

UISchema.onready = init;
