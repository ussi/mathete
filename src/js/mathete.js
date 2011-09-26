/*
 * Mathete JavaScript CAS
 * http://mathete.com/
 *
 * Copyright 2011, Boris Timokhin
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */

(function (window, undefined) {

var $MClass = function () {
	this.VERSION = "0.1";
	this.RECUR_DEEP = 300;
	this.ARRAY_LENGTH = 300;
	this.ARRAY_SHOW_LENGTH = 30;
	this.NUM_ARRAY_LENGTH = 1000;
	this.DEFAULT_FLOAT_MODE = 7;
	this.articles = [];
	this.activeArticle = undefined;
	this.limitFloor = 1e-15;
};

var $M = window.$M = new $MClass();

/**********************************************************************/
/*****		U  T  I  L  S			*******/
/**********************************************************************/

$M.Utils = new Object();

// Margin coefficient calculation
$M.Utils.setMargin = function() {
	var cont = document.createElement("span");
	cont.className = "MathetePar";

	var inn = document.createElement("span");
	inn.className = "BasePow";

	inn.innerHTML = 'a';
	inn.style.fontSize = '0.5em';
	inn.style.marginTop = '0.5em';
	cont.appendChild(inn);
	document.body.appendChild(cont);
	var oH = cont.offsetHeight;
	$M._coeffMargin = (oH < 12) ? 2 : 1;
};

$M.Utils.error = function(message){
	var err = new Error(message);
	err.name = '$M';
	return err;
};

$M.Utils._err2obj = function(er){
	if (er.name != '$M'){
		//console.log(er + ':' + er.line);
	};
	var mess = er.name == '$M' ? er.message : 'Syntax Error';
	return new $M.Error(mess);
};

$M.Utils.equal = function (a, b) {
	if (a == b)
		return true;
	if (typeof a == 'undefined')
		return typeof b == 'undefined';
	if (a.constructor != b.constructor)
		return false;
	// if constructor equal than toString must be equal too
	return ('' + a) == ('' + b);
};

$M.Utils.getElementByClass = function(node, classList) {
	if (document.getElementsByClassName)
		return (node || document).getElementsByClassName(classList);
	node = node || document;
	var list = node.getElementsByTagName('*'),
	length = list.length,
	classArray = classList.split(/\s+/),
	classes = classArray.length,
	result = [], i, j;
	for (i = 0; i < length; i++) {
		for (j = 0; j < classes; j++) {
			if (list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
				result[result.length] = list[i];
				break;
			};
		};
	};
	return result;
};

/***********************************************************************/
/****		E n v i r o m e n t		***/
/***********************************************************************/
$M.Env = new Object();

$M.Env.SetUpNumber = function(){
	if (Number.prototype.getResult)
		return;
	Number.prototype.isNum = true;

	Number.prototype.isInteger = function () {
		return 1 * this.toFixed() === 1 * this;
	};

	Number.prototype.getResult = function (ns) {
		if ($M.activeArticle.getMode('rational')) {
			var coeff = Math.pow(10, (this+'').length - this.toFixed().length);
			if (coeff != 1)
				coeff = coeff / 10;
			var ratio = new $M.Rational(this * coeff, coeff);
			return ratio.getResult(ns);
		};
		var roun = $M.activeArticle.getMode('float') || $M.DEFAULT_FLOAT_MODE;
		var res = this.toFixed(roun) / 1;
		return (Math.abs(res) < $M.limitFloor) ? 0 : res;
	};

	Number.prototype.getHtml = function (alone) {
		if (this >= Number.POSITIVE_INFINITY){
			var dv = $M.Html.block(undefined, "Symbol");
			dv.innerHTML = "&infin;";
			return dv;
		};
		if (this <= Number.NEGATIVE_INFINITY) {
			var dv = $M.Html.block(undefined, "Symbol");
			dv.innerHTML = "-&infin;";
			return dv;
		};
		var roun = $M.activeArticle.getMode('float') || $M.DEFAULT_FLOAT_MODE;
		var res = alone ? this : Math.abs(this);
		var baseMantis = res.toString().split("e");
		var base = baseMantis[0] / 1;
		if (baseMantis.length == 2) {
			var mantis = parseInt(baseMantis[1]);
			return $M.func.get('mul', [base, $M.func.get('pow', [10, mantis])]).getHtml();
		};
		var rounRes = res.toFixed(roun);
		if (rounRes * 1 != res)
			res = rounRes;
		return $M.Html.block('' + res, "Number");
	};
};

$M.Env.SetUpString = function() {
	String.prototype.isSym = true;
	String.prototype.strong = false;

	String.prototype._strip = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};

	String.prototype.getResult = function (ns) {
		var elem = ns.get(this);
		if ((typeof elem !== 'undefined') && !elem.isFuncBody)
			return elem;
		return this + '';
	};

	String.prototype.getHtml = function() {
		var name = this;
		if (this.charAt(0) == '_') {
			name = this.substring(1);
			this.strong = true;
		};
		var symbolSplit = name.split("_", 2),
		symbol = $M.prepareName(symbolSplit[0]);
		var v = $M.Html.block(undefined, this.strong ? "SymbolStrong" :
								"Symbol");
		v.innerHTML = symbol;
		if (symbolSplit.length > 1) {
			var s = $M.Html.block(undefined, "sub");
			s.innerHTML = $M.prepareName(symbolSplit[1]);
			v.appendChild(s);
		};
		return v;
	};
};

$M.Env.SetUpArray = function(){
	if (Array.prototype.getResult)
		return;
	Array.prototype.isArray = true;

	Array.prototype.mfind = function(el) {
		for (var i = 0, l = this.length; i < l; i++) {
			if ($M.Utils.equal(this[i], el))
				return i;
		};
		return -1;
	};

	Array.prototype.mlast = function() {
		return this[this.length - 1];
	};

	Array.prototype.isMatrix = function(){
		if (typeof this._isMatrix === 'undefined'){
			this._isMatrix = false;
			var el;
			for (var i = 0, size = this[0] && this[0].length; i < this.length; i++) {
				el = this[i];
				this._isMatrix = el.isArray && el.length == size;
				if (!this._isMatrix)
					break;
			};
			if (this._isMatrix) {
				this._height = this.length;
				this._width = this[0].length;
			}
		};
		return this._isMatrix;
	};

	//Vector methods
	Array.prototype.mulScal = function(v){
		// scalar multiplication on vector or scalar
		var res = 0;
		if (typeof v == 'number'){
			for (var i = 0, l = this.length; i < l; i++)
				res += this[i] * v;
		} else {
			for (var i=0, l=this.length; i < l; i++)
				res += this[i] * v[i];
		}
		return res;
	};

	Array.prototype.mulVector = function(v) {
		// vector multiplication (only for 3d vectors)
		return [this[1]*v[2] - this[2]*v[1],
				this[2]*v[0] - this[0]*v[2],
				this[0]*v[1] - this[1]*v[0]];
	};

	Array.prototype.mulS = function(s) {
		// multiplication scalar on vector
		var newV = new Array();
		for(var j = 0, l = this.length; j < l; j++)
			newV[j] = this[j] * s;
		return newV;
	};

	Array.prototype.add = function(v) {
		// additional vector
		var newV = new Array();
		for(var j = 0, l = this.length; j < l; j++)
			newV[j] = this[j] + v[j];
		return newV;
	};

	Array.prototype.subs = function(v){
		// substitute vector
		var newV = new Array();
		for(var j = 0, l = this.length; j < l; j++)
			newV[j] = this[j] - v(j);
		return newV;
	};

	//Mathete methods

	Array.prototype.getResult = function (ns) {
		var newArr = [],
		arrLength = this.length < $M.ARRAY_LENGTH ?
					this.length : $M.ARRAY_LENGTH;
		for (var i = 0; i < arrLength; i++)
			newArr[newArr.length] = this[i].getResult(ns);
		return newArr;
	};

	Array.prototype.getMatrixHtml = function(alone) {
		var htmlArr = [], subArr=[], el;
		var table = document.createElement("table"),
			tbody = document.createElement("tbody");
		table.appendChild(tbody);

		var contTable = document.createElement("table"),
			contTbody = document.createElement("tbody"),
		contTr = document.createElement("tr");
		contTable.appendChild(contTbody);
		contTbody.appendChild(contTr);

		table._height = 0;
		var trFake = this.length > $M.ARRAY_SHOW_LENGTH,
		fakeRow = false, row;

		for (var i = 0, l = this.length; i < l; i++) {
			row = this[i];
			var tr = document.createElement("tr"),
				tdFake = row.length > $M.ARRAY_SHOW_LENGTH;
			if (trFake){
				if (fakeRow){
					i = l - 2;
					trFake = false;
					fakeRow = false;
					continue;
				};
				fakeRow = i == ($M.ARRAY_SHOW_LENGTH - 1);
			};
			for (var j = 0, k = row.length; j < k; j++) {
				if (fakeRow) {
					var td = document.createElement("td");
					td.innerHTML = '...';
					tr.appendChild(td);
					if (j == $M.ARRAY_SHOW_LENGTH)
						break;
					continue;
				};
				if (tdFake){
					if (j == ($M.ARRAY_SHOW_LENGTH - 1)) {
						var td = document.createElement("td");
						td.innerHTML = '...';
						tr.appendChild(td);
						continue;
					} else {
						if (j > ($M.ARRAY_SHOW_LENGTH - 1)) {
							j = k - 2;
							tdFake = false;
							continue;
						};
					};
				};
				el = row[j].getHtml(true);
				subArr[subArr.length] = el;
				var td = document.createElement("td");
				td.appendChild(el);
				tr.appendChild(td);
			};
			var marg = $M.Html.margin(subArr);
			subArr = marg[0];
			table._height += marg[2] + 0.35;
			tbody.appendChild(tr);
		};
		table._height = table._height < 14? table._height : 14;
		table._margin = table._height / 2;
		var brLe = document.createElement("td");
		brLe.className = "maBrLe";
		var brRi = document.createElement("td");
		brRi.className = "maBrRi";
		contTr.appendChild(brLe);
		var mainTd = document.createElement("td");
		mainTd.appendChild($M.Html.block(table, 'MatrixBase'));
		contTr.appendChild(mainTd);
		contTr.appendChild(brRi);
		contTable._height = table._height;
		contTable._margin = table._margin;
		return $M.Html.block(contTable, "Matrix");
	};

	Array.prototype.getHtml = function () {
		if (this.isMatrix())
			return this.getMatrixHtml();
		var htmlArr = [], subArr = [];
		htmlArr[0] = $M.Html.brOpen("[");
		var table = document.createElement("table"),
		tbody = document.createElement("tbody"),
		tr = document.createElement("tr");
		table.appendChild(tbody);
		tbody.appendChild(tr);

		var contTable = document.createElement("table"),
		contTbody = document.createElement("tbody"),
		contTr = document.createElement("tr");
		contTable.appendChild(contTbody);
		contTbody.appendChild(contTr);

		for (var i = 0, l = this.length; i < l; i++) {
			subArr[subArr.length] = this[i].getHtml(true);
			if (i < l - 1)
				subArr[subArr.length] = $M.Html.oper(",");
		};
		if (subArr.length < 1) {
			subArr[0] = $M.Html.block(undefined, 'Symbol');
			subArr[0].innerHTML = '&nbsp;';
		}
		var marg = $M.Html.margin(subArr);
		subArr = marg[0];
		table._margin = marg[1];
		table._height = marg[2];
		for (i = 0, l = subArr.length; i < l; i++) {
			var td = document.createElement("td");
			td.appendChild(subArr[i]);
			tr.appendChild(td);
		};

		var brLe = document.createElement("td");
		brLe.className = "maBrLe";
		var brRi = document.createElement("td");
		brRi.className = "maBrRi";
		contTr.appendChild(brLe);
		var mainTd = document.createElement("td");
		mainTd.appendChild($M.Html.block(table, 'ArrayBase'));
		contTr.appendChild(mainTd);
		contTr.appendChild(brRi);
		contTable._height = table._height;
		contTable._margin = table._margin;
		return $M.Html.block(contTable, "Matrix");
	};

	Array.prototype.toString = function () {
		var res = "[" + this.join(", ") + "]";
		return res;
	};
};


$M.Env.setUp = function(){
	this.SetUpNumber();
	this.SetUpString();
	this.SetUpArray();
};

$M.Env.tearDown = function(){
	return;

	// TODO: More correct
	for (el in Number.prototype)
		delete Number.prototype[el];
	for (el in String.prototype)
		delete String.prototype[el];
	delete Array.prototype.mfind;
};

/***********************************************************************/
/********	P A R S E R		*****************/
/***********************************************************************/

$M.Parser = new Object();

$M.Parser.operators = new Object();//new function(){};

$M.Parser.operators.add = function(options){
	var existOp = this[options.symbol];
	if (typeof existOp !== 'undefined') {
		for (prop in options)
			existOp[prop] = options[prop];
		return existOp;
	};
	var constr = function(){this.isOperator = true;};
	constr.prototype.toString = function(){return this.symbol};
	constr.prototype.symbol = options['symbol'];
	constr.prototype.inf = options['infix'];
	constr.prototype.pre = options['prefix'];
	constr.prototype.pos = options['postfix'];
	constr.prototype.weight = options['weight'] || 0;
	constr.prototype.preWeight = options['preWeight'] || 0;
	constr.prototype.posWeight = options['posWeight'] || 0;
	constr.prototype.association = options['association'] || 'left';
	constr.prototype.isBOpen = options['bOpen'] || false;
	constr.prototype.isBClose = options['bClose'] || false;
	constr.prototype.pair = options['pair'] || null;
	constr.prototype.action = function(args){return this[this.method || 'inf'](args)};
	var meths = ['pos', 'inf', 'pre'];
	for (var j = 0; j < meths.length; j++) {
		if (constr.prototype[meths[j]]) {
			constr.prototype.method = meths[j];
			break;
		};
	};
	this[options.symbol] = constr;
};

$M.Parser.Args = function(args){
	this.args = args;
	this.isArgs = true;
};

$M.Parser.groupArgs = function(args, type){
	var ars = [], el;
	for (var i = 0, l = args.length; i < l; i++) {
		el = args[i];
		if (el[type])
			ars = ars.concat(el.args);
		else
			ars[ars.length] = el;
	};
	return ars;
};

$M.Parser.infixArgs = function(args, func, aggr){
	var newArgs = args.slice(args.length - 2);
	if (typeof aggr !== 'undefined')
		newArgs = $M.Parser.groupArgs(newArgs, aggr);
	args.splice(args.length-2, 2, $M.func.get(func, newArgs));
	return args;
};

$M.Parser.operators.add({symbol:'+', weight:40,
	prefix: function(a){ return a },
	infix: function(a){ return $M.Parser.infixArgs(a, 'add', 'isAdd') }
});

$M.Parser.operators.add({symbol:'-', weight:40, preWeight:25,
	prefix: function(a){
		var arg = a.mlast();
		a[a.length-1] = arg.isNum? -arg: $M.func.get('neg', [arg]);
		return a;
	},
	infix: function(a){
		return $M.Parser.infixArgs(this.pre(a), 'add', 'isAdd');
	}
});

$M.Parser.operators.add({symbol:'*', weight:30,
	infix: function(a){ return $M.Parser.infixArgs(a, 'mul', 'isMul') }
});

$M.Parser.operators.add({symbol:'/', weight:30,
	infix: function(a){return $M.Parser.infixArgs(a, 'div')}
});

$M.Parser.operators.add({symbol:'^', weight:20, 'association':'right',
	infix: function(a){return $M.Parser.infixArgs(a, 'pow')}
});

$M.Parser.operators.add({symbol:'\\', weight:10, 'association':'right',
	infix: function(a){return $M.Parser.infixArgs(a, 'root')},
	prefix: function(a){
		a[a.length - 1] = $M.func.get('root', [2, a[a.length - 1]]);
		return a;
	}
});

$M.Parser.operators.add({symbol:'!', weight:10,
	postfix: function(a){
		a[a.length - 1] = $M.func.get('factorial', [a[a.length - 1]]);
		return a;
	}
});

$M.Parser.operators.add({symbol:'=', weight:200,
	infix: function(a){ return $M.Parser.infixArgs(a, 'ass', 'isAss') }
});

$M.Parser.operators.add({symbol:'==', weight:80,
	infix: function(a){ return $M.Parser.infixArgs(a, 'eq') }
});

$M.Parser.operators.add({symbol:'/=', weight:80,
	infix: function(a){ return $M.Parser.infixArgs(a, 'ne') }
});

$M.Parser.operators.add({symbol:'>', weight:80,
	infix: function(a){ return $M.Parser.infixArgs(a, 'gt') }
});

$M.Parser.operators.add({symbol:'<', weight:80,
	infix: function(a){ return $M.Parser.infixArgs(a, 'lt') }
});

$M.Parser.operators.add({symbol:'>=', weight:80,
	infix: function(a){ return $M.Parser.infixArgs(a, 'ge') }
});

$M.Parser.operators.add({symbol:'<=', weight:80,
	infix: function(a){ return $M.Parser.infixArgs(a, 'le') }
});

$M.Parser.operators.add({symbol:'(', weight:300,
						bOpen:true, pair:')', prefix:true});

$M.Parser.operators.add({symbol:')', weight:310,
				bClose:true, pair:'(', postfix:true});

$M.Parser.operators.add({symbol:'[', weight:300,
				bOpen:true, pair:']', prefix:true});

$M.Parser.operators.add({symbol:']', weight:310,
				bClose:true, pair:'[', postfix:true});

$M.Parser.operators.add({symbol:'{', weight:300,
				bOpen:true, pair:'}', prefix:true});

$M.Parser.operators.add({symbol:'}', weight:310,
				bClose:true, pair:'{', postfix:true});

$M.Parser.operators.add({symbol:'(|', weight:300,
				bOpen:true, pair:'|)', prefix:true});

$M.Parser.operators.add({symbol:'|)', weight:310,
				bClose:true, pair:'(|', postfix:true});

// function call
$M.Parser.operators.add({symbol:'f', weight:5,
	infix: function(a){
		var fnc = a[a.length - 2],
		args = a[a.length - 1];
		args = args.isArgs ? args.args : [args];
		a.splice(a.length-2, 2, $M.func.get(fnc, args));
		return a;
}});


// vector
$M.Parser.operators.add({symbol:'v', weight:5,
	prefix: function(a){
		var vector = a[a.length - 1];
		a[a.length - 1] = vector.isArgs ? vector.args : [vector];
		return a;
	},
	infix:function(a){ return $M.Parser.infixArgs(a, 'get') }
});

// options (dictionary)
$M.Parser.operators.add({symbol:'d', weight:5,
	prefix: function(a){
		var vector = a[a.length-1],
		dict = new Object();
		if (vector.isArgs) {
			var args = vector.args;
			for (var i = 0, l = args.length; i < l; i++)
				dict[args[i][0]] = args[i][1];
		} else
			dict[vector[0]] = vector[1];
		a[a.length - 1] = dict;
		return a;
	}
});

$M.Parser.operators.add({symbol:':', weight:140,
	infix: function(a){
		var key = a[a.length - 2],
		value = a[a.length - 1];
		a.splice(a.length - 2, 2, [key, value]);
		return a
	}
});

$M.Parser.operators.add({symbol:'..', weight:120,
	infix: function(a) {
		var fst = a[a.length - 2],
		lst = a[a.length - 1];
		a.splice(a.length - 2, 2, $M.func.get('range', [fst, null, lst]));
		return a;
	}
});


$M.Parser.operators.add({symbol:',', weight:210,
	infix: function(a) {
		var newArgs = a.slice(a.length-2);
		if (newArgs[1].isRange && newArgs[1].args[1] === null) {
			newArgs[1].args[1] = newArgs[1].args[0];
			newArgs[1].args[0] = newArgs[0];
			newArgs = newArgs[1];
		} else {
			newArgs = $M.Parser.groupArgs(newArgs, 'isArgs');
			newArgs = new $M.Parser.Args(newArgs);
		};
		a.splice(a.length-2, 2, newArgs);
		return a;
	}
});

$M.Parser.operators.add({symbol:';', weight:'1000'});

$M.Parser.Parser = function(){
	var indexes = new Array();
	var _name;
	for (op in $M.Parser.operators)
		indexes[indexes.length] = op;
	this.index = ' ' + indexes.join(' ');
	this.stack = new Array();
	this.pars = new Array();
};

$M.Parser.Parser.prototype.inIndex = function(v){
	return this.index.indexOf(v) > -1;
};

$M.Parser.Parser.prototype.aggr = function(stack){
	// agregation stack of tokens
	var el, num, preEl, lOp, meths, err,
		stackArgs = new Array(),
		stackOpers = new Array(),
		stackBrs = new Array();
	stack.push(new $M.Parser.operators[')']());
	stack.unshift(new $M.Parser.operators['(']());

	for (var i = 0, l = stack.length; i < l; i++, preEl = el) {
		el = stack[i];
		if (!el.isOperator) {
			if (preEl && (!preEl.isOperator || preEl.method == 'pos'))
				throw $M.Utils.error('Syntax Error `' + preEl + ' ' + el + '`');
			num = Number(el);
			if (isNaN(num)) {
				if (el == 'true' || el == 'false')
					el = $M.func.get(el);
				stackArgs.push(el);
			} else
				stackArgs.push(num);
			continue;
		};
		if (preEl && preEl.isOperator) {
			meths = {pos: ['pos', 'inf'], inf: ['pre'], pre: ['pre', 'inf']};
			var aMeths = meths[preEl.method];
			el.method = el[aMeths[0]]? aMeths[0]: aMeths[1];
			if (!el.method)
				throw $M.Utils.error('Syntax Error`' + preEl + ' ' + el + '`');
			if (el.method == 'pre')
				el.weight = el.preWeight;
		};
		if (el.isBOpen){
			if (el.symbol.charAt(0) == '(' && preEl && !preEl.isOperator) //TODO:need better way!
				stackOpers.push(new $M.Parser.operators['f']());
			stackBrs.push(el);
			stackOpers.push(el);
			continue;
		};
		lOp = stackOpers.mlast();
		while (lOp && el.weight >= lOp.weight){
			if (lOp.association == 'right' && el.weight == lOp.weight)
				break;
			if (lOp.isBOpen){
				if (el.isBClose)
					lOp = stackOpers.pop();
				break;
			};
			lOp = stackOpers.pop();
			stackArgs = lOp.action(stackArgs);
			lOp = stackOpers.mlast();
		};
		if (el.isBClose){
			var lastBr = stackBrs.pop();
			if (!lastBr || lastBr.pair != el.symbol)
				throw $M.Utils.error('Syntax error ' + el.symbol);
		} else
			stackOpers.push(el);
	};
	return stackArgs[0];
};

$M.Parser.Parser.prototype.preSplit = function(str){
	var stack = new Array(), preIsOper = true, // begining with operator
	token = '';
	str += ' '; // for closing last token
	var chr, nxtChr, isOper;
	for (var i = 0, l = str.length; i < l; ++i) {
		chr = str.charAt(i);
		isOper = '~%@`|#*!:?^+-.,/\\<>=(){}[]'.indexOf(chr) > 0;
		if (token) {
			if (preIsOper) {
				if (chr != ' ' && this.inIndex(token + chr)){
					token += chr;
					continue;
				};
				if (token === '.'){
					token = (stack.pop() || '') + token + chr;
					preIsOper = false;
					continue;
				};
				if (typeof $M.Parser.operators[token] == 'undefined')
					throw $M.Utils.error('Unknown operator :' + token);

				if (token == '[')
					stack.push(new $M.Parser.operators['v']());
				if (token == '{')
					stack.push(new $M.Parser.operators['d']());
				if (token == '(|')
					stack.push('abs');
				if (stack.length > 1 && (stack.mlast() + token == '()'))
					stack.push( new $M.Parser.Args([]) );
				var oper = new $M.Parser.operators[token]();
				stack.push(oper);
				token = '';
			} else {
				if (isOper || chr == ' '){
					stack.push(token);
					token = '';
				};
			};
		};
		preIsOper = isOper;
		token += (chr == ' ') ? '' : chr;
	};
	return stack;
};

$M.Parser.Parser.prototype.preParse = function(str){
	return this.aggr(this.preSplit(str));
};

$M.parse = function(str) {
	// string to Mathete object
	var parser = new $M.Parser.Parser(), el, mess;
	try {
		el = parser.preParse(str);
	} catch (er) {
		el = $M.Utils._err2obj(er);
	}
	return el;
};

$M.parsePar = function(str) {
	// string
	var list = str.split(';'),
	subpars = new Array(), subpar;
	for (var i = 0, l = list.length; i < l; i++) {
		subpar = list[i]._strip();
		if (!subpar)
			continue;
		subpars.push( $M.parse(subpar) );
	};
	return new $M.Paragraph(subpars);
};

$M.parseMulti = function(str){
	// multiline string to Paragraphs array
	var lines = str.split(/\r\n|\r|\n/),
	list = [], line;
	for (var i = 0, l = lines.length; i < l; i++){
		line = lines[i]._strip();
		if (line)
			list.push($M.parsePar(line));
	};
	return list;
};

/***********************************************************************/
/*****		H T M L		 ************/
/***********************************************************************/

$M.Html = new Object();

/*
$M.Html.waiterShow = function () {
	var w = document.getElementById('waiter');
	w ? w.style.display = 'block':null;
};

$M.Html.waiterHide = function () {
	var w = document.getElementById('waiter');
	w ? w.style.display = 'block':null;
};
*/
$M.Html.setMargin = function(el, attr, val, coeff) {
	if ($M._coeffMargin > 1)
		val *= coeff || $M._coeffMargin;
	el.style[attr] = val + 'em';
};

$M.Html.block = function (el, cl, tag) {
	tag = tag || "span";
	var dv = document.createElement(tag), _margin = 0, _height = 1;
	dv.className = cl;

	if (el instanceof Array) {
		var htmlFr = document.createDocumentFragment();
		var els_marg = $M.Html.margin(el);
		el = els_marg[0];
		_margin = els_marg[1];
		_height = els_marg[2];
		for (var i = 0, l = el.length; i < l; i++)
			htmlFr.appendChild(el[i]);
		el = htmlFr;
	} else {
		if (typeof el == "string")
			el = document.createTextNode(el);
		else {
			if (el) {
				_margin = el._margin;
				_height = el._height;
			}
		}
	}
	if (el)
		dv.appendChild(el);
	dv._margin = _margin;
	dv._height = _height;
	return dv;
};

$M.Html.oper = function (_op, cls) {
	cls = cls || "Oper";
	var dv = document.createElement("span");
	dv.className = cls;
	dv.innerHTML = _op;
	return dv;
};

$M.Html._bracket = function(symb){
	var dv = document.createElement("span");
	dv.className = "Brack";
	dv.innerHTML = symb;
	dv._max_height = true;
	return dv;
};

$M.Html.brOpen = function (symb) {
	return $M.Html._bracket(symb || '(');
};

$M.Html.brClose = function (symb) {
	return $M.Html._bracket(symb || ')');
};

$M.Html.margin = function (elements) {
	var maxMargin = 0, maxHeight = 0, el;
	for (var i = 0, l = elements.length; i < l; i++) {
		el = elements[i];
		if (el._margin && el._margin > maxMargin)
			maxMargin = el._margin;
		if (el._height && el._height > maxHeight)
			maxHeight = el._height;
	};
	if (maxMargin) {
		var marg;
		for (i = 0; i < l; i++) {
			el = elements[i];
			if (!el._margin || el._margin < maxMargin) {
				marg = el._margin ? (maxMargin - el._margin) : maxMargin;
				if (el._max_height) {
					el.style.fontSize = maxMargin + 1 + "em";
					marg = marg / (maxMargin + 5);
					$M.Html.setMargin(elements[i], 'marginTop', marg, maxMargin + 1);
				} else
					$M.Html.setMargin(elements[i], 'marginTop', marg, 1);
			};
		};
	};
	return [elements, maxMargin, maxHeight];
};

/***********************************************************************/
/*
/***********************************************************************/
 

$M.NameSpace = function (nss) {
	this.nss = nss || [];

	this.reset = function () {
		this.nss = [{pi:Math.PI, e:Math.E}];
	};
	if (this.nss.length == 0)
		this.reset();

	this.addNS = function (ns) {
		this.nss[this.nss.length] = ns;
	};

	this.add = function (name, el) {
		this.nss[this.nss.length - 1][name] = el;
	};

	this.get = function (name) {
		for (var i = this.nss.length - 1; i >= 0; i--) {
			if (typeof this.nss[i][name] !== "undefined")
				return this.nss[i][name];
		}
		return undefined;
	};

	this.delNS = function () {
		this.nss.pop();
	};
};


/***********************************************************************/
/***********************************************************************/

$M.Rational = function(nom, denom){
	this.isRational = true;
	this.isNum = true;
	this.nom = nom;
	this.denom = denom;
};

$M.Rational.prototype.valueOf = function(){
	return this.nom / this.denom;
};

$M.Rational.prototype.getHtml = function(alone){
	if (this.denom == 1)
		return this.nom.getHtml(alone);

	if (Math.abs(this.nom) > Math.abs(this.denom)) {
		var main = parseInt(this.nom / this.denom),
			nom = Math.abs(this.nom % this.denom),
			args = [main.getHtml(alone), $M.func.get("div", [nom, this.denom]).getHtml()]
		return $M.Html.block(args, 'Number');
	};
	var nom = alone ? this.nom : Math.abs(this.nom);
	return $M.func.get("div", [nom, this.denom]).getHtml(alone);
};

$M.Rational.prototype.getResult = function(ns){
	if (!$M.activeArticle.getMode('rational'))
		return (this.nom / this.denom).getResult(ns);

	this._normal();
	return this;
};

$M.Rational.prototype.gcd = function(nums){
	// copy-past from http://www.geekpedia.com/code73_Get-the-greatest-common-divisor.html
	if (!nums.length)
		return 0;
	for (var r, a, i = nums.length - 1, GCDNum = nums[i]; i;)
		for (a = nums[--i]; r = a % GCDNum; a = GCDNum, GCDNum = r);
	return GCDNum;
};

$M.Rational.prototype._normal = function(){
	var gcd = Math.abs(this.gcd([this.nom, this.denom]));
	this.nom /= gcd;
	this.denom /= gcd;
	if (this.denom < 0) {
		this.denom = -this.denom;
		this.nom = -this.nom;
	};
};

$M.calcArticle = function (_id) {
	var a = $M.articles[_id];
	if (a)
		a.calc(true);
	return false;
};

/***********************************************************************/
/********	A R T I C L E  &  P A R A G R A P H		************/
/***********************************************************************/

$M.Article = function (mid, paragraphs) {
	this.init(mid, paragraphs);
};

$M.Article.prototype.init = function(mid, paragraphs) {
	$M.Env.setUp();
	this.modes = {'float': 7, rational: false, calc: true,
				hideIn: false, hide: false, hideOut: false};

	this.id = $M.articles.length;
	var element;

	if (mid) {
		if (typeof mid === 'string')
			element = document.getElementById(mid);
		else
			element = mid.nodeType ? mid : null;
	};
	this.element = element;
	// paragraphs
	this.paragraphs = new Array();
	var _pars = paragraphs || new Array();

	for (var i = 0, l = _pars.length; i < l; i++)
		this.addParagraph(_pars[i]);

	//$M.Utils.setMargin();
	this.ns = new $M.NameSpace();
	this.inputCount = 0;
	this.inputSpace = {};
	$M.articles.push(this);
	$M.Env.tearDown();
};

$M.Article.prototype.addParagraph = function(par) {
	var ids = [];

	if (par.isPar)
		return this.paragraphs.push(el) - 1;

	if ((typeof par == 'object') && par.length && par.length > 0) {
		for (var i = 0, l = par.length; i < l; i++)
			ids.push(this.addParagraph(par[i]));
		return ids;
	};
	var _str = (typeof par === 'string') ? par :
				(par.nodeType ? par.innerHTML : undefined);
	if (!_str)
		return;
	var pars = $M.parseMulti(_str), pr;
	for (var j = 0, k = pars.length; j < k; j++) {
		pr = pars[j];
		if (j == 0 && par.nodeType)
			pr.DOMEl = par;
		ids.push(this.paragraphs.push(pr));
	};
	return ids;
};

$M.Article.prototype.getMode = function(key){
	return this.modes[key];
};

$M.Article.prototype.setMode = function(key, value) {
	this.modes[key] = typeof value === 'undefined'? true: value;
	if (key == 'float') // rational mode off
		this.modes['rational'] = false;
};

$M.Article.prototype.fillParagraph = function(id, lastEl) {
	if ((typeof id == 'object') && par.length && par.length > 0) {
		for (var i = 0, l = id.length; i < l; i++)
			ids.push(this.fillParagraph(id[i]));
	};
	var par = this.paragraphs[id];
	if (!par)
		return;
	// TODO: check current display mode (may be paragraph is hidden)
	_html = par.getHtml();
	if (!_html)
		return;
	if (!par.DOMEl) {
		dv = document.createElement('div');
		if (lastEl){
			// insert after last element
			lastEl.parentNode.insertBefore(dv, lastEl.nextSibling);
		} else {
			// just append to article
			this.element.appendChild(dv);
		};
		par.DOMEl = dv;
	};
	par.DOMEl.innerHTML = '';
	par.DOMEl.appendChild(_html);
	lastEl = par.DOMEl;
};

$M.Article.prototype.fill = $M.Article.prototype.getHtml = function () {
	$M.Env.setUp();
	this.inputCount = 0;
	$M.activeArticle = this;
	var el, lastEl, dv, _html;

	for (var i = 0, l = this.paragraphs.length; i < l; i++)
		lastEl = this.fillParagraph(i, lastEl)

	if (this.hasInputs) {
		var but = document.createElement('button');
		but.className = 'MatheteButton';
		but.innerHTML = 'Recalculate';
		but.onclick = function(i){
			return function() {
					$M.calcArticle( i );
					return false;
				};
			}($M.articles.length - 1);
		this.element.appendChild(but);
	};

	$M.activeArticle = undefined;
	$M.Env.tearDown();
};

$M.Article.prototype._calc = function () {
	$M.Env.setUp();
	$M.activeArticle = this;
	// reset namespace
	this.ns.reset();
	var el, str, res, newOut;
	for (var i = 0, l = this.paragraphs.length; i < l; ++i) {
		el = this.paragraphs[i];
		if (!el)
			continue;
		res = el.getResult(this.ns);
		if (!el.isPlotPar && el.DOMEl) {
			// find previous
			var out = $M.Utils.getElementByClass(el.DOMEl, 'MatheteOut');
			if (out && out.length)
				el.DOMEl.removeChild(out[0]);
			newOut = res.getHtml(true);
			newOut.className = "MathetePar MatheteOut";
			el.DOMEl.appendChild(newOut);
		};
	};
	$M.Env.tearDown();
	$M.activeArticle = undefined;
	window.document.body.style.cursor = '';
	return;
};

$M.Article.prototype.calc = function(async) {
	window.document.body.style.cursor = 'wait';
	if (async){
		window.setTimeout(
				(function(self) {
					return function() {self._calc()}}
				)(this), 0);
	} else {
		this._calc();
	}
};


$M.Error = function(message) {
	this.message = message;
	this.isError = true;

	this.getHtml = function(){
		return $M.Html.block(this.message, "MathError");
	};

	this.getResult = function(){
		return this;
	};
};

$M.Paragraph = function (subpars) {
	this.isPar = true;
	this.subpars = subpars || [];

	this.DOMEl = null;
	for (var i = 0, l = this.subpars.length; i < l; i++) {
		if (this.subpars[i].isPlot) {
			this.isPlotPar = true;
			this.plot = subpars[i];
		};
	};
};

$M.Paragraph.prototype.getHtml = function (result) {
	var elements = [], delm, el;
	if (this.isPlotPar) {
		if ($M.activeArticle.getMode('hide'))
			return
		return $M.Html.block(this.plot.getHtml(), "MathetePar", "div");
	};
	for (var i = 0, l = this.subpars.length; i < l; i++) {
		if (this.subpars[i].isMode) {
			el = this.subpars[i];
			if (el.nameMode == 'hide' || (el.nameMode == 'hideIn' && !result) || el.nameMode == 'hideOut' && result) {
				el.getResult($M.activeArticle.ns);
			};
			continue;
		};
		if ($M.activeArticle.getMode('hide') || $M.activeArticle.getMode('hideIn') && !result || $M.activeArticle.getMode('hideOut') && result)
			continue;
		try {
			el = this.subpars[i].getHtml(true);
		} catch (er) {
			el = $M.Utils._err2obj(er).getHtml(true);
		};
		elements[elements.length] = el;
		if (i < l - 1) {
			delm = $M.Html.block(document.createTextNode(";"), "Delmiter");
			elements[elements.length] = delm;
		};
	};
	var res = $M.Html.block(elements, "MathetePar", "div");
	return res;
};

$M.Paragraph.prototype.getResult = function (ns) {
	if (this.isPlotPar) {
		this.plot.getResult(ns);
		return this;
	}
	var res, el;
	var subpars = [];
	for (var i = 0, l = this.subpars.length; i < l; i++) {
		if (this.subpars[i].isMode && this.subpars[i].nameMode == 'hideIn')
			continue;
		try {
			el = this.subpars[i].getResult(ns);
		} catch (er) {
			el = $M.Utils._err2obj(er);
		};
		subpars[subpars.length] = el;
	};
	res = new $M.Paragraph(subpars);
	return res;
};

$M.prepareName = function (n) {
	if (n == "oo")
		return "&infin;";
	var SN = {alpha:1, beta:1, gamma:1, delta:1, epsilon:1, zeta:1,
		 eta:1, theta:1, iota:1, kappa:1, lambda:1, mu:1, nu:1,
		 xi:1, omicron:1, pi:1, rho:1, sigma:1, tau:1, upsilon:1,
		 phi:1, chi:1, psi:1, omega:1,
		 Alpha:1, Beta:1, Gamma:1, Delta:1, Epsilon:1, Zeta:1,
		 Eta:1, Theta:1, Iota:1, Kappa:1, Lambda:1, Mu:1, Nu:1,
		 Xi:1, Omicron:1, Pi:1, Rho:1, Sigma:1, Tau:1, Upsilon:1,
		 Phi:1, Chi:1, Psi:1, Omega:1};
	if (SN[n])
		return "&" + n + ";";
	return n;
};


$M.BaseFunc = function () {};

$M.BaseFunc.prototype.init = function(args){
	if (!(args instanceof Array))
		args = Array.prototype.slice.call(arguments);
	this.args = args;
	this.isFunc = true;
	this.funcInMem = null;
	return this;
};

$M.BaseFunc.prototype.oneResult = function (args, ns) {};

$M.BaseFunc.prototype.preGetResult = function (ns) {
	return ns;
};

$M.BaseFunc.prototype.postGetResult = function (ns) {
	return ns;
};

$M.BaseFunc.prototype.getResult = function (ns) {
	ns = this.preGetResult(ns);
	if (ns.isError)
		return ns;
	var arrLength = 0,
	newArgs = [], _arg;
	for (var i = 0, l = this.args.length; i < l; i++) {
		if (typeof this.args[i] == 'undefined')
			continue;
		_arg = this.args[i].getResult(ns);
		if (!this.aggregate && _arg.isArray) {
			if (_arg.length < arrLength || arrLength == 0)
			arrLength = _arg.length;
		};
		newArgs[newArgs.length] = _arg;
	};
	var res, _res;
	if (arrLength) {
		var cicleRes = [];
		for (var j = 0; j < arrLength; j++) {
			var cicleArgs = [];
			for (i = 0, l = newArgs.length; i < l; i++) {
				_arg = newArgs[i];
				cicleArgs[cicleArgs.length] = _arg.isArray ? _arg[j]: _arg;
			};
			_res = this.oneResult(cicleArgs, ns);
			cicleRes[cicleRes.length] = _res;
		};
		res = cicleRes;
	} else
		res = newArgs.length ? this.oneResult(newArgs, ns): this;
	ns = this.postGetResult(ns);
	return res;
};

$M.BaseFunc.prototype.getHtml = function (alone) {
	var dv = [$M.Html.block(this.name.getHtml(), "FuncName"), $M.Html.brOpen()];
	for (var i = 0, l = this.args.length; i < l; i++) {
		dv[dv.length] = this.args[i].getHtml(true);
		if (i < l - 1)
			dv[dv.length] = $M.Html.oper(",");
	};
	dv[dv.length] = $M.Html.brClose();
	return $M.Html.block(dv, "Func");
};

$M.BaseFunc.prototype.toString = function () {
	var res = this.name + "(" + this.args.join(", ") + ")";
	return res;
};


$M.func = new Object();

$M.func.container = new Object();

$M.func.FuncInNS = function (args, body) {
	this.args = args;
	this.body = body;
	this.isFuncBody = true;
};

$M.func._makeConstr = function(name, options){
	// create constructor for functions
	options = options || {};
	var constr = function(){};
	constr.prototype = new $M.BaseFunc();
	constr.prototype.constructor = constr;
	constr.prototype.name = name;
	for (el in options)
		constr.prototype[el] = options[el];
	return constr;
};

$M.func.get = function(name, args){
	var constr = this.container[name];
	if (typeof constr === 'undefined'){
		constr = this.container['_user_fnc'];
		var fnc = (new constr()).init(args);
		fnc.name = name;
		return fnc;
	}
	return (new constr()).init(args);
};


$M.func.add = function(name, options){
	this.container[name] = $M.func._makeConstr(name, options);
};

/* Modes */

(function() {
	var modeNames = ['float', 'rational', 'calc', 'hideIn', 'hide',  'hideOut'],
		nameMode;
	for (var i = 0, l = modeNames.length; i < l; i++) {
		nameMode = modeNames[i];
		$M.func.add('$' + nameMode, {
			isMode: true,
			nameMode: nameMode,
			getResult: function (ns) {
				value = this.args[0];
				value = typeof value == 'undefined' ? true : value.getResult(ns);
				$M.activeArticle.setMode(this.nameMode, value);
				return this;
			}
		});
	};
})();


/****************************************************************************/
/************************* I N P U T  ***************************************/
/****************************************************************************/
$M.func.add('input', {
	isInput: true,

	getHtml: function (alone) {
		$M.activeArticle.hasInputs = true;
		this.id = "_mathi" + $M.activeArticle.id + '-' + $M.activeArticle.inputCount;
		$M.activeArticle.inputCount++;
		var val = this.args[0];
		//val = Number(val);
		var _height = 1.4, _margin = 0.27;
		if (this.args.length == 1) {
			var dv = document.createElement("input");
			dv.setAttribute("type", "text");
			dv.setAttribute("id", this.id);
			dv.setAttribute("name", this.id);
			dv.style.width = (('' + val).length / 2 + 1 + "em");
			dv.setAttribute("value", val);
		} else {
			var dv = document.createElement("select");
			dv.setAttribute("id", this.id);
			dv.setAttribute("name", this.id);
			for (var i = 0, l = this.args.length; i < l; i++) {
				var v = this.args[i];
				var op = document.createElement("option");
				if ($M.Utils.equal(v, val)) {
					op.setAttribute("selected", "");
				};
				op.setAttribute("value", v);
				op.innerHTML = v;
				dv.appendChild(op);
			}
			_height = 1.7;
			_margin = 0.34;
		}
		var inp = $M.Html.block(dv, "Input");
		inp._height = _height;
		inp._margin = _margin;
		return inp;
	},
	getResult: function (ns) {
		var val = document.getElementById(this.id).value;
		return $M.parse(val._strip()).getResult(ns);
	}
});

/**************************************************************************/
/************************* L O G I C  *************************************/
/**************************************************************************/
$M.func.add('true', {
	isTrue: true,
	isBool: true,
	isNum: true,
	getResult: function (ns) {
		return this;
	},
	getHtml: function (alone) {
		return $M.Html.block('true', 'Bool');
	},
	toString: function () {
		return 'true';
	},
	valueOf: function(){
		return 1;
	}
});

$M.func.add('false', {
	isFalse: true,
	isBool: true,
	isNum: true,
	getResult: function (ns) {
		return this;
	},
	getHtml: function (alone) {
		return $M.Html.block('false', 'Bool');
	},
	toString: function () {
		return 'false';
	},
	valueOf: function(){
		return 0;
	}
});

$M.func.add('eq', {
	isRel: true,
	getResult: function (ns) {
		var a = this.args[0].getResult(ns);
		var b = this.args[1].getResult(ns);
		return $M.func.get($M.Utils.equal(a, b)?'true':'false', []);
	},
	getHtml: function (alone) {
		return $M.Html.block([this.args[0].getHtml(),
			$M.Html.oper('=', 'OperEquiv'), this.args[1].getHtml()], 'Relation');
	},
	toString: function () {
		return this.a + '==' + this.b;
	}
});

$M.func.add('ne', {
	isRel: true,
	getResult: function (ns) {
		var a = this.args[0].getResult(ns);
		var b = this.args[1].getResult(ns);
		return $M.func.get($M.Utils.equal(a, b)?'false':'true', []);
	},
	getHtml: function (alone) {
		return $M.Html.block([this.args[0].getHtml(), $M.Html.oper('&ne;',
			'OperEquiv'), this.args[1].getHtml()], 'Relation');
	},
	toString: function () {
		return this.args[0] + '/=' + this.args[1];
	}
});

$M.func.add('gt', {
	isRel: true,
	getResult: function (ns) {
		var a = this.args[0].getResult(ns);
		var b = this.args[1].getResult(ns);
		return $M.func.get((a.isNum && b.isNum && a > b)?'true':'false', []);
	},
	getHtml: function (alone) {
		return $M.Html.block([this.args[0].getHtml(), $M.Html.oper('&gt;',
			'OperEquiv'), this.args[1].getHtml()], 'Relation');
	},
	toString: function () {
		return this.args[0] + '>' + this.args[1];
	}
});

$M.func.add('lt', {
	isRel: true,
	getResult: function (ns) {
		var a = this.args[0].getResult(ns);
		var b = this.args[1].getResult(ns);
		return $M.func.get((a.isNum && b.isNum && a < b)?'true':'false', []);
	},
	getHtml: function (alone) {
		return $M.Html.block([this.args[0].getHtml(), $M.Html.oper('&lt;',
			'OperEquiv'), this.args[1].getHtml()], 'Relation');
	},
	toString: function () {
		return this.args[0] + '<' + this.args[1];
	}
});

$M.func.add('ge', {
	isRel: true,
	getResult: function (ns) {
		var a = this.args[0].getResult(ns);
		var b = this.args[1].getResult(ns);
		return $M.func.get($M.Utils.equal(a, b)||(a.isNum && b.isNum && a > b)?
					'true':'false', []);
	},
	getHtml: function (alone) {
		return $M.Html.block([this.args[0].getHtml(), $M.Html.oper('&ge;',
				'OperEquiv'), this.args[1].getHtml()], 'Relation');
	},
	toString: function () {
		return this.args[0] + '>=' + this.args[1];
	}
});

$M.func.add('le', {
	isRel: true,
	getResult: function (ns) {
		var a = this.args[0].getResult(ns);
		var b = this.args[1].getResult(ns);
		return $M.func.get($M.Utils.equal(a, b)||(a.isNum && b.isNum && a < b)?
					'true':'false', []);
	},
	getHtml: function (alone) {
		return $M.Html.block([this.args[0].getHtml(), $M.Html.oper('&le;',
				'OperEquiv'), this.args[1].getHtml()], 'Relation');
	},
	toString: function () {
		return this.args[0] + '<=' + this.args[1];
	}
});

/**************************************************************************/
/*********************** ASSOCIATION  *************************************/
/**************************************************************************/
$M.func.add('ass', {
	isAss: true,

	getHtml: function (alone) {
		var htmlFr = [];
		for (var i = 0, l = this.args.length; i < l; i++) {
			htmlFr[htmlFr.length] = this.args[i].getHtml(true);
			if (i < l - 1)
				htmlFr[htmlFr.length] = $M.Html.oper("=");
		};
		//htmlFr[htmlFr.length] = this.right.getHtml(true);
		return $M.Html.block(htmlFr, "Ass");
	},

	getResult: function (ns) {
		var res = this.args.mlast().getResult(ns), left;
		for (var i = 0, l = this.args.length - 1; i < l; i++) {
			left = this.args[i];
			if (left.isGetItem) {
				var start = left.args[1].getResult(ns);
				// TODO: Slice case with stop and step
				//var stop = left.args[2]
				if (start.isNum) {
					var arr = left.args[0].getResult(ns);
					if (arr && arr.isArray) {
						arr[start.toFixed(0)-1] = res;
						ns.add(left.args[0], arr);
					}
				}
			} else {
				var right;
				if (!left.isSym && !left.isFunc)
					return $M.Utils.error('SyntaxError',
					'Left side of association must be symbol, function or vector element');
				if (left.isFunc) {
					right = new $M.func.FuncInNS(left.args, res);
					left = left.name;
					// Don`t need result
					res = this.args.mlast();
				} else
					right = res;
				ns.add(left, right);
			};
		};
		var newArgs = this.args.slice(0, this.args.length - 1);
		newArgs.push(res);
		var fnc = $M.func.get('ass', newArgs);
		return fnc;
	},

	toString: function () {
		var res = '';
		for (var i = 0, l = this.args.length; i < l; i++) {
			if (this.args[i].isNeg)
				res += '-';
			res += this.args[i];
			if (i < l - 1)
				res += ' = ';
		};
	return res;
	}
});

/**************************************************************************/
/********************** A D D  &  M U L  **********************************/
/**************************************************************************/
$M.func.add('add', {
	isAdd: true,

	oneResult: function (args, ns) {
		var numberAdd = function(f, s) {
			if (!$M.activeArticle.getMode('rational'))
				return f + s;
			f = f.getResult(ns);
			s = s.getResult(ns);
			var rat = new $M.Rational(f.nom * s.denom + s.nom * f.denom,
							f.denom * s.denom);
			return rat.getResult(ns);
		};

		var syms = {}, val = 0, coeff, symStr, elem;
		for (var i = 0, l = args.length; i < l; ++i) {
			elem = args[i];
			if (elem.isNum) {
				val = numberAdd(val, elem);
				continue;
			};
			if (elem.isMul && elem.args[0].isNum) {
				coeff = elem.args[0];
				elem = elem.args.length == 2 ? elem.args[1] : $M.func.get('mul', elem.args.slice(1));
			} else
				coeff = 1;
			symStr = elem + '';
			if (typeof syms[symStr] === 'undefined')
				syms[symStr] = {'elem': elem, 'coeff' : coeff};
			else
				syms[symStr].coeff = numberAdd(syms[symStr].coeff, coeff);
		};
		var symsArray = [];
		for (key in syms)
			symsArray.push(syms[key])

		if (!symsArray.length)
			return val;
		var sortFunc = function(a, b) {
			return a.elem == b.elem ? 0 : (a.elem < b.elem ? -1 : 1);
		};
		symsArray.sort(sortFunc);

		var addArgs = [], addElem;
		for (var i = 0, l = symsArray.length; i < l; i++) {
			elem = symsArray[i];
			coeff = elem.coeff;
			elem = elem.elem;
			if (coeff == 0)
				continue;
			addElem = coeff == 1 ? elem : (coeff == -1 ? $M.func.get('neg', elem) : $M.func.get('mul', [coeff, elem]));
			addArgs.push(addElem);
		};
		if (val != 0 )
			addArgs.push(val);
		return addArgs.length == 1 ? addArgs[0] : $M.func.get('add', addArgs);
	},

	getHtml: function (alone) {
		var args = [], elem, _h, minus, isNeg, numCoeff;
		for (var i = 0, l = this.args.length; i < l; i++) {
			elem = this.args[i];
			isNeg = elem.isNeg || elem.isNum && (elem * 1) < 0 || elem.isMul && elem.args[0].isNum && elem.args[0] < 0;
			elem = elem.isNeg ? elem.args[0] : elem;
			_h = elem.getHtml();
			if (isNeg) {
				minus = $M.Html.oper(i==0 ? "-" : "&minus;");
				if (el.isAdd) {
					args[args.length] = $M.Html.brOpen();
					if (i > 0)
						args[args.length] = minus;
					args[args.length] = _h;
					args[args.length] = $M.Html.brClose();
				} else {
					args[args.length] = minus;
					args[args.length] = _h;
				};
			} else {
				if (i > 0)
					args[args.length] = $M.Html.oper("+");
				args[args.length] = _h;
			};
		};
		return $M.Html.block(args, "Add");
	},

	toString: function () {
		var res = "", el;
		for (var i = 0, l = this.args.length; i < l; i++) {
			el = this.args[i];
			if (el.isNeg || el.isNum && el < 0)
				res += (i == 0 ? "-" : " - ") + (el.isNum ? Math.abs(el) : el);
			else
				res += (i == 0 ? "" : " + ") + el;
		};
		return res;
	}
});

$M.func.add('mul', {
	isMul: true,

	oneResult: function (args, ns) {
		// [a , b] * a => [a^2, b]
		// [a^5, b] * a => [a^6, b]
		// [a, b] * a^4 => [a^5, b]
		// [(a*b)^5, c] * (a*b)^2 => [(a*b)^7, c]
		// [a , b] * (1/a) => [b]
		// [a , b] * (b/a^4) => [b^2/a^3]
		// [a , b] * \a => [a^(3/2), b]
		// [\a , b] * \a => [a, b]

	//return $M.func.get('mul', args)

		var numberAdd = function(f, s) {
			return $M.func.get('add', [f, s]).getResult(ns);
		};

		var numberMul = function(f, s) {
			if (!$M.activeArticle.getMode('rational'))
				return f * s;
			f = f.getResult(ns);
			s = s.getResult(ns);
			var rat = new $M.Rational(f.nom * s.nom, f.denom * s.denom);
			return rat.getResult(ns);
		};

		var syms = {}, val = 1, coeff, symStr, elem;
		for (var i = 0, l = args.length; i < l; ++i) {
			elem = args[i];
			if (elem.isNum) {
				val = numberMul(val, elem);
				continue;
			};
			if (elem._asMul) {
				elemCoeffs = elem._asMul();
			} else {
				elemCoeffs = [{'elem': elem, 'coeff' : 1}];
			};
/*			if (elem.isPow && elem.args[1].isNum) {
				coeff = elem.args[1];
				elem = elem.args[0];
			} else
				coeff = 1;
*/
			for (var j = 0, k = elemCoeffs.length; j < k; j++) {
				elem = elemCoeffs[j]
				symStr = elem.elem + '';
				if (typeof syms[symStr] === 'undefined')
					syms[symStr] = elem;
				else
					syms[symStr].coeff = numberAdd(syms[symStr].coeff, elem.coeff);
			};
		};

		if (val==0)
			return val;

		var symsArray = [];
		for (key in syms)
			symsArray.push(syms[key])

		if (!symsArray.length)
			return val;
		var sortFunc = function(a, b) {
			return a.elem == b.elem ? 0 : (a.elem < b.elem ? -1 : 1);
		};
		symsArray.sort(sortFunc);

		var mulArgs = [], mulElem;
		for (var i = 0, l = symsArray.length; i < l; i++) {
			elem = symsArray[i];
			coeff = elem.coeff;
			elem = elem.elem;
			if (coeff == 0)
				continue;
			mulElem = coeff == 1 ? elem : ($M.func.get('pow', [elem, coeff]));
			mulArgs.push(mulElem);
		};
		if (val != 1 )
			mulArgs.unshift(val);
		return mulArgs.length == 1 ? mulArgs[0] : $M.func.get('mul', mulArgs);

/*

		var ratdiv = function(f, s){
			if ($M.activeArticle.getMode('rational')) {
				f = f.getResult(ns);
				s = s.getResult(ns);
				var rat = new $M.Rational(f.nom * s.denom,
							  f.denom * s.nom);
				return rat.getResult(ns);
			};
			return f / s;
		};

		var getCoeff = function(elList){
			var el, coeff, newList = new Array();
			for (var i = 0, l = elList.length; i < l; ++i){
				el = elList[i];
				coeff = el.coeff;
				el = el.el;
				if (el.isDiv) {
					newList = newList.concat(getCoeff([{coeff:coeff, 
															el:el.args[0]}]));
					newList = newList.concat(getCoeff([{coeff:ratmul(-1,
													coeff), el:el.args[1]}]));
					continue;
				};
				if (el.isRoot && el.args[1].isNum) {
					newList = newList.concat(getCoeff([{coeff:ratdiv(coeff,
								el.args[1]), el:el.args[0]}]));
					continue;
				};
				if (el.isPow && el.args[1].isNum){
					newList = newList.concat(getCoeff([{coeff:ratmul(coeff,
								el.args[1]), el:el.args[0]}]));
					continue;
				};
				if (el.isMul){
					for (var i = 0, l = el.args.length; i < l; ++i){
						newList = newList.concat(getCoeff([{coeff:coeff,
										el:el.args[i]}]));
					}
					continue;
				};
				newList.push({coeff:coeff, el:el});
			};
			return newList;
		};

		var addEl = function(list, el){
			var elLi;
			el = getCoeff(el);
			for (var j = 0, k = list.length; j < k; ++j){
				elLi = getCoeff(list[j]);
				if ($M.Utils.equal(el.el, elLi.el)) {
					list[j] = $M.func.get('pow', [el.el,
								ratadd(el.coeff,elLi.coeff)]);
					return list;
				};
			};
			list[list.length] = el.el;
			return list;
		};

		var syms = new Array(), val = 1, arResult, sInd, ak;
		var coeffs = new Array();
		for (var i = 0, l = args.length; i < l; ++i) {
			arResult = args[i]; //$M.clone(args[i]);
			if (arResult.isNum)
				val = ratmul(val, arResult);
			else
				syms.push(arResult);
		};
		val = val.getResult(ns);
		//if (val == 0 || syms.length < 1)
		return val;
		// symbolic operations with syms
		syms.sort();
		var mul = [], el;
		// each to primitives with coeffs
		for (i = 0, l = syms.length; i < l; ++i) {
			mul = mul.concat(getCoeff([{coeff:1, el:syms[i]}]));
		};
		// aggregate
		var aggrMul = new Array();
		var elLi, find;
		for (i = 0, l = mul.length; i < l; ++i) {
			el = mul[i];
			if(el.el.isNum){
				val = ratmul(val, el.el);
				continue;
			}
			find = false;
			for (var j = 0, k = aggrMul.length; j < k; ++j) {
				elLi = aggrMul[j];
				if ($M.Utils.equal(el.el, elLi.el)){
					aggrMul[j].coeff = ratadd(el.coeff, elLi.coeff);
					find = true;
					break;
				};
			};
			if(!find)
				aggrMul[aggrMul.length] = el;
			val = val.getResult(ns);
			// to mul
			var nom = new Array(), denom = new Array();
			if (val != 1) {
				nom[0] = val;
				for (var j = 0, k = aggrMul.length; j < k; ++j) {
					el = aggrMul[j];
					if (el.coeff == 0)
						continue;
					if (el.coeff > 0){
						nom[nom.length] = el.coeff == 1 ? el.el :
						$M.func.get("pow", [el.el, el.coeff]).getResult(ns);
						continue;
					};
					denom[denom.length] = el.coeff == -1 ? el.el : 
						$M.func.get("pow", [el.el, ratmul(-1, el.coeff)])
							.getResult(ns);
				};
				var mnom = nom.length == 0 ? 1 : (nom.length == 1 ? nom[0] :
								$M.func.get("mul", nom));
				if (denom.length > 0){
					//div case
					var res = $M.func.get("div", [mnom, denom.length == 1 ? 
								 denom[0]: $M.func.get("mul", denom)]);
					return res;
				}
				return mnom;
			}
		}
*/
	},

	getHtml: function (alone) {
		var args = this.args;
		var dv = [], el;
		for (var i = 0, l = args.length; i < l; i++) {
			el = args[i]; //$M.clone(args[i]);
			if (el == -1) {
				if (alone)
					dv[dv.length] = $M.Html.oper("-");
				continue;
			}
			var _h = el.getHtml(); // was be (true)
			if (el.isAdd) {
				dv[dv.length] = $M.Html.brOpen();
				dv[dv.length] = _h;
				dv[dv.length] = $M.Html.brClose();
			} else
				dv[dv.length] = _h;
			if (i < l - 1)
				dv.push($M.Html.oper("&middot;", "OperMul"));
		}
		return $M.Html.block(dv, "Mul");
	},
	toString: function () {
		var res = "", el;
		for (var i = 0, l = this.args.length; i < l; i++) {
			el = this.args[i];
			if (el == -1) {
				res += "-";
				continue;
			};
			if (el.isNeg || el.isAdd)
				res += "(" + el + ")";
			else
				res += el;
			if (i < l - 1)
				res += " * ";
		};
	return res;
	}

});

$M.func.add('pow', {
	isPow: true,

	oneResult: function (args, ns) {
		var base = args[0];
		var exp = args[1];
		if (base.isRoot && base.args[0].isNum && exp.isNum){
			var coeff;
			if ($M.activeArticle.getMode('rational')) {
				var bexp = base.args[0].getResult(ns);
				coeff = (new $M.Rational(exp.nom * bexp.denom, exp.denom * bexp.nom)).getResult(ns);
				var nom = coeff.isRational ? coeff.nom : coeff;
				var denom = coeff.isRational ? coeff.denom : 1;
				base = nom == 1 ? base : $M.func.get('pow', [base.base, nom]);
				if (denom == 1)
					return base;
				return $M.func.get('root', [denom, base]);
			};
			coeff = exp / base.exp;
			return coeff == 1 ? base.base : $M.func.get('pow', [base.base, (exp / base.exp)]);
		};

		if ($M.activeArticle.getMode('rational') && exp.isNum){
			if (base.isNum) {
				if (exp.nom < 0) {
					var tmp = base.nom;
					base.nom = base.denom;
					base.denom = tmp;
					exp.nom = -exp.nom;
				};
				// exp.nom == Infinity fix;
				var nom = base.nom == 1 ? base.nom : Math.pow(base.nom, exp.nom);
				var denom = base.denom == 1 ? base.denom : Math.pow(base.denom, exp.nom);
				return (new $M.Rational(nom, denom)).getResult(ns);
			};
			var needDiv = false;
			if (exp.nom < 0) { // negative
				exp.nom = -exp.nom;
				needDiv = true;
			};
			base = exp.nom == 1 ? base: $M.func.get("pow", [base, exp.nom]);
			var res = exp.denom == 1 ? base : $M.func.get("root", [exp.denom, base]);
			return needDiv ? $M.func.get("div", [1, res]) : res;
		};
		if (exp.isNum && exp < 0) {
			var denom = exp == -1 ? base : $M.func.get('pow', [base, Math.abs(exp)]);
			return $M.func.get("div", [1, denom]);
		}
		return base.isNum && exp.isNum ? Math.pow(base, exp).getResult(ns): 
			$M.func.get("pow", [base, exp]);
	},

	getHtml: function (alone) {
		var _b = [], _ex = [], base = this.args[0], exp=this.args[1], po,
		exHtml = exp.getHtml(true), baHtml = base.getHtml(true),
		_margin = exHtml._height ? exHtml._height * 0.4 : 0.4;
		if (base.isNeg || base.isAdd || base.isDiv || base.isMul || base.isFunc || base.isPow){
			_b.push($M.Html.brOpen());
			_b.push(baHtml);
			_b.push($M.Html.brClose());

		} else
			_b.push(baHtml);
		_ex.push(exHtml);
		po = [$M.Html.block(_b, "BasePow")];
		var ex = $M.Html.block(_ex, "ExpPow");
		$M.Html.setMargin(ex, 'marginLeft', 0.2, 0.66);
		ex._margin = _margin;
			//ex.style.marginLeft = 0.2 + 'em';
		po.push(ex);
		//po[1]._margin = _margin;
		var _pow = $M.Html.block(po, "Pow");
		_pow._height = (baHtml._height || 1) + _margin;
		return _pow;
	},

	toString: function () {
		var res, base = this.args[0], exp = this.args[1];
		if (base.isNeg || base.isAdd || base.isDiv || base.isMul || base.isFunc)
			res = "(" + base + ")";
		else
			res = base;
		if (exp.isNeg || exp.isAdd || exp.isDiv || exp.isMul)
			res += " ^ (" + exp + ")";
		else
			res += " ^ " + exp;
		return res;
	}
});

$M.func.add('div', {

	isDiv: true,

	oneResult: function (args, ns) {
		var nom = args[0], denom = args[1];
		if (nom.isNum && denom.isNum){
			if ($M.activeArticle.getMode('rational'))
				return (new $M.Rational(nom.nom * denom.denom,
								nom.denom * denom.nom)).getResult(ns);
			return (nom / denom);
		};
		return $M.func.get("mul", [nom, $M.func.get("pow", 
							 [denom, -1])]).getResult(ns);
	},

	getHtml: function (alone) {
		var dv = document.createDocumentFragment(),
		nom_html = $M.Html.block(this.args[0].getHtml(true), "Nom"),
		denom_html = $M.Html.block(this.args[1].getHtml(true), "Denom");
		dv.appendChild(nom_html);
		dv.appendChild(denom_html);
		dv._height = (nom_html._height || 1) + (denom_html._height || 1) + 0.45;
		dv._margin = (nom_html._height || 1) - 0.28;
		return $M.Html.block(dv, "Div");
	},

	toString: function () {
		var nom = this.args[0], denom = this.args[1],
		res = (nom.isNeg || nom.isAdd || nom.isDiv || nom.isMul || nom.isFunc || nom.isRoot) ? "(" + nom + ")" : nom;
		res += " / " + ((denom.isNeg || denom.isAdd || denom.isDiv || denom.isMul || denom.isRoot) ? "(" + denom + ")" : denom);
		return res;
	}
});

$M.func.add('root', {

	isRoot: true,

	oneResult: function (args, ns) {
		var base = args[1];
		var exp = args[0];
		if (base.isPow && base.args[1].isNum && exp.isNum) {
			if ($M.activeArticle.getMode('rational')) {
				var coeff = (new $M.Rational(base.args[1].nom * exp.denom, 
							base.args[1].denom * exp.nom)).getResult(ns);
				base = coeff.nom == 1 ? base.args[0] : $M.func.get('pow', [base.args[0], coeff.nom]);
				return coeff.denom == 2 ? $M.func.get('root', [2, base]) : $M.func.get('root', [coeff.denom, base]);
			};
			return $M.func.get("pow", [base.args[0], base.args[1] / exp]).getResult(ns);
		};
		return base.isNum && exp.isNum ? Math.pow(base, 1 / exp).getResult(ns) :
			$M.func.get("root", [exp, base]);
	},

	getHtml: function (alone) {
		var dv = document.createDocumentFragment(),
			baseH = this.args[1].getHtml(true),
			_margin = baseH._margin, _height = baseH._height;
		var opHtml = $M.Html.block(undefined, "OperRoot"),
		baseHtml = $M.Html.block(baseH, "BaseRoot");
		opHtml.innerHTML = "&radic;";
		var coeff = baseH._height || 1;
		opHtml.style.fontSize = coeff * 1.15 + "em";
		baseHtml.style.paddingLeft = coeff * 0.15 + "em";
		baseHtml.style.paddingRight = coeff * 0.05 + "em";
		var expH = this.args[0].getHtml(true),
				expHtml = $M.Html.block(expH, "ExpRoot");
		if (expH._height || baseH._height) {
			var e_h = expH._height || 1, b_h = baseH._height || 1;
			if (e_h > b_h) {
				var _coeff = e_h * 0.33;
				$M.Html.setMargin(baseHtml, 'marginTop', _coeff + 0.143, 0.66);
				$M.Html.setMargin(opHtml, 'marginTop', _coeff / 1.2, 0.66);
				_margin += _coeff;
				_height += _coeff;
			} else
				$M.Html.setMargin(expHtml, 'marginTop', b_h/10, 0.66);
		};
		if (this.args[0] != 2) //not sqrt case
			dv.appendChild(expHtml);
		dv.appendChild(opHtml);
		dv.appendChild(baseHtml);
		var sq = $M.Html.block(dv, "Root");
		sq._margin = (_margin || 0) + 0.14;
		sq._height = (_height || 1) * 1.15;
		return sq;
	},

	toString: function () {
		var base = this.args[1], exp = this.args[0];
		var res = exp == 2 ? '':
					((exp.isNeg || exp.isAdd || exp.isDiv || exp.isMul || exp.isFunc) ?
				"(" + exp + ")": exp);
		res += '\\' + ((base.isNeg || base.isAdd || base.isDiv || base.isMul)?
				'(' + base + ')': base);
		return res;
	}
});

$M.func.add('neg', {
	isNeg: true,

	oneResult: function (args, ns) {
		var val = args[0];
		if (val.isNum) {
			if ($M.activeArticle.getMode('rational'))
				val.nom = -val.nom;
			else
				val = -val;
			return val
		};
		if (val.isMul) {
			args = val.args;
			if (args[0].isNum)
				args[0] = $M.func.get('neg', args[0]).getResult(ns);
			else
				args.unshift(-1);
		} else
			args = [-1, val];
		return $M.func.get('mul', args);
	},

	getHtml: function(alone){
		var dv = new Array(), mi = $M.Html.oper("-"),
			el = this.args[0];
		var _h = el.getHtml(alone);
		if (el.isAdd) {
			dv[dv.length] = $M.Html.brOpen();
			dv[dv.length] = mi;
			dv[dv.length] = _h;
			dv[dv.length] = $M.Html.brClose();
		} else {
			dv[dv.length] = mi;
			dv[dv.length] = _h;
		};
		return $M.Html.block(dv, "Mul");
	},
	toString: function(){
		return '-' + this.args[0];
	}
});

$M.func.add('abs', {

	oneResult: function (el, ns) {
		var val = el[0];
		if (!val.isNum)
			$M.func.get('abs', [val]);
		if ($M.activeArticle.getMode('rational'))
			return new $M.Rational(Math.abs(val.nom), Math.abs(val.denom))
		return Math.abs(val);
	},

	getHtml: function(alone){
		var dv = [$M.Html.brOpen('|'), this.args[0].getHtml(true),
				 $M.Html.brClose('|')];
		return $M.Html.block(dv, "Abs");
	},
	toString: function(){
		return '|' + this.args[0] + '|';
	}
});

$M.func.add('factorial', {

	oneResult: function (el, ns) {
		var va = el[0];
		if (va.isInteger && va.isInteger() && va >= 0){
			var res = 1, n = 1;
			while (n <= va) {
				res = res * n;
				n++;
			}
			return res;
		}
		return $M.func.get('factorial', [va]);
	},

	getHtml: function(alone){
		var elems = [],
			base =  this.args[0], baseHtml;
		if (base.isNeg || base.isAdd || base.isDiv || base.isMul || base.isFunc || base.isPow || base.isNum && base < 0){
			elems.push($M.Html.brOpen());
			baseHtml = this.args[0].getHtml(true);
			elems.push(baseHtml);
			elems.push($M.Html.brClose());
		} else {
			baseHtml = this.args[0].getHtml();
			elems = [baseHtml];
		};
		var opHtml = $M.Html.block(undefined, "OperFact");
		opHtml.innerHTML = "!";
		opHtml._margin = baseHtml._margin;
		var coeff = baseHtml._height || 1;
		opHtml.style.fontSize = coeff + "em";
		elems.push(opHtml);
		return $M.Html.block(elems, "Fact");
	}
});

$M.func.add('sin', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.sin(va).getResult(ns) : $M.func.get('sin', [va]);
	}
});

