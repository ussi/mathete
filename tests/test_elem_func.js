$(document).ready(function(){

	$M.Env.setUp();

	var art = new $M.Article();

	module("Elementary Functions Test");
	test("sin(1) test", function(){
		var pr = $M.parse('sin(1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('sin(1)', pr+'', 'Expected equals');
		equals(0.841471, pr.getResult(art.ns), 'Expected equals');
	});

	test("sin(0) test", function(){
		var pr = $M.parse('sin(0)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('sin(0)', pr+'', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("sin(-1) test", function(){
		var pr = $M.parse('sin(-1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('sin(-1)', pr+'', 'Expected equals');
		equals(-0.841471, pr.getResult(art.ns), 'Expected equals');
	});

	test("sin(5.2) test", function(){
		var pr = $M.parse('sin(5.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('sin(5.2)', pr+'', 'Expected equals');
		equals(-0.8834547, pr.getResult(art.ns), 'Expected equals');
	});


	test("cos(1) test", function(){
		var pr = $M.parse('cos (1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('cos(1)', pr+'', 'Expected equals');
		equals(0.5403023, pr.getResult(art.ns), 'Expected equals');
	});

	test("cos(0) test", function(){
		var pr = $M.parse('cos(0)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('cos(0)', pr+'', 'Expected equals');
		equals(1, pr.getResult(art.ns), 'Expected equals');
	});

	test("cos(-1) test", function(){
		var pr = $M.parse('cos(-1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('cos(-1)', pr+'', 'Expected equals');
		equals(0.5403023, pr.getResult(art.ns), 'Expected equals');
	});

	test("cos(5.2) test", function(){
		var pr = $M.parse('cos(5.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('cos(5.2)', pr+'', 'Expected equals');
		equals(0.4685167, pr.getResult(art.ns), 'Expected equals');
	});

	test("tan(1) test", function(){
		var pr = $M.parse('tan (1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('tan(1)', pr+'', 'Expected equals');
		equals(1.5574077, pr.getResult(art.ns), 'Expected equals');
	});

	test("tan(0) test", function(){
		var pr = $M.parse('tan(0)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('tan(0)', pr+'', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("tan(-1) test", function(){
		var pr = $M.parse('tan(-1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('tan(-1)', pr+'', 'Expected equals');
		equals(-1.5574077, pr.getResult(art.ns), 'Expected equals');
	});

	test("tan(5.2) test", function(){
		var pr = $M.parse('tan(5.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('tan(5.2)', pr+'', 'Expected equals');
		equals(-1.8856419, pr.getResult(art.ns), 'Expected equals');
	});


	test("asin(1) test", function(){
		var pr = $M.parse('asin(1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('asin(1)', pr+'', 'Expected equals');
		equals(1.5707963, pr.getResult(art.ns), 'Expected equals');
	});

	test("asin(0) test", function(){
		var pr = $M.parse('asin(0)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('asin(0)', pr+'', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("asin(-1) test", function(){
		var pr = $M.parse('asin(-1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('asin(-1)', pr+'', 'Expected equals');
		equals(-1.5707963, pr.getResult(art.ns), 'Expected equals');
	});

	test("asin(1.2) test", function(){
		var pr = $M.parse('asin(1.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('asin(1.2)', pr+'', 'Expected equals');
		ok(isNaN(pr.getResult(art.ns)), 'Expected equals');
	});


	test("acos(1) test", function(){
		var pr = $M.parse('acos (1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('acos(1)', pr+'', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("acos(0) test", function(){
		var pr = $M.parse('acos(0)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('acos(0)', pr+'', 'Expected equals');
		equals(1.5707963, pr.getResult(art.ns), 'Expected equals');
	});

	test("acos(-1) test", function(){
		var pr = $M.parse('acos(-1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('acos(-1)', pr+'', 'Expected equals');
		equals(3.1415927, pr.getResult(art.ns), 'Expected equals');
	});

	test("acos(1.2) test", function(){
		var pr = $M.parse('acos(1.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('acos(1.2)', pr+'', 'Expected equals');
		ok(isNaN(pr.getResult(art.ns)), 'Expected equals');
	});

	test("atan(1) test", function(){
		var pr = $M.parse('atan (1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('atan(1)', pr+'', 'Expected equals');
		equals(0.7853982, pr.getResult(art.ns), 'Expected equals');
	});

	test("atan(0) test", function(){
		var pr = $M.parse('atan(0)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('atan(0)', pr+'', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("atan(-1) test", function(){
		var pr = $M.parse('atan(-1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('atan(-1)', pr+'', 'Expected equals');
		equals(-0.7853982, pr.getResult(art.ns), 'Expected equals');
	});

	test("atan(5.2) test", function(){
		var pr = $M.parse('atan(5.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('atan(5.2)', pr+'', 'Expected equals');
		equals(1.380808, pr.getResult(art.ns), 'Expected equals');
	});

	test("ln(1) test", function(){
		var pr = $M.parse('ln (1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('ln(1)', pr+'', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("ln(0) test", function(){
		var pr = $M.parse('ln(0)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('ln(0)', pr+'', 'Expected equals');
		ok(pr.getResult(art.ns)<=Number.NEGATIVE_INFINITY, 'Expected equals');
	});

	test("ln(-1) test", function(){
		var pr = $M.parse('ln(-1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('ln(-1)', pr+'', 'Expected equals');
		ok(isNaN(pr.getResult(art.ns)), 'Expected equals');
	});

	test("ln(5.2) test", function(){
		var pr = $M.parse('ln(5.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('ln(5.2)', pr+'', 'Expected equals');
		equals(1.6486586, pr.getResult(art.ns), 'Expected equals');
	});

	test("log(2, 1) test", function(){
		var pr = $M.parse('log (2, 1)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('log(2, 1)', pr+'', 'Expected equals');
		equals(0, pr.getResult(art.ns), 'Expected equals');
	});

	test("log(4, 12) test", function(){
		var pr = $M.parse('log(4, 12)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('log(4, 12)', pr+'', 'Expected equals');
		equals(1.7924813, pr.getResult(art.ns), 'Expected equals');
	});

	test("log(12, 4) test", function(){
		var pr = $M.parse('log(12, 4)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('log(12, 4)', pr+'', 'Expected equals');
		equals(0.5578859, pr.getResult(art.ns), 'Expected equals');
	});

	test("log(0.5, 5.2) test", function(){
		var pr = $M.parse('log(0.5, 5.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('log(0.5, 5.2)', pr+'', 'Expected equals');
		equals(-2.3785116, pr.getResult(art.ns), 'Expected equals');
	});

	module("Complex Functions Test");
	test("sin(2*4/(3.5+0.5)-1) test", function(){
		var pr = $M.parse('sin(2*4/(3.5+0.5)-1)');
		expect(6);
		ok(pr.isFunc, 'it`s function');
		ok(pr.args[0].isAdd, 'argument is add');
		equals(pr.args[0].args[1], -1, 'second argument is -1');
		equals(pr.args[0].args[0].isDiv, true, 'first argument is div');
		equals('sin((2 * 4) / (3.5 + 0.5) - 1)', pr+'', 'Expected equals');
		equals(0.841471, pr.getResult(art.ns), 'Expected equals');
	});

	test("cos(sin(2*4/(3.5+0.5)-1)) test", function(){
		var pr = $M.parse('cos ( sin(2*4/(3.5+0.5)-1))');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals(pr + '', 'cos(sin((2 * 4) / (3.5 + 0.5) - 1))',
		   'Expected equals');
		equals(0.6663667, pr.getResult(art.ns), 'Expected equals');
	});

	test("tan(cos(sin(2*4/(3.5+0.5)-1))) test", function(){
		var pr = $M.parse(' tan(cos ( sin(2*4/(3.5+0.5)-1)) )');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals(pr + '', 'tan(cos(sin((2 * 4) / (3.5 + 0.5) - 1)))',
		   'Expected equals');
		equals(0.7863573, pr.getResult(art.ns), 'Expected equals');
	});

	test("log(\4/(2+2), 2^2 + 1.2) test", function(){
		var pr = $M.parse('log(\\4/(2+2), 2^2+1.2)');
		expect(3);
		ok(pr.isFunc, 'it`s function');
		equals('log((\\4) / (2 + 2), 2 ^ 2 + 1.2)', pr+'', 'Expected equals');
		equals(-2.3785116, pr.getResult(art.ns), 'Expected equals');
	});

});
