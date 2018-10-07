const TOKENS = {
  collection_start: /^</,
  collection_end: /^>/,
  fixed_collection_start: /^\(/,
  fixed_collection_end: /^\)/,
  type_name: /^(?:#\w+|((::)?\w+)+)/,
  type_next: /^[,;]/,
  whitespace: /^\s+/,
  hash_collection_start: /^\{/,
  hash_collection_next: /^=>/,
  hash_collection_end: /^\}/,
  literal: /^(?::\w+|(["']).+?\1)/,
  parse_end: null
};

const BreakException = {};

class SyntaxError extends Error {}

class Type {
  toString(plural) {
    if (this.name[0] === "#") {
      return plural ? `objects that respond to ${this.name}` : `an object that responds to ${this.name}`;
    } else if (this.name[0].match(/["':]/)) {
      return plural ? `literal values of ${this.name}` : `a literal value ${this.name}`;
    } else if (this.name[0].match(/[A-Z]/)) {
      return plural ? `${this.name}${this.name[this.name.length - 1].match(/[A-Z]/) ? "'" : ''}s` : 
        `a${this.name[0].match(/[aeiou]/i) ? 'n' : ''} ` + this.name;
    }
    return this.name;
  }
}

class CollectionType extends Type {
  constructor() {
    super();
    this.types = [];
  }

  toString() {
    return `a${this.name[0].match(/[aeiou]/i) ? 'n' : ''} ${this.name} of (` +
           this.types.map((t) => t.toString(true)).join(', ') + ")";
  }
}

class FixedCollectionType extends CollectionType {
  toString() {
    return `a${this.name[0].match(/[aeiou]/i) ? 'n' : ''} ${this.name} containing (` +
           this.types.map((t) => t.toString()).join(" followed by ") + ")";
  }
}

class HashCollectionType extends Type {
  toString() {
    return `a${this.name[0].match(/[aeiou]/i) ? 'n' : ''} ${this.name} with keys made of (` +
           this.key_types.map((t) => t.toString(true)).join(', ') + 
           ") and values of (" +
           this.value_types.map((t) => t.toString(true)).join(', ') +
           ")";
  }
}

class TypesParser {
  constructor(input) {
    this.input = input;
    this.pos = 0;
  }

  static parse(input) {
    return new TypesParser(input).parse();
  }

  parse() {
    var types = [];
    var type = null;
    var name = null;
    var result = null;
  
    try {
      while (result === null) {
        if (!this.input || this.input.length === 0) {
          if (!name) {
            throw new SyntaxError('expecting name, got EOF');
          }
          if (!type) {
            type = new Type;
            type.name = name;
          }
          types.push(type);
          result = types;
          break;
        }
  
        try {
          Object.keys(TOKENS).forEach((key) => {
            const val = TOKENS[key];
            const match = this.input.match(val);
            if (match === null) return;
    
            // advance input
            const token = match[0];
            this.pos += token.length
            this.input = this.input.substr(token.length);

            // handle token
            if (key === 'type_name' || key === 'literal') {
              if (name) {
                throw new SyntaxError(`expecting END, got name '${token}'`);
              }
              name = token;
            } else if (key === 'type_next') {
              if (!name) {
                throw new SyntaxError(`expecting name, got '${token}' at ${this.pos}`);
              }
              if (!type) {
                type = new Type;
                type.name = name;
              }
              types.push(type);
              type = null;
              name = null;
            } else if (key === 'fixed_collection_start' || key === 'collection_start') {
              name = name || 'Array';
              type = key === 'collection_start' ? new CollectionType : new FixedCollectionType;
              type.name = name;
              type.types = this.parse();
            } else if (key === 'hash_collection_start') {
              name = name || 'Hash';
              type = new HashCollectionType;
              type.name = name;
              type.key_types = this.parse();
              type.value_types = this.parse();
            } else if (key === 'hash_collection_next' || key === 'hash_collection_end' ||
                       key === 'fixed_collection_end' || key === 'collection_end' || key == 'parse_end') {
              if (!name) {
                throw new SyntaxError(`expecting name, got '${token}'`);
              }
              if (!type) {
                type = new Type;
                type.name = name;
              }
              types.push(type);
              result = types;
            }

            throw BreakException;
          });
          throw new SyntaxError(`invalid character at ${this.input[0]}`);
        } catch (e) {
          if (e !== BreakException) throw e;
        }
      }
      return result;
    } catch (e) {
      if (e instanceof SyntaxError) {
        return e.message;
      }
      throw e;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const submit = document.getElementById('types_submit');
  const results = document.getElementById('types_results');
  const input = document.getElementById('types_text');

  submit.addEventListener('click', () => {
    const result = TypesParser.parse(input.value);
    const html = result.map((v) => v.toString(false)).join(';<br>\n');
    results.innerHTML = html;
  });

  input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) submit.click();
  });

  document.querySelectorAll('#examples dd').forEach((el) => {
    el.addEventListener('click', () => {
      input.value = el.innerText;
      submit.click();
      document.location = '#see_results';
    });
  });
});
