var WHITESPACE_CHARS = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004" +
    "\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";

/**
 * Strips whitespace or specified characters at the beginning and the end of a
 * string.
 * 
 * @param {string} str The string that needs to be trimmed.
 * @param {string} [chars] What kind of chars that needs to be stripped.
 * 
 * @return {string} The trimmed string.
 */
function StringTrimmer(str, chars) {
    return StringTrimmer.trim(str, chars || WHITESPACE_CHARS);
}

/**
 * Strips whitespace or specified characters at the beginning and the end of a
 * string.
 * 
 * @param {string} str The string that needs to be trimmed.
 * @param {string} [chars] What kind of chars that needs to be stripped.
 * 
 * @return {string} The trimmed string.
 */
StringTrimmer.trim = function trim(str, chars) {
    chars = chars || WHITESPACE_CHARS;
    return this.trimLeft(this.trimRight(str, chars), chars);
}

/**
 * Strips whitespace or specified characters at the beginning of a string.
 * 
 * @param {string} str The string that needs to be trimmed.
 * @param {string} [chars] What kind of chars that needs to be stripped.
 * 
 * @return {string} The trimmed string.
 */
StringTrimmer.trimLeft = function trimLeft(str, chars) {
    chars = (chars || WHITESPACE_CHARS).split("");
    for (var i = 0; i < str.length; i++) {
        if (chars.indexOf(str[i]) === -1) break;
    }
    return str.substring(i);
}

/**
 * Strips whitespace or specified characters at the end of a string.
 * 
 * @param {string} str The string that needs to be trimmed.
 * @param {string} [chars] What kind of chars that needs to be stripped.
 * 
 * @return {string} The trimmed string.
 */
StringTrimmer.trimRight = function trimRight(str, chars) {
    chars = (chars || WHITESPACE_CHARS).split("");
    for (var i = str.length - 1; i >= 0; i--) {
        if (chars.indexOf(str[i]) === -1) break;
    }
    return str.substring(0, i + 1);
}

/**
 * Apply the functions to an object's prototype, e.g. `String.prototype`.
 * 
 * @param {any} proto Normally, this should be `String.prototype`.
 */
StringTrimmer.applyTo = function applyTo(proto) {
    proto.trim = function(chars) {
        return StringTrimmer.trim(this, chars);
    };
    proto.trimLeft = function(chars) {
        return StringTrimmer.trimLeft(this, chars);
    };
    proto.trimRight = function(chars) {
        return StringTrimmer.trimRight(this, chars);
    };
}

if (typeof window == "object") {
    window.StringTrimmer = StringTrimmer;
    if (typeof define === "function") {
        //AMD
        define((require, exports, module) => {
            module.exports = StringTrimmer;
        });
    }
} else if (typeof module === "object" && module.exports) {
    //CommonJS
    module.exports = StringTrimmer;
}