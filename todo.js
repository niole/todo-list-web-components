class TodoList extends HTMLElement {
  constructor() {
    super();
    this.listView = document.createElement('ol');
    this.append(this.listView);
  }
}

customElements.define('todo-list', TodoList, { extends: 'ol' });

class AddTodoInput extends HTMLInputElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.append(document.createElement('div'));
  }
}

customElements.define('add-todo-input', AddTodoInput, { extends: 'input' });

class TodoView extends HTMLDivElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      li {
	list-style: none;
      }

      li label > input[type="checkbox"] {
	display: none;
      }

      li label > input[type="checkbox"] + span {
	cursor: pointer;
      }

      li label > input:checked + span {
	text-decoration: line-through
      }
    `;
    this.shadow.appendChild(style);

    /**
     * { id: string; content: string; }[]
     */
    this.list = [
      { id: 'a', content: 'go to the store', checked: false },
    ];
    this.listView = document.createElement('todo-list');
    this.addTodoInput = document.createElement('input');
    this.submitNewTodoButton = document.createElement('button');
    this.submitNewTodoButton.textContent = 'Submit';
    this.submitNewTodoButton.onclick = () => {
      const newTodoContent = this.addTodoInput.value;
      this.addTodoInput.value = null;
      this.list.push({
	id: Date.now().toString(),
	content: newTodoContent,
	checked: false,
      });
      this.updateViewItems();
    };
    this.exportButton = document.createElement('a');
    this.exportButton.textContent = 'Download Todos';
    this.exportButton.setAttribute('download', 'todos.json');

    this.addTodoInput.setAttribute('is', 'add-todo-input');
  }

  connectedCallback() {
    this.listView = document.createElement('todo-list');
    this.shadow.append(this.addTodoInput);
    this.shadow.append(this.submitNewTodoButton);
    this.shadow.append(this.exportButton);
    this.shadow.append(this.listView);
    this.setItems(this.list);
  }

  setItems(todoItems) {
    this.list = todoItems;
    this.updateViewItems();
  }

  updateViewItems() {
    // TODO smarter updates?
    this.listView.textContent = null;
    this.list.forEach(todoItem => {
      this.listView.appendChild(
	this.createTodoListItem(todoItem)
      );
    });
    this.setExportHref();
  }

  setExportHref() {
    this.exportButton.href = `data:text/json;charset=utf-8,'${encodeURIComponent(JSON.stringify(this.list))}'`;
  }

  createTodoListItem(todoItem) {
    const {
      id, content, checked
    } = todoItem;
    const itemContainer = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    if (checked) {
      checkbox.setAttribute('checked', true);
    }
    checkbox.onchange = event => {
      todoItem.checked = event.target.checked;
      this.setExportHref();
    };
    label.appendChild(checkbox);
    const contentContainer = document.createElement('span');
    contentContainer.textContent = content;
    label.append(contentContainer)
    itemContainer.append(label);
    return itemContainer;
  }
}

customElements.define('todo-view', TodoView, { extends: 'div' });
