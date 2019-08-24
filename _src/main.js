'use strict';

const Path = require('path');
const FileSystem = require('fs');
const Mustache = require(Path.join(__dirname, 'app', 'js', 'mustache'));
const HTTP = require('http');
const Url = require('url');
const Util = require('util');

const PORT = 4000;

// Directiories
const SRC_DIR = Path.join(__dirname);
const ROOT_DIR = Path.join(SRC_DIR, '../');

// Custom directories
const CUSTOM_DIR = Path.join(SRC_DIR, 'custom');
const CUSTOM_TEMPLATE_DIR = Path.join(CUSTOM_DIR, 'templates');
const CUSTOM_SCHEMA_DIR = Path.join(CUSTOM_DIR, 'schemas');
const CUSTOM_CSS_DIR = Path.join(CUSTOM_DIR, 'css');
const CUSTOM_EXAMPLES_DIR = Path.join(CUSTOM_DIR, 'examples');
const CUSTOM_I18N_DIR = Path.join(CUSTOM_SCHEMA_DIR, 'i18n');

// App directories
const APP_DIR = Path.join(SRC_DIR, 'app');
const APP_CSS_DIR = Path.join(APP_DIR, 'css');
const APP_JS_DIR = Path.join(APP_DIR, 'js');
const APP_TEMPLATE_DIR = Path.join(APP_DIR, 'templates');

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
 * Gets app templates
 *
 * @return {Object} Templates
 */
