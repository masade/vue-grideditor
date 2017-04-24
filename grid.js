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

var	keys = { ESC: 27, TAB: 9, RETURN: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };

// Data Cell Component
var datacellComponent = {
	template 	: '#datacell-template',
	props 		: ['value','celldata','cellname','widthclass','noneditable','cellindex'],
	data 		: function(){
		return {}
	},
	computed	: {
		cursor: function(){
			return (this.$parent.cursorcell == this.cellindex)?true:false;
		},
		editing: function(){
			return (this.$parent.editingcell == this.cellindex)?true:false;
		}
	},
	methods 	:{
		movecursor: function(){
			this.$parent.editingcell = null;
			this.$parent.cursorcell = this.cellindex;
		},
		editcell:function(){
			if(!this.noneditable)
				this.$parent.editingcell = this.cellindex;
		}
	},
	directives: {
	}
}

// Data Grid Component

Vue.component('datagrid', {
	template 	: '#datagrid-template',
	props 		: ['rows','cols'],
	components 	: {
		'datacell' 	: datacellComponent,
	},
	data 	: function (){
		return {
			// newRow: '',
			cursorcell: null,
			editingcell: null,
		}
	},
	computed   :  {
		colwidths : function(){
			var sum = 0; var max = 0; var maxindex = 0;
			var total = this.cols.reduce(function(total,col) {
				if(!col.show) return total;
				return total + (parseInt(col.w) || 10);
			}, 0);
			var cws = this.cols.map(function(col,index){
				if(!col.show) return 0;
				var cw = Math.ceil((col.w || 10) * 12 / total);
				if(max < cw){max = cw; maxindex = index;}
				sum += cw;
				return cw;
			})

			cws[maxindex] = (sum>12)?(cws[maxindex] + (12 - sum)) : cws[maxindex];

			return cws.map(function(v){return v?'col-sm-'+v:'';})
		},
		totalrows: function(){
			return this.rows.length;
		},
		totalcols: function(){
			return this.cols.reduce(function(count,col) {
				return count+= (col.show)?1:0;
			}, 0);
		}
	},
	created: function(){
		window.addEventListener('keydown', event => this.handleKeynav(event));
	},
	methods: {
		handleKeynav : function(e){
			var preventKeyDefault = false;
			// console.log(e.which);
			if(e.which == keys.ESC){ preventKeyDefault= true;}

			//edit cell on enter
			if(!this.editingcell && this.cursorcell){
				if(e.which == keys.RETURN){
					preventKeyDefault = true;
					this.editingcell = this.cursorcell;
				}
			}


			// Manage cursor movement only when cell not editing
			if(!this.editingcell){
				var c = 0; var r = 0;
				switch(e.which){
					case keys.LEFT 	:	preventKeyDefault=true;c=-1;r=0;  break;
					case keys.RIGHT :	preventKeyDefault=true;c= 1;r=0; break;
					case keys.UP 	:	preventKeyDefault=true;c= 0;r=-1; break;
					case keys.DOWN 	:	preventKeyDefault=true;c= 0;r=1; break;
				}

				if(this.cursorcell){
					var cursor = this.cursorcell.split(',');
					ri = parseInt(cursor[0])+r; ci= parseInt(cursor[1])+c;
					ri = (ri<0)?-1:ri;
					ci = (ri<0)?-1:((ci<0)?0:ci);
					ri = (ri>=this.totalrows)?this.totalrows-1:ri;
					ci = (ci>=this.totalcols)?this.totalcols-1:ci;
				}else{
					ri =-1; ci=-1;
				}
				this.cursorcell = ri+","+ci;
			}

			if(preventKeyDefault)
				e.preventDefault();

		}
	}

});

var app = new Vue({

	data: {
		rows: gridStorage.fetch(),
		cols : cols,
	},
	watch: {
		rows: {
			handler: function (rows) {
				gridStorage.save(rows)
			},
			deep: true
		}
	},
	computed: {},
	methods: {
		removeAll: function(){ this.rows = [];}
	}
});


app.$mount('.gridtable')