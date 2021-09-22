# uischema.org

A portable standard for web modules

## What?

In short, UI schema is a supplement to [schema.org](http://schema.org).

Whereas they aim to provide a sensible specification for information architecture, UI schema aims to do the same for presentation and authoring of visual content.

## Why?

Because websites are still a hot mess, and we want to help fix that.

Realistically speaking, there is no such thing as a de facto CMS or website framework, and there won't be in the foreseeable future.

We believe that CMS'es, and the websites they provide content for, are in need of a sensible standard in order to communicate more seamlessly.

If every CMS and website could be taught the same language, the technical and communicational workload of web solution providers could be reduced, which would free up their time to work on making the best user experiences they can think of.

### Provider/client communication

When both parties are familiar with the terms used to describe a website, the communication barrier is significantly reduced.

### SEO

All software that outputs uischema.org modules also complies with the schema.org specification, so you can render the output as json-ld directly.

### CMS agnostic content

By installing a plugin, schemas and authored content can be exported and imported to and from other CMS'es.

### Web agnostic templates

Reduce the amount of markup work needed by keeping a handy collection of templates that can be used anywhere.

## How?

### CMS

The following CMS'es are officially supported:

* [HashBrown](https://hashbrowncms.org) has built-in support (schemas go in the `/plugins/YOUR_PLUGIN/schemas/` folder)
* [Drupal](https://drupal.org) has a [module](https://www.drupal.org/project/uischema) (schemas go in the `/sites/YOUR_SITE/uischema` folder)

### Website

For websites, you need the css and templates of your modules. Then just request the content from your CMS and render it (we suggest using [mustache](https://mustache.github.io)). The only remaining work in most cases will be to set up site navigation.

Check out some examples [here](https://uischema.org/examples)

### Creating schemas

To create your own schemas, please check out the [specification](https://uischema.org/specification).
