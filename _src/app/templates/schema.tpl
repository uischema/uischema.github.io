<!DOCTYPE html>
<html>
    <head>
        <title>{{ name }}</title>

        <meta name="description" content="{{ description }}">
        
        {{> head }}
    </head>

    <body class="site-page">
        {{> nav }}

        <main class="site-main">
            <header class="site-header">
                <div class="ui-container site-header__container">
                    <h1 class="site-header__title">{{ name }}</h1>
                    <p class="site-header__description">{{ description }}</p>
                    
                    {{# schema.@role }}
                        <h4>Role: {{ . }}</h4>
                    {{/ schema.@role }}

                </div>
                
                <div class="site-header__links">
                    <div class="ui-container site-header__links__container">
                        {{# schema.@parent }}
                            <div class="site-header__links__group">
                                <span class="site-header__links__group__title">Parent: </span>
                                <a href="/{{ . }}" class="site-header__link">{{ . }}</a>
                            </div>
                        {{/ schema.@parent }}
                        {{# hasChildren }}
                            <div class="site-header__links__group">
                                <span class="site-header__links__group__title">Children: </span>
                                {{# children }}
                                    <a href="/{{ . }}" class="site-header__link">{{ . }}</a>
                                {{/ children }}
                            </div>
                        {{/ hasChildren }}
                    </div>
                </div>
            </header>
           
            <div class="site-schema" data-ui-schema="{{ schema.@type }}">
                <div class="ui-container">
                    {{# hasProperties }}
                        <h2>Properties</h2>
                        <table class="site-schema__properties">
                            {{# properties }}
                                <tr class="site-schema__property">
                                    <td class="site-schema__property__key">{{ key }}</td>
                                    <td class="site-schema__property__name">{{ name }}</td>
                                    <td class="site-schema__property__description">{{ description }}</td>
                                </tr>
                            {{/ properties }}
                        </table>
                    {{/ hasProperties }}
               
                    {{# hasOptions }}
                        <h3>Options</h3>
                        <table class="site-schema__properties">
                            {{# options }}
                                <tr class="site-schema__property">
                                    <td class="site-schema__property__key">{{ key }}</td>
                                    <td class="site-schema__property__name">{{ name }}</td>
                                    <td class="site-schema__property__description">{{ description }}</td>
                                </tr>
                            {{/ options }}
                        </table>
                    {{/ hasOptions }} 
               
                    <h2>Definition</h2>

                    <pre class="site-schema__code site-schema__definition"></pre>

                    {{# hasTemplate }}
                        <h2>Template</h2>

                        <pre class="site-schema__code site-schema__template"></pre>
                    {{/ hasTemplate }}
                    
                    {{# hasExample }}
                        <h2>Example</h2>
                    {{/ hasExample }}
                </div>

                {{# hasExample }}
                    <iframe class="site-schema__example"></iframe>
                {{/ hasExample }}
            </div>
        </main>

        {{> footer }}
        
        <script type="text/javascript" src="/js/mustache/index.js"></script>
        <script type="text/javascript" src="/js/script.js"></script>
        <script type="text/javascript" src="/js/schema.js"></script>
    </body>
</html>
