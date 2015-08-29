'use strict';

/**
 * Exports all CLI modules.
 */
module.exports = [
	require( './modules/debug'       ),
	require( './modules/site'        ),
	require( './modules/insecure'    ),
	require( './modules/describe'    ),
	require( './modules/update'      ),
	require( './modules/auth'        ),
	require( './modules/routes'      ),
	require( './modules/bool-loader' ),
	require( './modules/file-loader' ),
	require( './modules/dict-loader' ),
	require( './modules/text-loader' ),
];
