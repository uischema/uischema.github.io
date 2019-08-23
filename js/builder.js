'use strict';

let modules = [];

/**
 * Loads the page modules
 */
function loadModules() {
    let name = document.getElementById('site-builder__toolbar__input--pick-page').value || 'My page';

    modules = JSON.parse(localStorage.getItem('builder:' + name) || '[]');
}

/**
 * Saves the page modules
 */
function saveModules() {
    let name = document.getElementById('site-builder__toolbar__input--pick-page').value || 'My page';

    localStorage.setItem('builder:' + name, JSON.stringify(modules));
}

/**
 * Event: Start dragging a nav item
 *
 * @param {InputEvent} e
 */
function onNavItemDragStart(e) {
    e.dataTransfer.setData('type', e.target.dataset.uiSchema);
}

/**
 * Event: Dragging over a slot
 *
 * @param {InputEvent} e
 */
function onModulesDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Event: Dropping onto a slot
 *
 * @param {InputEvent} e
 */
function onModulesDrop(e) {
    e.preventDefault();

    let type = e.dataTransfer.getData('type');
    let example = UISchema.getExample(type);

    if(!example) { return; }

    modules.push(example);

    saveModules();

    renderModules();
}

/**
 * Event: Click remove page
 *
 * @param {InputEvent} e
 */
function onClickRemovePage(e) {
    let selector = document.getElementById('site-builder__toolbar__input--pick-page');
    let name = selector.value;

    localStorage.removeItem('builder:' + name);

    console.log('Removed page "' + name + '"');

    renderPageNames();

    loadModules();
    saveModules();
    renderModules();
    updateInspector();
}

/**
 * Event: Click add page
 *
 * @param {InputEvent} e
 */
function onClickAddPage(e) {
    let name = prompt('New page name', 'My page');

    if(!name) { return; }

    localStorage.setItem('builder:' + name, '[]');

    loadModules();
    renderPageNames(name);
    renderModules();
}

/**
 * Event: Change name
 *
 * @param {InputEvent} e
 */
function onChangeName(e) {
    renderModules();
}

/**
 * Event: Clicked module
 *
 * @param {InputEvent} e
 */
function onClickModule(e) {
    let moduleElements = document.querySelectorAll('.site-builder__module');

    for(let i = 0; i < moduleElements.length; i++) {
        moduleElements[i].classList.toggle('active', moduleElements[i] === e.currentTarget)
    }

    updateInspector();
}

/**
 * Event: Clicked remove module
 *
 * @param {InputEvent} e
 */
function onClickRemoveModule(e) {
    let activeModule = getActiveModuleIndex();

    if(activeModule < 0) { return; }

    modules.splice(activeModule, 1);

    saveModules();
    renderModules();
    updateInspector();
}

/**
 * Event: Edited module
 *
 * @param {InputEvent} e
 */
function onEditModule(e) {
    let activeModule = getActiveModuleIndex();

    if(activeModule < 0) { return; }

    let inspectorJSONInput = document.getElementById('site-builder__toolbar__input--edit-module'); 
    let json = inspectorJSONInput.value;

    try {
        json = JSON.parse(json);
        
        modules[activeModule] = json;
    
        inspectorJSONInput.classList.toggle('error', false);

        saveModules();
        renderModules();

    } catch(e) {
        inspectorJSONInput.classList.toggle('error', true);

    }
}

/**
 * Gets the active module index
 *
 * @return {Number} Active
 */
function getActiveModuleIndex() {
    let moduleElements = document.querySelectorAll('.site-builder__module');

    for(let i = 0; i < moduleElements.length; i++) {
        if(moduleElements[i].classList.contains('active')) { return i; }
    }

    return -1;
}

/**
 * Renders all page names
 *
 * @param {String} selected
 */
