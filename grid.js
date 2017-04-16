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

var datacellComponent = {
	template 	: '#datacell-template',
	props 		: ['value','celldata','cellname','cellclass','noneditable'],
	data 		: function(){
		return {
			editing: false
		}
	},
	computed	: {
		editableCell: function(){
			return !this.noneditable;
		}
	},
	methods 	:{
		editCell: function(value,field){
			if(this.editableCell)
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
}

Vue.component('datarows', {
	template 	: '#datarows-template',
	props 		: ['value'],
	components 	: {
		'datacell' : datacellComponent,
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
		removeAll: function(){
			this.rows = [];
		}
	}
});

app.$mount('.gridtable')