$M.func.add('cos', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.cos(va).getResult(ns) : $M.func.get('cos', [va]);
	}
});

$M.func.add('tan', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.tan(va).getResult(ns) : $M.func.get('tan', [va]);
	}
});

$M.func.add('cot', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? (1 / Math.tan(va)).getResult(ns):
			$M.func.get('cot', [va]);
	}
});

$M.func.add('asin', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.asin(va).getResult(ns): $M.func.get('asin',[va]);
	}
});

$M.func.add('acos', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.acos(va).getResult(ns): $M.func.get('acos',[va]);
	}
});

$M.func.add('atan', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.atan(va).getResult(ns): $M.func.get('atan',[va]);
	}
});

$M.func.add('acot', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? (Math.PI / 2 - Math.atan(va)).getResult(ns):
							$M.func.get("acot", [va]);
	}
});

$M.func.add('exp', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.exp(va).getResult(ns) : $M.func.get('exp', [va]);
	},
	getHtml: function (alone) {
		var pow = $M.func.get('pow', ["e", this.args[0]]);
		return pow.getHtml(alone);
	}
});

$M.func.add('ln', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.log(va).getResult(ns) : $M.func.get('ln', [va]);
	}
});

$M.func.add('log', {
	oneResult: function (args, ns) {
		var base = args[1];
		var exp = args[0];
		return base.isNum && exp.isNum ? (Math.log(base) /
			Math.log(exp)).getResult(ns) : $M.func.get('log', [base, exp]);
	},
	getHtml: function (alone) {
		var baHtml = this.args[1].getHtml();
		var expHtml = $M.Html.block(this.args[0].getHtml(), "ExpLog");
		var log = $M.Html.block("log", "SymbLog");
		$M.Html.setMargin(expHtml, 'marginTop', 1, 0.66);
		var logExp = $M.Html.block([log, expHtml], "Log");
		var logBase = $M.Html.block([$M.Html.brOpen(), baHtml,
						$M.Html.brClose()], "BaseLog");
		return $M.Html.block([logExp, logBase], "Logarithm");
	}
});