function renderPageNames(selected) {
    let pageSelector = document.getElementById('site-builder__toolbar__input--pick-page');

    pageSelector.innerHTML = '';

    let names = Object.keys(localStorage);

    if(names.length < 1) {
        names.push('builder:My page');
    }

    for(let name of names) {
        if(name.indexOf('builder:') < 0) { continue; }

        name = name.replace('builder:', '');
            
        pageSelector.innerHTML += '<option ' + (selected === name ? 'selected' : '') + ' value="' + name + '">' + name + '</option>';
    }
}

/**
 * Renders all modules
 */
function renderModules() {
    let activeModule = getActiveModuleIndex();
    let modulesContainer = document.querySelector('.site-builder__modules');

    modulesContainer.innerHTML = '';

    for(let i = 0; i < modules.length; i++) {
        let module = modules[i];
        let newModule = document.createElement('div');
        newModule.className = 'site-builder__module';

        if(i === activeModule) {
            newModule.classList.toggle('active', true);
        }

        newModule.innerHTML = UISchema.renderModule(module);

        modulesContainer.appendChild(newModule);
    
        newModule.addEventListener('click', onClickModule);
    }

    updateStats();
}

/**
 * Updates the toolbar stats
 */
function updateStats() {
    let moduleCount = 0;
    let schemaCount = {};

    let moduleCountOutput = document.getElementById('site-builder__toolbar__output--module-count'); 
    let schemaCountOutput = document.getElementById('site-builder__toolbar__output--schema-count'); 

    for(let module of modules) {
        moduleCount++;
        schemaCount[module['@type']] = 1;
    }

    moduleCountOutput.innerHTML = moduleCount;
    schemaCountOutput.innerHTML = Object.keys(schemaCount).length + '/' + UISchema.schemas.length;
}

/**
 * Updates the inspector
 *
 * @param {Number} moduleIndex
 */
function updateInspector() {
    let inspectorDefinitionOutput = document.getElementById('site-builder__toolbar__output--schema-definition'); 
    let inspectorIframeOutput = document.getElementById('site-builder__toolbar__output--preview-module'); 
    let inspectorJSONInput = document.getElementById('site-builder__toolbar__input--edit-module'); 
    let moduleIndex = getActiveModuleIndex();

    if(moduleIndex < 0 || !modules[moduleIndex]) {
        inspectorJSONInput.value = '';
        inspectorIframeOutput.srcdoc = '';
        inspectorDefinitionOutput.innerHTML = '';
        return;
    }

    inspectorJSONInput.value = JSON.stringify(modules[moduleIndex], null, 4);

    UISchema.renderModuleIframe(modules[moduleIndex], inspectorIframeOutput);
        
    inspectorDefinitionOutput.innerHTML = JSON.stringify(UISchema.getSchema(modules[moduleIndex]['@type'], false), null, 4);
}

/**
 * Initialises the builder
 */
async function init() {
    // Drag 'n' drop
    for(let navItem of Array.from(document.querySelectorAll('.site-nav__item'))) {
        navItem.setAttribute('draggable', 'true');
        navItem.setAttribute('ondragstart', 'onNavItemDragStart(event);');
    }

    document.querySelector('.site-builder__modules').setAttribute('ondrop', 'onModulesDrop(event);');
    document.querySelector('.site-builder__modules').setAttribute('ondragover', 'onModulesDragOver(event);');

    // Toolbar
    document.getElementById('site-builder__toolbar__input--pick-page').addEventListener('change', onChangeName);
    document.getElementById('site-builder__toolbar__action--add-page').addEventListener('click', onClickAddPage);
    document.getElementById('site-builder__toolbar__action--remove-page').addEventListener('click', onClickRemovePage);
    document.getElementById('site-builder__toolbar__input--edit-module').addEventListener('change', onEditModule);
    document.getElementById('site-builder__toolbar__action--remove-module').addEventListener('click', onClickRemoveModule);
    
    // Saved pages
    renderPageNames();

    // Modules
    loadModules();
    renderModules();
    updateInspector();
}

UISchema.onready = init;
