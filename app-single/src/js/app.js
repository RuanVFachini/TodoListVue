const presetValues = [{
    "title":"Tarefa 1",
    "completed":true
  }, {
    "title":"Tarefa 2",
    "completed":false
  }, {
    "title":"Tarefa 3",
    "completed":false
  }]
  
  const STORAGE_KEY = "todo-app";
  const todoStorage = {
    fetch: function() {
      var todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || presetValues;
      todos.forEach(function(todo, index) {
        todo.id = index;
      });
      todoStorage.uid = todos.length;
      return todos;
    },
    save: function(todos) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  };
  
  var filters = {
    all: function(todos) {
      return todos;
    },
    active: function(todos) {
      return todos.filter(function(todo) {
        return !todo.completed;
      });
    },
    completed: function(todos) {
      return todos.filter(function(todo) {
        return todo.completed;
      });
    }
  };
  
  var app = new Vue({
      el:'#app',
    data: {
      todos: todoStorage.fetch(),
      newTodo: "",
      editedTodo: null,
      visibility: "all"
    },
    watch: {
      todos: {
        handler: function(todos) {
          todoStorage.save(todos);
        },
        deep: true
      }
    },
    computed: {
      filteredTodos: function() {
        return filters[this.visibility](this.todos);
      },
      remaining: function() {
        return filters.active(this.todos).length;
      },
      allDone: {
        get: function() {
          return this.remaining === 0;
        },
        set: function(value) {
          this.todos.forEach(function(todo) {
            todo.completed = value;
          });
        }
      }
    },
  
    filters: {
      pluralize: function(n) {
        return n === 1 ? "task" : "tasks";
      }
    },
  
    methods: {
      addTodo: function() {
        var value = this.newTodo && this.newTodo.trim();
        if (!value) {
          return;
        }
        this.todos.push({
          id: todoStorage.uid++,
          title: value,
          completed: false
        });
        this.newTodo = "";
      },
  
      removeTodo: function(todo) {
        this.todos.splice(this.todos.indexOf(todo), 1);
      },

      completeTodo: function(todo) {
        this.beforeEditCache = todo.title;
        this.editedTodo = todo;
        this.editedTodo.completed = !this.editedTodo.completed;
        this.editedTodo = null;
      },
  
      editTodo: function(todo) {
        this.beforeEditCache = todo.title;
        this.editedTodo = todo;
      },
  
      doneEdit: function(todo) {
        if (!this.editedTodo) {
          return;
        }
        this.editedTodo = null;
        todo.title = todo.title.trim();
        if (!todo.title) {
          this.removeTodo(todo);
        }
      },
  
      cancelEdit: function(todo) {
        this.editedTodo = null;
        todo.title = this.beforeEditCache;
      },
  
      removeCompleted: function() {
        this.todos = filters.active(this.todos);
      }
    },
    directives: {
      "todo-focus": function(el, binding) {
        if (binding.value) {
          el.focus();
        }
      }
    }
  });
  
  function onHashChange() {
    var visibility = window.location.hash.replace(/#\/?/, "");
    if (filters[visibility]) {
      app.visibility = visibility;
    } else {
      window.location.hash = "";
      app.visibility = "all";
    }
  }
  
  window.addEventListener("hashchange", onHashChange);
  onHashChange();
  