$M.func.add('random', {
	oneResult: function (el, ns) {
		var va = el[0];
		return va.isNum ? Math.random(va).getResult(ns):
								$M.func.get('random', [va]);
	}
});

$M.func.add('if', {
	oneResult: function (args, ns) {
		var rel = args[0];
		var tr = args[1];
		var fa = args[2];
		if (rel.isFalse||(rel.isArray && !rel.arr.length) ||(rel.isNum&&rel==0))
			return fa;
		else
			return tr;
	},
	getHtml: function(alone){
		var trHtml = $M.Html.block([this.args[1].getHtml(true),
			$M.Html.oper(','), this.args[0].getHtml(true)], 'SwitchEl');
		var faHtml = $M.Html.block([this.args[2].getHtml(false)], 'SwitchEl');
		var swit = $M.Html.block([trHtml, faHtml], 'SwitchBase');
		swit._height = (trHtml._height || 1) + (faHtml._height || 1) + 0.45;
		var brek = $M.Html.oper('{');
		brek.style.fontSize = swit._height * 1.1 + 'em';
		brek.style.marginRight = -swit._height * 0.02 + 'em';
		brek.style.marginLeft = -swit._height * 0.02 + 'em';
		brek._height = swit._height * 1.1;
		brek._margin = 0.27 * swit._height;
		var sw = $M.Html.block([brek, swit], 'Switch');
		sw._margin = sw._height * 1.1 / 2;
		return sw;
	}
});

