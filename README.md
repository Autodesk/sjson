# Simplified JSON Parser

A parser that converts [SJSON](http://help.autodesk.com/view/Stingray/ENU/?guid=__stingray_help_managing_content_sjson_html) into JSON.

[![Build Status](https://travis-ci.org/Autodesk/sjson.svg?branch=master)](https://travis-ci.org/Autodesk/sjson)

## Installation

```bash
npm install --save simplified-json
```

## Usage

#### [sample.sjson](./test/sample.sjson)

```
description = "A sample, json document."
author = {
 	name = "Autodesk"
}
keywords = ["sample", "sjson"]
```

### parse

Parse a sjson string and return a javascript object

``` javascript
var SJSON = require('simplified-json'),
  fs = require('fs');

fs.readFile('sample.sjson', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(SJSON.parse(data));
});
```

### stingify

Parse a javascript object and return a sjson string

``` javascript
var SJSON = require('simplified-json'),
  fs = require('fs'),
  data = {
    keywords: [
    	"sample"
    	"sjson"
    ]
  };

fs.writeFile('sample.sjson', SJSON.stringify(data), 'utf8', function (err) {
  if (err) {
    return console.log(err);
  }
});
```


## Featured In

* [Autodesk&reg; Stingray&reg;](http://stingrayengine.com/) uses SJSON to express data in many of its text-based resource files.
