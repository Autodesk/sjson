"use strict";

function parseError(source, at, expected) {
  const token = String.fromCharCode(source[at]);
  const near = source.toString('utf8', at, Math.min(at + 25, source.length + 1));
  let line = 1;
  for (let i = 0; i < at; ++i)
    if (source[i] == 10) ++line;

  return new SyntaxError(`Unexpected token '${token}', expected '${expected}' on line ${line} near '${near}'.`);
}

function characterMask(str) {
  const mask = new Uint32Array(4);
  for (let i = 0; i < str.length; ++i) {
    const c = str.charCodeAt(i);
    mask[Math.floor(c / 32)] |= (1 << (c % 32));
  }
  return mask;
}

function hasChar(mask, c) {
  return (mask[Math.floor(c / 32)] & (1 << (c % 32))) != 0;
}

const NUMBER = characterMask("-+0123456789");
const NUMBER_EXP = characterMask(".eE");
const ID_TERM = characterMask(" \t\n=:");
const WHITESPACE = characterMask(" \n\r\t,");

class SJSON {
  static parse(s) {

    let i = 0;
    if(typeof s === 'string') s = Buffer(s);

    const ws = () => {
      while (i < s.length) {
        if (s[i] === 47) { // "/"
          ++i;
          if (s[i] === 47)
            while (s[++i] !== 10); // "\n"
          else if (s[i] === 42) // "*"
            while (s[++i] !== 42);
        } else if (!hasChar(WHITESPACE, s[i])) {
          break;
        }
        ++i;
      }
    };

    const consume = c => {
      ws();
      if (s[i++] !== c)
        throw parseError(s, i-1, String.fromCharCode(c));
    };

    const consumeKeyword = kw => {
      ws();
      const chars = Buffer(kw);
      for (let c of chars) {
        if (s[i++] !== c)
          throw parseError(s, i-1, String.fromCharCode(c));
      }
    };

    const pvalue = () => {
      ws();
      const c = s[i];
      if (hasChar(NUMBER, c)) return pnumber();
      if (c === 123)  return pobject();  // "{"
      if (c === 91)   return parray();   // "["
      if (c === 34)   return pstring();  // "
      if (c === 116)  { consumeKeyword("true"); return true; }
      if (c === 102)  { consumeKeyword("false"); return false; }
      if (c === 110)  { consumeKeyword("null"); return null; }
      throw parseError(s, i, "number, {, [, \", true, false or null");
    };

    const pnumber = () => {
      ws();
      let isFloat = false;
      const start = i;
      for (; i < s.length; ++i) {
        const c = s[i];
        isFloat |= hasChar(NUMBER_EXP, c);
        if (!isFloat && !hasChar(NUMBER, c))
          break;
      }
      const n = s.toString('utf8', start, i);
      return isFloat ? parseFloat(n) : parseInt(n);
    };

    const pstring = () => {
      // Literal string
      if (s[i] === 34 && s[i+1] === 34 && s[i+2] === 34) {
        i += 3;
        const start = i;
        for (; s[i] !== 34 || s[i+1] !== 34 || s[i+2] !== 34; ++i);
        i += 3;
        return s.toString('utf8', start, i-3);
      }

      const start = i;
      let escape = false;
      consume(34);
      for (; s[i] !== 34; ++i) { // unescaped "
        if (s[i] === 92) {
          ++i;
          escape = true;
        }
      }
      consume(34);
      if (!escape)
        return s.toString('utf8', start+1, i-1);

      i = start;
      var octets = [];
      consume(34);
      for (; s[i] !== 34; ++i) { // unescaped "
        if (s[i] === 92) {
          ++i;
          if (s[i] == 98) octets.push(7); // \b
          else if (s[i] == 102) octets.push(12); // \f
          else if (s[i] == 110) octets.push(10); // \n
          else if (s[i] == 114) octets.push(13); // \r
          else if (s[i] == 116) octets.push(9); // \t
          else if (s[i] == 117) { // \u
            ++i;
            octets.push(16*(s[i] - 48) + s[i+1] - 48);
            i += 2;
            octets.push(16*(s[i] - 48) + s[i+1] - 48);
            i += 2;
          }
          else octets.push(s[i]); // \" \\ \/
        } else
          octets.push(s[i]);
      }
      consume(34);
      return Buffer(octets).toString('utf8');
    };

    const parray = () => {
      const ar = [];
      ws();
      consume(91); // "["
      ws();
      for (; s[i] !== 93; ws()) // "]"
        ar.push(pvalue());

      consume(93);
      return ar;
    };

    const pidentifier = () => {
      ws();
      if(i === s.length)  // Catch whitespace EOF
        return null;
      if (s[i] === 34)
        return pstring();

      const start = i;
      for (; !hasChar(ID_TERM, s[i]); ++i);
      return s.toString("utf8", start, i);
    };

    const pobject = () => {
      const object = Object.setPrototypeOf({},  null);
      consume(123); // "{"
      ws();
      for (; s[i] !== 125; ws()) { // "}"
        const key = pidentifier();
        ws();
        (s[i] === 58) ? consume(58) : consume(61); // ":" or "="
        object[key] = pvalue();
      }
      consume(125); // "}"
      return object;
    };

    const proot = () => {
      ws();
      if (s[i] === 123)
        return pobject();

      const object = Object.setPrototypeOf({},  null);
      while (i < s.length) { // "}"
        const key = pidentifier();
        ws();
        if(i === s.length)  // Catch whitespace EOF
          break;
        (s[i] === 58) ? consume(58) : consume(61); // ":" or "="
        object[key] = pvalue();
      }

      ws();
      if (i != s.length)
        throw parseError(s, i, "end-of-string");

      return object;
    };

    return proot();
  }
}

module.exports = SJSON.parse;
