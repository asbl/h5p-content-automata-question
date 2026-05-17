import AutomataQuestionContainer from './container/automata-question-container';

/**
 * H5P question type for finite automata.
 *
 * The class reuses CodeQuestion's content rendering, toolbar shell and H5P
 * feedback/xAPI plumbing, but delegates domain work to AutomataTools classes.
 * Future PDA/Turing variants should override model/test option normalization
 * instead of copying the question lifecycle.
 */
export default class AutomataQuestion extends H5P.CodeQuestion {
  /**
   * @param {object} params H5P params.
   * @param {number|string} contentId H5P content ID.
   * @param {object} extras H5P extras.
   */
  constructor(params = {}, contentId, extras = {}) {
    super(params, contentId, extras);
    this.hasStopButton = false;
    this.hasConsole = params.advancedOptions?.showConsole !== false;
    this.gradingMethod = this.normalizeGradingMethod(params.gradingSettings?.gradingMethod);
    this.testcases = params.gradingSettings?.testCases || [];
    this.solutionModel = params.gradingSettings?.solutionAutomaton || null;
    this.lastGrade = null;
    this.automataTestRunner = new H5P.AutomataTools.AutomataTestRunner();

    if (typeof this.isRoot !== 'function') {
      this.isRoot = () => true;
    }
  }

  /**
   * Returns the coding language identifier used by inherited markdown blocks.
   *
   * @returns {string} Language identifier.
   */
  getCodingLanguage() {
    return 'automata';
  }

  /**
   * Returns the root CSS class suffix for this question.
   *
   * @returns {string} Question class.
   */
  getQuestionName() {
    return 'h5p-automataquestion';
  }

  /**
   * Returns the custom graph container class.
   *
   * @returns {typeof AutomataQuestionContainer} Container class.
   */
  getContainerClass() {
    return AutomataQuestionContainer;
  }

  /**
   * Disables the inherited IO/image CodeTester factory.
   *
   * AutomataQuestion grades graph models through `AutomataTestRunner`, but the
   * base constructor may ask for a tester before this constructor body runs.
   * Returning a null tester here keeps inherited construction side-effect free.
   *
   * @returns {object} Null tester factory.
   */
  getCodeTesterFactory() {
    return {
      create: () => null,
    };
  }

  /**
   * Normalizes AutomataQuestion container options.
   *
   * @param {object|null} contentParams Inline content params.
   * @returns {object} Container options.
   */
  getCodeContainerOptions(contentParams = null) {
    const editorSettings = this.params.editorSettings || {};
    const advancedOptions = this.params.advancedOptions || {};
    const model = contentParams?.automataModel
      || contentParams?.code
      || editorSettings.automataModel
      || this.defaultCode;

    return {
      hasConsole: this.hasConsole,
      showSaveLoadButtons: advancedOptions.enableSaveLoadButtons === true,
      consoleType: 'codemirror',
      downloadFilename: 'automaton.json',
      automatonType: editorSettings.automatonType || contentParams?.automatonType || 'dfa',
      automataModel: model,
      manualInput: editorSettings.manualInput || '',
      automataL10n: this.getAutomataL10n(),
    };
  }

  /**
   * Normalizes grading method values from semantics.
   *
   * @param {string} value Raw grading method.
   * @returns {string|null} Normalized grading method.
   */
  normalizeGradingMethod(value) {
    if (['byTestCases', 'bySolution'].includes(value)) {
      return value;
    }

    return null;
  }

  /**
   * Returns localized AutomataTools labels.
   *
   * @returns {object} Labels.
   */
  getAutomataL10n() {
    return {
      manualInput: this.contentL10n.manualInput || 'Input word',
      input: this.contentL10n.input || 'Input',
      expected: this.contentL10n.expected || 'Expected',
      actual: this.contentL10n.actual || 'Actual',
      passed: this.contentL10n.passed || 'Passed?',
      accepted: this.contentL10n.accepted || 'accepted',
      rejected: this.contentL10n.rejected || 'rejected',
      noResults: this.contentL10n.noResults || 'No test results yet.',
    };
  }

  /**
   * Renders inherited buttons and the custom AutomataTools testcase table.
   *
   * @returns {void}
   */
  renderButtonsAndTestCases() {
    if (!this.gradingMethod) {
      return;
    }

    this.addButtons();
  }

  /**
   * Runs automata grading and updates feedback.
   *
   * @returns {Promise<void>} Resolves after grading.
   */
  async checkAction() {
    if (!this.gradingMethod || !this.codeContainer) {
      return;
    }

    this.removeFeedback();
    this.setCheckAnswerBusyState(true);

    try {
      this.sendAttemptedEvent();
      this.lastGrade = this.automataTestRunner.grade({
        model: this.codeContainer.getAutomataModel(),
        testCases: this.testcases,
        solution: this.solutionModel,
        gradingMethod: this.gradingMethod,
      });

      this.codeContainer.renderTestResults(this.lastGrade.testCases.rows);
      this.answerGiven = true;
      this.passed = this.lastGrade.passed;
      this.applyScoreFeedback(this.getScore(), this.getMaxScore());
      this.sendAnsweredEvent();
      this.scheduleEvaluationFrameSync();
    }
    finally {
      this.setCheckAnswerBusyState(false);
    }
  }

  /**
   * Returns current score in CodeQuestion's two-point scale.
   *
   * @returns {number} Score.
   */
  getScore() {
    return Math.min((this.lastGrade?.score || 0) * this.maxScore, this.maxScore);
  }

  /**
   * Returns the learner response for xAPI.
   *
   * @returns {object} xAPI result.
   */
  buildResultStatement() {
    const result = super.buildResultStatement();
    result.response = this.codeContainer?.getCode?.() || '';
    return result;
  }
}
