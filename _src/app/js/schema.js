'use strict';

/**
 * Initialises the schema viewer
 */
function init() {
    let type = document.querySelector('.site-schema').dataset.uiSchema;
    let schema = UISchema.getSchema(type);

    // Render definition
    let definitionContainer = document.querySelector('.site-schema__definition');
    
    if(definitionContainer) {
        definitionContainer.innerHTML = JSON.stringify(UISchema.getSchema(type, false), null, 4);
    }
   
    // Render template
    let templateContainer = document.querySelector('.site-schema__template');
    
    if(templateContainer) {
        templateContainer.innerHTML = UISchema.escapeHTML(UISchema.getTemplate(type));
    }
    
    // Render example
    let exampleContainer = document.querySelector('.site-schema__example');

    if(exampleContainer) {
        UISchema.renderModuleIframe(UISchema.getExample(type), exampleContainer, true);
    }
}

UISchema.onready = init;
