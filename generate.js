'use strict';

const FileSystem = require('fs');
const Marked = require('marked');
const Path = require('path');

let files = {
    'index.html': 'README.md',
    'examples/index.html': 'EXAMPLES.md',
    'specification/index.html': 'SPECIFICATION.md'
};
  
for(let name in files) {
    let md = FileSystem.readFileSync(Path.join(__dirname, files[name])).toString();
    let html = Marked(md);
    
    // Create folder
    if(name.indexOf('/') > -1) {
        let path = Path.join(__dirname, name.split('/')[0]);

        if(!FileSystem.existsSync(path)) {
            FileSystem.mkdirSync(path);
        }
    }

    // Append HTML
    html = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>uischema.org</title>
        <style type="text/css">
            body {
                margin: 3rem auto;
                max-width: 60rem;
                width: calc(100% - 4rem);
                line-height: 1.6;
                font-size: 16px;
                color: #444;
            }

            h1, h2, h3 {
                line-height:1.2;
            }

            nav {
                display: flex;
                margin-bottom: 3rem;
            }
                nav a {
                    margin-left: 0.5rem;
                }

                nav a:first-child {
                    flex-grow: 1;
                    margin-left: 0;
                }

            code {
                color: dodgerblue;
            }

            pre {
                background-color: lightgrey;
                padding: 1rem;
                overflow: auto;
            }
                pre code {
                    color: dimgrey;
                }

            table th {
                text-align: left;
                padding-right: 1rem;
            }

            table td {
                padding-right: 1rem;
            }
        </style>
    </head>
    <body>
        <nav>
            <a href="/">uischema.org</a>
            <a href="/examples">Examples</a>
            <a href="/specification">Specification</a>
        </nav>

        ${html}
    </body>
</html>`;

    // Write file
    FileSystem.writeFileSync(Path.join(__dirname, name), html);
}
