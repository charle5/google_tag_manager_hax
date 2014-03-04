/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
 *
 *  allows google content experiments (gcx) to run from within google tag manager (gtm)
 *  rule for this tag: event equals pageLoaded
 *  rule for GA code: event equals gcx.done
 *  (c) GNUv3 tony felice - tfelice at vladimirjones dot com
 *
 *  SOURCE FILE: not for production use.  Instead, refer to http://vj-gcx.googlecode.com/svn/trunk/vj_gcx.min.js
 *
 *  USAGE
 *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  See readme.txt for instructions
 *  
 *
 *
 *  
 *
 */


(function (window, document, undefined) {
var _gcx, callback, experiment, variations, doVariation, active, target, doclocation, timer = (new Date()/1000),
load = function(expId) {

// set up the cxApi script
var s = document.createElement('script');
s.type='text/javascript';
s.src = '//www.google-analytics.com/cx/api.js?experiment=' + expId;
s.async = false;

// listen for the script to be loaded and ready, then pass to the handler
s.onreadystatechange = s.onload = function() {
var state = s.readyState;
if (!callback.done && (!state || /loaded|complete/.test(state))) {

// run the callback
callback.done = true;
callback();
}
};
// load the script
var d = document.getElementsByTagName('script')[0];
d.parentNode.insertBefore(s, d);
},
init = function(obj, thiscallback) {
try{
_gcx = obj;

// is an experiment running on this request? Not yet. Maybe.
active = false;

// set handler as the default callback
callback = typeof(thiscallback) !== 'undefined' ? thiscallback : handler;

// step thru the _gcx array
for(exp in obj){

// see if the current request is the target of the experiment - hostname:target[0], pathname:target[1], querystring:target[2], fragment:target[3]
target = obj[exp][1];
doclocation = document.location;
if(target[0] == doclocation.hostname
     && target[1] == doclocation.pathname
     && (target.length < 3 || target[2] == '\' || target[2] == doclocation.search)
   && (target.length < 4 || target[3] == doclocation.hash)
){
// yes, so load in the cxApi with the experiment id (at obj[exp][0]) and pass the variations
experiment = obj[exp][0];
variations = obj[exp][2];
active = true;
load(experiment);
}
}
return (active) ? true : done();
}catch(e){
return done();
}
},
handler = function(){
// ask GA which variation to show the visitor
doVariation = cxApi.chooseVariation();

// execute the variation function that matches the chosen variation
variations[doVariation]();

// fire a non-interaction event to \"wake\" the experiment - this will not show in your reports because the account id is still undefined
window._gaq.push(['_trackEvent', 'x', 'x', 'x', undefined, true]);

done();
},
done = function(){
// push flag to the gtm dataLayer so that GA can be loaded from that event macro
dataLayer.push({
'event':'gcx.done'
,'gcx.active': active
,'gcx.began': timer
,'gcx.ended': (new Date()/1000)
,'gcx.execution': (new Date()/1000)-timer
,'gcx.experiment': experiment
,'gcx.variation': doVariation
,'_gcx': _gcx
});
};
window.vj_gcx = init //promote the fn
}(window, document));
vj_gcx(_gcx);

























\"\"\''))}}})
