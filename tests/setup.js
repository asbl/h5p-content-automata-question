import AutomataModelNormalizer from '../../H5P.LibAutomataTools-1.0/src/scripts/model/automata-model-normalizer';
import AutomataRunner from '../../H5P.LibAutomataTools-1.0/src/scripts/runtime/automata-runner';
import AutomataTestRunner from '../../H5P.LibAutomataTools-1.0/src/scripts/testing/automata-test-runner';

globalThis.H5P = globalThis.H5P || {};

globalThis.H5P.Question = class {
  constructor() {
    this.buttons = [];
  }

  addButton(id, label, callback) {
    this.buttons.push({ id, label, callback });
  }

  setFeedback() {}

  removeFeedback() {}

  trigger() {}

  createXAPIEventTemplate() {
    return {
      data: { statement: { object: { definition: {} } } },
      setVerb() {},
      getVerifiedStatementValue() {
        return {};
      },
    };
  }
};

globalThis.H5P.createUUID = () => 'test-uuid';
globalThis.H5P.t = (key) => key;
globalThis.H5P.Util = {
  extend(target, ...sources) {
    return Object.assign(target, ...sources);
  },
  setupOnDocumentReady(callback) {
    callback();
  },
};
globalThis.H5P.CodeContainer = class {};
globalThis.H5P.CodeQuestionContainer = class extends globalThis.H5P.CodeContainer {};
globalThis.H5P.AutomataTools = {
  AutomataModelNormalizer,
  AutomataRunner,
  AutomataTestRunner,
};

globalThis.H5P.CodeQuestion = class extends globalThis.H5P.Question {
  constructor(params = {}, contentId, extras = {}) {
    super('code-question', {});
    this.params = {
      l10n: {},
      contents: [],
      editorSettings: {},
      gradingSettings: {},
      advancedOptions: {},
      ...params,
    };
    this.contentId = contentId;
    this.extras = extras;
    this.contentL10n = this.params.l10n || {};
    this.l10n = this.contentL10n;
    this.defaultCode = this.params.editorSettings?.startingCode || '';
    this.maxScore = 2;
    this.parentDiv = document.createElement('div');
  }

  getCodeTesterFactory() {
    return { create: () => null };
  }

  removeFeedback() {}

  setCheckAnswerBusyState() {}

  sendAttemptedEvent() {}

  sendAnsweredEvent() {}

  scheduleEvaluationFrameSync() {}

  applyScoreFeedback(score, maxScore) {
    this.lastFeedback = { score, maxScore };
  }

  getMaxScore() {
    return this.maxScore;
  }

  buildResultStatement() {
    return { response: '' };
  }
};
