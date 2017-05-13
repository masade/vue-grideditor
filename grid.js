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

function isInViewport(element,moveInViewport) {
	var ww = window.innerWidth;
	var wh = window.innerHeight;
	var rect = element.getBoundingClientRect();
	var html = document.documentElement;
	var inviewport = (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (wh || html.clientHeight) &&
		rect.right <= (ww || html.clientWidth)
	);
	if(!moveInViewport)
		return inviewport;

	// console.log(inviewport);
	// if(!inviewport){
		offset = element.offsetHeight + 10;
		scrollY = document.body.scrollTop;
		if(rect.bottom >= wh - offset)
			scrollY += (rect.bottom - wh + offset)
		if(rect.top <= offset )
			scrollY += (rect.top - offset)

		scrollX = document.body.scrollLeft;
		if(rect.right >= ww)
			scrollX += (rect.right - ww + 10)
		if(rect.left <= 0 )
			scrollX += (rect.left - 10)
	// }
	window.scrollTo(scrollX,scrollY);
}

var	keys = { ESC: 27, TAB: 9, RETURN: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };

// Data Cell Component
var datacellComponent = Vue.extend({
	template 	: '#datacell-template',
	props 		: ['value','celldata','cellname','widthclass','noneditable','cellindex','namespace'],
	data 		: function(){
		return {
			newrow : {}
		}
	},
	computed	: {
		cursor: function(){
			return (this.$parent.cursorcell == this.cellindex)?true:false;
		},
		editing: function(){
			return (this.$parent.editcell == this.cellindex)?true:false;
		}
	},
	methods 	:{
		editCell:function(e){
			this.$parent.cursorcell = this.cellindex;
			if(!this.noneditable)
				this.$parent.editcell = this.cellindex;
		},
		doneEdit: function(e) {
			// e.target.value;
			// console.log(e.target.value);
			this.$emit('input', e.target.value);
			this.$parent.editcell 	= null;

		},
		cancelEdit: function(e) {
			this.$parent.editcell = null;
		},
		makeNewRow(){
			console.log("here");
			this.newrow = {};
			this.$parent.cols.map((col,index) => this.$set(this.newrow, col.m, ""))
		},
		addRow: function (e) {
			e.preventDefault();
			console.log(this.newrow);
			var value = this.newrow.name && this.newrow.name.trim()
			if (!value) {
				return
			}
			this.newrow.id = gridStorage.uid++;
			var newrow = this.newrow;
			const vm = this;
			this.$parent.cols.map(function(col,index){
				if(typeof newrow[col.m] == "undefined")
					vm.$set(newrow, col.m,"");
			})
			this.$parent.rows.unshift(newrow);
			this.makeNewRow();
		},
		reset: function(e){
			e.preventDefault();
			this.newrow={}
			this.$parent.editcell = null;
			// this.$parent.cursorcell  = null;
		}
	},
	mounted: function(){
		this.makeNewRow();
	}
})

var addrowComponent = datacellComponent.extend({
	template 	: '#addrow-template',
})

// Data Grid Component
Vue.component('datagrid', {
	template 	: '#datagrid-template',
	props 		: ['rows','cols'],
	components 	: {
		'datacell' 	: datacellComponent,
		'addrow'	: addrowComponent,
	},
	data 	: function (){
		return {
			cursorcell  : null,
			editcell 	: null,
		}
	},
	computed   :  {
		myInput : function(v){
			// console.log(v);
		},
		cursorrow : function(){
			return this.cursorcell?parseInt(this.cursorcell.split(',')[0]):null;
		},
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
			// return 0;
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
		addRow: function(row){
			console.log(row);
			this.$emit('addrow',row);
		},
		moveCursor: function(index){
			this.editcell = null;
			this.cursorcell = index;
		},
		handleKeynav : function(e){
			var preventKeyDefault = false;
			// console.log(e.which);
			if(e.which == keys.ESC){ preventKeyDefault= true;}

			//edit cell on enter
			if(!this.editcell && this.cursorcell){
				if(e.which == keys.RETURN){
					preventKeyDefault = true;
					this.editcell = this.cursorcell;
				}
			}


			// Manage cursor movement only when cell not editing
			if(!this.editcell){
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
				this.moveCursor(ri+","+ci);
			}

			if(preventKeyDefault)
				e.preventDefault();

		}
	}

});

Vue.directive('focus', {
	inserted: function (el,binding) {
		Vue.nextTick(function() {
			if(binding.value){
			  	el.focus();
			}
		});
	}
})

Vue.directive('inviewport',function(el,binding){
	if(binding.value)
		isInViewport(el,true);
});

var app = new Vue({

	data: {
		rows: gridStorage.fetch(),
		cols : cols,
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
	computed: {},
	methods: {
		addRow : function(row){
			console.log(row);
			console.log("myrow");
			this.rows.unshift(row);
		},
		removeAll: function(){ this.rows = [];}
	}
});


app.$mount('.gridtable')