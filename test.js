import {readFile} from 'node:fs/promises';
import test from 'node:test';
import Ajv from 'ajv';

import {parse} from './index.js';

async function get_validator() {
  let main = await readFile('./schema.main.json'       , {encoding: 'utf8'});
  let defs = await readFile('./schema.definitions.json', {encoding: 'utf8'});
  main = JSON.parse(main);
  defs = JSON.parse(defs);
  return (new Ajv).addSchema(defs).compile(main);
}

test('parse markdown', async (t) => {
  const validate = await get_validator();

  const md_string = `

    Question 1

    - [ ] Answer 1
    - [x] Answer 2
    - [ ] Answer 3

    Question 2

    - [x] Answer 4
    - [ ] Answer 5
    - [x] Answer 6

    Question 3

    - [x] Answer 7
    - [ ] Answer 8

  `;

  const quiz = parse(md_string);

  if (validate(quiz) !== true) {
    throw new Error('invalid document');
  }

  t.assert.ok(quiz.hasPart.length === 3);

  t.assert.ok(quiz.hasPart[0].text === 'Question 1');
  t.assert.ok(quiz.hasPart[1].text === 'Question 2');
  t.assert.ok(quiz.hasPart[2].text === 'Question 3');
  
  t.assert.ok(quiz.hasPart[0].suggestedAnswer[0].text     === 'Answer 1');
  t.assert.ok(quiz.hasPart[0].suggestedAnswer[0].position === 0);
  t.assert.ok(quiz.hasPart[0].acceptedAnswer.text         === 'Answer 2');
  t.assert.ok(quiz.hasPart[0].acceptedAnswer.position     === 1);
  t.assert.ok(quiz.hasPart[0].suggestedAnswer[1].text     === 'Answer 3');
  t.assert.ok(quiz.hasPart[0].suggestedAnswer[1].position === 2);

  t.assert.ok(quiz.hasPart[1].acceptedAnswer[0].text      === 'Answer 4');
  t.assert.ok(quiz.hasPart[1].acceptedAnswer[0].position  === 0);
  t.assert.ok(quiz.hasPart[1].suggestedAnswer.text        === 'Answer 5');
  t.assert.ok(quiz.hasPart[1].suggestedAnswer.position    === 1);
  t.assert.ok(quiz.hasPart[1].acceptedAnswer[1].text      === 'Answer 6');
  t.assert.ok(quiz.hasPart[1].acceptedAnswer[1].position  === 2);

  t.assert.ok(quiz.hasPart[2].acceptedAnswer.text         === 'Answer 7');
  t.assert.ok(quiz.hasPart[2].acceptedAnswer.position     === 0);
  t.assert.ok(quiz.hasPart[2].suggestedAnswer.text        === 'Answer 8');
  t.assert.ok(quiz.hasPart[2].suggestedAnswer.position    === 1);
});



