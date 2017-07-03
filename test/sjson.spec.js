'use strict';

const fs = require('fs');
const path = require('path');

const expect = require('chai').expect;
const SJSON = require('./../index.js');

/**
 * Parse the "sample.json" file as a JavaScript Object.
 *
 * @return {Object} The parsed content of the "sample.json" file.
 */
function getJSONSample() {
  const jsonSampleFilePath = path.join(__dirname, 'sample.json');
  const jsonSample = require(jsonSampleFilePath);
  return jsonSample;
}
/**
 * Read the sample.sjson file
 * @params filename {String} the sample file to load
 * @returns {Promise} A Promise to be fulfilled once the content of the
 *                   "sample.sjson" file has read.
 */
function getSJSONSample(filename) {
  const sjsonSampleFilePath = path.join(__dirname, filename);

  return new Promise((resolve, reject) => {
      fs.readFile(sjsonSampleFilePath, 'utf-8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Parse the "sample.sjson" file using the SJSON Parser.
 *
 * @return {Promise} A Promise to be fulfilled once the content of the
 *                   "sample.sjson" file has been parsed.
 */
function getParsedSJSONSample() {
  return getSJSONSample('sample.sjson').then(data => {
      return SJSON.parse(data);
  });
}

describe('simplified-json', function () {
  describe('#parse()', function () {

    /**
     * Validate that the value returned by the SJSON Parser is a JavaScript
     * Object.
     */
    it('returns a JavaScript Object', function () {
      return getParsedSJSONSample()
          .then(parsedSJSON => {
          expect(parsedSJSON).to.be.an('object');
      });
    });

    /**
     * Validate that the value returned by SJSON Parser is an extensible
     * JavaScript Object (i.e. that it can have new properties added to it).
     */
    it('returns an extensible JavaScript Object', function () {
      return getParsedSJSONSample()
          .then(parsedSJSON => {
          expect(parsedSJSON).to.be.extensible;
      expect(parsedSJSON).to.not.be.sealed;
      expect(parsedSJSON).to.not.be.frozen;
      });
    });

    /**
     * Compare the SJSON sample file to its expected JSON representation.
     */
    it('parses SJSON into JSON', function () {
      return getParsedSJSONSample()
          .then(parsedSJSON => {
          const expectedJSON = getJSONSample();

      expect(expectedJSON).to.eql(parsedSJSON);
      });
    });

    /**
     * Validate that the SJSON Parser correctly parses Numbers.
     */
    it('parses Numbers', function () {
      const parsedSJSON = SJSON.parse('integer = 42, float = 42.4');

      expect(parsedSJSON.integer).to.be.a('Number');
      expect(parsedSJSON.integer).to.eql(42);
      expect(parsedSJSON.float).to.be.a('Number');
      expect(parsedSJSON.float).to.eql(42.4);
    });

    /**
     * Validate that the SJSON Parser correctly parses Strings.
     */
    it('parses Strings', function () {
      const parsedSJSON = SJSON.parse('string = "sjson"');

      expect(parsedSJSON.string).to.be.a('String');
      expect(parsedSJSON.string).to.eql('sjson');
    });

    /**
     * Validate that the SJSON Parser correctly parses Arrays.
     */
    it('parses Arrays', function () {
      const parsedSJSON = SJSON.parse('array = [42, "sjson"]');

      expect(parsedSJSON.array).to.be.an('Array');
      expect(parsedSJSON.array[0]).to.eql(42);
      expect(parsedSJSON.array[1]).to.eql('sjson');
    });

    /**
     * Validate that the SJSON Parser correctly parses Booleans.
     */
    it('parses Booleans', function () {
      const parsedSJSON = SJSON.parse('boolean_true = true, boolean_false = false');

      expect(parsedSJSON.boolean_true).to.be.a('Boolean');
      expect(parsedSJSON.boolean_true).to.be.true;
      expect(parsedSJSON.boolean_false).to.be.a('Boolean');
      expect(parsedSJSON.boolean_false).to.be.false;
    });

    /**
     * Validate that the SJSON Parser correctly parses Nulls.
     */
    it('parses Nulls', function () {
      const parsedSJSON = SJSON.parse('nullable = null');

      expect(parsedSJSON.nullable).to.be.a('null');
      expect(parsedSJSON.nullable).to.be.null;
    });

    /**
     * Validate that the SJSON Parser correctly parses keys with a leading solidus.
     */
    it('parses keys with a leading solidus', function () {
      const parsedSJSON = SJSON.parse('/key_with_a_leading_solidus = true');

      expect(parsedSJSON["/key_with_a_leading_solidus"]).to.be.a('Boolean');
      expect(parsedSJSON["/key_with_a_leading_solidus"]).to.be.true;
    });

    /**
     * Validate that the SJSON Parser throws a SyntaxError when encountering an
     * unexpected token.
     */
    it('throws an error when the syntax is incorrect', function () {
      const incorrectFile = 'variable = syntax_error';
      const testRunner = () => SJSON.parse(incorrectFile);

      expect(testRunner).to.throw(SyntaxError, /Unexpected token/);
    });
  });

  describe('#stringify()', function () {
    /**
     * Validate that the SJSON stringify add double quotes around simple string value
     */
    it('should stringify a string value', function () {
      const inputString = 'just a sting string';
      const expectedResult = '"' + inputString + '"';
      const result = SJSON.stringify(inputString);
      expect(result).to.equal(expectedResult);
    });

    /**
     * Validate that the SJSON stringify add triple double quotes around string containing line break
     */
    it('should stringify a string value with line break', function () {
      const inputString = 'one\ntwo\nthree';
      const expectedResult = '"""' + inputString + '"""';
      const result = SJSON.stringify(inputString);
      expect(result).to.equal(expectedResult);
    });

    it('should stringify a single-line string with proper escaping according to the JSON spec', function() {
      const input = "\u03B8\b\t\\\"//\\//ñëiø☃\\\\\fâônàæ";
      const expectedResult = JSON.stringify(input);
      const result = SJSON.stringify(input);
      expect(result).to.equal(expectedResult);
    });

    /**
     * Validate that the SJSON stringify number(s)
     */
    it('should stringify a number value', function () {
      const inputNumber = 1239;
      const expectedResult = '1239';
      const result = SJSON.stringify(inputNumber);
      expect(result).to.equal(expectedResult);
    });

    /**
     * Validate that the SJSON stringify boolean
     */
    it('should stringify a boolean value', function () {
      const inputTrue = true;
      const expectedTrueResult = 'true';
      const trueResult = SJSON.stringify(inputTrue);
      expect(trueResult).to.equal(expectedTrueResult);

      const inputFalse = false;
      const expectedFalseResult = 'false';
      const falseResult = SJSON.stringify(inputFalse);
      expect(falseResult).to.equal(expectedFalseResult);
    });
    /**
     * Validate that the SJSON stringify array(s)
     */
    it('should stringify an array', function () {
      const input = [123, 'one two three', true];
      const expectedResult = '[\n\t123\n\t"one two three"\n\ttrue\n]';
      const result = SJSON.stringify(input);
      expect(result).to.equal(expectedResult);
    });

    /**
     * Validate that the SJSON stringify object(s)
     */
    it('should stringify a root object', function () {
      const input = {a: 1, b: 'B', c: [1,2,3]};
      const expectedResult = 'a = 1\nb = "B"\nc = [\n\t1\n\t2\n\t3\n]\n';
      const result = SJSON.stringify(input);
      expect(result).to.equal(expectedResult);
    });

    /**
     * Validate that the SJSON stringify object(s) in root object
     */
    it('should stringify an object inside the root object', function () {
      const input = {a: {b: 'b', c: 3}};
      const expectedResult = 'a = {\n\tb = "b"\n\tc = 3\n}\n';
      const result = SJSON.stringify(input);
      expect(result).to.equal(expectedResult);
    });
  });

  /**
   * Validate that the SJSON stringify object(s)
   */
  it('should add double quote on object key if it contain an = character', function () {
    const input = {'a=b': true, b: 'B', c: {'1=2': true}};
    const expectedResult = '"a=b" = true\nb = "B"\nc = {\n\t"1=2" = true\n}\n';
    const result = SJSON.stringify(input);
    expect(result).to.equal(expectedResult);
  });

  it('should add double quote on object key if it contain space', function () {
    const input = {'a b': true, b: 'B', c: {'1 2': true}};
    const expectedResult = '"a b" = true\nb = "B"\nc = {\n\t"1 2" = true\n}\n';
    const result = SJSON.stringify(input);
    expect(result).to.equal(expectedResult);
  });

  it('should be able to go back and forth between json and sjson', function () {
    return getSJSONSample('stringify_sample.sjson').then(data => {
      //ignore line ending just use unix for comparison.
      const sjsonString = data.replace(/\r\n/g, "\n");
      //get the object from the sjson string
      const obj = SJSON.parse(sjsonString);
      expect(obj).to.be.an('object');
      //get the sting back from the object
      const strigifyString = SJSON.stringify(obj);
      expect(strigifyString).to.be.a('string');
      expect(sjsonString).to.equal(strigifyString);
    });
  });
});
