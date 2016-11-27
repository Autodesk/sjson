'use strict';

const sjsonParse = require('./index');
const HTMLUtilities = require('./html-utilities');


/**
 * SJSON Web Demo Application.
 *
 * @type {Object}
 */
const Application = (function() {

  /**
   * ID of the DOMElement for the SJSON input.
   *
   * @type {String}
   * @access private
   */
  const _INPUT_ELEMENT_ID = 'sjson-input';

  /**
   * ID of the DOMElement for the JSON output.
   *
   * @type {String}
   * @access private
   */
  const _OUTPUT_ELEMENT_ID = 'json-output';

  /**
   * ID of the DOMElement for the SyntaxError output.
   *
   * @type {String}
   * @access private
   */
  const _SYNTAX_ERROR_ELEMENT_ID = 'syntax-error';

  /**
   * CSS Seletor for the content of the SyntaxError outpt.
   *
   * @type {String}
   * @access private
   */
  const _SYNTAX_ERROR_CONTENT_SELECTOR = '.panel-body';


  /**
   * Notify the User that there was an Error when attempting to parse the input.
   *
   * @param {SyntaxError} ex The SyntaxError thrown by the SJSON parser.
   * @access private
   */
  const _notifySyntaxError = function(ex) {
    const syntaxErrorElement = document.getElementById(_SYNTAX_ERROR_ELEMENT_ID);
    if (syntaxErrorElement !== null) {
      const syntaxErrorContentElement = syntaxErrorElement.querySelector(_SYNTAX_ERROR_CONTENT_SELECTOR);
      if (syntaxErrorContentElement != null) {
        syntaxErrorContentElement.innerHTML = ex.message;

        HTMLUtilities.show(syntaxErrorElement);
      }
    }
  };

  /**
   * Clear any Error previously displayed.
   *
   * @access private
   */
  const _clearSyntaxError = function() {
    const syntaxErrorElement = document.getElementById(_SYNTAX_ERROR_ELEMENT_ID);
    if (syntaxErrorElement !== null) {
      const syntaxErrorContentElement = syntaxErrorElement.querySelector(_SYNTAX_ERROR_CONTENT_SELECTOR);
      if (syntaxErrorContentElement != null) {
        syntaxErrorContentElement.innerHTML = '';

        HTMLUtilities.hide(syntaxErrorElement);
      }
    }
  };

  /**
   * Set the parsed content.
   *
   * @access private
   */
  const _setParsedContent = function(content) {
    const outputElement = document.getElementById(_OUTPUT_ELEMENT_ID);
    if (outputElement !== null) {
      outputElement.innerHTML = content;
    }
  };

  /**
   * Parse the SJSON content.
   *
   * @access private
   */
  const _parseSJSONContent = function() {
    const inputElement = document.getElementById(_INPUT_ELEMENT_ID);
    if (inputElement !== null) {
      const sourceText = inputElement.value;
      try {
        const parsedObject = sjsonParse(sourceText);
        const parsedText = JSON.stringify(parsedObject, null, 4);

        _setParsedContent(parsedText);
        _clearSyntaxError();
      } catch (ex) {
        if (ex instanceof SyntaxError) {
          _setParsedContent('');
          _notifySyntaxError(ex);
        } else {
          console.error(ex);
        }
      }
    }
  };

  /**
   * Bind DOM Listeners.
   *
   * @access private
   */
  const _bindListeners = function () {
    const inputElement = document.getElementById(_INPUT_ELEMENT_ID);
    if (inputElement !== null) {
      inputElement.addEventListener('input', _parseSJSONContent);
      inputElement.addEventListener('propertychange', _parseSJSONContent);
    }
  };

  /**
   * Execute the given callback on DOMReady.
   *
   * @param {Function} callback The callback to execute on DOMReady.
   * @access private
   */
  const _onDOMReady = function(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  };

  /**
   * Initialize the Application.
   *
   * @access public
   */
  const initialize = function() {
    _onDOMReady(function () {
      // Parse SJSON Content as soon as the page loads:
      _parseSJSONContent();

      // Bind DOM Event listeners:
      _bindListeners();
    });
  };


  /**
   * Return the pubic interface of the Module (Adapter pattern).
   *
   * @type {Object}
   */
  return {
    'initialize': initialize
  };
})();


module.exports = Application;
