import * as ohm from 'ohm-js';

export const grammar = ohm.grammar(String.raw`

  QuizMarkdown {

    Quiz     = Block+

    Block    = Question Answers

    Question = text

    Answers  = Answer+

    Answer   = "-" "[" mark? "]" text

    mark     = " " | "x"

    text     = (~eol any)+ (eol | end)

    eol      = "\r"? "\n"

  }

`);

function map_schema(list) {
  return list.children.map(child => child.schema());
}

export const semantics = grammar.createSemantics().addOperation('schema', {

  Quiz(blocks) {
    return {
      "@context": "https://schema.org/",
      "@type": "Quiz",
      "hasPart": map_schema(blocks)
    };
  },

  Block(question, answers) {
    return {
      ...question.schema(),
      ...answers.schema()
    }
  },

  Question(text) {
    return {
      "@type": "Question",
      text: text.schema()
    }
  },

  Answers(answers) {
    const [correct, wrong] =
      map_schema(answers).reduce(
        ([c, w], [status, answer], position) => {
          (status ? c : w).push({position, ...answer});
          return [c, w];
        },
        [[], []]
      );

    // Assuming that a question **MUST** have at least one correct answer.
    if (correct.length === 0) {
      throw new Error("question with no correct answers");
    }

    return {
      acceptedAnswer: correct.length === 1 ? correct[0] : correct,
      suggestedAnswer: wrong.length === 1 ? wrong[0] : wrong
    };
  },

  Answer(_, __, mark, ___, text) {
    // When `- [ ] Answer A` then `mark` is `[]` (empty)
    // When `- [x] Answer B` then `mark` is `[x]`
    const correct = mark.children.length === 1;
    return [correct, {"@type": "Answer", text: text.schema()}];
  },

  text(val, _) {
    return val.sourceString;
  },

});


