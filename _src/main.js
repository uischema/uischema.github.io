'use strict';

const Path = require('path');
const FileSystem = require('fs');
const Mustache = require(Path.join(__dirname, 'lib', 'mustache'));
const HTTP = require('http');
const Url = require('url');
const Util = require('util');

const PORT = 4000;
const SRC_DIR = Path.join(__dirname);
const ROOT_DIR = Path.join(SRC_DIR, '../');
const TEMPLATE_DIR = Path.join(SRC_DIR, 'templates');
const SCHEMA_DIR = Path.join(SRC_DIR, 'schemas');
const I18N_DIR = Path.join(SCHEMA_DIR, 'i18n');

/**
 * Reads a file
 *
 * @param {String} path
 *
 * @return {Buffer} File
 */
async function readFile(path, isBinary = false) {
    try {
        return await Util.promisify(FileSystem.readFile)(path, !isBinary ? 'utf8' : undefined);

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
        return await Util.promisify(FileSystem.readdir)(path);

    } catch(e) {
        return [];
    }
}

/**
 * Gets site templates
 *
 * @return {Object} Templates
 */
async function getSiteTemplates() {
    let templates = {};
    
    for(let filename of await readDir(Path.join(SRC_DIR,'mustache'))) {
        templates[filename.replace('.mustache', '')] = await readFile(Path.join(SRC_DIR, 'mustache', filename));
    }

    return templates;
}

/**
 * Gets schema templates
 *
 * @return {Object} Templates
 */
async function getSchemaTemplates() {
    let templates = {};
    
    for(let filename of await readDir(TEMPLATE_DIR)) {
        templates[filename.replace('.mustache', '')] = await readFile(Path.join(TEMPLATE_DIR, filename));
    }

    return templates;
}

/**
 * Gets internationalisations for a type
 *
 * @param {String} type
 * @param {String} language
 *
 * @return {Object} Internationalisation
 */
async function getInternationalization(type, language) {
    if(!type) { throw new Error('Type is required'); }
    if(!language) { throw new Error('Language is required'); }

    let path = Path.join(I18N_DIR, language, type + '.json');
    
    let data = await readFile(path);

    if(!data) { throw new Error('Internationalisation for ' + path + ' not found'); }
    
    return JSON.parse(data);
}

/**
 * Render a schema page
 *
 * @param {String} type
 * @param {String} language
 *
 * @return {String} HTML
 */
async function renderSchemaPage(type, language) {
    if(!type) { throw new Error('Type is required'); }
    if(!language) { throw new Error('Language is required'); }

    let view = {};

    // Get templates
    let siteTemplates = await getSiteTemplates();
    let schemaTemplates = await getSchemaTemplates();

    // List of all schemas (for the nav)
    view['topics'] = await getTopics();
    view['schemas'] = await getSchemas();
   
    // Assign ids to topics
    for(let i in view['topics']) {
        view['topics'][i] = {
            id: i,
            name: view['topics'][i]
        };

        for(let schema of view['schemas']) {
            if(!schema['@topic']) { continue; }

            if(!Array.isArray(schema['@topic'])) {
                schema['@topic'] = [ schema['@topic'] ];
            }

            let topicIndex = schema['@topic'].indexOf(view['topics'][i]['name']);
        
            if(topicIndex > -1) {
                schema['@topic'][topicIndex] = view['topics'][i];
            }
        }
    }


    // Definition content
    view['schema'] = await getSchema(type + '.json');
    view['template'] = schemaTemplates[type];
    view['json'] = await readFile(Path.join(SCHEMA_DIR, type + '.json'));

    // Children
    view['children'] = [];

    for(let schema of view['schemas']) {
        if(schema['@parent'] === view['schema']['@type']) {
            view['children'].push(schema['@type']);
        }
    }

    // Example JSON, HTML and iFrame
    view['exampleJSON'] = await readFile('examples/' + type + '.json');

    if(view['exampleJSON']) {
        let json = JSON.parse(view['exampleJSON']);
        view['exampleJSON'] = JSON.stringify(json, null, 4);

        let html = await Mustache.render(schemaTemplates[type], json, schemaTemplates);
        view['exampleHTML'] = html;                

        let iframe = '<!DOCTYPE html><meta name="viewport" content="width=device-width, initial-scale=0.6"><meta charset="utf8"><link rel="stylesheet" type="text/css" href="/css/style.css">' + html;
        iframe = iframe.replace(/\n/g, '');
        view['exampleIframe'] = iframe;
    }

    // Properties
    view['properties'] = await getInternationalization(type, language);

    // Extract the name and description
    view['name'] = view['properties']['@name'];
    view['description'] = view['properties']['@description'];

    delete view['properties']['@name'];
    delete view['properties']['@description'];

    // Extract the options
    if(view['properties']['options']) {
        let options = [];
        
        for(let key in view['properties']['options']) {
            if(key[0] === '@') { continue; }

            options.push({
                'key': key,
                'name': view['properties']['options'][key]['@name'],
                'description': view['properties']['options'][key]['@description']
            });
        }

        view['options'] = options;
    }
    
    delete view['properties']['options'];
   
    let parentProperties

    let properties = [];

    for(let key in view['properties']) {
        properties.push({
            'key': key,
            'name': view['properties'][key]['@name'],
            'description': view['properties'][key]['@description']
        });
    }

    view['properties'] = properties;

    // Booleans
    view['hasChildren'] = view['children'].length > 0;
    view['hasExample'] = !!view['exampleJSON'];
    view['hasOptions'] = Array.isArray(view['options']) && view['options'].length > 0;
    view['hasProperties'] = Array.isArray(view['properties']) && view['properties'].length > 0;

    // Render the view
    return Mustache.render(siteTemplates['schema'], view, siteTemplates);
}

