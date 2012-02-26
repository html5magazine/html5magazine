// selector engine
test('sel', 3, function() {
	ok($$, '$$ should be sel');
	ok(sel, 'sel should be sel');
	equals($$, sel, '$$ and sel should be equal');
});
// selectors
test('selectors', 5, function() {
	var elems = $$('#fixture-1');
	equals(elems.length, 1, 'one element should be selected');
	equals(elems[0].innerText || elems[0].innerHTML, 'fixture', 'element has some text');
	var el = $$('.class1');
	equals(el.length, 1, 'one element should be selected');
	equals(el[0].innerText || el[0].innerHTML, '', 'element has no text');
	var elems = $$('#abcdefghijk');
	equals(elems.length, 0, 'no elements should be selected');
});
// add remove class
test('classes', 3, function() {
	var el = $$('.class1');
	el.removeClass('class1');
	equals(el[0].className, '', 'no more class');
	el.addClass('class1');
	equals(el[0].className, 'class1', 'exact one class');
	el.addClass('class2');
	equals(el[0].className, 'class1 class2', 'two classes');
});
// remove element
test('remove element', 1, function() {
	var el = $$('.class1');
	el.remove();
	el = $$('.class1');
	equals(el.length, 0, 'element should be removed');
});
//attribute
test('get/set attribute', 5, function() {
	var el = $$('.class1');
	var attr = el.attr('id');
	equals(attr, 'first-div', 'get attribute id');
	attr = el.attr('bla');
	equals(attr, 'blub', 'get attribute bla');
	el.attr('huhu', 'hallo');
	attr = el.attr('huhu');
	equals(attr, 'hallo', 'get attribute huhu');
	el = $$('.classABC');
	attr = el.attr('huhu');
	equals(attr, undefined, 'no attribute found');
	el.attr('hfdj', 'jfdjhfj');
	attr = el.attr('hfdj');
	equals(attr, undefined, 'no attribute found');
});
//os version
test('os version', 1, function() {
	equals(typeof $$.os, typeof {}, 'os should be an object');
});