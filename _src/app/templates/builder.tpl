<!DOCTYPE html>
<html>
    <head>
        <title>Builder</title>

        <meta name="description" content="Build a web page!">
        
        {{> head }}
    </head>
    <body class="site-page">
        {{> nav }}
            
        <main class="site-main site-builder">
            <div class="site-builder__modules"></div>
           
            <div class="site-builder__toolbar">
                <div class="site-builder__toolbar__group">
                    <select class="site-builder__toolbar__input" id="site-builder__toolbar__input--pick-page" title="Page"></select>
                    <button class="site-builder__toolbar__action" id="site-builder__toolbar__action--add-page" title="Add page">➕</button>
                    <button class="site-builder__toolbar__action" id="site-builder__toolbar__action--remove-page" title="Remove page">🗑️</button>
                </div>
                <hr class="site-builder__toolbar__separator">
                <div class="site-builder__toolbar__group">
                    <label class="site-builder__toolbar__label">Modules used:</label><output class="site-builder__toolbar__output"  id="site-builder__toolbar__output--module-count">0</output>
                </div>
                <div class="site-builder__toolbar__group">
                    <label class="site-builder__toolbar__label">Schemas used:</label><output class="site-builder__toolbar__output"  id="site-builder__toolbar__output--schema-count">0/0</output>
                </div>
                <hr class="site-builder__toolbar__separator">
                <div class="site-builder__toolbar__group">
                    <label class="site-builder__toolbar__label" id="site-builder__toolbar__label--schema-type"></label>
                    <button class="site-builder__toolbar__action" id="site-builder__toolbar__action--remove-module" title="Remove module">❌</button>
                </div>
                <div class="site-builder__toolbar__group">
                    <textarea class="site-builder__toolbar__input code" id="site-builder__toolbar__input--edit-module"></textarea>
                </div>
                <div class="site-builder__toolbar__group">
                    <pre class="site-builder__toolbar__output code" id="site-builder__toolbar__output--schema-definition"></pre>
                </div>
            </div>
        </main>

        <script type="text/javascript" src="/js/mustache/index.js"></script>
        <script type="text/javascript" src="/js/script.js"></script>
        <script type="text/javascript" src="/js/builder.js"></script>
    </body>
</html>
