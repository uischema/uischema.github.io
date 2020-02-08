# Specification

A full description of the UI schema internals

## Principles

* Meta fields are written like **@this**, lowercase with a prefixed "@" symbol
* Input fields, the ones used for rendering and CMS input, are written in camelCase
* Schema types (like `"Hero"` or `"Feature"`) are written in PascalCase
* Simple data types (like `"text"` or `"bool"`) are written in lowercase
* Input field types can be specified in 3 ways:
    * As a string, to indicate a singular input field: `"Hero"`
    * As an array, to indicate multiple input fields: `[ "Hero", "Highlight" ]`
    * As an object with **@type** and **@[rule]** fields:  
        `{ "@type": "text", "@min": 100, "@max": 300 }`

## Schema meta fields

These fields can be used to describe a schema

| Name          | Type              | Description |
| ---           | ---               | --- |
| **@context**  | `string`          | A context URL for the site holding the schema information **(required)** |
| **@i18n**     | `object`          | Translations for field names |
| **@init**     | `string`          | An optional callable method for the server to initialise a schema |
| **@label**    | `string`          | The name of the field whose value represents this content when it's collapsed |
| **@parent**   | `string`          | A parent schema to inherit values from |
| **@process**  | `string`          | An optional callable method for the server to process an element |
| **@role**     | `string`          | Whether this schema is a full module **(module)** or just part of one **(partial)** |
| **@topic**    | `string\|array`   | Topic(s) describing this schema |
| **@type**     | `string`          | A unique type name for this schema **(required)** |

### Translations

Translations can be provided for field labels. They are commonly stored in a folder `/i18n/[language]/SchemaType.json` and appended to the schema upon export.

Example of the exported output:

```javascript
{
    "@context": "http://uischema.org",
    "@type": "Feature",
    "image": "Image",
    "@i18n": {
        "@name": "Feature",
        "@description": "An element for featuring other content",
        "image": {
            "@name": "Image",
            "@description": "The main image"
        }
    }
}
```

## Data types

Apart from the types described below, input field can also refer to other uischemas.

### Simple types

These types can be represented in simple JSON:

| Name              | Description |
| ---               | --- |
| `array`           | An array of value types |
| `bool`            | A boolean value, `true` or `false` |
| `date`            | A date value |
| `dict`            | A nested structure |
| `float`           | A decimal value |
| `html`            | A rich text editor storing its input as HTML |
| `int`             | An integer value |
| `options`         | A list of options |
| `string`          | A single line of text, no formatting |
| `text`            | A text area with multiple lines of text, no formatting |

### Common schema.org types

Any [schema.org](https://schema.org) type can be used, but these are the most common cases:

| Name              | Description |
| ---               | --- |
| `AudioObject`     | An audio clip |
| `DataDownload`    | An binary file intended for download |
| `ImageObject`     | An image |
| `VideoObject`     | An audio clip |
| `MediaObject`     | A generic media file, covering all above types |

### Nested fields (dict)

Nested fields can be declared as an implicit JSON object:

```javascript
{
    "options": {
        "isHeader": "bool"
    }
}
```

The type can optionally be explicitly declared:

```javascript
{
    "options": {
        "@type": "dict",
        "isHeader": "bool"
    }
}
```

### Arrays

Arrays can be declared as an implicit JSON array, indicating only which value types are allowed inside it:

```javascript
{
    "items": [ "Feature" ]
}
```

They can also be declared as an explicit block with rules:

```javascript
{
    "items": {
        "@type": "array",
        "@options": [ "Hero", "Highlight" ],
        "@max": 4
    }
}
```

## Rules

Input rules are defined as meta values in the field definition.

| Name              | Value type    | Used with type            | Description |
| ---               | ---           | ---                       | --- |
| **@max**          | `int`         | `array\|string\|text`     | A maximum value |
| **@min**          | `int`         | `array\|string\|text`     | A minimum value |
| **@required**     | `bool`        | `*`                       | Whether a field is required |
| **@options**      | `array`       | `*`                       | Options for this field, like mimetypes or select options |

### Example

```javascript
{
    "heading": {
        "@type": "string",
        "@required": true,
        "@max": 200
    },
    "layout": {
        "@type": "options",

    }
}
```
