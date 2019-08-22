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
            <div class="site-builder__slot"></div>
        </main>

        {{> footer }}

        <script type="text/javascript" src="/js/builder.js"></script>
    </body>
</html>
