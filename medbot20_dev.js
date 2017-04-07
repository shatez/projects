
// **********************************
// MedBot v0.19
//
// Coding by: Mark Harris Date: 20160302
// Code Ownership: 
//   - Re-use of HarrisScience Algorithms converted from originals in LISP and Python (to be defined in code modules)
//   - Open Source of some limited Algorithm extensions in Harris Science code (to be defined in code modules) under Apache License
//   - Use of IBM Watson Open Source Text-to-Speech code for IBM Watson APIs under Apache License
//
// Changes resulting in v0.9 version
// --------------------------------
//   introduced tested nested async functions for text to speech wav processing (major breakthrough today!)
//   temporarily disabled http, url and createServer functions
//   copied nested async to initial, modified input and base routes
//   introduced 'use strict' node.js rule which identified 'ki' variable issue in AI Algorithms - converted to VAR ki whch fixed problem
//   tested with longtext story first
//   successful initial test of text to speech
//   logged routing of traffic in initial testing
//   re-introduced standard 'out' variable instead of text.txt (to see if that was issue - passed test)
//   turned on createServer function again along with http and url as well as res(out) in each route, and original decode input, and
//   port listening
//   all testing repeated
//   Then AI upgrades for conversation:
//      - new subject learning - initial partial alpha
// **********************************
// Changes resulting in v0.10 version
// ----------------------------------
// Suspend createServer Input variable 
// Suspend createServer
// Suspend server listen
// suspend res(end) in output routes
// Add new speech to text listening and transcript code - producing new Input as first Module
// Introduce npm forever setting options to optimize continuous medbot operation
// 
// Changes resulting in v0.11 - v0.19 versions
// -------------------------------------------
// AI: Remove general conversation keywords and response phrases  
// Tried to Reduce time taken in node-record - this is delaying response - but changes did not optimize accuracy vs time further 
// Need to try and optimize Restart process to avoid any duplicate operations
// Also need to reset threshold to not drive audio when aircon switches on






var http = require('http');
var url = require('url');

'use strict';

var fs = require('fs');

var watson = require('watson-developer-cloud');

var text_to_speech = watson.text_to_speech({
  username: '6600c308-bf71-4091-bc4d-7067b677470a',
  password: '4SrveOL2Yn12',
  version: 'v1',
  url: 'https://stream.watsonplatform.net/text-to-speech/api'
  });

var wav = require('wav');
var Speaker = require('speaker');

//****************************************
// Add new speech to text listening and transcript code - producing new Input
// s2trecord_master.js

var record = require('node-record-lpcm16');
    
var file = fs.createWriteStream('/home/marksharris/IBMWatson/record.wav', { encoding: 'binary' });
var input = fs.readFileSync('/home/marksharris/IBMWatson/transcript.txt').toString();
var inStream = fs.createWriteStream('transcript.txt')

record.start({
//try reducing sample rate in half from 44100 to 22050
    sampleRate : 44100,
//try changing threshold from 4.0 to 8.0
    threshold : 8.0,
//try changing verbose to false to save time 
    verbose : true
}).pipe(file);


    file.on("finish", function() {
       var watson = require('watson-developer-cloud');
   
       var speech_to_text = watson.speech_to_text({
         username: 'c53ff0af-5467-4358-837b-da14c06e712d',
         password: 'bVy0hVmkKLRP',
         version: 'v1',
         url: 'https://stream.watsonplatform.net/speech-to-text/api'   
         });
       var params = {content_type: 'audio/wav'};
       // create the stream
       var recognizeStream = speech_to_text.createRecognizeStream(params);
       // pipe in some audio
       fs.createReadStream(__dirname + '/record.wav').pipe(recognizeStream);
       // and pipe out the transcription
   
   
       recognizeStream.pipe(fs.createWriteStream('transcript.txt'));
       recognizeStream.setEncoding('utf8'); // to get strings instead of Buffers from `data` events

       inStream.on("finish", function() {
       fs.writeFile('/home/marksharris/IBMWatson/transcript.txt', input, (err) => {
           if (err) throw err;
           console.log("finished"); 
           });
       });
    });



//***************************************
//Temporarily suspend creat server

