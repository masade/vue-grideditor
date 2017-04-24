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
var	keys = {
			ESC: 27,
			TAB: 9,
			RETURN: 13,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40
		};






var datacellComponent = {
	template 	: '#datacell-template',
	props 		: ['value','celldata','cellname','cellwidth','noneditable','cellindex'],
	data 		: function(){
		return {
			// editme: false
			// editing: false,
			// cursor : false,
		}
	},
	computed	: {
		editableCell: function(){
			return !this.noneditable;
		},
		cellClass : function(){
			return "col-sm-"+this.cellwidth;
		},
		cursor: function(){
			return (this.$parent.$parent.cursoron == this.cellindex)?true:false;
		},
		editing: function(){
			return (this.$parent.$parent.editingcell == this.cellindex)?true:false;
		}
	},
	methods 	:{
		editCell: function(value,field){
			if(this.editableCell){
				// field.target.focus();
				// this.editme = true;
				// console.log(field.currentTarget);
				// console.log(this.cellindex);
				this.$parent.$parent.editingcell = this.cellindex;
			}
		},
		edited: function(value,field){
			// if(this.editableCell){
				// field.target.focus();
				// this.editme = true;
				// console.log(field.currentTarget);
				// console.log(this.cellindex);
				this.$parent.$parent.edited = this.cellindex;
			// }
		},
		doneEdit: function(value,field) {
			// console.log(!this.$parent.$parent.edited);
			if(this.$parent.$parent.edited){
				// console.log(e.keyCode);

				this.$parent.$parent.editingcell = null;
				this.$parent.$parent.edited = null;
				this.$emit('input', value);
			}

		},
		cancelEdit: function(value,field) {
			// this.editing = false;
			this.$parent.$parent.editingcell = null;
		},

	},
	directives: {
		'cell-focus': {
			inserted: function (el, value) {
				this.$parent.$parent.edited = true;
		  		if (value) {
					el.getElementsByTagName('input')[0].focus()
				}
			}
		}
	}
}

Vue.component('datagrid', {
	template 	: '#datagrid-template',
	props 		: ['rows','cols'],
	components 	: {
		'datacell' 	: datacellComponent,
		// 'addrow'	:
	},
	data 	: function (){
		return {
			newRow: '',
			cursoron: null,
			editingcell: null,
			edited: null,
		}
	},
	computed: {
		totalrows: function(){
			return this.rows.length;
		},
		totalcols: function(){
			return this.cols.length;
		}
	},
	methods		: {
		// moveCursor: function(topos){
			// console.log(topos);
			// console.log("here");
		// }
		addRow: function () {

			var value = this.newRow && this.newRow.trim()
			if (!value) {
				return
			}
			this.rows.unshift({
				id: gridStorage.uid++,
				name: value,
				knownfor: '',
				year: '',
				degree: '',
				specialization: ''
			})
			this.newRow = ''
			//
		},
		removeAll: function(){
			this.rows = [];
		}
	}
});

var app = new Vue({

	data: {
		rows: gridStorage.fetch(),
		newRow: '',
		cursoron: null,
		editingcell: null,
		edited: null,
		cols :[
			// {m:'id',w:'1',noedit:'true'},
			{m:'name',w:'3'},
			{m:'knownfor',w:'3'},
			{m:'year',w:'1'},
			{m:'degree',w:'2'},
			{m:'specialization',w:'2'},
		],
	},
	watch: {
		rows: {
			handler: function (rows) {
				gridStorage.save(rows)
			},
			deep: true
		}
	},
	computed: {

	},
	filters: {
		pluralize: function (n) {
		return n === 1 ? 'row' : 'rows'
		}
	},
	created: function(){
		window.addEventListener('keydown', event => this.handleKeynav(event));
	},
	methods: {
		handleKeynav: function(e) {
			var preventKey = false;
			if(e.which == keys.ESC){
				e.preventDefault();
			}
			if(!this.editingcell && this.cursoron){
				if(e.which == keys.RETURN){
					e.preventDefault();
					this.editingcell = this.cursoron;
					//e.stopPropogation();
				}

			}
			if(!this.editingcell){
				var c = 0; var r = 0;
				switch(e.which){
					case keys.LEFT 	:	preventKey=true;c=-1;r=0;  break;
					case keys.RIGHT :	preventKey=true;c= 1;r=0; break;
					case keys.UP 	:	preventKey=true;c= 0;r=-1; break;
					case keys.DOWN 	:	preventKey=true;c= 0;r=1; break;
					// case keys.TAB 	:	preventKey=true;r= 0; c = (e.shiftKey?-1:+1); break;
				}
				if(preventKey)
					e.preventDefault();

				if(this.cursoron){
					var cursor = this.cursoron.split(',');
					ri = parseInt(cursor[0])+r; ci= parseInt(cursor[1])+c;
					ri = (ri<0)?0:ri;
					ci = (ci<0)?0:ci;
					ri = (ri>=this.totalrows)?this.totalrows-1:ri;
					ci = (ci>=this.totalcols)?this.totalcols-1:ci;
				}else{
					ri = 0; ci=0;
				}
				this.cursoron = ri+","+ci;
			}
			// console.log(e.which,this.editingcell,this.cursoron);

			// console.log(e.which);

		},

	}
});


app.$mount('.gridtable')