$M.func.add('switch', {
	isSwitch: true,
	aggregate: true,
	oneResult: function (args, ns) {
		var el, rel;
		for (var i = 0, l = args.length; i < l; i++){
			el = args[i];
			if (!el.isArray || el.length != 2)
				return $M.Utils.error('Switch arguments must be array with 2 elements');
			rel = el[0];
			if (rel.isFalse || (rel.isArray && !rel.length) || (rel.isNum && rel == 0))
				continue;
			else
				return el[1];
		};
		return this;
	},

	getHtml: function(alone){
		var el, switArr = [], swHeight=0;
		for (var i=0, l=this.args.length; i<l; i++){
			el = this.args[i];
			var elHtml = $M.Html.block([el[0].getHtml(), $M.Html.oper(','),
						el[1].getHtml()],
					  'SwitchEl');
			switArr.push(elHtml);
			swHeight += (elHtml._height || 1) +0.45;
		};
		var swit = $M.Html.block(switArr, 'SwitchBase');
		swit._height = swHeight;
		var brek = $M.Html.brOpen('{');
		brek.style.fontSize = swHeight * 0.92 + 'em';
		brek.style.marginRight = -swit._height * 0.02 + 'em';
		brek.style.marginLeft = -swit._height * 0.02 + 'em';
		brek._height = swit._height * .95;
		brek._margin = 0.17 * swit._height;
		var sw = $M.Html.block([brek, swit], 'Switch');
		sw._margin = sw._height  / 2.1;
		return sw;
	}
});