//http.createServer(function (req, res) {
//	res.writeHead(200, {'Content-Type': 'text/plain'});
	
	var medbotInitials = [
	"I'm Carina, your medical companion.  Please tell me how you are feeling.",
	"Hey, this is Carina, how are you right now?",
	"This is Carina. How are you feeling right now!"
	];

	var medbotFinals = [
	"Bye for now.  Let's catch up again in a few hours, or let me know if you start to feel bad.",
	"I always enjoy our chats. I'll leave you alone now for a few hours.",
	"Looking forward to our next chat! Bye for now.",
	"I always enjoy our discussions. Hope you are feeling my assistance is helping you",
	"I am enjoying becoming your friend. I always like assisting you with medical matters, but our other chats give me great satisfaction."
	];

	var medbotQuits = [ "bye",
	"goodbye",
	"done",
	"exit",
	"quit"
	];


	var medbotPres = [
	"dont", "don't",
	"cant", "can't",
	"wont", "won't",
	"recollect", "remember",
	"recall", "remember",
	"dreamt", "dreamed",
	"dreams", "dream",
	"maybe", "perhaps",
	"certainly", "yes",
	"machine", "computer",
	"machines", "computer",
	"computers", "computer",
	"were", "was",
	"you're", "you are",
	"i'm", "i am",
	"same", "alike",
	"identical", "alike",
	"equivalent", "alike"
	];

	var medbotPosts = [
	"am", "are",
	"your", "my",
	"me", "you",
	"myself", "yourself",
	"yourself", "myself",
	"i", "you",
	"you", "I",
	"my", "your",
	"i'm", "you are"
	];

	var medbotSynons = {
	"be": ["am", "is", "are", "was"],
	"belief": ["feel", "think", "believe", "wish"],
	"cannot": ["can't"],
	"desire": ["want", "need"],
	"everyone": ["everybody", "nobody", "noone"],
	"family": ["mother", "mom", "father", "dad", "sister", "brother", "wife", "children", "child"],
	"happy": ["elated", "glad", "better"],
	"sad": ["unhappy", "depressed", "sick"]
	};


	var medbotKeywords = [


    ["sorry", 0, [
	 ["*", [
	     "No need to say sorry.",
	     "No need to apologise.",
	     "No worries. Let's keep talking."
	  ]]
	]],

	["hello", 0, [
	 ["*", [
		 "This is Carina, your medical companion. How can I help you right now.",
		 "Hi there. Good to speak again. Tell me how I can help you! ?"
	  ]]
	]],




	["i", 0, [
//	 ["* i am* @happy *", [
//		 "How have I helped you to be (3) ?",
//		 "Has your treatment made you (3) ?",
//		 "What makes you (3) just now ?",
//		 "Can you explain why you are suddenly (3) ?"
//	  ]],
//	 ["* i was *", [
//		 "goto was"
//	  ]],
	 ["* i @belief i *", [
		 "Do you really think so ?",
		 "But you are not sure you (3).",
		 "Do you really doubt you (3) ?"
	  ]],
	 ["* i* @belief *you *", [
		 "goto you"
	  ]],

	 ["* i @cannot *", [
		 "How do you know that you can't (3) ?",
		 "Have you tried ?",
		 "Perhaps you could (3) now.",
		 "Do you really want to be able to (3) ?",
		 "What if you could (3) ?"
	  ]],

	 
//     ["* new subject *", [
//		 "Tell me more about what is hurting right now.",
//		 "Can you describe where you are feeling sick?",
//		 "Where in your body are you feeling unwell?"
//	  ]],	 
     
     ["* sick *", [
		 "Tell me where you are feeling uncomfortable.",
		 "Where are you feeling sick?",
		 "Where are you feeling unwell?"
	  ]],
     ["* unwell *", [
		 "Tell me where the pain is.",
		 "Can you describe where you are feeling sick?",
		 "Where are you feeling unwell?"
	  ]],
     ["* hurting *", [
		 "Tell me what is painful right now.",
		 "Where does it hurt?",
		 "Where do you feel pain?"
	  ]],
     ["* hurt *", [
		 "Tell me more about what is hurting right now.",
		 "Can you describe where you are feeling sick?",
		 "Where in your body are you feeling unwell?"
	  ]],
     ["* all over *", [
		 "Tell me more about what is hurting the most right now.",
		 "Can you describe where you are feeling the pain the most?",
		 "Where in your body are you feeling unwell?"
	  ]],
     ["* not well *", [
		 "Sorry to hear you are not feeling well. Tell me what is hurting",
		 "Can you describe where you are feeling unwell?",
		 "Where in your body are you feeling bad?"
	  ]],
     ["* my chest *", [
		 "On a scale between one and ten how bad is the pain",
		 "Between 1 and 10, how bad is the pain",
	  ]],
     ]], 
   ["it's", 0, [	
     ["* seven * ", [
		 "shall I call nine one one now or call your family contact right away?",
		 "do you want an ambulance to be called right away, or shall I call your family emergency contact first to get their advice?"
	  ]],
     ["* seven *", [
		 "shall I call nine one one now or call your family contact right away?",
		 "do you want an ambulance to be called right away, or shall I call your family emergency contact first to get their advice?"
		 
	  ]],
     ["* eight *", [
		 "shall I call nine one one now or call your family contact right away?",
		 "do you want an ambulance to be called right away, or shall I call your family emergency contact first to get their advice?"
	  ]],


     ["* ate *", [
		 "shall I call nine one one now or call your family contact right away?",
		 "do you want nine one one to be called right away, or shall I call your family emergency contact first to get their advice?"
	  ]],
     ["nine *", [
		 "shall I call nine one one now or call your family contact right away?",
		 "do you want nine one one to be called right away, or shall I call your family emergency contact first to get their advice?"
	  ]],
    ]],
	
["please call", 0, [
	 ["* ambulance *", [
		 "I'm calling nine one one right now. I'll continue to talk with you and the emergency service until they arrive. Help is on the way!",
         "I have already called the emergency service. I'll keep talking with you and the emergency service until they arrive. Help is on the way!"
	  ]],
     ]],

["thank", 0, [	
     ["*", [
		 "That's what I am here for. Rest and hang in there. Keep talking to me and tell me right away if anything changes until the paramedics arrive."
	  ]],
     ]],








	["how", 0, [
	 ["how *", [
		 "I am good. How are you feeling?",
         "I am having a great day. Thanks for asking. How are you feeling?"
	  ]]
	]],

	["everyone", 2, [
	 ["* @everyone *", [
		 "Really, (2) ?",
		 "Surely not (2).",
		 "Can you think of anyone in particular ?",
		 "Who, for example?",
		 "Are you thinking of a very special person ?",
		 "Who, may I ask ?",
		 "Someone special perhaps ?",
		 "You have a particular person in mind, don't you ?",
		 "Who do you think you're talking about ?"
	  ]]
	]],
	["everybody", 2, [
	 ["*", [
		 "goto everyone"
	  ]]
	]],
	["nobody", 2, [
	 ["*", [
		 "goto everyone"
	  ]]
	]],
	["noone", 2, [
	 ["*", [
		 "goto everyone"
	  ]]
	]],
	["always", 1, [
	 ["*", [
		 "Can you think of a specific example ?",
		 "When ?",
		 "What incident are you thinking of ?",
		 "Really, always ?"
	  ]]
	]],
//	["alike", 10, [
//	 ["*", [
//		 "In what way ?",
//		 "What resemblence do you see ?",
//		 "What does that similarity suggest to you ?",
//		 "What other connections do you see ?",
//		 "What do you suppose that resemblence means ?",
//		 "What is the connection, do you suppose ?",
//		 "Could there really be some connection ?",
//		 "How ?"
//	  ]]
//	]],
	["like", 10, [
	 ["* @be *like *", [
		 "goto alike"
	  ]]
	]],
	["different", 0, [
	 ["*", [
		 "How is it different ?",
		 "What differences do you see ?",
		 "What does that difference suggest to you ?",
		 "What other distinctions do you see ?",
		 "What do you suppose that disparity means ?",
		 "Could there be some connection, do you suppose ?",
		 "How ?"
	  ]]
	]]

	];

	// regexp/replacement pairs to be performed as final cleanings
	// here: cleanings for multiple bots talking to each other
	var medbotPostTransforms = [
		/ old old/g, " old",
		/\bthey were( not)? me\b/g, "it was$1 me",
		/\bthey are( not)? me\b/g, "it is$1 me",
		/Are they( always)? me\b/, "it is$1 me",
		/\bthat your( own)? (\w+)( now)? \?/, "that you have your$1 $2 ?",
		/\bI to have (\w+)/, "I have $1",
		/Earlier you said your( own)? (\w+)( now)?\./, "Earlier you talked about your $2."
	];
	
	
	
	function MedbotBot(noRandomFlag) {
		this.noRandom= (noRandomFlag)? true:false;
		this.capitalizeFirstLetter=true;
		this.debug=false;
		this.memSize=20;
		this.version="1.1 (original)";
		if (!this._dataParsed) this._init();
		this.reset();
	}

	MedbotBot.prototype.reset = function() {
		this.quit=false;
		this.mem=[];
		this.lastchoice=[];
		for (var k=0; k<medbotKeywords.length; k++) {
			this.lastchoice[k]=[];
			var rules=medbotKeywords[k][2];
			for (var i=0; i<rules.length; i++) this.lastchoice[k][i]=-1;
		}
	}

	MedbotBot.prototype._dataParsed = false;

	MedbotBot.prototype._init = function() {
		// install ref to object
		//MedbotBot.prototype.global=self;
		//var m=MedbotBot.prototype.global;
		
		// parse data and convert it from canonical form to internal use
		// prodoce synonym list
		var synPatterns={};
		if ((medbotSynons) && (typeof medbotSynons == 'object')) {
			for (var i in medbotSynons) synPatterns[i]='('+i+'|'+medbotSynons[i].join('|')+')';
		}
		// check for keywords or install empty structure to prevent any errors
		if ((!medbotKeywords) || (typeof medbotKeywords.length == 'undefined')) {
			medbotKeywords=[['###',0,[['###',[]]]]];
		}
		// 1st convert rules to regexps
		// expand synonyms and insert asterisk expressions for backtracking
		var sre=/@(\S+)/;
		var are=/(\S)\s*\*\s*(\S)/;
		var are1=/^\s*\*\s*(\S)/;
		var are2=/(\S)\s*\*\s*$/;
		var are3=/^\s*\*\s*$/;
		var wsre=/\s+/g;
		for (var k=0; k<medbotKeywords.length; k++) {
			var rules=medbotKeywords[k][2];
			medbotKeywords[k][3]=k; // save original index for sorting
			for (var i=0; i<rules.length; i++) {
				var r=rules[i];
				// check mem flag and store it as decomp's element 2
				if (r[0].charAt(0)=='$') {
					var ofs=1;
					while (r[0].charAt[ofs]==' ') ofs++;
					r[0]=r[0].substring(ofs);
					r[2]=true;
				}
				else {
					r[2]=false;
				}
				// expand synonyms (working around lambda function)
				var m=sre.exec(r[0]);
				while (m) {
					var sp=(synPatterns[m[1]])? synPatterns[m[1]]:m[1];
					r[0]=r[0].substring(0,m.index)+sp+r[0].substring(m.index+m[0].length);
					m=sre.exec(r[0]);
				}
				// expand asterisk expressions (working around lambda function)
				if (are3.test(r[0])) {
					r[0]='\\s*(.*)\\s*';
				}
				else {
					m=are.exec(r[0]);
					if (m) {
						var lp='';
						var rp=r[0];
						while (m) {
							lp+=rp.substring(0,m.index+1);
							if (m[1]!=')') lp+='\\b';
							lp+='\\s*(.*)\\s*';
							if ((m[2]!='(') && (m[2]!='\\')) lp+='\\b';
							lp+=m[2];
							rp=rp.substring(m.index+m[0].length);
							m=are.exec(rp);
						}
						r[0]=lp+rp;
					}
					m=are1.exec(r[0]);
					if (m) {
						var lp='\\s*(.*)\\s*';
						if ((m[1]!=')') && (m[1]!='\\')) lp+='\\b';
						r[0]=lp+r[0].substring(m.index-1+m[0].length);
					}
					m=are2.exec(r[0]);
					if (m) {
						var lp=r[0].substring(0,m.index+1);
						if (m[1]!='(') lp+='\\b';
						r[0]=lp+'\\s*(.*)\\s*';
					}
				}
				// expand white space
				r[0]=r[0].replace(wsre, '\\s+');
				wsre.lastIndex=0;
			}
		}
		// now sort keywords by rank (highest first)
		medbotKeywords.sort(this._sortKeywords);
		// and compose regexps and refs for pres and posts
		MedbotBot.prototype.pres={};
		MedbotBot.prototype.posts={};
		if ((medbotPres) && (medbotPres.length)) {
			var a=new Array();
			for (var i=0; i<medbotPres.length; i+=2) {
				a.push(medbotPres[i]);
				MedbotBot.prototype.pres[medbotPres[i]]=medbotPres[i+1];
			}
			MedbotBot.prototype.preExp = new RegExp('\\b('+a.join('|')+')\\b');
		}
		else {
			// default (should not match)
			MedbotBot.prototype.preExp = /####/;
			MedbotBot.prototype.pres['####']='####';
		}
		if ((medbotPosts) && (medbotPosts.length)) {
			var a=new Array();
			for (var i=0; i<medbotPosts.length; i+=2) {
				a.push(medbotPosts[i]);
				MedbotBot.prototype.posts[medbotPosts[i]]=medbotPosts[i+1];
			}
			MedbotBot.prototype.postExp = new RegExp('\\b('+a.join('|')+')\\b');
		}
		else {
			// default (should not match)
			MedbotBot.prototype.postExp = /####/;
			MedbotBot.prototype.posts['####']='####';
		}
		// check for medbotQuits and install default if missing
		if ((!medbotQuits) || (typeof medbotQuits.length == 'undefined')) {
			medbotQuits=[];
		}
		// done
		MedbotBot.prototype._dataParsed=true;
	}

	MedbotBot.prototype._sortKeywords = function(a,b) {
		// sort by rank
		if (a[1]>b[1]) return -1
		else if (a[1]<b[1]) return 1
		// or original index
		else if (a[3]>b[3]) return 1
		else if (a[3]<b[3]) return -1
		else return 0;
	}

	MedbotBot.prototype.transform = function(text) {
		var rpl='';
		this.quit=false;
		// unify text string
		text=text.toLowerCase();
		text=text.replace(/@#\$%\^&\*\(\)_\+=~`\{\[\}\]\|:;<>\/\\\t/g, ' ');
		text=text.replace(/\s+-+\s+/g, '.');
		text=text.replace(/\s*[,\.\?!;]+\s*/g, '.');
		text=text.replace(/\s*\bbut\b\s*/g, '.');
		text=text.replace(/\s{2,}/g, ' ');
		// split text in part sentences and loop through them
		var parts=text.split('.');
		for (var i=0; i<parts.length; i++) {
			var part=parts[i];
			if (part!='') {
				// check for quit expression
				for (var q=0; q<medbotQuits.length; q++) {
					if (medbotQuits[q]==part) {
						this.quit=true;
						return this.getFinal();
					}
				}
				// preprocess (work around lambda function)
				var m=this.preExp.exec(part);
				if (m) {
					var lp='';
					var rp=part;
					while (m) {
						lp+=rp.substring(0,m.index)+this.pres[m[1]];
						rp=rp.substring(m.index+m[0].length);
						m=this.preExp.exec(rp);
					}
					part=lp+rp;
				}
				this.sentence=part;
				// loop trough keywords
				for (var k=0; k<medbotKeywords.length; k++) {
					if (part.search(new RegExp('\\b'+medbotKeywords[k][0]+'\\b', 'i'))>=0) {
						rpl = this._execRule(k);
					}
					if (rpl!='') return rpl;
				}
			}
		}
		// nothing matched try mem
		rpl=this._memGet();
		// if nothing in mem, so try xnone
		if (rpl=='') {
			this.sentence=' ';
			var k=this._getRuleIndexByKey('xnone');
			if (k>=0) rpl=this._execRule(k);
		}
		// return reply or default string
		return (rpl!='')? rpl : 'Can you repeat that again?';
	}

	MedbotBot.prototype._execRule = function(k) {
		var rule=medbotKeywords[k];
		var decomps=rule[2];
		var paramre=/\(([0-9]+)\)/;
		for (var i=0; i<decomps.length; i++) {
			var m=this.sentence.match(decomps[i][0]);
			if (m!=null) {
				var reasmbs=decomps[i][1];
				var memflag=decomps[i][2];
				var ri= (this.noRandom)? 0 : Math.floor(Math.random()*reasmbs.length);
				if (((this.noRandom) && (this.lastchoice[k][i]>ri)) || (this.lastchoice[k][i]==ri)) {
					ri= ++this.lastchoice[k][i];
					if (ri>=reasmbs.length) {
						ri=0;
						this.lastchoice[k][i]=-1;
					}
				}
				else {
					this.lastchoice[k][i]=ri;
				}
				var rpl=reasmbs[ri];
				if (this.debug) alert('match:\nkey: '+medbotKeywords[k][0]+
					'\nrank: '+medbotKeywords[k][1]+
					'\ndecomp: '+decomps[i][0]+
					'\nreasmb: '+rpl+
					'\nmemflag: '+memflag);
				if (rpl.search('^goto ', 'i')==0) {
					//adj added var to ki 02/26
                    var ki=this._getRuleIndexByKey(rpl.substring(5));
					if (ki>=0) return this._execRule(ki);
				}
				// substitute positional params (working around lambda function)
				var m1=paramre.exec(rpl);
				if (m1) {
					var lp='';
					var rp=rpl;
					while (m1) {
						var param = m[parseInt(m1[1])];
						// postprocess param
						var m2=this.postExp.exec(param);
						if (m2) {
							var lp2='';
							var rp2=param;
							while (m2) {
								lp2+=rp2.substring(0,m2.index)+this.posts[m2[1]];
								rp2=rp2.substring(m2.index+m2[0].length);
								m2=this.postExp.exec(rp2);
							}
							param=lp2+rp2;
						}
						lp+=rp.substring(0,m1.index)+param;
						rp=rp.substring(m1.index+m1[0].length);
						m1=paramre.exec(rp);
					}
					rpl=lp+rp;
				}
				rpl=this._postTransform(rpl);
				if (memflag) this._memSave(rpl)
				else return rpl;
			}
		}
		return '';
	}

	MedbotBot.prototype._postTransform = function(s) {
		// final cleanup
		s=s.replace(/\s{2,}/g, ' ');
		s=s.replace(/\s+\./g, '.');
		if ((medbotPostTransforms) && (medbotPostTransforms.length)) {
			for (var i=0; i<medbotPostTransforms.length; i+=2) {
				s=s.replace(medbotPostTransforms[i], medbotPostTransforms[i+1]);
				medbotPostTransforms[i].lastIndex=0;
			}
		}
		// capitalize first char (working around lambda function)
		if (this.capitalizeFirstLetter) {
			var re=/^([a-z])/;
			var m=re.exec(s);
			if (m) s=m[0].toUpperCase()+s.substring(1);
		}
		return s;
	}

	MedbotBot.prototype._getRuleIndexByKey = function(key) {
		for (var k=0; k<medbotKeywords.length; k++) {
			if (medbotKeywords[k][0]==key) return k;
		}
		return -1;
	}

	MedbotBot.prototype._memSave = function(t) {
		this.mem.push(t);
		if (this.mem.length>this.memSize) this.mem.shift();
	}

	MedbotBot.prototype._memGet = function() {
		if (this.mem.length) {
			if (this.noRandom) return this.mem.shift();
			else {
				var n=Math.floor(Math.random()*this.mem.length);
				var rpl=this.mem[n];
				for (var i=n+1; i<this.mem.length; i++) this.mem[i-1]=this.mem[i];
				this.mem.length--;
				return rpl;
			}
		}
		else return '';
	}

	MedbotBot.prototype.getFinal = function() {
		if (!medbotFinals) return '';
		return medbotFinals[Math.floor(Math.random()*medbotFinals.length)];
	}

	MedbotBot.prototype.getInitial = function() {
		if (!medbotInitials) return '';
		return medbotInitials[Math.floor(Math.random()*medbotInitials.length)];
	}

	// old New temp input
	// old        var input = fs.readFileSync('/home/marksharris/IBMWatson/input.txt').toString();
	//*****************************************************
    //Temporarily suspend createServer web input
    //var input=decodeURIComponent(req.url).substring(1);
	//*****************************************************
	
	var medbot = new MedbotBot();


	if (input){
		var out = medbot.transform(input);
        //res.end(out);	suspend for now
        //var out = fs.readFileSync('/home/marksharris/IBMWatson/text.txt').toString();
        console.log('YOU:   '+input);   
        console.log('MEDBOT: '+out);

        //****REVISED NEST*****

        'use strict';

        var watson = require('watson-developer-cloud');
        var fs = require('fs');

        var text_to_speech = watson.text_to_speech({
            username: '6600c308-bf71-4091-bc4d-7067b677470a',
            password: '4SrveOL2Yn12',
            version: 'v1',
            url: 'https://stream.watsonplatform.net/text-to-speech/api'
            });

        //var out = fs.readFileSync('/home/marksharris/IBMWatson/text.txt').toString();

        var params = {
            text: out,
            voice: 'en-US_AllisonVoice', // Optional voice
            accept: 'audio/wav'
            };

        var outStream = fs.createWriteStream('output.wav')
        var wav = require('wav');
        var Speaker = require('speaker');


        fs.writeFile('output.txt', out, (err) => {
            if (err) throw err;
            console.log("File saved!");     
            text_to_speech.synthesize(params).pipe(outStream);
            //text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav'));
            //outStream.on('error', function err {
            //  console.log(err)
            // });
            outStream.on("finish", function() {
             
                var file = fs.createReadStream('output.wav');
                var reader = new wav.Reader();
                // the "format" event gets emitted at the end of the WAVE header
                reader.on('format', function (format) {

                    // the WAVE header is stripped from the output of the reader
                    reader.pipe(new Speaker(format));
                    });
                // pipe the WAVE file to the Reader instance
                file.pipe(reader);
                console.log("Updated!");
                console.log(out);
                });
    });






	}		
	else
	{
		
        var out=medbot.getInitial();
		//res.end(out); suspend for now
        //var out = fs.readFileSync('/home/marksharris/IBMWatson/text.txt').toString();
        console.log('MEDBOT: '+out);

        //****REVISED NEST****

    'use strict';

    var watson = require('watson-developer-cloud');
    var fs = require('fs');

    var text_to_speech = watson.text_to_speech({
        username: '6600c308-bf71-4091-bc4d-7067b677470a',
        password: '4SrveOL2Yn12',
        version: 'v1',
        url: 'https://stream.watsonplatform.net/text-to-speech/api'
        });

    //var out = fs.readFileSync('/home/marksharris/IBMWatson/text.txt').toString();

    var params = {
        text: out,
        voice: 'en-US_AllisonVoice', // Optional voice
        accept: 'audio/wav'
        };

    var outStream = fs.createWriteStream('output.wav')
    var wav = require('wav');
    var Speaker = require('speaker');


    fs.writeFile('output.txt', out, (err) => {
        if (err) throw err;
        console.log("File saved!");     
        text_to_speech.synthesize(params).pipe(outStream);
        //text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav'));
        //outStream.on('error', function err {
        //  console.log(err)
        // });
        outStream.on("finish", function() {
             
            var file = fs.createReadStream('output.wav');
            var reader = new wav.Reader();
            // the "format" event gets emitted at the end of the WAVE header
            reader.on('format', function (format) {

                // the WAVE header is stripped from the output of the reader
                reader.pipe(new Speaker(format));
                });
            // pipe the WAVE file to the Reader instance
            file.pipe(reader);
            console.log("Initial!");
            console.log(out);
            });
    });











	}
	


	/*
	if (medbot.quit) {
	
	}  */


//*******************************************************
// Suspend server listen
//}).listen(4000, "127.0.0.1");
//console.log('Server running at http://localhost:4000/');

//*******************************************************


//*******************************************************
// Replicate Listening Module as final Module 