async function getAppTemplates() {
    let templates = {};
    
    for(let filename of await readDir(APP_TEMPLATE_DIR)) {
        templates[Path.basename(filename, '.tpl')] = await readFile(Path.join(APP_TEMPLATE_DIR, filename));
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
    
    for(let filename of await readDir(CUSTOM_TEMPLATE_DIR)) {
        templates[Path.basename(filename, '.tpl')] = await readFile(Path.join(CUSTOM_TEMPLATE_DIR, filename));
    }

    return templates;
}

/**
 * Gets a schema template
 *
 * @param {String} type
 *
 * @return {String} Template
 */
async function getSchemaTemplate(type) {
    return await readFile(Path.join(CUSTOM_TEMPLATE_DIR, type) + '.tpl');
}

/**
 * Gets a schema example
 *
 * @param {String} type
 *
 * @return {Object} Example
 */
async function getSchemaExample(type) {
    let example = await readFile(Path.join(CUSTOM_EXAMPLES_DIR, type) + '.json');

    try {
        return JSON.parse(example);

    } catch(e) {
        return null;
    
    }
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

    let path = Path.join(CUSTOM_I18N_DIR, language, type + '.json');
    
    let data = await readFile(path);

    if(!data) { throw new Error('Internationalisation for ' + path + ' not found'); }
    
    return JSON.parse(data);
}

/**
 * Applies app view data to a view object
 *
 * @param {Object} view
 */
async function applyAppViewData(view) {
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
}

/**
 * Checks whether a schema has an example
 *
 * @return {Boolean} Result
 */
function schemaHasExample(type) {
    return FileSystem.existsSync(Path.join(SRC_DIR, 'examples', type + '.json'));
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
    let appTemplates = await getAppTemplates();
    let schemaTemplates = await getSchemaTemplates();

    // App data
    await applyAppViewData(view);

    // Definition content
    view['schema'] = await getSchema(type);

    // Children
    view['children'] = [];

    for(let schema of view['schemas']) {
        if(schema['@parent'] === view['schema']['@type']) {
            view['children'].push(schema['@type']);
        }
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
    view['hasOptions'] = Array.isArray(view['options']) && view['options'].length > 0;
    view['hasProperties'] = Array.isArray(view['properties']) && view['properties'].length > 0;
    view['hasExample'] = schemaHasExample(type);

    // Render the view
    return Mustache.render(appTemplates['schema'], view, appTemplates);
}

/**
 * Renders the index page
 *
 * @return {String} HTML
 */
async function renderIndexPage() {
    // Load all templates
    let templates = await getAppTemplates();
    
    // Init view
    let view = {};

    // App data
    await applyAppViewData(view);

    return Mustache.render(templates['index'], view, templates);
}

/**
 * Renders the builder page
 *
 * @return {String} HTML
 */
async function renderBuilderPage() {
    // Load all templates
    let templates = await getAppTemplates();
    
    // Init view
    let view = {};

    // App data
    await applyAppViewData(view);

    return Mustache.render(templates['builder'], view, templates);
}

/**
 * Gets the combined JSON responses
 *
 * @return {Array} Responses
 */
async function getSchemas() {
    let all = [];
    
    for(let file of await readDir(Path.join(CUSTOM_SCHEMA_DIR))) {
        let extension = Path.extname(file)
        let type = Path.basename(file, extension);

        if(extension !== '.json') { continue; }
        
        let json = await getSchema(type);

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
 * Gets schema examples
 *
 * @return {Array} Examples
 */
async function getSchemaExamples() {
    let examples = [];
    
    for(let filename of await readDir(CUSTOM_EXAMPLES_DIR)) {
        if(Path.extname(filename) !== '.json') { continue; }

        let json = await readFile(Path.join(CUSTOM_EXAMPLES_DIR, filename));

        json = JSON.parse(json);

        examples.push(json);
    }

    return examples;
}

/**
 * Renders a JSON response
 *
 * @param {String} type
 *
 * @return {Object} JSON
 */
async function getSchema(type) {
    let file = type + '.json';
    let json = await readFile(Path.join(CUSTOM_SCHEMA_DIR, file));
    
    if(!json) { throw new Error('JSON file "' + file + '" could not be found in /schemas'); }
    
    json = JSON.parse(json);
    json['@i18n'] = {};

    for(let language of await readDir(Path.join(CUSTOM_I18N_DIR))) {
        let i18n = await readFile(Path.join(CUSTOM_I18N_DIR, language, file));

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
        // Assets
        case 'favicon.ico':
            res.writeHead(404);
            res.end();
            break;
        
        case 'css':
            let css = '';

            css = await readFile(Path.join(CUSTOM_CSS_DIR, path[1]));
            
            if(!css) {
                css = await readFile(Path.join(APP_CSS_DIR, path[1]));
            }

            res.writeHead(200, { 'Content-Type': 'text/css' }); 
            res.end(css);
            break;
       
        case 'js':
            path.shift();

            let js = await readFile(Path.join(APP_JS_DIR, path.join('/')));

            res.writeHead(200, { 'Content-Type': 'text/javascript' }); 
            res.end(js);
            break;

        case 'img':
            let img = await readFile(Path.join('app', 'img', path[1]), true);

            if(path[1].indexOf('.svg') > -1) {
                res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); 
            } else {
                res.writeHead(200, { 'Content-Type': 'image/jpeg' }); 
            }
            
            res.end(img);
            break;

        // JSON API
        case 'schemas.json':
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            res.end(JSON.stringify(await getSchemas()));
            break;
        
        case 'templates.json':
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            res.end(JSON.stringify(await getSchemaTemplates()));
            break;
        
        case 'examples.json':
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            res.end(JSON.stringify(await getSchemaExamples()));
            break;
        
        case 'topics.json':
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            res.end(JSON.stringify(await getTopics()));
            break;

        // Builder
        case 'builder':
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(await renderBuilderPage());
            break;

        // Index page
        case undefined:
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(await renderIndexPage());
            break;

        // Schema page
        default:
            try {
                let queryPattern = /\?.+/g;
                let extension = Path.extname(path[0]).replace(queryPattern, '');
                let type = Path.basename(path[0], Path.extname(path[0]));
                let query = path[0].match(queryPattern);

                if(query) { query = query[0]; }

                switch(extension) {
                    case '.json':
                        let json = await getSchema(type);
                        
                        json = JSON.stringify(json);

                        res.writeHead(200, { 'Content-Type': 'application/json' }); 
                        res.end(json);
                        break;
                    
                    case '':
                        let html = await renderSchemaPage(type, 'en');

                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(html);
                        break;

                    default:
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end(path[0] + ' is invalid');
                        break;
                
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
        
        // Render the builder page
        let builderPage = await renderBuilderPage();

        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'builder'));
        await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, 'builder', 'index.html'), builderPage);

        // Render the schema pages
        for(let json of await getSchemas()) {
            let type = json['@type'];
            
            await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, type));

            let schemaPage = await renderSchemaPage(type, 'en');

            await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, type, 'index.html'), schemaPage);
        }
            
        // Create "css" directory
        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'css'));
        await Util.promisify(FileSystem.copyFile)(Path.join(APP_CSS_DIR, 'style.css'), Path.join(ROOT_DIR, 'css', 'style.css'));
        await Util.promisify(FileSystem.copyFile)(Path.join(CUSTOM_CSS_DIR, 'uischema.org.css'), Path.join(ROOT_DIR, 'css', 'uischema.org.css'));
        
        // Create "js" directory
        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'js'));
        await Util.promisify(FileSystem.copyFile)(Path.join(APP_DIR, 'js', 'script.js'), Path.join(ROOT_DIR, 'js', 'script.js'));
        await Util.promisify(FileSystem.copyFile)(Path.join(APP_DIR, 'js', 'schema.js'), Path.join(ROOT_DIR, 'js', 'schema.js'));
        await Util.promisify(FileSystem.copyFile)(Path.join(APP_DIR, 'js', 'builder.js'), Path.join(ROOT_DIR, 'js', 'builder.js'));
        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'js', 'mustache'));
        await Util.promisify(FileSystem.copyFile)(Path.join(APP_DIR, 'js', 'mustache', 'index.js'), Path.join(ROOT_DIR, 'js', 'mustache', 'index.js'));

        // Create "img" directory
        await Util.promisify(FileSystem.mkdir)(Path.join(ROOT_DIR, 'img'));

        for(let filename of await readDir(Path.join(APP_DIR, 'img'))) {
            if(Path.extname(filename) !== '.jpg' && Path.extname(filename) !== '.svg') { continue; }

            await Util.promisify(FileSystem.copyFile)(Path.join(APP_DIR, 'img', filename), Path.join(ROOT_DIR, 'img', filename));
        }

        // Copy schema files
        let schemas = await getSchemas();

        for(let json of schemas) {
            await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, json['@type'] + '.json'), JSON.stringify(json));
        }

        // Create API json files
        schemas = JSON.stringify(schemas);
        await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, 'schemas.json'), schemas);
    
        let templates = JSON.stringify(await getSchemaTemplates())
        await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, 'templates.json'), templates);
        
        let topics = JSON.stringify(await getTopics())
        await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, 'topics.json'), topics);
        
        let examples = JSON.stringify(await getSchemaExamples())
        await Util.promisify(FileSystem.writeFile)(Path.join(ROOT_DIR, 'examples.json'), examples);

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
