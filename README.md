# Simplified JSON Parser

A parser that converts [SJSON](http://help.autodesk.com/view/Stingray/ENU/?guid=__stingray_help_managing_content_sjson_html) into JSON.

## Installation

```bash
npm install --save simplified-json
```

## Usage

`sample.sjson`
```
// About
//
name = "Sample"
description = "A sample json document."
version = "0.0.1"
author = {
	name = "Autodesk"
}
keywords = ["sample", "sjson"]

// SJSON Object
//
object = {
	arr = [
		{
			str = "String Value"
			object = {
				type = "lua"
				script = """
					require "some/resource"
					local result = Sample:generate()
					print("Multiline String Sample", result)
				"""
			}
			otherStr = "Another String"
		}
	]

	arr2 = [
		{
			str = "String Value"
		}
	]
}

// Array
//
platforms = ["win64", "win32", "linux"]
dependencies = {
	"sjson" = "^1.0"
}
```

``` javascript
var sjsonParse = require("simplified-json"),
  fs = require('fs');
  
fs.readFile('sample.sjson', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(sjsonParse(data));  
});
```

`output`
```json
{
  "name": "Sample",
  "description": "A sample json document.",
  "version": "0.0.1",
  "author": {
    "name": "Autodesk"
  },
  "keywords": [
    "sample",
    "sjson"
  ],
  "object": {
    "arr": [
      {
        "str": "String Value",
        "object": {
          "type": "lua",
          "script": "\r\n\t\t\t\t\trequire \"some/resource\"\r\n\t\t\t\t\tlocal result = Sample:generate()\r\n\t\t\t\t\tprint(\"Multiline String Sample\", result)\r\n\t\t\t\t"
        },
        "otherStr": "Another String"
      }
    ],
    "arr2": [
      {
        "str": "String Value"
      }
    ]
  },
  "platforms": [
    "win64",
    "win32",
    "linux"
  ],
  "dependencies": {
    "sjson": "^1.0"
  }
}
```