$M.func.add('get', {
	isGetItem: true,

	getResult: function (ns) {
		var vector = this.args[0].getResult(ns);
		var start = this.args[1].getResult(ns);
		var stop = this.args.length > 2 ? this.args[2].getResult(ns): start;
		var step = this.args.length > 3 ? this.args[3].getResult(ns): null;
		if (!vector.isArray)
			return $M.func.get('get', [vector, start, stop, step]);
		if (!$M.Utils.equal(start, stop)) {
			if (start.isNum && stop.isNum)
			return vector.slice(start.toFixed(0)-1, stop.toFixed(0)-1);
			else
			return $M.func.get('get', [vector, start, stop, step]);
		}
		if (start.isNum) {
			var res = vector[start.toFixed(0)-1];
			if (typeof res == 'undefined')
			return NaN;
			return res;
		} else
			return $M.func.get('get', [vector, start, stop, step]);
	},

	getHtml: function (alone) {
		var vector = this.args[0];
		var start = this.args[1];
		var stop = this.args.length > 2 ? this.args[2]: start;
		var step = this.args.length > 3 ? this.args[3]: null;	
		var index = [start.getHtml()];
		if (step) {
			index.push($M.Html.oper(":"));
			index.push(step.getHtml());
		}
		if (!$M.Utils.equal(start, stop)) {
			index.push($M.Html.oper(":"));
			index.push(stop.getHtml());
		}
		var _index = $M.Html.block(index, "ArrayIndex");
		return $M.Html.block([vector.getHtml(alone), _index], "ArrayElement");
	},

	toString: function () {
		var res = this.element + "[" + this.start;
		if (this.step)
			res += ":" + this.step;
		if (this.stop && this.isArraySlice)
			res += ":" + this.stop;
		res += "]";
		return res;
	}
});

