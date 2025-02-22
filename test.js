import {readFile} from 'node:fs/promises';
import test from 'node:test';
import Ajv from 'ajv';

import {grammar,semantics} from './index.js';

function parse(md_string) {
  const match = grammar.match(md_string);
  return semantics(match).schema();
}

test('parse markdown', async () => {
  const main = await readFile('./schema.main.json'       , {encoding: 'utf8'});
  const defs = await readFile('./schema.definitions.json', {encoding: 'utf8'});
  
  const validate = (
    (new Ajv)
      .addSchema(JSON.parse(defs))
      .compile(JSON.parse(main))
  );

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



