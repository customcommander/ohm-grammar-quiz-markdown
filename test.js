import test from 'node:test';
import Ajv from 'ajv';

import {grammar,semantics} from './index.js';

const validate = (
  (new Ajv)
  .addSchema({
    '$id': 'customcommander/ohm-grammar-quiz-markdown/schemas/defs.json',
    definitions: {
      question: {
        type: 'object',
        properties: {
          '@type': {
            const: 'Question'
          },
          text: {
            type: 'string'
          },
          acceptedAnswer: {
            '$ref': 'defs.json#/definitions/answer'
          }
        },
        required: ['@type', 'acceptedAnswer', 'text']
      },
      answer: {
        type: 'object',
        properties: {
          '@type': {
            const: 'Answer'
          },
          position: {
            type: 'number'
          },
          text: {
            type: 'string'
          }
        },
        required: ['@type', 'position', 'text']
      }
    }
  })
  .compile({
    '$id': 'customcommander/ohm-grammar-quiz-markdown/schemas/main.json',
    type: 'object',
    properties: {
      '@context': {
        const: 'https://schema.org/'
      },
      '@type': {
        const: 'Quiz'
      },
      hasPart: {
        type: 'array',
        items: {
          '$ref': 'defs.json#/definitions/question'
        }
      },
    },
    required: ['@context', '@type', 'hasPart']
  })
);

function parse(md_string) {
  const match = grammar.match(md_string);
  return semantics(match).schema();
}

test('parse markdown', () => {
  const quiz = parse(`

    What is the correct answer?

    - [ ] 41
    - [x] 42
    - [ ] 43

  `);

  if (validate(quiz) !== true) {
    throw new Error('fail');
  }

  console.log(JSON.stringify(quiz, null, 2));

});



