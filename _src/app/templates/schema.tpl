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
           
            <div class="site-schema ui-container">
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

                {{# json }}
                    <pre class="site-schema__code">{{{ . }}}</pre>
                {{/ json }}

                <h2>Template</h2>

                {{# template }}
                    <pre class="site-schema__code">{{ . }}</pre>
                {{/ template }}

                {{# hasExample }} 
                    <h2>Example</h2>
                
                    <iframe class="site-schema__iframe" src="/{{ schema.@type }}.html" onload="resizeIframe(this);" scrolling="no"></iframe>
                {{/ hasExample }} 
            </div>
        </main>

        {{> footer }}
    </body>
</html>
