// localStorage persistence
// var STORAGE_KEY = 'todos-vuejs-2.0'
var STORAGE_KEY = 'grid-vue'
var gridStorage = {
  fetch: function () {
	var rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
	rows.forEach(function (row, index) {
	  row.id = index
	})
	gridStorage.uid = rows.length
	return rows
  },
  save: function (rows) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  }
}

Vue.component('datacell', {
	template 	: '#datacell-template',
	props 		: ['value','celldata','cellname','cellclass'],
	data 		: function(){
		return {
			editing: false,
		}
	},
	computed	: {},
	methods 	:{
		editCell: function(value,field){
			this.editing = true;
		},
		doneEdit: function(value,field) {
			this.editing = false;
			this.$emit('input', value)
		},
		cancelEdit: function(value,field) {
			this.editing = false;
		},
	},
	directives: {
		'cell-focus': function (el, value) {
	  		if (value) {
				el.focus()
			}
		}
	}
});


var app = new Vue({

	data: {
		rows: gridStorage.fetch(),
		newRow: '',
		editedRow: null,
		editedProp: null,
		visibility: 'all',
		updated: '',
	},
	watch: {
		rows: {
			handler: function (rows) {
				console.log(rows);
				gridStorage.save(rows)
			},
			deep: true
		}
	},
	computed: {
		totalrows: function(){
			return this.rows.length;
		},
	},
	filters: {
		pluralize: function (n) {
		return n === 1 ? 'row' : 'rows'
		}
	},
	methods: {
		addRow: function () {
			var value = this.newRow && this.newRow.trim()
			if (!value) {
				return
			}
			this.rows.push({
				id: gridStorage.uid++,
				name: value,
				knownfor: '',
				year: '',
				degree: '',
				specialization: ''
			})
			this.newRow = ''
		},
		updateCell: function(updated) {
			console.log(updated);
			console.log("Updated");
		},
		editItem: function(row,field){
			this.beforeEditCache = row[field] || '';
			this.editedRow = row
			this.editedProp = field
		},
		doneEdit: function (row,field) {
			if (!this.editedProp) {
				return
			}
			this.editedProp = null;
			this.editedRow = null;
			// console.log(row[field]);
			row[field] = row[field]?row[field].trim() : "";
		},
		cancelEdit: function
		 (row,field) {
			this.editedProp = null;
			this.editedRow = null;
			row[field] = this.beforeEditCache
		},

		removeAll: function(){
			this.rows = [];
		}
	},
	directives: {
		'row-focus': function (el, value) {
	  		if (value) {
				el.focus()
			}
		}
	}
});

app.$mount('.gridtable')