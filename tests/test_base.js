$(document).ready(function(){

	$M.Env.setUp();

	var art = new $M.Article();
	$M.activeArticle = art;

	module("Basic Number Test");
	test("simple number 12 test", function(){
		var pr = $M.parse('12');
		expect(2);
		ok(typeof pr == 'number', 'it`s number');
		equals(12, pr, 'Expected equals');
	});

	test("simple number 12.78 test", function(){
		var pr = $M.parse('12.78');
		expect(2);
		ok(typeof pr == 'number', 'it`s number');
		equals(12.78, pr, 'Expected equals');
	});

	module("Basic Additional Test");
	test("1+2 test", function(){
		var pr = $M.parse('1+2');
		expect(3);
		ok(pr.isAdd, 'it`s additional');
		equals('1 + 2', pr+'', 'Expected equals');
		equals(3, pr.getResult(art.ns), 'Expected equals');
	});

	test("1+2+3 test", function(){
		var pr = $M.parse(' 1+2+ 3');
		expect(3);
		ok(pr.isAdd, 'it`s additional');
		equals('1 + 2 + 3', pr+'', 'Expected equals');
		equals(6, pr.getResult(art.ns), 'Expected equals');
	});

	test("1.1+2+3.04 test", function(){
		var pr = $M.parse(' 1.1+2  + 3.04 ');
		expect(3);
		ok(pr.isAdd, 'it`s additional');
		equals('1.1 + 2 + 3.04', pr + '', 'Expected equals');
		equals(6.14, pr.getResult(art.ns).toFixed(3), 'Expected equals');
	});

	test("1.1+2+3.04+5.5+6.6+7.7+903+78.9+0.23 test", function(){
		var pr = $M.parse('1.1+2+3.04+5.5+6.6+7.7 +903+78.9+ 0.23 ');
		expect(3);
		ok(pr.isAdd, 'it`s additional');
		equals('1.1 + 2 + 3.04 + 5.5 + 6.6 + 7.7 + 903 + 78.9 + 0.23', pr + '', 'Expected equals');
		equals(1008.07, pr.getResult(art.ns).toFixed(3), 'Expected equals');
	});


	module("Basic Suscription Test");
	test("11-2 test", function(){
		var pr = $M.parse('11-2');
		expect(3);
		ok(pr.isAdd, 'it`s additional');
		equals('11 - 2', pr+'', 'Expected equals');
		equals(9, pr.getResult(art.ns), 'Expected equals');
	});

	test("1-2-3 test", function(){
		var pr = $M.parse(' 1 -2- 3');
		expect(3);
		ok(pr.isAdd, 'it`s additional');
		equals('1 - 2 - 3', pr+'', 'Expected equals');
		equals(-4, pr.getResult(art.ns), 'Expected equals');
	});

	test("1.1-2-3.04 test", function(){
		var pr = $M.parse(' 1.1-2  - 3.04 ');
		expect(3);
		ok(pr.isAdd, 'it`s additional');
		equals('1.1 - 2 - 3.04', pr + '', 'Expected equals');
		equals(-3.94, pr.getResult(art.ns).toFixed(3), 'Expected equals');
	});

	module("Basic Multiple Test");
	test("1*2 test", function(){
		var pr = $M.parse('1*2');
		expect(3);
		ok(pr.isMul, 'it`s multiple');
		equals('1 * 2', pr+'', 'Expected equals');
		equals(2, pr.getResult(art.ns), 'Expected equals');
	});

	test("1 * 2 * 3 test", function(){
		var pr = $M.parse(' 1*2* 3');
		expect(3);
		ok(pr.isMul, 'it`s multiple');
		equals('1 * 2 * 3', pr + '', 'Expected equals');
		equals(6, pr.getResult(art.ns), 'Expected equals');
	});

	test("1.1 * 2 * 3.04 test", function(){
		var pr = $M.parse(' 1.1*2  * 3.04 ');
		expect(3);
		ok(pr.isMul, 'it`s multiple');
		equals('1.1 * 2 * 3.04', pr + '', 'Expected equals');
		equals(6.688, pr.getResult(art.ns).toFixed(4), 'Expected equals');
	});

	test("1.1*2*3.04*5.5*6.6*7.7*903*78.9*0.23 test", function(){
		var pr = $M.parse('1.1*2*3.04*5.5*6.6*7.7 *903*78.9* 0.23 ');
		expect(3);
		ok(pr.isMul, 'it`s multiple');
		equals('1.1 * 2 * 3.04 * 5.5 * 6.6 * 7.7 * 903 * 78.9 * 0.23', pr + '', 'Expected equals');
		equals('30632765.3495741', pr.getResult(art.ns).toFixed(7)+'', 'Expected equals');
	});

	test("1.1*2*3.04*5.5*6.6*7.7*903*78.9*0 test", function(){
		var pr = $M.parse('1.1*2*3.04*5.5*6.6*7.7 *903*78.9* 0 ');
		expect(3);
		ok(pr.isMul, 'it`s multiple');
		equals('1.1 * 2 * 3.04 * 5.5 * 6.6 * 7.7 * 903 * 78.9 * 0', pr + '', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	module("Basic Division Test");
	test("1/2 test", function(){
		var pr = $M.parse('1/2');
		expect(3);
		ok(pr.isDiv, 'it`s division');
		equals('1 / 2', pr+'', 'Expected equals');
		equals(0.5, pr.getResult(art.ns), 'Expected equals');
	});

	test("12 / 3 / 2 test", function(){
		var pr = $M.parse(' 12/ 3/2');
		expect(3);
		ok(pr.isDiv, 'it`s division');
		equals('(12 / 3) / 2', pr + '', 'Expected equals');
		equals(2, pr.getResult(art.ns), 'Expected equals');
	});

	test("0/3/2 test", function(){
		var pr = $M.parse(' 0/ 3/2');
		expect(3);
		ok(pr.isDiv, 'it`s division');
		equals('(0 / 3) / 2', pr + '', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("12/3/2/0.45 test", function(){
		var pr = $M.parse(' 12/ 3/2  /0.45 ');
		expect(3);
		ok(pr.isDiv, 'it`s division');
		equals('((12 / 3) / 2) / 0.45', pr + '', 'Expected equals');
		equals(pr.getResult(art.ns).toFixed(7), '4.4444444', 'Expected equals');
	});

	test("zero division test", function(){
		var pr = $M.parse(' 3.5/ 0');
		expect(3);
		ok(pr.isDiv, 'it`s division');
		equals( pr + '', '3.5 / 0', 'Expected equals');
		ok(pr.getResult(art.ns) >= Number.POSITIVE_INFINITY, 'result is Infinity');
	});

	module("Basic Power Test");
	test("1^2 test", function(){
		var pr = $M.parse('1^2');
		expect(3);
		ok(pr.isPow, 'it`s power');
		equals('1 ^ 2', pr+'', 'Expected equals');
		equals(1, pr.getResult(art.ns), 'Expected equals');
	});

	test("1.2^3^2 test", function(){
		var pr = $M.parse(' 1.2^ 3^2');
		expect(3);
		ok(pr.isPow, 'it`s power');
		equals('1.2 ^ 3 ^ 2', pr + '', 'Expected equals');
		equals(5.1597804, pr.getResult(art.ns).toFixed(9), 'Expected equals');
	});

	module("Basic Sqrt Test");
	test("\\2 test", function(){
		var pr = $M.parse('\\ 2');
		expect(3);
		ok(pr.isRoot, 'it`s root');
		equals('\\2', pr+'', 'Expected equals');
		equals(1.4142136, pr.getResult(art.ns), 'Expected equals');
	});

	test("\\\\32.4 test", function(){
		var pr = $M.parse(' \\\\ 32.4');
		expect(3);
		ok(pr.isRoot, 'it`s root');
		equals('\\\\32.4', pr + '', 'Expected equals');
		equals(2.3858122, pr.getResult(art.ns).toFixed(9), 'Expected equals');
	});

	test("\\\\\\\\\\32.4 test", function(){
		var pr = $M.parse(' \\\\\\\\\\ 32.4');
		expect(3);
		ok(pr.isRoot, 'it`s root');
		equals('\\\\\\\\\\32.4', pr + '', 'Expected equals');
		equals(1.1148194, pr.getResult(art.ns).toFixed(9), 'Expected equals');
	});

	module("Basic Root Test");
	test("3\\512 test", function(){
		var pr = $M.parse('3\\ 512');
		expect(3);
		ok(pr.isRoot, 'it`s root');
		equals('3\\512', pr+'', 'Expected equals');
		equals(8, pr.getResult(art.ns).toFixed(5), 'Expected equals');
	});

	test("3\\\\32.4 test", function(){
		var pr = $M.parse(' 3\\\\ 32.4');
		expect(3);
		ok(pr.isRoot, 'it`s root');
		equals('3\\\\32.4', pr + '', 'Expected equals');
		equals(1.7854903, pr.getResult(art.ns).toFixed(9), 'Expected equals');
	});

	test("3\\\\32.4\\456.78 test", function(){
		var pr = $M.parse(' 3\\\\32.4\\456.78 ');
		expect(3);
		ok(pr.isRoot, 'it`s root');
		equals('3\\(\\32.4)\\456.78', pr + '', 'Expected equals');
		equals(1.4313779, pr.getResult(art.ns).toFixed(9), 'Expected equals');
	});


	module("Negative numbers Test");
	test("-23 test", function(){
		var pr = $M.parse('-23');
		expect(3);
		equals(typeof pr, 'number', 'Expected equals');
		equals('-23', pr+'', 'Expected equals');
		equals(-23, pr.getResult(art.ns), 'Expected equals');
	});

	test("-23+5 test", function(){
		var pr = $M.parse('-23+5');
		expect(3);
		ok(pr.isAdd, 'it`s add');
		equals('-23 + 5', pr+'', 'Expected equals');
		equals(-18, pr.getResult(art.ns), 'Expected equals');
	});

	test("16.2--5 test", function(){
		var pr = $M.parse('16.2 --5');
		expect(3);
		ok(pr.isAdd, 'it`s add');
		equals('16.2 + 5', pr+'', 'Expected equals');
		equals(21.2, pr.getResult(art.ns), 'Expected equals');
	});

	test("-23*5 test", function(){
		var pr = $M.parse('-23*5');
		expect(4);
		ok(pr.isMul, 'it`s mul');
		equals(pr.args[0], -23, 'first arg is -23');
		equals('-23 * 5', pr+'', 'Expected equals');
		equals(-115, pr.getResult(art.ns), 'Expected equals');
	});

	test("-23*-5 test", function(){
		var pr = $M.parse('-23*-5');
		expect(5);
		ok(pr.isMul, 'it`s neg');
		equals(pr.args[0], -23, 'first arg is -23');
		equals(pr.args[1], -5, 'first arg is -5');
		equals('-23 * -5', pr+'', 'Expected equals');
		equals(115, pr.getResult(art.ns), 'Expected equals');
	});

	test("-23^5 test", function(){
		var pr = $M.parse('-23^5');
		expect(4);
		ok(pr.isNeg, 'it`s neg');
		ok(pr.args[0].isPow, 'arg is power');
		equals('-23 ^ 5', pr+'', 'Expected equals');
		equals(-6436343, pr.getResult(art.ns), 'Expected equals');
	});

	test("-23/5 test", function(){
		var pr = $M.parse('-23/5');
		expect(4);
		ok(pr.isDiv, 'it`s neg');
		equals(pr.args[0], -23, 'first arg is -23');
		equals('-23 / 5', pr + '', 'Expected equals');
		equals(-4.6, pr.getResult(art.ns), 'Expected equals');
	});



	module("Complex Actions Test");
	test("1+2*3 test", function(){
		var pr = $M.parse('1+2*3');
		expect(5);
		ok(pr.isAdd, 'it`s additional');
		ok(pr.args[1].isMul, 'second argument multiple');
		equals('2 * 3', pr.args[1]+'', 'Expected equals');
		equals('1 + 2 * 3', pr+'', 'Expected equals');
		equals(7, pr.getResult(art.ns), 'Expected equals');
	});

	test("(1+2)*3 test", function(){
		var pr = $M.parse(' (1+2)* 3');
		expect(5);
		ok(pr.isMul, 'it`s multiple');
		ok(pr.args[0].isAdd, 'first argument addition');
		equals('1 + 2', pr.args[0]+'', 'Expected equals');
		equals('(1 + 2) * 3', pr+'', 'Expected equals');
		equals(9, pr.getResult(art.ns), 'Expected equals');
	});

	test("4*(1+2)*3 test", function(){
		var pr = $M.parse(' 4*(1+2)* 3');
		expect(5);
		ok(pr.isMul, 'it`s multiple');
		ok(pr.args[1].isAdd, 'second argument addition');
		equals('1 + 2', pr.args[1]+'', 'Expected equals');
		equals('4 * (1 + 2) * 3', pr+'', 'Expected equals');
		equals(36, pr.getResult(art.ns), 'Expected equals');
	});

	test("(1+2)*(3+4) test", function(){
		var pr = $M.parse(' (1+2)* (3+4)');
		expect(7);
		ok(pr.isMul, 'it`s multiple');
		ok(pr.args[0].isAdd, 'first argument addition');
		ok(pr.args[1].isAdd, 'second argument addition');
		equals('3 + 4', pr.args[1]+'', 'Expected equals');
		equals('1 + 2', pr.args[0]+'', 'Expected equals');
		equals('(1 + 2) * (3 + 4)', pr+'', 'Expected equals');
		equals(21, pr.getResult(art.ns), 'Expected equals');
	});


	test("1+2^3 test", function(){
		var pr = $M.parse('1+2^3');
		expect(5);
		ok(pr.isAdd, 'it`s additional');
		ok(pr.args[1].isPow, 'second argument multiple');
		equals('2 ^ 3', pr.args[1]+'', 'Expected equals');
		equals('1 + 2 ^ 3', pr+'', 'Expected equals');
		equals(9, pr.getResult(art.ns), 'Expected equals');
	});

	test("(1+2)^3 test", function(){
		var pr = $M.parse(' (1+2) ^ 3');
		expect(5);
		ok(pr.isPow, 'it`s power');
		ok(pr.args[0].isAdd, 'first argument is addition');
		equals('1 + 2', pr.args[0]+'', 'Expected equals');
		equals('(1 + 2) ^ 3', pr+'', 'Expected equals');
		equals(27, pr.getResult(art.ns), 'Expected equals');
	});

	test("4^(1+2)^3 test", function(){
		var pr = $M.parse(' 4^(1+2)^ 3');
		expect(5);
		ok(pr.isPow, 'it`s power');
		ok(pr.args[1].isPow, 'second argument is power');
		equals('(1 + 2) ^ 3', pr.args[1]+'', 'Expected equals');
		equals('4 ^ (1 + 2) ^ 3', pr+'', 'Expected equals');
		equals(18014398509481984, pr.getResult(art.ns), 'Expected equals');
	});

	test("(1+2)^(3+4) test", function(){
		var pr = $M.parse(' (1+2)^ (3+4)');
		expect(7);
		ok(pr.isPow, 'it`s power');
		ok(pr.args[0].isAdd, 'first argument addition');
		ok(pr.args[1].isAdd, 'second argument addition');
		equals('3 + 4', pr.args[1]+'', 'Expected equals');
		equals('1 + 2', pr.args[0]+'', 'Expected equals');
		equals('(1 + 2) ^ (3 + 4)', pr+'', 'Expected equals');
		equals(2187, pr.getResult(art.ns), 'Expected equals');
	});

	test("(1+2)\\(3+24) test", function(){
		var pr = $M.parse(' (1+2)\\ (3+24)');
		expect(7);
		ok(pr.isRoot, 'it`s root');
		ok(pr.args[0].isAdd, 'first argument addition');
		ok(pr.args[1].isAdd, 'second argument addition');
		equals('1 + 2', pr.args[0]+'', 'Expected equals');
		equals('3 + 24', pr.args[1]+'', 'Expected equals');
		equals('(1 + 2)\\(3 + 24)', pr+'', 'Expected equals');
		equals(3, pr.getResult(art.ns), 'Expected equals');
	});


	test("1/2*3 test", function(){
		var pr = $M.parse(' 1/2*3');
		expect(5);
		ok(pr.isMul, 'it`s mul');
		ok(pr.args[0].isDiv, 'first argument is div');
		equals('1 / 2', pr.args[0]+'', 'Expected equals');
		equals('1 / 2 * 3', pr+'', 'Expected equals');
		equals(1.5, pr.getResult(art.ns), 'Expected equals');
	});

	test("1/\\4*9 test", function(){
		var pr = $M.parse(' 1/\\4*9');
		expect(6);
		ok(pr.isMul, 'it`s mul');
		ok(pr.args[0].isDiv, 'first argument is div');
		ok(pr.args[0].args[1].isRoot, 'denom of div is root');
		equals('1 / (\\4)', pr.args[0]+'', 'Expected equals');
		equals('1 / (\\4) * 9', pr+'', 'Expected equals');
		equals(4.5, pr.getResult(art.ns), 'Expected equals');
	});

	test("1+2*3^4 test", function(){
		var pr = $M.parse(' 1+2*3^4');
		expect(6);
		ok(pr.isAdd, 'it`s power');
		ok(pr.args[1].isMul, 'second argument is mul');
		ok(pr.args[1].args[1].isPow, 'second argument is pow');
		equals('2 * 3 ^ 4', pr.args[1]+'', 'Expected equals');
		equals('1 + 2 * 3 ^ 4', pr+'', 'Expected equals');
		equals(163, pr.getResult(art.ns), 'Expected equals');
	});

	test("1+2*3^\\16 test", function(){
		var pr = $M.parse(' 1+2*3^\\16');
		expect(6);
		ok(pr.isAdd, 'it`s power');
		ok(pr.args[1].isMul, 'second argument is mul');
		ok(pr.args[1].args[1].isPow, 'second argument is pow');
		equals('2 * 3 ^ \\16', pr.args[1]+'', 'Expected equals');
		equals('1 + 2 * 3 ^ \\16', pr+'', 'Expected equals');
		equals(163, pr.getResult(art.ns), 'Expected equals');
	});

	test("(1+2)*3^4 test", function(){
		var pr = $M.parse(' (1+2)*3^4');
		expect(5);
		ok(pr.isMul, 'it`s power');
		ok(pr.args[1].isPow, 'second argument is mul');
		equals('3 ^ 4', pr.args[1]+'', 'Expected equals');
		equals('(1 + 2) * 3 ^ 4', pr+'', 'Expected equals');
		equals(243, pr.getResult(art.ns), 'Expected equals');
	});

});
