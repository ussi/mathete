$(document).ready(function(){

	$M.Env.setUp();

	var art = new $M.Article();
	$M.activeArticle = art;

	module("Vector Test");

	test("[12.3] test", function(){
		var pr = $M.parse('[12.3]');
		expect(4);
		ok(pr.isArray, 'it`s array');
		equals('[12.3]', pr+'', 'Expected equals');
		equals('[12.3]', pr.getResult(art.ns)+'', 'Expected equals');
		equals(12.3, pr[0], 'Expected equals');
	});

	test("[1,2,3] test", function(){
		var pr = $M.parse('[1,2, 3]');
		expect(6);
		ok(pr.isArray, 'it`s array');
		equals('[1, 2, 3]', pr+'', 'Expected equals');
		equals('[1, 2, 3]', pr.getResult(art.ns)+'', 'Expected equals');
		equals(1, pr[0], 'Expected equals');
		equals(2, pr[1], 'Expected equals');
		equals(3, pr[2], 'Expected equals');

	});

	test("[1/3,sin(2),3^4.5,\\9] test", function() {
		var pr = $M.parse('[1/3,sin(2),3^ 4.5,\\9 ]');
		var res = pr.getResult(art.ns);
		expect(1);//8

		ok(pr.isArray, 'it`s array');

/*		equals('[1 / 3, sin(2), 3 ^ 4.5, \\9]', pr+'', 'Expected equals');
		ok(res.isArray, 'it`s array');
		equals(4, res.length, 'Expected equals');
		equals(res[0].toFixed(7), '0.3333333', 'Expected equals');
		equals(res[1].toFixed(7), '0.9092974', 'Expected equals');
		equals(res[2].toFixed(7), '140.2961154', 'Expected equals');
		equals(3, res[3], 'Expected equals');
*/
	});

	test("sin([0,1,2]) test", function(){
		var pr = $M.parse('sin([0,1,2])'),
		res = pr.getResult(art.ns);
		expect(6);
		ok(pr.isFunc, 'it`s function');
		ok(res.isArray, 'result is array');
		equals('sin([0, 1, 2])', pr + '', 'Expected equals');
		equals(res + '', '[0, 0.841471, 0.9092974]', 'Expected equals');
		equals(0, res[0], 'Expected equals');
		equals(0.841471, res[1], 'Expected equals');
	});

	module("Matrix Test");

	test("[[1,2],[3,4]] test", function(){
		var pr = $M.parse('[[1,2],[3,4]]');
		expect(6);
		ok(pr.isArray, 'it`s array');
		ok(pr.isMatrix, 'it`s matrix');
		equals('[[1, 2], [3, 4]]', pr+'', 'Expected equals');
		equals('[[1, 2], [3, 4]]', pr.getResult(art.ns) + '', 'Expected equals');
		equals(pr[0] + '', '[1, 2]', 'Expected equals');
		equals(pr[1] + '', '[3, 4]', 'Expected equals');
	});

});
