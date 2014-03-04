google_tag_manager_hax
======================

i totally borrowed this from http://vj-gcx.googlecode.com/svn/trunk/readme.txt so i could make some tweaks.  

allows google content experiments (gcx) to run from within google tag manager (gtm)  

for x-browser compat (namely IE), and to make sure stuff loads in the correct order, it's recommended to create a custom event to use as a rule for this tag instead of using gtm.dom. this tip came from an SO answer [here](http://stackoverflow.com/a/21576831).  

create a custom HTML tag called `pageLoad` and use the below code:  

````javscript
<script type="text/javascript">
var tid = setInterval( function () {
    if ( document.readyState !== 'complete' ) return;
    clearInterval( tid );
    dataLayer.push({ "event": "pageLoaded" });
}, 100 );
</script>
````

add whatever firing rule suits your purposes (e.g. `all pages`) and same for condition (e.g. `{{url}} matches RegEx .*`)  

rule for this tag: event equals pageLoaded  
rule for GA code: event equals gcx.done
(c) GNUv3 tony felice - tfelice at vladimirjones dot com

USAGE
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Use the following as a template for a custom HTML tag in gtm:

<script>
	var _gcx = _gcx || [], _gaq = [];
	
	//configure your experiment(s)
	_gcx.push([
		'%your_experiment_id%',
		[
			'%experiment hostname - should match document.location.hostname%',
			'%experiment pathname - should match document.location.pathname%',
			'%optional experiment querystring - should match document.location.search - remove or provide an empty string if not used',
			'%optional experiment #fragment - should match document.location.hash - remove if not used'
		],[
			function(){ %javascript to execute your original variation, usually left empty% },
			function(){ %javascript to execute your first variation% },
			function(){ %javascript to execute your second variation...% },
			function(){ %repeat as needed% }
		]
	]);
	
	//do not modify - minified source at http://vj-gcx.googlecode.com/svn/trunk/vj_gcx.min.js (must be included inline as shown below) 
	(function(e,t,n){var r,i,s,o,u,a,f,l,c=new Date/1e3,h=function(e){var n=t.createElement("script");n.type="text/javascript";n.src="//www.google-analytics.com/cx/api.js?experiment="+e;n.async=false;n.onreadystatechange=n.onload=function(){var e=n.readyState;if(!i.done&&(!e||/loaded|complete/.test(e))){i.done=1;i()}};var r=t.getElementsByTagName("script")[0];r.parentNode.insertBefore(n,r)},p=function(e,n){try{r=e;a=0;i=typeof n!=="undefined"?n:d;for(exp in e){f=e[exp][1];l=t.location;if(f[0]==l.hostname&&f[1]==l.pathname&&(f.length<3||f[2]==""||f[2]==l.search)&&(f.length<4||f[3]==l.hash)){s=e[exp][0];o=e[exp][2];a=1;h(s)}}return a?a:v()}catch(u){return v()}},d=function(){u=cxApi.chooseVariation();o[u]();e._gaq.push(["_trackEvent","x","x","x",n,true]);v()},v=function(){dataLayer.push({event:"gcx.done","gcx.active":a,"gcx.began":c,"gcx.ended":new Date/1e3,"gcx.execution":new Date/1e3-c,"gcx.experiment":s,"gcx.variation":u,_gcx:r})};e.vj_gcx=p})(window,document);vj_gcx(_gcx)
</script>


Set the firing rule for this tag as:
{{event}} [equals] gtm.dom

Then, for your google analytics tag in gtm, set the firing rule to:
{{event}} [equals] gcx.done


OPTIONS
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
The main function is vj_gcx.test(array, callback[optional] )
Be sure that you follow the format of the usage example

As you may notice, this function can accept two arguments:
arr			array	required	An array of arrays defining the experiment and its variations.  See Child Array below for more info.
callback	fn		optional	The default callback function loads the string 'gcx.done' to the dataLayer.  You may define your own callback to perform additional actions if needed.

Child Array  (the formatting for the below is terrible here. check out the original.)
The arr argument expects to be passed an array of arrays.  
The structure of the child array is as follows:  
0:		string	required	Experiment Id  
1:		array	required	Experiment target page - defines the page for which this experiment is designed  
1.0:	string	required	document.location.hostname (fully qualified domain name; ex: 'subdomain.mysite.com') of the page on which the experiment should run  
1.1:	string	required	document.location.pathname (path to the page, including leading /; ex: '/contact.html') of the page on which the experiment should run  
1.2:	string	optional	document.location.search (querystring, not including ?; ex: 'key=value&anotherkey=something) of the page on which the experiment should run  
1.2:	string	optional	document.location.hash (url fragment, including #; ex: '#contact') of the page on which the experiment should run  
2:		array	required	Experiment variations - An array of anonymous functions that map _directly_ to the experiment variations  
2.0:	fn		required	An anonymous function carrying a payload that will render the original variation (typically just an empty function)  
2.1:	fn		required	An anonymous function carrying a payload that will render the FIRST variation  
2.2:	fn		optional	An anonymous function carrying a payload that will render the SECOND variation (if defined in the experiment)  
2.3:	fn		optional	An anonymous function carrying a payload that will render the THIRD variation (if defined in the experiment)  
2.4:	fn		optional	An anonymous function carrying a payload that will render the FOURTH variation (if defined in the experiment)    

*note: if you have three total variations defined in your experiment (original and two variations), but do not include element 2.2, your second variation will never execute.

You can enable an unlimited number of experiments across your site using this helper, however you cannot have more than one experiment running on the same page at the same time
EXAMPLE 1:
````javascript
	var _gcx = _gcx || [], _gaq = [];
	_gcx.push([
		'123456789abcedf',[
			'www.mysite.com,
			'/'
		],[
			function(){ /* original homepage "buy now" button */ },
			function(){
				var el = document.getElementById('buynow')
				el.setAttribute('class', 'greenButton');
			},
			function(){
				var el = document.getElementById('buynow')
				el.setAttribute('class', 'redButton');
			}
		]
	],[
		'abcdef123456789',[
			'www.mysite.com',
			'/cart.html'
		],[
			function(){ /* original cart page "checkout" button */ },
			function(){
				var el = document.getElementById('checkout')
				el.setAttribute('class', 'largerButton');
			},
			function(){
				var el = document.getElementById('buynow')
				el.setAttribute('class', 'largerButtonWithIcon');
			}
		]
	]);
````
EXAMPLE 2:
````javascript
(run the exact same experiments, but define them using individual _gcx.push() statements)
	var _gcx = _gcx || [], _gaq = [];
	_gcx.push([
		'123456789abcedf',[
			'www.mysite.com',
			'/'
		],[
			function(){ /* original homepage "buy now" button */ },
			function(){
				var el = document.getElementById('buynow');
				el.setAttribute('class', 'greenButton');
			},
			function(){
				var el = document.getElementById('buynow');
				el.setAttribute('class', 'redButton');
			}
		]
	]);
	_gcx.push([
		'abcdef123456789',[
			'www.mysite.com',
			'/cart.html'
		],[
			function(){ /* original cart page "checkout" button */ },
			function(){
				var el = document.getElementById('checkout');
				el.setAttribute('class', 'largerButton');
			},
			function(){
				var el = document.getElementById('buynow');
				el.setAttribute('class', 'largerButtonWithIcon');
			}
		]
	]);
````
