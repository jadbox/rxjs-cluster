exports.handler = function(event, context) {
	const f = x => "hello " + x;
	console.log( f("world!") )
}

// Local direct test case
if(!module.parent) {
	exports.handler({}, 
		{ done: (err, x) => 
			console.log(`${err}, ${x}`) 
		} );
}