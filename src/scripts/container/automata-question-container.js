/**
 * CodeQuestion-compatible container for automata tasks.
 *
 * It reuses the shared CodeQuestion shell (toolbar, instructions, console,
 * fullscreen and theming) while replacing the code editor/runtime with graph
 * editor and automata runner strategies.
 */
export default class AutomataQuestionContainer extends H5P.CodeQuestionContainer {
  /**
   * Returns a graph editor manager instead of the generic code editor manager.
   *
   * @param {HTMLElement} _parent Parent element.
   * @param {object} options Container options.
   * @returns {object} Editor manager.
   */
  getEditorManager(_parent, options = this.options) {
    if (!this._editorManager) {
      this._editorManager = new H5P.AutomataTools.AutomataEditorManager(this, {
        ...options,
        model: this.getInitialModel(options),
        automatonType: options?.automatonType || 'dfa',
      });
    }

    return this._editorManager;
  }

  /**
   * Returns the normalized initial automaton model.
   *
   * @param {object} options Container options.
   * @returns {object} Initial model.
   */
  getInitialModel(options = this.options) {
    const normalizer = new H5P.AutomataTools.AutomataModelNormalizer({
      defaultType: options?.automatonType || 'dfa',
    });
    return normalizer.normalize(options?.automataModel || options?.code);
  }

  /**
   * Adds editor, manual input, testcase table and console to the code page.
   *
   * @returns {void}
   */
  appendCodePageContent() {
    super.appendCodePageContent();
    const codePage = this.getPageManager().getPage('code');

    if (!codePage) {
      return;
    }

    this.manualRunDOM = this.createManualRunDOM();
    this.testTable = new H5P.AutomataTools.AutomataTestTable({ l10n: this.options?.automataL10n || {} });
    this.getPageManager().appendChild('code', this.manualRunDOM);
    this.getPageManager().appendChild('code', this.testTable.getDOM());
  }

  /**
   * Creates the manual input row shown below the graph editor.
   *
   * @returns {HTMLElement} Manual run DOM.
   */
  createManualRunDOM() {
    const wrapper = document.createElement('div');
    wrapper.className = 'h5p-automata-manual-run';

    const label = document.createElement('label');
    label.textContent = this.options?.automataL10n?.manualInput || 'Input word';

    this.manualInput = document.createElement('input');
    this.manualInput.type = 'text';
    this.manualInput.value = this.options?.manualInput || '';
    this.manualInput.className = 'h5p-automata-manual-input';

    label.append(this.manualInput);
    wrapper.append(label);
    return wrapper;
  }

  /**
   * Executes the current automaton with the manual input.
   *
   * @returns {void}
   */
  run() {
    const runner = new H5P.AutomataTools.AutomataRunner();
    const result = runner.run(this.getAutomataModel(), this.manualInput?.value || '');
    this.renderRunResult(result);
  }

  /**
   * Clears run output and visual trace.
   *
   * @returns {void}
   */
  clearRunOutput() {
    this.getConsoleManager()?.clearConsole?.();
    this.getEditorManager()?.highlightTraceFrame?.(null);
  }

  /**
   * Renders a manual run result to console and graph highlight.
   *
   * @param {object} result Runner result.
   * @returns {void}
   */
  renderRunResult(result) {
    const consoleManager = this.getConsoleManager();
    consoleManager?.clearConsole?.();

    (result.diagnostics || []).forEach((diagnostic) => {
      consoleManager?.write?.(diagnostic.message, 'Automata');
    });

    (result.trace || []).forEach((frame) => {
      consoleManager?.write?.(frame.description, 'Trace');
    });

    consoleManager?.write?.(
      result.accepted
        ? (this.options?.automataL10n?.accepted || 'accepted')
        : (this.options?.automataL10n?.rejected || 'rejected'),
      'Result',
    );

    const lastFrame = result.trace?.[result.trace.length - 1] || null;
    this.getEditorManager()?.highlightTraceFrame?.(lastFrame);
  }

  /**
   * Returns the current normalized automaton model.
   *
   * @returns {object} Automaton model.
   */
  getAutomataModel() {
    return this.getEditorManager().getModel();
  }

  /**
   * Renders testcase result rows into the embedded table.
   *
   * @param {object[]} rows Testcase rows.
   * @returns {void}
   */
  renderTestResults(rows = []) {
    this.testTable?.renderRows?.(rows);
  }
}
