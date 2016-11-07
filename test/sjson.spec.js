'use strict';

const fs = require('fs');
const path = require('path');

const expect = require('chai').expect;
const sjsonParse = require('./../index.js');


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
 * Parse the "sample.sjson" file using the SJSON Parser.
 *
 * @return {Promise} A Promise to be fulfilled once the content of the
 *                   "sample.sjson" file has been parsed.
 */
function getSJSONSample() {
  const sjsonSampleFilePath = path.join(__dirname, 'sample.sjson');

  return new Promise((resolve, reject) => {
    fs.readFile(sjsonSampleFilePath, 'utf-8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        const parsedSJSON = sjsonParse(data);
        resolve(parsedSJSON);
      }
    });
  });
}


describe('simplified-json', function () {
  describe('#parse()', function () {

    /**
     * Validate that the value returned by the SJSON Parser is a JavaScript
     * Object.
     */
    it('returns a JavaScript Object', function () {
      return getSJSONSample()
        .then(parsedSJSON => {
          expect(parsedSJSON).to.be.an('object');
        });
    });

    /**
     * Validate that the value returned by SJSON Parser is an extensible
     * JavaScript Object (i.e. that it can have new properties added to it).
     */
    it('returns an extensible JavaScript Object', function () {
      return getSJSONSample()
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
      return getSJSONSample()
        .then(parsedSJSON => {
          const expectedJSON = getJSONSample();

          expect(expectedJSON).to.eql(parsedSJSON);
        });
    });

    /**
     * Validate that the SJSON Parser correctly parses Numbers.
     */
    it('parses Numbers', function () {
      const parsedSJSON = sjsonParse('integer = 42, float = 42.4');

      expect(parsedSJSON.integer).to.be.a('Number');
      expect(parsedSJSON.integer).to.eql(42);
      expect(parsedSJSON.float).to.be.a('Number');
      expect(parsedSJSON.float).to.eql(42.4);
    });

    /**
     * Validate that the SJSON Parser correctly parses Strings.
     */
    it('parses Strings', function () {
      const parsedSJSON = sjsonParse('string = "sjson"');

      expect(parsedSJSON.string).to.be.a('String');
      expect(parsedSJSON.string).to.eql('sjson');
    });

    /**
     * Validate that the SJSON Parser correctly parses Arrays.
     */
    it('parses Arrays', function () {
      const parsedSJSON = sjsonParse('array = [42, "sjson"]');

      expect(parsedSJSON.array).to.be.an('Array');
      expect(parsedSJSON.array[0]).to.eql(42);
      expect(parsedSJSON.array[1]).to.eql('sjson');
    });

    /**
     * Validate that the SJSON Parser correctly parses Booleans.
     */
    it('parses Booleans', function () {
      const parsedSJSON = sjsonParse('boolean_true = true, boolean_false = false');

      expect(parsedSJSON.boolean_true).to.be.a('Boolean');
      expect(parsedSJSON.boolean_true).to.be.true;
      expect(parsedSJSON.boolean_false).to.be.a('Boolean');
      expect(parsedSJSON.boolean_false).to.be.false;
    });

    /**
     * Validate that the SJSON Parser correctly parses Nulls.
     */
    it('parses Nulls', function () {
      const parsedSJSON = sjsonParse('nullable = null');

      expect(parsedSJSON.nullable).to.be.a('null');
      expect(parsedSJSON.nullable).to.be.null;
    });

    /**
     * Validate that the SJSON Parser throws a SyntaxError when encountering an
     * unexpected token.
     */
    it('throws an error when the syntax is incorrect', function () {
      const incorrectFile = 'variable = syntax_error';
      const testRunner = () => sjsonParse(incorrectFile);

      expect(testRunner).to.throw(SyntaxError, /Unexpected token/);
    });
  });
});