$M.func.add('range', {
	isRange: true,

	getHtml: function (alone) {
		var args = [this.args[0].getHtml(true)];
		if (this.args[1] !== null) {
			args.push($M.Html.oper(","));
			args.push(this.args[1].getHtml(true));
		};
		args.push($M.Html.oper(".."));
		args.push(this.args[2].getHtml(true));
		return $M.Html.block(args, "Range");
	},
	getResult: function (ns) {
		var arr = [];
		var first = this.args[0].getResult(ns);
		var last = this.args[2].getResult(ns);
		var second = this.args[1];
		second = second === null ? second : second.getResult(ns);
		if (!first.isNum || !last.isNum || second && !second.isNum)
			return $M.func.get('range', [first, second, last]);
		var step = second === null ? 1 : second - first;
		var n = 0;
		for (var i=first, stop=last + step/100; step > 0 ? i <= stop : i >= stop;
						i += step) {
			++n;
			if (n > $M.NUM_ARRAY_LENGTH)
				break;
			arr[arr.length] = i.getResult(ns);
		}
		return arr;
	},
	toString: function () {
		var res = "" + this.args[0];
		if (this.args[1] !== null)
			res += "," + this.args[1];
		res += ".." + this.args[2];
		return "(" + res + ")";
	}});

	//// MATRIX FUNCTIONS
	///////////////////////////

$M.func.add('transp', {
	isTransp: true,
	getResult: function (ns) {
		var arr = this.args[0].getResult(ns);
		if (arr.isMatrix()){
			///  9 7 6	9 4 1
			///  4 3 2	7 3 8
			///  1 8 2	6 2 2
			var newMatrix = [], newRow;
			for (var i = 0, l = arr[0].length; i < l; i++){
				newRow = [];
				for (var j = 0, k = arr.length; j < k; j++){
					newRow[j] = arr[j][i];
				}
				newMatrix[i] = newRow;
			};
			return newMatrix;
		}else
			return this;
	},
	getHtml: function (alone) {
		var p = $M.func.get('pow', [this.args[0], '_T']);
		return p.getHtml(alone);
	}
	});


	//// ANALIZE
	///////////////////////////
/*
	$M.Sum_ = function (base, bottom, top) {
	var funcArgs = ["sum", base, bottom, top];
	var func = new $M.BaseFunc_(funcArgs);
	func.base = base;
	func.bottom = bottom;
	func.top = top;
	func.isFunc = false;
	func.type = "sum";
	func.isSum = true;
	func.oneElem = function (args, ns) {
		return this;
	};
	func.getHtml = function (alone) {
		var bse = document.createDocumentFragment(),
			baseHtml = this.base.getHtml(true),
				opHtml = $M._op('&sum;');
		var coeff = baseHtml._height || 1;
		opHtml.style.fontSize = coeff * 1.15 + "em";
		var sm = document.createDocumentFragment();
		sm._height = baseHtml._height * 1.25;
		sm._margin = baseHtml._margin * 1.15;

		if (this.top){
		var _tp = $M._block(this.top.getHtml(true), "TopSum");
		sm._height += (_tp._height || 1) * 0.75;
		sm._margin += (_tp._height || 1) * 0.7;
		sm.appendChild(_tp);
		}
		sm.appendChild(opHtml);
		if (this.bottom){
		var _bt = $M._block(this.bottom.getHtml(true), "BottomSum");
		sm.appendChild(_bt);
		sm._height += (_bt._height || 1) * 0.75;
		}
		sm = $M._block(sm, 'OpSum');
		return $M._block([sm, baseHtml], "Sum");
	};
	return func;
	};

	$M.Prod_ = function (base, bottom, top, neg) {
	var funcArgs = ["prod", base, bottom, top, neg];
	var func = new $M.BaseFunc_(funcArgs);
	func.base = base;
	func.bottom = bottom;
	func.top = top;
	func.isFunc = false;
	func.type = "prod";
	func.isProd = true;
	func.oneElem = function (args, ns) {
		return this;
	};
	func.getHtml = function (alone) {
		var bse = document.createDocumentFragment(),
			baseHtml = this.base.getHtml(true),
				opHtml = $M._op('&prod;');
		var coeff = baseHtml._height || 1;
		opHtml.style.fontSize = coeff * 1.15 + "em";
		var sm = document.createDocumentFragment();
		sm._height = baseHtml._height * 1.25;
		sm._margin = baseHtml._margin * 1.15;

		if (this.top){
		var _tp = $M._block(this.top.getHtml(true), "TopSum");
		sm._height += (_tp._height || 1) * 0.75;
		sm._margin += (_tp._height || 1) * 0.7;
		sm.appendChild(_tp);
		}
		sm.appendChild(opHtml);
		if (this.bottom){
		var _bt = $M._block(this.bottom.getHtml(true), "BottomSum");
		sm.appendChild(_bt);
		sm._height += (_bt._height || 1) * 0.75;
		}
		sm = $M._block(sm, 'OpSum');
		return $M._block([sm, baseHtml], "Sum");
	};
	return func;
	};


	$M.Integral_ = function (base, args, bottom, top, neg) {
	var funcArgs = ["integral", base, args, bottom, top, neg];
	var func = new $M.BaseFunc_(funcArgs);
	func.base = base;
	func.bottom = bottom;
	func.top = top;
	func.args = args;
	func.isFunc = false;
	func.type = "integral";
	func.isIntegral = true;
	func.oneElem = function (args, ns) {
		return this;
	};
	func.getHtml = function (alone) {
		var bse = document.createDocumentFragment(),
			baseHtml = this.base.getHtml(true);
		var coeff = baseHtml._height || 1;
		var sm = document.createDocumentFragment();
		sm._height = baseHtml._height * 1.25;
		sm._margin = baseHtml._margin * 1.15;

		if (this.top){
		var _tp = $M._block(this.top.getHtml(true), "TopSum");
		sm._height += (_tp._height || 1) * 0.75;
		sm._margin += (_tp._height || 1) * 0.7;
		sm.appendChild(_tp);
		};
		var argsHtml = [];
		if (this.args.isArray){
		for(var i=0, l=this.args.length_(); i < l; i++){
			var opHtml = $M._op('&int;', 'OperMul');
			opHtml.style.fontSize = coeff * 1.15 + "em";
			sm.appendChild(opHtml);
			argsHtml.push($M._op('d', 'OperMul'));

			argsHtml.push(this.args.getItem(i + 1).getHtml());
		}
		}else{
		var opHtml = $M._op('&int;', 'OperMul');
		opHtml.style.fontSize = coeff * 1.15 + "em";
		sm.appendChild(opHtml);
		argsHtml.push($M._op('d', 'OperMul'));
		argsHtml.push(this.args.getHtml());
		};
		if (this.bottom){
		var _bt = $M._block(this.bottom.getHtml(true), "BottomSum");
		sm.appendChild(_bt);
		sm._height += (_bt._height || 1) * 0.75;
		}
		sm = $M._block(sm, 'OpSum');
		return $M._block([sm, baseHtml, $M._block(argsHtml, 'SumDiff')], "Sum");
	};
	return func;
	};

	$M.Diff_ = function (base, args, neg) {
	var funcArgs = ["diff", args, neg];
	var func = new $M.BaseFunc_(funcArgs);
	func.base = base;
	func.args = args;
	func.isFunc = false;
	func.type = "diff";
	func.isDiff = true;
	func.oneElem = function (args, ns) {
		return this;
	};
	func.getHtml = function (alone) {
		var Templ = function(el, dName){
		this.el = el;
		this.dName = dName;
		this.getHtml = function(){
			var fu = function(ar, dName){
			var elHtml = ar.getHtml();
			var d = $M._op(dName, 'OperMul');
			var args;
			if (ar.isSym){
				args = [d, elHtml];
			}
			else{
				args = [d, $M._brOpen(), elHtml, $M._brClose()];
			}
			return args;
			};
			var args = [];
			if(this.el.isArray){
			for (var i=0, l=this.el.length_(); i<l;i++){
				var _args = fu(this.el.getItem(i + 1), this.dName);
				for (var j=0, k=_args.length; j < k; j++){
				args[args.length] = _args[j];
				}
			}
			}else{
			args = fu(this.el, this.dName);
			}
			return $M._block(args, "Diff");
		};
		};
		var dName = this.args.isArray? '&part;': 'd';
		return $M.div(new Templ(this.base, dName), new Templ(this.args, dName),
			  this.neg).getHtml();
	};
	return func;
	};
*/
$M.recursionCount = 0;

// User function
$M.func.add('_user_fnc', {

	oneResult : function (args, ns) {
		if(!this.funcInMem)
			return this;
		for (var i = 0, l = this.args.length; i < l; i++) {
			$M.func.get('ass', [this.funcInMem.args[i], args[i]]).getResult(ns);
		};
		return this.funcInMem.body.getResult(ns);
	},

	preGetResult : function (ns) {
		var funcInMem = ns.get(this.name);
		if (!funcInMem) {
			return ns;
		}
		$M.recursionCount++;
		if ($M.recursionCount > $M.REC_DEEP) {
			return $M.Utils.error('Syntax', 'To much recursion');
		}

		if (funcInMem.args.length != this.args.length) {
			$M.recursionCount--;
			return $M.Utils.error('Syntax', 'Need other quantity of arguments');
		}
		this.funcInMem = funcInMem;
		ns.addNS({});
		return ns;
	},

	postGetResult : function (ns) {
		if(!this.funcInMem)
			return ns;
		ns.delNS();
		$M.recursionCount--;
		return ns;
	}
});

 /// PLOT
 ///////////////////
 $M.PLOT_COLORS = {black:"rgb(0, 0, 0)", grey:"rgb(90, 90, 90)",
		red:"rgb(255, 0, 0)", green:"rgb(0, 255, 0)",
		blue:"rgb(0, 0, 255)", yellow:"rgb(255, 255, 0)",
		pink:"rgb(255, 0, 255)", brown:"rgb(80, 40, 0)"};

