# Specification

A full description of the UI schema internals

## Principles

* Meta fields are written like **@this**, lowercase with a prefixed "@" symbol
* Input fields, the ones used for rendering and CMS input, are written in camelCase
* Value types (like `"Hero"` or `"Text"`) are written in PascalCase
* Input field types can be specified in 3 ways:
    * As a string, to indicate a singular input field: `"Hero"`
    * As an array, to indicate multiple input fields: `[ "Hero", "Highlight" ]`
    * As an object with **@type** and **@[rule]** fields:  
        `{ "@type": "Text", "@min": 100, "@max": 300 }`

## Schema meta fields

These fields can be used to describe a schema

| Name          | Type              | Description |
| ---           | ---               | --- |
| **@context**  | `string`          | A context URL for the site holding the schema information **(required)** |
| **@config**   | `object`          | A structured set of arbitrary values |
| **@i18n**     | `object`          | Translations for field names |
| **@init**     | `string`          | An optional callable method for the server to initialise a schema |
| **@label**    | `string`          | The name of the field whose value represents this content when it's collapsed |
| **@parent**   | `string`          | A parent schema to inherit values from |
| **@process**  | `string`          | An optional callable method for the server to process an element |
| **@topic**    | `string\|array`   | Topic(s) describing this schema |
| **@type**     | `string`          | A unique type name for this schema **(required)** |

### Translations

Translations can be provided for field labels. They are commonly stored in a folder `/i18n/[language]/[type].json` and appended to the schema upon export.

Example of the exported output:

```javascript
{
    "@context": "http://uischema.org",
    "@type": "Feature",
    "image": "ImageObject",
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

Apart from the types described below, input field can also refer to other schemas.

### Common schema.org types

Any [schema.org](https://schema.org/DataType) type can be used, here are some common cases:

| Name              | Description |
| ---               | --- |
| `AudioObject`     | An audio clip |
| `Boolean`         | A boolean value, `true` or `false` |
| `DataDownload`    | An binary file intended for download |
| `DateTime`        | A date/time value |
| `Date`            | A date value |
| `Enumeration`     | A list of options |
| `ImageObject`     | An image |
| `ItemList`        | An array of value types |
| `MediaObject`     | A generic media file |
| `Number`          | A numeric value |
| `Text`            | A single line of text, no formatting |
| `StructuredValue` | A nested structure |
| `VideoObject`     | A video |

### Extensions

A few more descriptive data types:

| Name              | Description |
| ---               | --- |
| `RichText`        | A rich text editor storing its input as HTML |
| `MultiLineText`   | A text area with multiple lines of text, no formatting |

### Nested fields (StructuredValue)

Nested fields can be declared as an implicit JSON object:

```javascript
{
    "options": {
        "isHeader": "Boolean"
    }
}
```

The type can optionally be explicitly declared:

```javascript
{
    "options": {
        "@type": "StructuredValue",
        "isHeader": "Boolean"
    }
}
```

### Arrays (ItemList)

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
        "@type": "ItemList",
        "@options": [ "Hero", "Highlight" ],
        "@max": 4
    }
}
```

### Selects/dropdowns (Enumeration)

Dropdowns can be declared explicitly with or without translation strings:

```javascript
{
    "layout" {
        "@type": "Enumeration",
        "@options": [ "left", "right" ]
    },
    "@i18n": {
        "en": {
            "layout": {
                "@name": "Layout",
                "@options": [ "Left aligned", "Right aligned ]
            }
        }
    }
}
```

## Rules

Input rules are defined as meta values in the field definition.

| Name              | Value type    | Used with type            | Description |
| ---               | ---           | ---                       | --- |
| **@max**          | `int`         | `ItemList\|Text\|Number`  | A maximum value |
| **@min**          | `int`         | `ItemList\|Text\|Number`  | A minimum value |
| **@required**     | `bool`        | `*`                       | Whether a field is required |
| **@options**      | `array`       | `*`                       | Options for this field, like mimetypes or select options |

### Example

```javascript
{
    "heading": {
        "@type": "Text",
        "@required": true,
        "@max": 200
    }
}
```
