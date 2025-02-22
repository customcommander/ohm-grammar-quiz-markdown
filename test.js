import test from 'node:test';
import {grammar,semantics} from './index.js';

function parse(md_string) {
  const match = grammar.match(md_string);
  return semantics(match).schema();
}

test('parse markdown', () => {
  const quiz = parse(`
Question A

- [ ] Answer 1
- [ ] Answer 2
- [x] Answer 3

Question B

- [ ] Answer 4
- [x] Answer 5

Question C

- [x] Answer 6
- [ ] Answer 7
- [x] Answer 8
`);

});