$M.func.add('plot', {
	isPlot: true,
	options : undefined,
	el : undefined,
	prepare : function () {
		var opt = this.args[0];
		var newOpt = {};
		newOpt.legend = opt.legend;
		var width = opt.width;
		width = parseInt(width || 200);
		newOpt.width = width < 200 ? 200 : width > 500 ? 500 : width;
		var height = opt.height;
		height = parseInt(height || 200);
		newOpt.height = height < 200 ? 200 : height > 500 ? 500 : height;
		newOpt.xaxis = "auto";
		newOpt.yaxis = "auto";
		newOpt.data = [];
		for (var i = 1; i <= 3; i++) {
			if (opt["x" + i] && opt["y" + i]) {
				newOpt.data.push({x:opt["x" + i],
								y:opt["y" + i],
								color: opt["color" + i],
								type: opt["type" + i],
								label: opt["label" + i]});
			}
		};
		this.options = newOpt;
	},

	getResult : function (ns) {
		var opt = this.options;
		var data = opt.data;
		var flotData = [];
		for (var i = 0, l = data.length; i < l; ++i) {
			var x = data[i].x.getResult(ns);
			var xIsSymb = !!x.isSym;
			if (xIsSymb){
				ns.addNS({});
				var xrange = $M.func.get('range',[-10,-9.9,10]);
				ns.add(x, xrange);
				x = xrange.getResult(ns);
			}
			var y = data[i].y.getResult(ns);
			var elData = [];
			if (xIsSymb)
				ns.delNS();
			if (!(x.isArray && y.isArray))
				continue;
			for (var j = 0, m = Math.min(x.length, y.length); j < m; ++j) {
				if (x[j].isNum && y[j].isNum)
					elData[j] = [x[j], y[j]];
			};
			var dataobj = {data: elData,
							color: $M.PLOT_COLORS[data[i].color] || 'red',
							label: data[i].label,
							type: data[i].type || 'pointsline'};
							flotData.push(dataobj);
		};
		var plt = new $M.Plots.Plot2D(this.el,
						flotData,
						{width:opt.width, height:opt.height});
		plt.init();
		plt.plot();

		return true;
	},

	preHtml : function (width, height) {
		var div = document.createElement("div");
		div.style.width = width + "px";
		div.style.height = height + "px";
		div.className = "PlotPar";
		return div;
	},

	getHtml : function (alone) {
		this.prepare();
		var opt = this.options;
		var el = this.preHtml(opt.width, opt.height);
		this.el = el;
		return el;
	}
});

$M.func.add('plot3d', {
	isPlot : true,
	isPlot3d : true,
	options : undefined,
	el : undefined,
	prepare : function () {
		var opt = this.args[0];
		var newOpt = {};
		newOpt.legend = opt.legend;
		var width = opt.width;
		width = parseInt(width || 200);
		newOpt.width = width < 200 ? 200 : width > 500 ? 500 : width;
		newOpt.xaxis = "auto";
		newOpt.yaxis = "auto";
		newOpt.zaxis = "auto";
		newOpt.data = [{x:opt.x, y:opt.y, z:opt.z, color:opt.color}];
		this.options = newOpt;
	},
	getResult : function (ns) {
		var opt = this.options;
		var data = opt.data;
		var flotData = [];
		for (var i = 0, l = data.length; i < l; ++i) {
			var elData = [];
			var x = data[i].x.getResult(ns);
			var y = data[i].y.getResult(ns);
			var z = data[i].z.getResult(ns);
			var xIsSymb = !!x.isSym;
			var yIsSymb = undefined;
			if (xIsSymb){
				ns.addNS({});
				for (var x_=-10; x_ < 10; x_+=.5){
					ns.add(x, x_);
					var nY = y.getResult(ns);
					if (typeof yIsSymb == 'undefined'){

						yIsSymb = !!nY.isSym;
						var yName = y;
					};
					if (yIsSymb){
						for (var y_=-10; y_ < 10; y_+=.5){
							ns.add(yName, y_);
							var nZ = z.getResult(ns);
							if (!nZ.isNum)
								continue;
							elData[elData.length] = [x_, y_, nZ];
						};
					};
				};
				ns.delNS();
			} else {
				if (!(x.isArray && y.isArray && z.isArray))
					continue;
				for (var j = 0, m = Math.min(x.length, y.length, z.length); j < m; ++j) {
					if (x.isNum && y.isNum && z.isNum)
						elData[j] = [x[j], y[j], z[j]];
				};
			};
			if (elData.length < 1)
				continue;
			var dataobj = {data:  elData,
					color: $M.PLOT_COLORS[data[i].color] || 'red'};
			flotData.push(dataobj);
		};
		this.el.innerHTML = '';
		if (flotData.length < 1)
			return;
		var plt = new $M.Plots.Plot3D(this.el, flotData, {width:opt.width});
		plt.init();
		plt.plot();
		return true;
	},

	preHtml : function (width) {
		var div = document.createElement("div");
		div.className = "PlotPar";
		div.style.width = width + "px";
		div.style.height = width + "px";
		return div;
	},

	getHtml : function (alone) {
		this.prepare();
		var opt = this.options;
		var el = this.preHtml(opt.width);
		this.el = el;
		return el;
	}
});



/////////////
///		 P  L  O  T  S 
////////////////////

$M.Plots = function(){};

$M.Plots.inf = Number.POSITIVE_INFINITY;

// ****************************************
// ******* Q U A T E R N I O N ************
// ****************************************

$M.Plots.Quaternion = function(vector, w){
	this.v = vector;
	this.w = w;
};

$M.Plots.Quaternion.prototype.mul = function(q2){
	// [ vv' + wv' + w'v, ww' – v•v' ]
	var newV = this.v.mulVector(q2.v).add(q2.v.mulS(this.w)).add(this.v.mulS(q2.w));
	var newW = this.w * q2.w - this.v.mulScal(q2.v);
	return new $M.Plots.Quaternion(newV, newW);
};

$M.Plots.Quaternion.prototype.getMatrix = function(){
	// return `rotate matrix` for this quaternion
	var x = this.v[0], y = this.v[1], z = this.v[2], w = this.w;
	var mX = [1 - 2 * (y*y + z*z), 2 * ( x*y - z*w), 2 * ( x*z + y*w )];
	var mY = [2 * ( x*y + z*w ), 1 - 2 * ( x*x + z*z ), 2 * ( y*z - x*w )];
	var mZ = [2 * ( x*z - y*w ), 2 * ( y*z + x*w ), 1 - 2 * ( x*x + y*y )];
	return [mX, mY, mZ];
};

$M.Plots.Plot2D = function(element, data, options){
	// @element - canvas Element
	// @data - [{data:[[x1, y1], ..], type:'', color:'''}, {data:[[x2, y2], ..]}, ...]
	// @options - {width, height, xaxis, yaxis, round}

	this.textSize = 10;
	this.element = element;
	this.move = 10;
	this.data = data;
	this.options = options || {};
	this.width = this.options.width || 250;
	this.height = this.options.height || 200;
	this.round = this.options.round || 1000;

	this.init = function(){
		this.element.innerHTML = '';
		this._id = (Math.random()+'').substring(4);
		if (this.options.yaxis){
			this.ymax = Math.max(this.options.yaxis);
			this.ymin = Math.min(this.options.yaxis);
		};
		if (this.options.xaxis){
			this.xmax = Math.max(this.options.xaxis);
			this.xmin = Math.min(this.options.xaxis);
		} else {
			var maxims = [], el, cont;
			this.xmax = -$M.Plots.inf;
			this.xmin = $M.Plots.inf;
			if (!this.options.yaxis){
				this.ymax = -$M.Plots.inf;
				this.ymin = $M.Plots.inf;
			};
			for (var i = 0, l = this.data.length; i < l; i++){
				cont = this.data[i].data;
				for (var j = 0, k = cont.length; j < k; j++){
					el = cont[j];
					if (el[0] > this.xmax) this.xmax = el[0];
					if (el[0] < this.xmin) this.xmin = el[0];
					if (!this.options.yaxis){
						if (el[1] > this.ymax) this.ymax = el[1];
						if (el[1] < this.ymin) this.ymin = el[1];
					};
				};
			};
		};
		var _dltx = this.xmax - this.xmin;
		var _dlty = this.ymax - this.ymin;
		this.xmax = this.xmax;
		this.xmin = this.xmin;
		this.ymax = this.ymax;
		this.ymin = this.ymin;
		this.coeffX = function(){
			return (this.canvas.width)/ ((this.xmax - this.xmin) * 1.01);
		};
		this.deltaX = function(){
			return this.coeffX() * this.xmin;
		};
		this.coeffY = function(){
			return (this.canvas.height)/ ((this.ymax - this.ymin) * 1.01);
		};
		this.deltaY = function(){
			return this.coeffY() * this.ymin;
		};

		if (!this.options.xaxis)
			this.options.xaxis = this._getAxis(this.xmin, this.xmax, Math.floor(this.width / 50));
		if (!this.options.yaxis)
			this.options.yaxis = this._getAxis(this.ymin, this.ymax, Math.floor(this.height / 50));
		var widthDelta = 0, el;
		for ( var i=0, l=this.options.yaxis.length; i < l; i++){
			el = (this.options.yaxis[i] + '').length * this.textSize * 0.65;
			widthDelta = el > widthDelta ? el : widthDelta;
		};
		var heightDelta = this.textSize * 2.0;

		this.container = document.createElement('div');
		this.container.className = "PlotContainer";

		this.container.style.width = this.width + 'px';
		this.container.style.height = this.height + 'px';

		this.yLabels = document.createElement('div');

		this.yLabels.className = "PlotYLabels";
		this.yLabels.style.width = widthDelta * .9 + 'px';

		this.xLabels = document.createElement('div');
		this.xLabels.className = "PlotXLabels";
		this.xLabels.style.height = heightDelta * 0.95 + 'px' ;
		//this.xLabels.style.top = - heightDelta / 6 + 'px' ;
		this.xLabels.style.marginLeft = (widthDelta + 5)+ 'px' ;

		this.canvas = document.createElement('canvas');
		this.canvas.className = "PlotCanvas";
		this.canvas.width = this.width - widthDelta - 10;
		this.canvas.height = this.height - heightDelta;

		this.container.appendChild(this.canvas);
		this.container.appendChild(this.yLabels);
		this.container.appendChild(this.xLabels);
		this.element.appendChild(this.container);

		if (typeof(window.G_vmlCanvasManager) != 'undefined')
			window.G_vmlCanvasManager.initElement(this.canvas);
		this.ctx = this.canvas.getContext("2d");
		if (this.options.xaxis.length < 1)
			return;
		this.axis();
	};

	this._getAxis = function(mi, ma, count){

		var delt = (ma - mi) / count;
		var logg = Math.round(Math.log(delt / 10) / Math.log(10));
		var koeff = Math.pow(10, Math.abs(logg));
		if (logg < 0)
			koeff = 1 / koeff;
		var self = this;
		var normal = function(val){
			var el = Math.round( val / koeff ) * koeff;
			return  Math.round(el * self.round) / self.round;
		};

		var axis = [],
		mx = normal(ma),
		mn = normal(mi);
		var step = normal((mx - mn) * 1.1 / count);
		for (var _y = mn; _y <= mx; _y += step)
			axis[axis.length] = Math.round(_y * self.round)/self.round;
		return axis;
	};

	this._textWidth = function(mi, ma){
		var ma_length = Math.max((mi + '').length, (ma + '').length);
		return ma_length * this.textSize;
	};

	this.plot = function(){
		if (this.data.length < 1 || typeof this.ctx == 'undefined')
			return;
		for (var i = 0, l = this.data.length; i < l; i++){
			var cont = this.data[i];
			if (cont.data.length<1)
				continue;
		switch (cont.type) {
		case "bar":
			var delta = $M.Plots.inf, delta_;
			for (var j = 0, k = cont.data.length - 1; j < k; j++ ){
				delta_ = Math.abs(cont.data[j+1][0] - cont.data[j][0]);
				if (delta_ < delta)
					delta = delta_;
			};
			this.bar(cont.data, cont.color, delta * this.coeffX()/2);
			break;
		case "line":
			this.line(cont.data, cont.color);
			break;
		case "points":
			this.points(cont.data, cont.color);
			break;
		case "pointsline":
			this.pointsline(cont.data, cont.color);
			break;
		};
		};
	};

	this.newCoord = function(c){
		var nc = {x: c[0] * this.coeffX() - this.deltaX()-1,
				y: this.canvas.height -(c[1] * this.coeffY() - this.deltaY())-1};
		return nc;
	};

	this.axis = function(){
		this.ctx.beginPath();
			this.ctx.strokeStyle = "black";
		var m = 1; //this.move;
		this.ctx.moveTo(m, m);
		this.ctx.lineTo(m, this.canvas.height - m);
		this.ctx.lineTo(this.canvas.width - m*3, this.canvas.height - m);
		var el, nC;
		var xl;
		for (var i = 0, l = this.options.xaxis.length; i < l; i++){
			el = this.options.xaxis[i];
			nC = this.newCoord([el, this.ymin]);
			xl = document.createElement('span');
			xl.className = "PlotText";
			xl.innerHTML = el + '';//parseInt(el * this.round)*(1/this.round);
			xl.style.left  = nC.x - 3 + 'px';
			//xl.style.fontSize = this.textSize + 'px';
			this.xLabels.appendChild(xl);

			this.ctx.moveTo(nC.x, nC.y);
			this.ctx.lineTo(nC.x, nC.y - 3);
		};
		//Math.round(val * roun);
		var yl, marg;
		var ycursor = 0;
		for (i = 0, l = this.options.yaxis.length; i < l; i++){

			el = this.options.yaxis[i];
			nC = this.newCoord([this.xmin, el]);

			yl = document.createElement('span');
			yl.className = "PlotText";

			yl.innerHTML = el + '';
			yl.style.top = nC.y - 10 + 'px';
			yl.style.textAlign = 'right';
			yl.style.width =this.yLabels.style.width;
			yl.style.left = -3 + 'px';
			this.yLabels.appendChild(yl);
			this.ctx.moveTo(nC.x, nC.y);
			this.ctx.lineTo(nC.x + 4, nC.y);
		};
		this.ctx.stroke();
	};

	this.point = function(coord){
			var c = this.newCoord(coord);
		this.ctx.beginPath();
		this.ctx.lineWidth = 0.5;
		//this.ctx.moveTo(c.x, c.y);
		this.ctx.lineWidth = 1.5;
			this.ctx.arc(c.x, c.y, 3.5, 0, 2*Math.PI, false);
			//this.ctx.arc(c.x, c.y, 2.5, 0, -Math.PI, false);
		this.ctx.stroke();
			//this.ctx.moveTo(c.x, c.y);
			//this.ctx.lineTo(++c.x, ++c.y);
	};

	this.points = function(data, color){
		color = color || 'red';
		this.ctx.beginPath();
		this.ctx.lineWidth = 1.5;
		this.ctx.strokeStyle = color;
		for (var i=0, l=data.length; i<l; i++ ){
		el = data[i];
		if (isNaN(el[0]) || isNaN(el[1]))
			continue;
		this.point(el);
		}
		this.ctx.stroke();

	};

	this.line = function(data, color){
		color = color || 'red';
		this.ctx.beginPath();
		this.ctx.lineWidth = 1.5;
		this.ctx.strokeStyle = color;
		var begining = true, c;
		for (var i=0, l=data.length;i < l; i++){
		el = data[i];
		if (isNaN(el[0]) || isNaN(el[1]))
			continue;
		c = this.newCoord(el);
		if (begining){
			this.ctx.moveTo(c.x, c.y);
			begining = false;
			continue;
		}
		this.ctx.lineTo(c.x, c.y);
		}
		this.ctx.stroke();

	};

	this.pointsline = function(data, color){
		this.line(data, color);
		this.points(data, color);
	};

	this.barPoint = function(coord, stepX){
		var zero = this.newCoord([coord[0], 0]);
		var c = this.newCoord(coord);
		this.ctx.moveTo(zero.x - stepX/2, zero.y);
		this.ctx.lineTo(zero.x - stepX/2, c.y);
		this.ctx.lineTo(zero.x + stepX/2, c.y);
		this.ctx.lineTo(zero.x + stepX/2, zero.y);
	};

	this.bar = function(data, color, stepX){
		color = color || 'blue';
		this.ctx.beginPath();
		this.ctx.strokeStyle = color;
		this.ctx.fillStyle = color;
		var el;
		for (var i = 0, l = data.length; i < l; i++ ){
		el = data[i];
		if (isNaN(el[0]) || isNaN(el[1]))
			continue;
		this.barPoint(el, stepX);
		}
		this.ctx.stroke();
		this.ctx.fill();
	};

	this.text = function(coord, text, size){
		// TODO
		var c = this.newCoord(coord);
	};
	};


