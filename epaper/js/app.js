(function() {
	$.getJSON(
		'epaper.json',
		epaper.init,
		function(error){
			console.log(error);
		}
	);
	
	
}());