# Examples

This page provides a few examples on how to render UI schemas without using any libraries

## Schema example

```javascript
{
    "@context": "http://uischema.org",
    "@type": "SchemaType",
    "@parent": "ParentSchemaType",
    "@role": "partial|full",
    "@label": "field1",
    "@topic": [ "topic1", "topic2" ],
    "options": {
        "option1": "bool",
        "option2": "int"
    },
    "field1": "string",
    "field2": "text",
    "field3a": "html",
    "field3b": {
        "@type": "html",
        "@rules": {
            "min": 100,
            "max": 600
        }
    },
    "field4a": "AnotherSchemaType",
    "field4b": {
        "@type": "AnotherSchemaType"
    },
    "field5a": [ "AnotherSchemaType", "YetAnotherSchemaType" ],
    "field5b": {
        "@type": [ "AnotherSchemaType", "YetAnotherSchemaType" ],
        "@rules": {
            "min": 2,
            "max": 10
        }
    }
}
```

## Website examples

### Prerequisites

* The folders "/templates" and "/css" are in your website's project folder
* A REST API or a JSON file on disk is reachable from the website

### PHP

(using [mustache](https://github.com/bobthecow/mustache.php)):

```php
<?php

// Fetch the content (this could be a JSON file on disk as well)
$page = file_get_contents('http://cms.example.com/page');

// Init Mustache
$mustache = new Mustache_Engine([
    'loader' => new Mustache_Loader_FilesystemLoader(__DIR__ . '/templates', [ 'extension' => '.tpl' ])
]);

// Render
echo $mustache->render($data['@type'], $page);

?>
```

### Node.js

(using [mustache](https://github.com/janl/mustache.js)):

```javascript
const FileSystem = require('fs');
const HTTP = require('http');
const HTTPS = require('https');
const Path = require('path');
const Url = require('url');
const Util = require('util');

const Mustache = require('mustache');

// Preload all templates
async function loadTemplates() {
    let templates = {};
    let files = await Util.promisify(FileSystem.readdir)(Path.join(__dirname, 'templates'));

    for(let filename of files) {
        let name = Path.basename(filename, Path.extname(filename));

        templates[name] = await Util.promisify(FileSystem.readFile)(Path.join(__dirname, 'templates', filename), 'utf8');
    }

    return templates;
}

// Fetch the content (this could be a JSON file on disk as well)
function getPage(url) {
    return new Promise((resolve, reject) => {
        HTTPS.get(url, (apiResponse) => {
            let data = '';

            apiResponse.on('data', (chunk) => {
                data += chunk;
            });

            apiResponse.on('end', () => {
                resolve(JSON.parse(data));
            });

        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Serve web requests
async function serve(req, res) {
    let templates = await loadTemplates();

    let result = '';

    switch(req.url) {
        // Make sure the stylesheet is served properly
        case '/css/uischema.org.css':
            result = await Util.promisify(FileSystem.readFile)(Path.join(__dirname, 'css/uischema.org.css'), 'utf8');
            res.writeHead(200, {'Content-Type': 'text/css'});
            break;
        
        // Render a page
        default:
            let data = await getPage('https://cms.example.com/page');

            result += '<!DOCTYPE html><link rel="stylesheet" type="text/css" href="/css/uischema.org.css">';
            result += Mustache.render(templates[data['@type']], data, templates);

            res.writeHead(200, {'Content-Type': 'text/html'});
            break;
    }

    res.end(result);
}

HTTP.createServer(serve).listen(4000);
```

### Ruby

(using [mustache](https://github.com/mustache/mustache)):

```ruby
require 'socket'
require 'json'
require 'net/http'
require 'mustache'

server = TCPServer.new(4000)

loop do
    # Init Mustache
    mustache = Mustache.new
    mustache.template_path = __dir__ + '/templates'

    # Set up web server
    request = server.accept
    response = ''

    path = URI(request.gets.split(' ')[1]).path

    header = "HTTP/1.1 200 OK\r\n"

    case path
    # Make sure the stylesheet is served properly
    when '/css/uischema.org.css'
        header += "Content-Type: text/css\r\n"

        file_path = __dir__ + '/css/uischema.org.css'

        response = File.read(file_path)
    
    # Render a page
    else
        header += "Content-Type: text/html\r\n"

        # Fetch the content (this could be a JSON file on disk as well)
        data = JSON.parse(Net::HTTP.get('cms.example.com', '/page'))

        template = File.read(__dir__ + '/templates/' + data['@type'] + '.tpl')

        response = '<!DOCTYPE html><link rel="stylesheet" type="text/css" href="/css/uischema.org.css">';
        response += mustache.render(template, data)
    end

    header += "Content-Length: #{ response.bytesize }\r\n"
    header += "Connection: close\r\n"

    request.puts header
    request.puts "\r\n"

    request.puts response

    request.close
end
```
