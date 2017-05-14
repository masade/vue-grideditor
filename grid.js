/*!
 * GridEditor.js v1.0.0
 * (c) 2017 Paresh Masade
 * Released under the MIT License.
 */
// localStorage persistence
var useRemoteStorage = false;
var useLocalStorage = true;
var STORAGE_KEY = 'grideditor-vue-1-0';

var baseURL = "https://masade.github.io/vue-grideditor/methods/"

/*        End of Config       */
/* -------------------------- */
axios.defaults.baseURL = baseURL;
var dataStorage = {
	fetch: function(cb){
		var rows = [];
		if(useRemoteStorage){
			axios.get('get.php').then(function(response){
				rows = response.data;
				dataStorage.save(rows);
				cb(rows);
			})
			.catch(function (error) { console.log(error);});
		}
		else if(useLocalStorage){
			rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
			if(rows.length == 0){
				axios.get('data.json').then(function(response){
					rows = response.data;
					dataStorage.save(rows);
					cb(rows);
				})
				.catch(function (error) { console.log(error);});
			}
			// cb(rows);
		}else{
			return rows;
		}

	},
	save : function(rows,cb){
		if(useLocalStorage)
			localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
	},
	cellupdate: function(data,cb){
		if(useRemoteStorage){
			axios.post('put.php',data)
				.then(function(response){
					cb(response.data)
					// console.log(response.data);
				})
				.catch(function (error) {console.log(error);});
		}else if(useLocalStorage){
			cb(data);
		}
	},
	rowadd: function(data,cb){
		if(useRemoteStorage){
			axios.post('post.php',data)
			.then(function(response){
				cb(response.data);
			})
			.catch(function (error) {console.log(error);});
		}else if(useLocalStorage){
			data.id = crypto.getRandomValues(new Uint32Array(1));
			cb(data);
		}
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

	window.scrollTo(scrollX,scrollY);
}

var	keys = { ESC: 27, TAB: 9, RETURN: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, C: 67, V: 86, X: 88, Z: 90, DELETE: 8};

// Data Cell Component
var datacellComponent = Vue.extend({
	template 	: '#datacell-template',
	props 		: ['value','celldata','cellname','widthclass','noneditable','cellindex','namespace','dataid'],
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
		},
		copied: function(){
			return (this.$parent.copiedcell == this.cellindex)?true:false;
		}
	},
	methods 	:{
		editCell:function(e){
			this.$parent.cursorcell = this.cellindex;
			if(!this.noneditable)
				this.$parent.editcell = this.cellindex;
		},
		doneEdit: function(e) {
			this.$emit('input', e.target.value);
			this.$parent.editcell 	= null;
			const vm = this.$parent;
			vm.loading = true;
			var params = {'id':e.target.dataset.id,'key': e.target.name,'val': e.target.value};
			dataStorage.cellupdate(params,function(){
				vm.loading = false;
			});

		},
		cancelEdit: function(e) {
			this.$parent.editcell = null;
		},
		makeNewRow: function(){
			this.newrow = {};
			this.$parent.cols.map((col,index) => this.$set(this.newrow, col.m, null))
		},
		addRow: function (e) {
			e.preventDefault();
			var value = this.newrow.name && this.newrow.name.trim()
			if (!value) {
				return
			}
			var vm = this.$parent;
			vm.loading = true;
			dataStorage.rowadd(this.newrow,function(data){
				vm.loading = false;
				vm.rows.unshift(data);
			})
			this.makeNewRow();
		},
		reset: function(e){
			e.preventDefault();
			this.$parent.editcell = null;
			// this.$parent.cursorcell  = null;
			this.makeNewRow();
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
			copiedcell	: null,
			pastelog	: [],
			loading 	: false,
		}
	},
	computed   :  {
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
	mounted : function(){
		this.getdata();
	},
	methods: {
		moveCursor: function(index){
			this.editcell = null;
			this.cursorcell = index;
		},
		getdata : function(){
			const vm = this;
			vm.loading = true;
			dataStorage.fetch(function(data){
				vm.loading = false;
				vm.$parent.rows = data;
			});
		},
		getcellval : function(index){
			var c = index.split(',');
			if(c[0] >= 0)
				return this.rows[c[0]][this.cols[c[1]]['m']];
			return null;
		},
		setcellval : function(index,val,undo){
			var c = index.split(',');
			if(c[0] >= 0){
				if(!undo) // log if not not undo
					this.pastelog.push({"index":index,"value":this.getcellval(index)});

				this.rows[c[0]][this.cols[c[1]]['m']] = val;
				// console.log(this.pastelog);
				var params = {'id':this.rows[c[0]]['id'],'key': this.cols[c[1]]['m'],'val': val};
				console.log(params);
				dataStorage.cellupdate(params,function(){});
			}
		},
		undoval : function(){
			var undo = this.pastelog.pop();
			if(undo)
				this.setcellval(undo['index'],undo['value'],true);
		},
		handleKeynav : function(e){
			var preventKeyDefault = false;
			if(e.which == keys.ESC){ preventKeyDefault= true;}

			// console.log(e.which,e.ctrlKey);
			//edit cell on enter
			if(!this.editcell && this.cursorcell){
				if(e.which == keys.RETURN){
					preventKeyDefault = true;
					this.editcell = this.cursorcell;
				}
			}

			if(!this.editcell && this.cursorcell){
				if(e.which == keys.C && e.ctrlKey)
					this.copiedcell = this.cursorcell;
				if(e.which == keys.V && e.ctrlKey)
					this.setcellval(this.cursorcell,this.getcellval(this.copiedcell));
				if(e.which == keys.DELETE)
					this.setcellval(this.cursorcell,null);
				if(e.which == keys.Z && e.ctrlKey)
					this.undoval();

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
		rows: [],//dataStorage.fetch(),
		cols : cols,
	},
	watch: {
		rows: {
			handler: function (rows) {
				dataStorage.save(rows)
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