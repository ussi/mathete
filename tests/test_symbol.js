$(document).ready(function(){

	$M.Env.setUp();

	var art = new $M.Article();

	module("Symbols Test");
	test("x test", function(){
		var pr = $M.parse('x');
		expect(3);
		ok(pr.isSym, 'it`s symbol');
		equals('x', pr+'', 'Expected equals');
		equals('x', pr.getResult(new $M.NameSpace)+'', 'Expected equals');
	});

	test("xnmer test", function(){
		var pr = $M.parse('xnmer');
		expect(3);
		ok(pr.isSym, 'it`s symbol');
		equals('xnmer', pr+'', 'Expected equals');
		equals('xnmer', pr.getResult(new $M.NameSpace)+'', 'Expected equals');
	});

	test("X_z test", function(){
		var pr = $M.parse('X_z');
		expect(3);
		ok(pr.isSym, 'it`s symbol');
		equals('X_z', pr+'', 'Expected equals');
		equals('X_z', pr.getResult(new $M.NameSpace)+'', 'Expected equals');
	});

	test("Внг test", function(){
		var pr = $M.parse('Внг');
		expect(3);
		ok(pr.isSym, 'it`s symbol');
		equals('Внг', pr+'', 'Expected equals');
		equals('Внг', pr.getResult(new $M.NameSpace)+'', 'Expected equals');
	});

	test("Внг_ап test", function(){
		var pr = $M.parse('Внг_ап');
		expect(3);
		ok(pr.isSym, 'it`s symbol');
		equals('Внг_ап', pr+'', 'Expected equals');
		equals('Внг_ап', pr.getResult(new $M.NameSpace)+'',
						 'Expected equals');
	});

	test("Внг_675 test", function(){
		var pr = $M.parse('Внг_675');
		expect(3);
		ok(pr.isSym, 'it`s symbol');
		equals('Внг_675', pr+'', 'Expected equals');
		equals('Внг_675', pr.getResult(new $M.NameSpace)+'',
				  'Expected equals');
	});

	test("-x test", function(){
		var pr = $M.parse('-x');
		expect(3);
		ok(pr.isNeg, 'it`s neg');
		ok(pr.args[0].isSym, 'it`s neg');
		equals('-x', pr+'', 'Expected equals');
	});

	module("Association Test");

	test("x=67 test", function(){
		var art = new $M.Article('math_', ['x=67'], 3);
		expect(3);
		var pr = art.paragraphs[0].subpars[0];
		ok(pr.isAss, 'it`s association');
		equals('x = 67', pr + '', 'Expected equals');
		art.calc();
		equals(67, art.ns.get('x'), 'Expected x in NS');
	});

	test("x= 67.5 test", function(){
		var art = new $M.Article('math_', ['x= 67.5'], 3);
		expect(3);
		var pr = art.paragraphs[0].subpars[0];
		ok(pr.isAss, 'it`s association');
		equals('x = 67.5', pr + '', 'Expected equals');
		art.calc();
		equals(67.5, art.ns.get('x'), 'Expected x in NS');
	});

	test("x=y_1=67.5 test", function(){
		var art = new $M.Article('math_', ['x=y_1=67.5'], 3);
		expect(4);
		var pr = art.paragraphs[0].subpars[0];
		ok(pr.isAss, 'it`s association');
		equals('x = y_1 = 67.5', pr + '', 'Expected equals');
		art.calc();
		equals(67.5, art.ns.get('x'), 'Expected equals');
		equals(67.5, art.ns.get('y_1'), 'Expected equals');
	});

	test("x=y_1=Z_ф=67.5+4 test", function(){
		var art = new $M.Article('math_', ['x=y_1=Z_ф=67.5+4'], 3);
		expect(5);
		pr = art.paragraphs[0].subpars[0];
		ok(pr.isAss, 'it`s association');
		equals('x = y_1 = Z_ф = 67.5 + 4', pr + '', 'Expected equals');
		art.calc();
		equals(71.5, art.ns.get('x'), 'Expected equals');
		equals(71.5, art.ns.get('y_1'), 'Expected equals');
		equals(71.5, art.ns.get('Z_ф'), 'Expected equals');
	});

	test("x=67; x=34.5 test", function(){
		var pr1 = 'x=67';
		var pr2 = 'x=34.5';
		var art1 = new $M.Article('math_', [pr1, pr2], 3);
		var art2 = new $M.Article('math_', [pr2, pr1], 3);
		expect(4);
		art1.calc();
		equals(34.5, art1.ns.get('x'), 'Expected x in NS');
		art1.calc();
		equals(34.5, art1.ns.get('x'), 'recalculate give same result');

		art2.calc();
		equals(67, art2.ns.get('x'), 'Expected x in NS');
		art2.calc();
		equals(67, art2.ns.get('x'), 'recalculate give same result');
	});

	test("x=67; x=x+x test", function(){
		var pr1 = 'x=67';
		var pr2 = 'x=x+x';
		var art1 = new $M.Article('math_', [pr1, pr2], 3);
		expect(2);
		art1.calc();
		equals(134, art1.ns.get('x'), 'Expected x in NS');
		art1.calc();
		equals(134, art1.ns.get('x'), 'recalculate give same result');

	});

	test("k=k; m=-k test", function(){
		var pr1 = 'k=k';
		var pr2 = 'm=-k';
		var art1 = new $M.Article('math_', [pr1, pr2], 3);
		expect(10);
		art1.calc();
		equals('k', art1.ns.get('k')+'', 'Expected k in NS');
		ok(typeof art1.ns.get('k') === 'string', 'k is symbol');
		equals('-k', art1.ns.get('m')+'', 'm is -k');
		ok(art1.ns.get('m').isMul, 'm  is mul');
		equals(-1, art1.ns.get('m').args[0], 'koeff -1');
		art1.calc();
		equals('k', art1.ns.get('k')+'', 'Expected k in NS (recalc)');
		ok(typeof art1.ns.get('k') === 'string', 'k is symbol(recalc)');
		equals('-k', art1.ns.get('m')+'', 'm is -k(recalc)');
		ok(art1.ns.get('m').isMul, 'm  is mul(recalc)');
		equals(-1, art1.ns.get('m').args[0], 'koeff -1(recalc)');
	});

	test("k=k; m=k+k test", function(){
		var pr1 = 'k=k';
		var pr2 = 'm=k+k';
		var art1 = new $M.Article('math_', [pr1, pr2], 3);
		expect(4);
		art1.calc();
		equals('k', art1.ns.get('k')+'', 'Expected k in NS');
		equals('2 * k', art1.ns.get('m')+'', 'Expected m in NS');
		art1.calc();
		art1.calc();
		equals('k', art1.ns.get('k')+'', 'Expected k in NS');
		equals('2 * k', art1.ns.get('m')+'', 'Expected m in NS');
	});

});
