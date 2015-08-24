var cliTaxonomies;

function taxonomy_list( cli, args, options, api ) {
	api.listTaxonomies( function ( error, taxonomies ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( taxonomies );
	});
}

function taxonomy_get( cli, args, options, api ) {
	api.getTaxonomy( options.taxonomy_slug, function ( error, taxonomy ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( taxonomy );
	});
}

cliTaxonomies = {
	options: {
		/*
		 * Taxonomy schema
		 */
		taxonomy_slug: [ false, 'An alphanumeric identifier for the object.', 'STRING' ],
	},
	commands: {
		taxonomy_list: {
			label: 'List all Taxonomies',
			handler: taxonomy_list,
		},
		taxonomy_get: {
			label: 'Retrieve a Taxonomy, use "taxonomy_slug" option.',
			handler: taxonomy_get,
		},
	},
};

module.exports = cliTaxonomies;
