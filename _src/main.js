'use strict';

const Path = require('path');
const FileSystem = require('fs');
const Mustache = require(Path.join(__dirname, 'lib', 'uischema.org', 'lib', 'mustache'));
const HTTP = require('http');
const UISchema = require(Path.join(__dirname, 'lib', 'uischema.org'));
const Url = require('url');
const Util = require('util');

const PORT = 4000;
const ROOT_DIR = Path.join(__dirname, '../');
const MUSTACHE = {};

let isDirty = true;

/**
 * Reads a file
 *
 * @param {String} path
 *
 * @return {Buffer} File
 */
async function readFile(path, isBinary = false) {
    try {
        return await Util.promisify(FileSystem.readFile)(Path.join(__dirname, path), !isBinary ? 'utf8' : undefined);

    } catch(e) {
        return null;
    }
}

/**
 * Removes a file or directory
 *
 * @param {String} path
 */
async function unlink(path) {
    if(FileSystem.lstatSync(path).isDirectory()) {
        for(let filename of await Util.promisify(FileSystem.readdir)(path)) {
            await unlink(Path.join(path, filename));
        }
    
        await Util.promisify(FileSystem.rmdir)(path);

    } else {
        await Util.promisify(FileSystem.unlink)(path);

    }
}

/**
 * Reads a directory
 *
 * @param {String} path
 *
 * @return {Array} Files
 */
async function readDir(path) {
    try {
        return await Util.promisify(FileSystem.readdir)(Path.join(__dirname, path));

    } catch(e) {
        return [];
    }
}

/**
 * Loads all views
 */
async function loadViews() {
    for(let filename of await readDir('mustache')) {
        MUSTACHE[filename.replace('.mustache', '')] = await readFile('mustache/' + filename);
    }
}

/**
 * Render a schema page
 *
 * @param {String} type
 *
 * @return {String} HTML
 */
async function renderSchemaPage(type) {
    let view = {};

    // List of all schemas (for the nav)
    view['schemas'] = Object.values(await UISchema.getSchemas());
    
    // Definition content
    view['schema'] = await UISchema.getSchema(type);
    view['template'] = await UISchema.getTemplate(type);
    view['json'] = await readFile('lib/uischema.org/schemas/' + type + '.json');

    // Example JSON, HTML and iFrame
    view['exampleJSON'] = await readFile('examples/' + type + '.json');

    if(view['exampleJSON']) {
        let json = JSON.parse(view['exampleJSON']);
        json = await UISchema.check(json['@type'], json);
        view['exampleJSON'] = JSON.stringify(json, null, 4);

        let html = await UISchema.render(json);
        view['exampleHTML'] = html;                

        let iframe = '<!DOCTYPE html><meta name="viewport" content="width=device-width, initial-scale=0.6"><meta charset="utf8"><link rel="stylesheet" type="text/css" href="/css/style.css">' + html;
        iframe = iframe.replace(/\n/g, '');
        view['exampleIframe'] = iframe;
    }

    // Properties
    view['properties'] = view['schema']['@i18n']['en'];

    // Extract the name and description
    view['name'] = view['properties']['@name'];
    view['description'] = view['properties']['@description'];

    delete view['properties']['@name'];
    delete view['properties']['@description'];

    // Extract the options
    if(view['properties']['options']) {
        view['options'] = Object.values(view['properties']['options']);
    }
    
    view['properties'] = Object.values(view['properties']).filter((x) => { return !!x && !!x['@name'] && !!x['@description']; });

    // Booleans
    view['hasExample'] = !!view['exampleJSON'];
    view['hasOptions'] = Array.isArray(view['options']) && view['options'].length > 0;
    view['hasProperties'] = Array.isArray(view['properties']) && view['properties'].length > 0;

    // Render the view
    return Mustache.render(MUSTACHE['schema'], view, MUSTACHE);
}

/**
 * Renders the index page
 *
 * @return {String} HTML
 */
async function renderIndexPage() {
    let view = {};

    view['schemas'] = Object.values(await UISchema.getSchemas());

    return Mustache.render(MUSTACHE['index'], view, MUSTACHE);
}

/**
 * Serve
 */
async function serve(req, res) {
    let path = Url
        .parse(req.url)
        .path
        .split('/')
        .filter((x) => { return !!x; });

    switch(path[0]) {
        case 'favicon.ico':
            res.writeHead(404);
            res.end();
            break;

        case 'css':
            let css = await readFile('css/' + path[1]);

            res.writeHead(200, { 'Content-Type': 'text/css' }); 
            res.end(css);
            break;
        
        case 'img':
            let img = await readFile('img/' + path[1], true);

            res.writeHead(200, { 'Content-Type': 'image/jpeg' }); 
            res.end(img);
            break;

        // Index page
        case undefined:
            let html = await renderIndexPage();

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
            break;

        // Schema page
        default:
            try {
                let html = await renderSchemaPage(path[0]);

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            
            } catch(e) {
                res.writeHead(404);
                res.end(e.message);
            
                throw e;
            }
            break;
    }
}

/**
 * Generates the pages
 */
async function generate() {
    // Remove all but the default files in the root dir
    for(let filename of await Util.promisify(FileSystem.readdir)(ROOT_DIR)) {
        if(
            filename === '_src' ||
            filename === 'CNAME' ||
            filename === '.git' ||
            filename === '.gitignore' ||
            filename === '.gitmodules' ||
            filename === '.' || 
            filename === '..'
        ) { continue; }

        await unlink(Path.join(ROOT_DIR, filename));
    }

    // Render the index page
    let indexPage = await renderIndexPage();

    await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, 'index.html'), indexPage);

    // Render the schema pages
    for(let type in await UISchema.getSchemas()) {
        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, type));

        let schemaPage = await renderSchemaPage(type);

        await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, type, 'index.html'), schemaPage);
    }
        
    // Create "css" directory
    await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'css'));
  
    for(let filename of await Util.promisify(FileSystem.readdir)(Path.join(__dirname, 'css'))) {
        if(Path.extname(filename) !== '.css') { continue; }

        await Util.promisify(FileSystem.copyFile)(Path.join(__dirname, 'css', filename), Path.join(ROOT_DIR, 'css', filename));
    }

    // Create "img" directory
    await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'img'));

    for(let filename of await Util.promisify(FileSystem.readdir)(Path.join(__dirname, 'img'))) {
        if(Path.extname(filename) !== '.jpg') { continue; }

        await Util.promisify(FileSystem.copyFile)(Path.join(__dirname, 'img', filename), Path.join(ROOT_DIR, 'img', filename));
    }
}

/**
 * Main
 */
async function main() {
    // Load all views into memory first
    await loadViews();
    
    switch(process.argv[2]) {
        case 'serve':
            console.log('Running server on port ' + PORT + '...');
            HTTP.createServer(serve).listen(PORT);
            break;

        case 'generate':
            console.log('Generating site...');
            await generate();
            console.log('...done generating site');
            break;

        default:
            console.log('Usage: node main.js [generate|serve]');
            break;
    }
}

main();
