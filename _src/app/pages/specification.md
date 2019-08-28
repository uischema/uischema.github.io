# Specification

A full description of the UI Schema internals

## Principles

* Meta fields are written like **@this**, lowercase with a prefixed "@" symbol
* Input fields, the ones used for rendering and CMS input, are written in camelCase
* Schema types (like `"Hero"` or `"Feature"`) are written in PascalCase
* Simple data types (like `"text"` or `"bool"`) are written in lowercase
* Input field types can be specified in 3 ways:
    * As a string, to indicate a singular input field: `"Hero"`
    * As an array, to indicate a collection of input fields: `[ "Hero", "Highlight" ]`
    * As an object, to indicate input rules:  
        `{ "@type": "text", "@rules": { "min": 100, "max": 300 } }`
        * Arrays can also be used here:  
            `{ "@type": [ "Hero", "Highlight" ], "@rules": { "min": 1, "max": 10 } }`

## Schema meta fields

These fields can be used to describe a schema

| Name | Type | Description |
| --- | --- | --- |
| **@context** | `string` | A context URL for the site holding the schema information **(required)** |
| **@type** | `string` | A unique type name for this schema **(required)** |
| **@parent** | `string` | A parent schema to inherit values from |
| **@role** | `string` | Whether this schema is meant ot be used as a full module **(full)**, just part of one **(partial)**, or not used in rendering at all **(abstract)** |
| **@label** | `string` | The name of the field whose value represents this content when it's collapsed |
| **@topic** | `string\|array` | Topic(s) describing this schema |
| **@options** | `object` | Options for content authors |
| **@i18n** | `object` | Translations for field names |

### Options

The **@options** field is for including customisation options relating to the schema. 

For example:

```javascript
{
    "@type": "Hero",
    "@options": {
        "isHeader": "bool"
    }
}
```

### Translations

Translations can be provided for field labels. They are commonly stored in a folder `/i18n/[language]/SchemaType.json` and appended to the schema upon export.

Example of the exported output:

```javascript
{
    "@name": "Feature",
    "@description": "An element for featuring other content",
    "image": {
        "@name": "Image",
        "@description": "The main image"
    }
```

## Data types

Apart from referring to other schema types, input fields can refer to a simple data type.

| Name | Description |
| --- | --- |
| `string` | A single line of text, no formatting |
| `text` | A text area with multiple lines of text, no formatting |
| `html` | A rich text editor storing its input as HTML |
| `bool` | A boolean value, `true` or `false` |
| `number` | An integer or decimal value |

### Rules

Rules can be specified to restrict the input of a data type.

For example:

```javascript
{
    "heading": {
        "@type": "string",
        "@rules": {
            "min": 4,
            "max": 20
        }
    }
}
```
