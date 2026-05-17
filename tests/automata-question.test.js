import { describe, expect, it } from 'vitest';

import AutomataQuestion from '../src/scripts/automata-question';
import AutomataQuestionContainer from '../src/scripts/container/automata-question-container';

describe('AutomataQuestion', () => {
  it('normalizes container options and uses the automata container', () => {
    const question = new AutomataQuestion({
      contentType: 'text_and_ide',
      editorSettings: {
        automatonType: 'nfa',
        startingCode: '{"type":"nfa","alphabet":["a"],"states":[],"transitions":[]}',
        manualInput: 'a',
      },
      advancedOptions: {
        showConsole: true,
        enableSaveLoadButtons: false,
      },
      gradingSettings: {
        gradingMethod: 'byTestCases',
        testCases: [{ input: 'a', expectedAccepted: true }],
      },
    }, 1, {});

    expect(question.getContainerClass()).toBe(AutomataQuestionContainer);
    expect(question.getCodingLanguage()).toBe('automata');
    expect(question.getCodeContainerOptions()).toMatchObject({
      automatonType: 'nfa',
      manualInput: 'a',
      downloadFilename: 'automaton.json',
    });
  });

  it('grades current container models with AutomataTestRunner', async () => {
    const question = new AutomataQuestion({
      contentType: 'text_and_ide',
      editorSettings: {},
      gradingSettings: {
        gradingMethod: 'byTestCases',
        testCases: [
          { input: '', expectedAccepted: true },
          { input: 'a', expectedAccepted: false },
        ],
      },
    }, 1, {});

    question.codeContainer = {
      getAutomataModel: () => ({
        type: 'dfa',
        alphabet: ['a'],
        states: [
          { id: 'even', label: 'even', initial: true, accepting: true },
          { id: 'odd', label: 'odd', initial: false, accepting: false },
        ],
        transitions: [
          { id: 'a0', from: 'even', to: 'odd', symbols: ['a'] },
          { id: 'a1', from: 'odd', to: 'even', symbols: ['a'] },
        ],
      }),
      renderTestResults: (rows) => {
        question.renderedRows = rows;
      },
      getCode: () => '{}',
    };

    await question.checkAction();

    expect(question.getScore()).toBe(2);
    expect(question.renderedRows).toHaveLength(2);
  });
});
