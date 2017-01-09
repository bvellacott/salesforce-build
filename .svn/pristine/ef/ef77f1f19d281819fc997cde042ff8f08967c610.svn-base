// log errors
var logger = function( details ) {
  if ( details.result ) {
    return;
  }
  var loc = details.module + ": " + details.name + ": ",
    output = "FAILED: " + loc + ( details.message ? details.message + ", " : "" );
 
  if ( details.actual ) {
    output += "expected: " + details.expected + ", actual: " + details.actual;
  }
  if ( details.source ) {
    output += ", " + details.source;
  }
  console.log( output );
};