/**
 * Renders the index page
 *
 * @return {String} HTML
 */
async function renderIndexPage() {
    // Load all templates
    let templates = {};
    
    for(let filename of await readDir(Path.join(SRC_DIR, 'mustache'))) {
        templates[filename.replace('.mustache', '')] = await readFile(Path.join(SRC_DIR, 'mustache', filename));
    }
    
    // Init view
    let view = {};

    view['schemas'] = await getSchemas();

    return Mustache.render(templates['index'], view, templates);
}

/**
 * Gets the combined JSON responses
 *
 * @return {Array} Responses
 */
async function getSchemas() {
    let all = [];
    
    for(let file of await readDir(Path.join(SCHEMA_DIR))) {
        if(Path.extname(file) !== '.json') { continue; }
        
        let json = await getSchema(file);

        all.push(json);
    }

    return all;
}

/**
 * Gets all topics
 *
 * @return {Array} Topics
 */
async function getTopics() {
    let topics = [];

    for(let schema of await getSchemas()) {
        if(!schema['@topic']) { continue; }

        if(Array.isArray(schema['@topic'])) {
            for(let topic of schema['@topic']) {
                if(topics.indexOf(topic) < 0) {
                    topics.push(topic);
                }
            }
        } else if(typeof schema['@topic'] === 'string') {
            let topic = schema['@topic'];
            
            if(topics.indexOf(topic) < 0) {
                topics.push(topic);
            }
        }
    }

    return topics.sort();
}

/**
 * Renders a JSON response
 *
 * @param {String} file
 *
 * @return {Object} JSON
 */
async function getSchema(file) {
    if(file.indexOf('.json') < 0) { file += '.json'; }
    
    let json = await readFile(Path.join(SCHEMA_DIR, file));
    
    if(!json) { throw new Error('JSON file "' + file + '" could not be found in /schemas'); }
    
    json = JSON.parse(json);
    json['@i18n'] = {};

    for(let language of await readDir(Path.join(I18N_DIR))) {
        let i18n = await readFile(Path.join(I18N_DIR, language, file));

        if(i18n) {
            json['@i18n'][language] = JSON.parse(i18n);
        }
    }

    return json;
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
                if(path[0].indexOf('.json') > -1) {
                    let json = null;
                    
                    if(path[0] === 'all.json') {
                        json = await getSchemas();
                    } else {
                        json = await getSchema(path[0]);
                    }
                        
                    json = JSON.stringify(json);

                    res.writeHead(200, { 'Content-Type': 'application/json' }); 
                    res.end(json);

                } else {
                    let html = await renderSchemaPage(path[0], 'en');

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                
                }
            
            } catch(e) {
                res.writeHead(404);
                res.end(e.stack || e.message);
            }
            break;
    }
}

/**
 * Generates the pages
 */
async function generate() {
    try {
        // Remove all but the default files in the root dir
        for(let filename of await readDir(ROOT_DIR)) {
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
        for(let json of await getSchemas()) {
            let type = json['@type'];
            
            await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, type));

            let schemaPage = await renderSchemaPage(type, 'en');

            await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, type, 'index.html'), schemaPage);
        }
            
        // Create "css" directory
        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'css'));
      
        for(let filename of await readDir('css')) {
            if(Path.extname(filename) !== '.css') { continue; }

            await Util.promisify(FileSystem.copyFile)(Path.join(SRC_DIR, 'css', filename), Path.join(ROOT_DIR, 'css', filename));
        }

        // Create "img" directory
        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'img'));

        for(let filename of await readDir('img')) {
            if(Path.extname(filename) !== '.jpg') { continue; }

            await Util.promisify(FileSystem.copyFile)(Path.join(SRC_DIR, 'img', filename), Path.join(ROOT_DIR, 'img', filename));
        }

        // Copy JSON files
        let all = await getSchemas();

        for(let json of all) {
            await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, json['@type'] + '.json'), JSON.stringify(json));
        }

        all = JSON.stringify(all);
                
        await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, 'all.json'), all);
    
    } catch(e) {
        console.log(e.stack || e.message);
        
    }
}

/**
 * Main
 */
async function main() {
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
