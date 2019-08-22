'use strict';

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
function onSlotDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Event: Dropping onto a slot
 *
 * @param {InputEvent} e
 */
function onSlotDrop(e) {
    let type = e.dataTransfer.getData('type');
   
    console.log(type);

    let newModule = document.createElement('iframe');
    newModule.className = 'site-builder__module';
    newModule.src = '/' + type + '.html';
    newModule.scrolling = false;
    newModule.setAttribute('onload', 'resizeIframe(this)');

    e.target.parentElement.insertBefore(newModule, e.target);
    e.preventDefault();
}

/**
 * Initialises the builder
 */
function init() {
    for(let navItem of Array.from(document.querySelectorAll('.site-nav__item'))) {
        navItem.setAttribute('draggable', 'true');
        navItem.setAttribute('ondragstart', 'onNavItemDragStart(event);');
    }

    for(let slot of Array.from(document.querySelectorAll('.site-builder__slot'))) {
        slot.setAttribute('ondrop', 'onSlotDrop(event);');
        slot.setAttribute('ondragover', 'onSlotDragOver(event);');
    }
}

init();
