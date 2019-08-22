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
            <div class="site-builder__toolbar ui-container">
                <select class="site-builder__toolbar__input" id="site-builder__toolbar__input--name" title="Page"></select>
                <button class="site-builder__toolbar__action" id="site-builder__toolbar__action--add" title="Add page">➕</button>
                <button class="site-builder__toolbar__action" id="site-builder__toolbar__action--remove" title="Remove page">🗑️</button>
            </div>

            <div class="site-builder__modules"></div>
        </main>

        <script type="text/javascript" src="/js/mustache/index.js"></script>
        <script type="text/javascript" src="/js/script.js"></script>
        <script type="text/javascript" src="/js/builder.js"></script>
    </body>
</html>
