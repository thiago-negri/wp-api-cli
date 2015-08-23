var cliForce;

function init( cli, args, options, api, callback ) {
	if ( options.force ) {
		api.setForce( true );
	}
	callback();
}

cliForce = {
	init: init,
	options: {
		force: [ 'f', 'Force the operation. Will delete instead of trashing.' ],
	},
};

module.exports = cliForce;