// *****************************************
// ******** 3D   C H A R T *****************
// *****************************************

	$M.Plots.Plot3D = function(el, data, options){
	// @el - Html Element
	// @data - [{data:[[x1, y1], ..], type:'', color:'''}, {data:[[x2, y2], ..]}, ...]
	// @options - {width, height, xaxis, yaxis, round}
	// Usage:
	// new $M.Plots.Plot3D(document.getElementById('plot3d'), [[0,0,0],[1,1,1]....],
		//				 {width:300, height:300})
	this.textSize = 10;
	this.element = el;
	this.move = 10;
	this.data = data;
	this.options = options || {};
	this.width = this.options.width || 250; //this.canvas.width - this.move*2;
	this.round = this.options.round || 1000;


	this.init = function(){
		var self = this;
		self.element.innerHTML = '';
		self._id = (Math.random()+'').substring(10);
		if (self.options.zaxis){
			self.zmax = Math.max(self.options.zaxis);
			self.zmin = Math.min(self.options.zaxis);
		};
		if (self.options.yaxis){
			self.ymax = Math.max(self.options.yaxis);
			self.ymin = Math.min(self.options.yaxis);
		};
		if (self.options.xaxis){
			self.xmax = Math.max(self.options.xaxis);
			self.xmin = Math.min(self.options.xaxis);
		} else {
			var maxims = [], el, cont;
			self.xmax = -$M.Plots.inf;
			self.xmin = $M.Plots.inf;
			if (!self.options.yaxis){
				self.ymax = -$M.Plots.inf;
				self.ymin = $M.Plots.inf;
			}
			if (!self.options.zaxis){
				self.zmax = -$M.Plots.inf;
				self.zmin = $M.Plots.inf;
			}
			for (var i = 0, l = self.data.length; i < l; i++){
				cont = self.data[i].data;
				for (var j = 0, k = cont.length; j < k; j++){
					el = cont[j];
					if (el[0] > self.xmax) self.xmax = el[0];
					if (el[0] < self.xmin) self.xmin = el[0];
					if (!self.options.yaxis){
						if (el[1] > self.ymax) self.ymax = el[1];
						if (el[1] < self.ymin) self.ymin = el[1];
					};
					if (!self.options.zaxis){
						if (el[2] > self.zmax) self.zmax = el[2];
						if (el[2] < self.zmin) self.zmin = el[2];
					};
				};
			};
		};
		if (self.xmin >= Number.POSITIVE_INFINITY || self.ymin >= Number.POSITIVE_INFINITY ||
										 self.zmin >= Number.POSITIVE_INFINITY)
			return;

		self.coeffX = function() {
			var dlt = (self.xmax - self.xmin);
			dlt = dlt == 0? 0.1:dlt;
			return (self.width)/ (dlt * 1.5);
		};
		self.deltaX = function(){
			return self.coeffX() * self.xmin + self.width / 3;
		};
		self.coeffY = function(){
			var dlt = (self.ymax - self.ymin);
			dlt = dlt == 0? 0.1:dlt;
			return (self.width)/ (dlt * 1.5);
		};
		self.deltaY = function(){
			return self.coeffY() * self.ymin + self.width/3;
		};
		self.coeffZ = function(){
			var dlt = (self.zmax - self.zmin);
			dlt = dlt == 0 ? 0.1 : dlt;
			return (self.width)/ (dlt * 1.5);
		};
		self.deltaZ = function(){
			return self.coeffZ() * self.zmin + self.width / 3;
		};

		if (!self.options.xaxis){
			self.options.xaxis = self._getAxis(self.xmin, self.xmax,
							 Math.floor(self.width / 50));
		};
		if (!self.options.yaxis){
			self.options.yaxis = self._getAxis(self.ymin, self.ymax,
							 Math.floor(self.width / 50));
		};

		if (!self.options.zaxis){
			self.options.zaxis = self._getAxis(self.zmin, self.zmax,
							 Math.floor(self.width / 50));
		};

		self.container = document.createElement('div');
		self.container.style.width = self.width + 'px';
		self.container.style.height = self.width + 'px';
		self.container.style.display = 'inline-block';
		self.container.style.border = '1px solid #eee';
		self.container.style.position = 'relative';
		//self.container.style.padding = '3px';
		self.canvas = document.createElement('canvas');
		self.canvas.width = self.width - 1;//widthDelta;
		self.canvas.height = self.width - 1;//heightDelta;
		self.canvas.cursor = 'default';
		self.container.appendChild(self.canvas);
		self.element.appendChild(self.container);
		if (typeof(window.G_vmlCanvasManager) != 'undefined') {
			window.G_vmlCanvasManager.initElement(self.canvas);
		};
		self.ctx = self.canvas.getContext("2d");
		self.color = options && options.color;
		self.data = data;
		self.center = {x: self.canvas.offsetLeft + self.width/2,
				y: self.canvas.offsetTop + self.width/2};

		self.cursor = {mhold:false, x:0, y:0, dx:0, dy:0, res:true};
		self.quaternion = new $M.Plots.Quaternion([0.5469144735957571, 0.20624185566227893, -0.267479216901699], 0.7120502980363053);

		//new $M.Plots.Quaternion([0.6456, -0.074, 0.0898], 0.7);
		self.canvas.onmousedown = function(){self.cursor.mhold=true;};
		self.canvas.onmouseup = function(ev){
			self.cursor.mhold = false;
			self.cursor.res = true;
		};
		self.canvas.onmouseout = function(event){
			var e = event || window.event;
			var relTarg = e.relatedTarget || e.toElement;
			if (relTarg && relTarg.className && relTarg.className=='PlotText')
				return;
			self.cursor.mhold = false;
			self.cursor.res = true;
		};
		self.canvas.onmousemove = function(event){
			event = event || window.event;
			if (!self.cursor.mhold) return;
			var c = self.getCoords(event);
			if (!c) return;
			if (!self.cursor.res) {
				self.cursor.dx = c.x - self.cursor.x;
				self.cursor.dy = c.y - self.cursor.y;
			} else {
				self.cursor.dx = 0;
				self.cursor.dy = 0;
				self.cursor.res = false;
			};
			self.cursor.x = c.x;
			self.cursor.y = c.y;
			var aX = self.cursor.dx / self.width;
			var aY = self.cursor.dy / self.width;
			//[cos(Q/2),sin(Q/2)v]
			self.quaternion = (new $M.Plots.Quaternion(([0, 1, 0]).mulS(Math.sin(aX)), Math.cos(aX))).
						mul(new $M.Plots.Quaternion(([-1, 0, 0]).mulS(Math.sin(aY)), Math.cos(aY))).
						mul(self.quaternion);
			self._cache_matrix = undefined;
			self.canvasRes();
			self.axis();
			self.plot();
		};

		self.axis();
	};

	this._getAxis = function(mi, ma, count) {
		var delt = (ma - mi) / count;
		var logg = Math.round(Math.log(delt / 10) / Math.log(10));
		var koeff = Math.pow(10, Math.abs(logg));
		if (logg < 0)
			koeff = 1 / koeff;
		var self = this;
		var normal = function(val){
			var el = Math.round( val / koeff ) * koeff;
			return  Math.round(el * self.round) / self.round;
		};
		var axis = [],
		mx = normal(ma),
		mn = normal(mi);
		var step = normal((mx - mn) * 1.1 / count);
		for (var _y = mn; _y <= mx; _y += step)
			axis[axis.length] = Math.round(_y * self.round)/self.round;
		return axis;
	};

	this.canvasRes = function(){
		// reset (clear) canvas
		this.canvas.width = this.canvas.width;
		// Chrome reset fix
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width);
	};

	this.getMatrix = function(){
		if(typeof this._cache_matrix == 'undefined')
			this._cache_matrix = this.quaternion.getMatrix();
		return this._cache_matrix;
	};

	this.getCoords = function(event){
		//alert(event);
		if (!event)
			return null;
		return {x: event.clientX, y: event.clientY};
	};

	this.newCoord = function(c){
		var matrix = this.getMatrix();
		var xRow = matrix[0];
		var yRow = matrix[1];
		var nc = {x: c[0] * this.coeffX() - this.deltaX(),
				y: c[1] * this.coeffY() - this.deltaY(),
				z: c[2] * this.coeffZ() - this.deltaZ()};

		var newX = xRow[0]*nc.x - xRow[1]*nc.y + xRow[2]*nc.z;
		var newY = yRow[0]*nc.x - yRow[1]*nc.y + yRow[2]*nc.z;
		newX = newX + this.width/2;
		newY = newY + this.width/2;
		return {x:newX, y:newY};
	};

	this.line = function(c1, c2, width, color){
		this.ctx.beginPath();
		this.ctx.strokeStyle = color || "black";
		this.ctx.lineCap = 'round';
		if (width)
			this.ctx.lineWidth=width;
		var _c1 = this.newCoord(c1);
		this.ctx.moveTo(_c1.x, _c1.y);
		var _c2 = this.newCoord(c2);
		this.ctx.lineTo(_c2.x, _c2.y);
		this.ctx.stroke();
	};

	this.point = function(c_){
			var c = this.newCoord(c_);
			//$C.ctx.arc(c.x, c.y, 1, 0, Math.PI*2, false);
			this.ctx.moveTo(c.x, c.y);
			this.ctx.lineTo(++c.x, ++c.y);
	};

	this.axis = function(){
		var llines = [
			[[this.xmax, this.ymin, this.zmin],
			 [this.xmax, this.ymax, this.zmin]],
			[[this.xmin, this.ymax, this.zmin],
			 [this.xmax, this.ymax, this.zmin]],
			[[this.xmax, this.ymax, this.zmin],
			 [this.xmax, this.ymax, this.zmax]],
			[[this.xmax, this.ymin, this.zmax],
			 [this.xmax, this.ymax, this.zmax]],
			[[this.xmin, this.ymax, this.zmax],
			 [this.xmax, this.ymax, this.zmax]],
			[[this.xmax, this.ymin, this.zmin],
			 [this.xmax, this.ymin, this.zmax]]
		];
		for (var f=0, p=llines.length; f < p; f++) {
			this.line(llines[f][0], llines[f][1], 0.4, 'rgba(200,200,200,0.6)');
		}

		var lines = [
			[[this.xmin, this.ymin, this.zmin],
			 [this.xmax, this.ymin, this.zmin]],
			[[this.xmin, this.ymin, this.zmin],
			 [this.xmin, this.ymax, this.zmin]],
			[[this.xmin, this.ymax, this.zmin],
			 [this.xmin, this.ymax, this.zmax]]
		];
		var a = ['x', 'y', 'z'],
			aX = ['X','Y','Z'];
		for (var i = 0; i < 3; i++){
			var cline = lines[i];
			this.line(cline[0], cline[1]);
			var axs = i==0 ? this.options.xaxis: (i==1 ? this.options.yaxis : this.options.zaxis);
			var from = cline[0].slice(0);
			var to = cline[0].slice(0);
			var to_txt = cline[0].slice(0);
			var path = i==1 ? 0 : 1;
			var cf = path == 0? this.coeffX(): this.coeffY();
			to[path] += (i==2 ? 4 : -4) / cf;
			to_txt[path] += (i==2 ? 22 : -12) / cf;
			for( var j=0, k=axs.length; j < k; j++){
				var el = axs[j];
				from[i] = el;
				to[i] = el;
				to_txt[i] = el;
				this.line(from, to, 1);
				this.textPoint(to_txt, el + '');
			};
			this.textPoint(cline[1], aX[i]);
		}
	};

	this.textPoint = function(point, text){
		var _id = 'ch3d' + this._id +'_'+ point[0]+''+point[1]+''+point[2];
		var dv = document.getElementById(_id);
		var _new = false;
		if (!dv){
			_new = true;
			dv = document.createElement('span');
			dv.className = "PlotText";
			dv.setAttribute("id", _id);
			dv.setAttribute("unselectable", "on"); // for IE
			dv.innerHTML = text;
		}
		var nc = this.newCoord(point);
		if (nc.x < -5 || nc.x > this.width - 5 || nc.y < -5 || nc.y > this.width - 5) {
			dv.style.visibility = "hidden";
		} else {
			dv.style.visibility = "visible";
			dv.style.left = nc.x + 'px';
			dv.style.top = nc.y + 'px';
		}
		if (_new)
			this.container.appendChild(dv);
	};

	this.plot = function(color){
		if (typeof this.ctx == 'undefined')
			return;
		for (var i = 0, l = this.data.length; i < l; i++){
			var cont = this.data[i],
				el;
			this.ctx.beginPath();
			this.ctx.strokeStyle = cont.color;
			this.ctx.lineWidth = 2;
			this.ctx.lineCap = 'round';
			for (var j=0, k=cont.data.length; j < k; j++){
				el = cont.data[j];
				if (isNaN(el[0]) || isNaN(el[1]) || isNaN(el[2]))
					continue;
				this.point(el);
			};
			this.ctx.stroke();
		};
	};
};

})(window, undefined);
