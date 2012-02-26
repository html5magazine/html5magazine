// initial values
QUnit.begin = function() {
  console.log("Running Test Suite");
};
QUnit.moduleStart = function(obj) {
    console.log("start module: " + obj.name);
  };
module('core');
test('initial values', 3, function(){
    equals(mg.maxPage,         5, 'maxPage is 5');
    equals(mg.currentPage,     0, 'currentPage is 0');
    equals(mg.currentPosition, 0, 'currentPosition is 0');
    

});
module('swipe');
asyncTest('swipe right left goto("last|first|middle")', 19, function() {
	window.setTimeout(function(){
	    start();
	    //next
	    equals(mg.currentPage, 0, 'currentPage is 0');
	    mg.next();
	    equals(mg.currentPage, 1, 'currentPage is 1');
	    mg.next();
	    equals(mg.currentPage, 2, 'currentPage is 2');
	    mg.next();
	    equals(mg.currentPage, 3, 'currentPage is 3');
	    mg.next();
	    equals(mg.currentPage, 4, 'currentPage is 4');
	    mg.next();
	    equals(mg.currentPage, 5, 'currentPage is 5');
	    mg.next();
	    equals(mg.currentPage, 5, 'currentPage is still 5');
	    //prev
	    mg.prev();
	    equals(mg.currentPage, 4, 'currentPage is 4');
	    mg.prev();
	    equals(mg.currentPage, 3, 'currentPage is 3');
	    mg.prev();
	    equals(mg.currentPage, 2, 'currentPage is 2');
	    mg.prev();
	    equals(mg.currentPage, 1, 'currentPage is 1');
	    mg.prev();
	    equals(mg.currentPage, 0, 'currentPage is 0');
	    mg.prev();
	    equals(mg.currentPage, 0, 'currentPage is still 0');
	    //goto last
	    mg.gotoPage(mg.maxPage);
	    equals(mg.currentPage, mg.maxPage, 'currentPage is ' + mg.maxPage);
	    equals(mg.currentPosition, 0, 'currentPosition is 0');
	    mg.prev();
	    equals(mg.currentPage, mg.maxPage - 1, 'currentPage is ' + (mg.maxPage - 1));
	    
	    mg.gotoPage(1);
	    equals(mg.currentPage, 1, 'currentPage is 1');
	    equals(mg.currentPosition, (mg.getWidth(mg.firstSlide) + mg.getMargin(mg.firstSlide)) * mg.slides[2].left / 100 * -1, 'currentPosition is ' + (mg.getWidth(mg.firstSlide) + mg.getMargin(mg.firstSlide)) * mg.slides[2].left / 100 * -1);
	    mg.prev();
	    equals(mg.currentPage, 0, 'currentPage is 0');
	    
	},
	2000);
});




