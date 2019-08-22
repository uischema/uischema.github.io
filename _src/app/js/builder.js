'use strict';

let modules = [];

/**
 * Loads the page modules
 */
function loadModules() {
    let name = document.getElementById('site-builder__toolbar__input--name').value || 'My page';

    modules = JSON.parse(localStorage.getItem('builder:' + name) || '[]');
}

/**
 * Saves the page modules
 */
function saveModules() {
    let name = document.getElementById('site-builder__toolbar__input--name').value || 'My page';

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
    let selector = document.getElementById('site-builder__toolbar__input--name');
    let name = selector.value;

    localStorage.removeItem('builder:' + name);

    console.log('Removed page "' + name + '"');

    renderPageNames();

    loadModules();
    saveModules();
    renderModules();
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
 * Renders all page names
 *
 * @param {String} selected
 */
function renderPageNames(selected) {
    let pageSelector = document.getElementById('site-builder__toolbar__input--name');

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
    let modulesContainer = document.querySelector('.site-builder__modules');

    modulesContainer.innerHTML = '';

    for(let module of modules) {
        let newModule = document.createElement('div');
        newModule.className = 'site-builder__module';
        
        newModule.innerHTML = UISchema.renderModule(module);

        modulesContainer.appendChild(newModule);
    }
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
    document.getElementById('site-builder__toolbar__input--name').addEventListener('change', onChangeName);
    document.getElementById('site-builder__toolbar__action--add').addEventListener('click', onClickAddPage);
    document.getElementById('site-builder__toolbar__action--remove').addEventListener('click', onClickRemovePage);
    
    // Saved pages
    renderPageNames();

    // Modules
    loadModules();
    renderModules();
}

UISchema.onready = init;
