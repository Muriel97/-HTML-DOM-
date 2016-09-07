IC.addEvent(window, 'load', function(){
	IC.addEvent('generate','click', function(W3CEvent){
		var source = IC.$('source').value;
		IC.$('result').value = generateDOM(source);
	});
});