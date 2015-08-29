'use strict';

/**
 * Sequences the call of a method in a collection of object.
 *
 * Halts if any method results in an error callback.
 *
 * @param collection The collection of objects to be sequenced over.
 * @param methodName The method name to be called in each object.
 * @param args       Array of arguments to be applied to the function call.
 * @param callback   Final callback to call.
 */
module.exports = function ( collection, methodName, args, callback ) {
	var	go = function ( i ) {
			var	currentObject,
				method;
			if ( i >= collection.length ) {
				/* Done calling all ojects, fire the final callback. */
				callback();
			} else {
				/* Still have objects to call. */
				currentObject = collection[ i ];
				method = currentObject[ methodName ];

				/* The current object has the method? */
				if ( method ) {

					/*
					 * Calls the method using the currentObject as the context,
					 * the callback will handle errors and advance our sequencing-index.
					 */
					method.apply( currentObject, args.concat( function ( error ) {
						if ( error ) {
							return callback( error );
						}
						/* Method sucessfuly called, go to next object. */
						go( i + 1 );
					}));

				} else {
					/* The object does not have the method, go to next one. */
					go( i + 1 );
				}
			}
		};

	/* Start sequencing from the very first one. */
	go( 0 );
};
