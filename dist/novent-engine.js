function InvalidInputException(e,n){this.name="InvalidInputException",this.input=e,this.message=n}function MissingLibraryException(e){this.name="MissingLibraryException",this.message=e}function UnknownNoventExeption(e,n){this.name="UnknownNoventExeption",this.message=n,this.name=e}if(function(){"use strict";function e(){}function n(e,n){for(var t=e.length;t--;)if(e[t].listener===n)return t;return-1}function t(e){return function(){return this[e].apply(this,arguments)}}var i=e.prototype,r=this,s=r.EventEmitter;i.getListeners=function(e){var n,t,i=this._getEvents();if(e instanceof RegExp){n={};for(t in i)i.hasOwnProperty(t)&&e.test(t)&&(n[t]=i[t])}else n=i[e]||(i[e]=[]);return n},i.flattenListeners=function(e){var n,t=[];for(n=0;n<e.length;n+=1)t.push(e[n].listener);return t},i.getListenersAsObject=function(e){var n,t=this.getListeners(e);return t instanceof Array&&(n={},n[e]=t),n||t},i.addListener=function(e,t){var i,r=this.getListenersAsObject(e),s="object"==typeof t;for(i in r)r.hasOwnProperty(i)&&n(r[i],t)===-1&&r[i].push(s?t:{listener:t,once:!1});return this},i.on=t("addListener"),i.addOnceListener=function(e,n){return this.addListener(e,{listener:n,once:!0})},i.once=t("addOnceListener"),i.defineEvent=function(e){return this.getListeners(e),this},i.defineEvents=function(e){for(var n=0;n<e.length;n+=1)this.defineEvent(e[n]);return this},i.removeListener=function(e,t){var i,r,s=this.getListenersAsObject(e);for(r in s)s.hasOwnProperty(r)&&(i=n(s[r],t),i!==-1&&s[r].splice(i,1));return this},i.off=t("removeListener"),i.addListeners=function(e,n){return this.manipulateListeners(!1,e,n)},i.removeListeners=function(e,n){return this.manipulateListeners(!0,e,n)},i.manipulateListeners=function(e,n,t){var i,r,s=e?this.removeListener:this.addListener,o=e?this.removeListeners:this.addListeners;if("object"!=typeof n||n instanceof RegExp)for(i=t.length;i--;)s.call(this,n,t[i]);else for(i in n)n.hasOwnProperty(i)&&(r=n[i])&&("function"==typeof r?s.call(this,i,r):o.call(this,i,r));return this},i.removeEvent=function(e){var n,t=typeof e,i=this._getEvents();if("string"===t)delete i[e];else if(e instanceof RegExp)for(n in i)i.hasOwnProperty(n)&&e.test(n)&&delete i[n];else delete this._events;return this},i.removeAllListeners=t("removeEvent"),i.emitEvent=function(e,n){var t,i,r,s,o,a=this.getListenersAsObject(e);for(s in a)if(a.hasOwnProperty(s))for(t=a[s].slice(0),r=0;r<t.length;r++)i=t[r],i.once===!0&&this.removeListener(e,i.listener),o=i.listener.apply(this,n||[]),o===this._getOnceReturnValue()&&this.removeListener(e,i.listener);return this},i.trigger=t("emitEvent"),i.emit=function(e){var n=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,n)},i.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},i._getOnceReturnValue=function(){return!this.hasOwnProperty("_onceReturnValue")||this._onceReturnValue},i._getEvents=function(){return this._events||(this._events={})},e.noConflict=function(){return r.EventEmitter=s,e},"function"==typeof define&&define.amd?define(function(){return e}):"object"==typeof module&&module.exports?module.exports=e:r.EventEmitter=e}.call(this),function(e,n,t){"function"==typeof define&&define.amd?define(t):"object"==typeof exports?module.exports=t():n[e]=t()}("heir",this,function(){"use strict";var e={inherit:function(n,t,i){var r=n.prototype=e.createObject(t.prototype);r.constructor=n,(i||"undefined"==typeof i)&&(n._super=t.prototype)},createObject:Object.create||function(e){var n=function(){};return n.prototype=e,new n},mixin:function(n,t){return e.merge(n.prototype,t)},merge:function(n,t){var i;for(i in t)e.hasOwn(t,i)&&(n[i]=t[i])},hasOwn:function(e,n){return Object.prototype.hasOwnProperty.call(e,n)}};return e}),"undefined"==typeof createjs)throw new MissingLibraryException("missing library createjs");var NoventEngine=NoventEngine||{};!function(){"use strict";function e(e,t,i){if(!e)throw new InvalidInputException("page","missing parameter page");return e.events[t]?e.events[t]:(e.events[t]=new n(e,t,i),e.events[t])}NoventEngine.event=e;var n=function(e,n,t){function i(){return s.page.novent.waiting=!1,s.function(s.page.container,s.page).then(function(){if(s.page.index++,s.page.novent.waiting=!0,s.page.index==s.page.events.length)return s.page.novent.index++,s.page.novent.play()})}function r(e,n){return new Promise(function(i){t(i,e,n)})}var s=this;return s.page=e,s.function=r,s.play=i,s}}(),function(){"use strict";function e(e,n,i,r,s){if(!e||n||i||r){var o=new t(e,n,i,r);return NoventEngine.novents||(NoventEngine.novents={}),NoventEngine.novents[e]=o,o}if(!NoventEngine.novents||!NoventEngine.novents[e])throw new UnknownNoventExeption(e,"unknown novent with name "+e);return NoventEngine.novents[e]}function n(e){e.style.position="fixed",e.style.top=0,e.style.left=0,e.style.bottom=0,e.style.right=0,e.style.margin="auto";var n=window.innerWidth,t=window.innerHeight,i=t/n,r=e.height/e.width;i<=r?n=t/r:t=n*r,e.style.width=n+"px",e.style.height=t+"px"}NoventEngine.novent=e;var t=function(e,t,i,r,s){function o(e){if(!e||""===e)throw new InvalidInputException("name","missing parameter name");return e}function a(e){if(!e||""===e)throw new InvalidInputException("canvasId","missing parameter canvasId");var n=document.getElementById(e);if(!n)throw new InvalidInputException("canvasId","invalid canvasId, no canvas found with id "+e);return n}function u(e,n){if(!n||""===n)throw new InvalidInputException(e,"missing parameter "+e);if(n=Number.parseInt(n),!Number.isInteger(n)||n<0)throw new InvalidInputException(e,"invalid pramameter "+e+", should be a positive integer");return n}function c(e,n){return NoventEngine.page(f,e,n)}function v(){return 0==f.index&&f.waiting?f.pages[f.index].play():f.index!=f.pages.length&&f.waiting?f.pages[f.index].play():void(f.index==f.pages.length&&f.waiting&&f.trigger("complete"))}function p(){createjs.Ticker.setFPS(30),createjs.Ticker.addEventListener("tick",f.stage),s&&s(f.stage,f),window.onresize=function(){n(f.canvas)},n(f.canvas)}var f=this;return f.name=o(e),f.canvas=a(t),f.width=f.canvas.width=u("width",r),f.height=f.canvas.height=u("height",i),f.pages=[],f.page=c,f.index=0,f.scope={},f.stage=new createjs.Stage(f.canvas),f.waiting=!0,f.play=v,p(),f};heir.inherit(t,EventEmitter)}(),function(){"use strict";function e(e,t,i){if(!e)throw new InvalidInputException("novent","missing parameter novent");return e.pages[t]?e.pages[t]:(e.pages[t]=new n(e,t,i),e.pages[t])}NoventEngine.page=e;var n=function(e,n,t){function i(e,n){if(void 0===n||""===n)throw new InvalidInputException(e,"missing parameter "+e);if(n=Number.parseInt(n),!Number.isInteger(n)||n<0)throw new InvalidInputException(e,"invalid pramameter "+e+", should be a positive integer");return n}function r(e,n){return NoventEngine.event(a,e,n)}function s(){return 0==a.index?(o(),a.events[a.index].play()):a.index!=a.events.length?a.events[a.index].play():void 0}function o(){t&&t(a.container,a);var e=function(e,n,t){return e.index>n.index?1:e.index<n.index?-1:0};a.container.sortChildren(e),a.novent.stage.addChild(a.container),a.novent.index>0&&a.novent.stage.removeChild(a.novent.pages[n-1].container)}var a=this;if(!e)throw new InvalidInputException("novent","missing parameter novent");return a.index=i("index",n),a.novent=e,a.events=[],a.event=r,a.index=0,a.scope={},a.container=new createjs.Container,a.play=s,a}}();