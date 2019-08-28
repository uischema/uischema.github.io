<!DOCTYPE html>
<html>
    <head>
        <title>{{ title }}</title>

        <meta name="description" content="{{ description }}">
        
        {{> head }}
    </head>
    <body class="site-page">
        {{> nav }}
            
        <main class="site-main">
            <div class="ui-container">
                {{{ content }}}
            </div>
        </main>

        {{> footer }}
        
        <script type="text/javascript" src="/js/mustache/index.js"></script>
        <script type="text/javascript" src="/js/script.js"></script>
    </body>
</html>
