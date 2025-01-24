const vscode = require('vscode');


class TaskTreeDataProvider {
  constructor() {
    this.tasks = [];
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  /**
   * Updates the tasks to display in the tree view.
   * @param {Array} tasks - The list of tasks (activities) from the activity.json file.
   */
  setTasks(tasks) {
    this.tasks = tasks;
    this.refresh();
  }

  /**
   * Refreshes the tree view.
   */
  refresh() {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Returns a TreeItem for the given element.
   * @param {Object} element - The task element.
   * @returns {vscode.TreeItem}
   */
  getTreeItem(element) {
    return {
      label: element.label,
      iconPath: new vscode.ThemeIcon('tasklist'),
    };
  }

  /**
   * Returns the children for the tree view.
   * @returns {Promise<Array>}
   */
  async getChildren() {
    return this.tasks.map((task) => ({label: task.id}));
  }
}

module.exports = TaskTreeDataProvider;