/**
 * HTML & DOM Utilities.
 *
 * @type {Object}
 */
const HTMLUtilities = {

  /**
   * Add the given CSS Class to the given DOMElement.
   *
   * @param {DOMElement} element The DOMElement to which to add the given CSS Class.
   * @param {String} className The CSS Class to apply to the given DOMElement.
   * @access public
   */
  addClass: function(element, className) {
    if (element.classList) {
      element.classList.add(className);
    } else {
      element.className += ' ' + className;
    }
  },

  /**
   * Remove the given CSS Class from the given DOMElement.
   *
   * @param {DOMElement} element The DOMElement from which to remove the given CSS Class.
   * @param {String} className The CSS Class to remove from the given DOMElement.
   * @access public
   */
  removeClass: function(element, className) {
    if (element.classList) {
      element.classList.remove(className);
    } else {
      element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  },

  /**
   * Make the given DOMElement visible (i.e. remove the "hidden" Bootstrap CSS Class
   * from the Element).
   *
   * @param {DOMElement} element The DOMElement to show.
   * @access public
   */
  show: function(element) {
    HTMLUtilities.removeClass(element, 'hidden');
  },

  /**
   * Make the given DOMElement invisible (i.e. add the "hidden" Bootstrap CSS Class
   * to the Element).
   *
   * @param {DOMElement} element The DOMElement to hide.
   * @access public
   */
  hide: function(element) {
    HTMLUtilities.addClass(element, 'hidden');
  }
};


module.exports = HTMLUtilities;
