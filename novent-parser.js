/* Dependency: canvasengine.js */
/* Dependency: novent-reader.js */

if(typeof NoventParser == "undefined") {
	var NoventParser = {
		read: function(noventXml) {
			
			var errors = new Array();
			var noventDescriptor = parseXmlFromString(noventXml);
			
			var noventNode = validateNovent(noventDescriptor, errors);
			if(errors.length != 0) return errors;
			
			var button = validateButton(noventNode, errors);
			if(errors.length != 0) return errors;
			
			var novent = new NoventEngine.Novent("canvas_id", button);
			
			var pageNodes = noventNode.getElementsByTagName("page");
			if(pageNodes.length == 0) {
				errors.push(new NoventXmlStructureException("No page tags, Novent must have at least one page tag."));
				return errors;
			}
			
			for(i = 0; i < pageNodes.length; i++) {
				var pageDescriptor = validatePage(pageNodes[i], errors);
				if(errors.length != 0) return errors;
				
				var page = novent.Pages.New(pageDescriptor);
				
				var events = validateEvents(pageNodes[i], pageDescriptor, errors);
				
				if(errors.length != 0) return errors;
				
				for(j = 0; j < events.length; j++) {
					page.Events.New(events[j]);
				}
			}
			
			return novent;
		}
	}
}

function parseXmlFromString(xmlString) {
	var xmlDoc;
	if (window.DOMParser)
	{
		var parser=new DOMParser();
		xmlDoc=parser.parseFromString(xmlString,"application/xml");
	}
	else // Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async=false;
		xmlDoc.loadXML(xmlString);
	}
	return xmlDoc;
}

function NoventXmlStructureException(message) {
	this.message = message;
	this.name = "NoventXmlStructureException";
	this.toString = function() {
		return this.name + ": " + this.message;
	}
}

function validateNovent(noventDescriptor, errors) {
	if(noventDescriptor.getElementsByTagName("novent").length == 0) {
		errors.push(new NoventXmlStructureException("Missing wrapping tag novent."));
		return null;
	}
	else {
		return noventDescriptor.getElementsByTagName("novent")[0];
	}
}

function validateButton(novent, errors) {
	if(novent.getElementsByTagName("button").length == 0) {
		errors.push(new NoventXmlStructureException("Missing wrapping tag button."));
		return null;
	}
	else {
		var buttonNode = novent.getElementsByTagName("button")[0];
		var button = new Object();
		
		if(buttonNode.attributes.src == undefined || buttonNode.attributes.src.value == "") { 
			errors.push(new NoventXmlStructureException("Missing attribute \"src\" in button tag."));
		} else {
			button.src = buttonNode.attributes.src.value;
		}
		
		if(buttonNode.attributes.x == undefined || Number.isNaN(parseInt(buttonNode.attributes.x.value))) {
			errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"x\" in button tag (Must be an Integer)."));
		} else {
			button.x = parseInt(buttonNode.attributes.x.value);
		}
		
		if(buttonNode.attributes.y == undefined || Number.isNaN(parseInt(buttonNode.attributes.y.value))) { 
			errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"y\" in button tag (Must be an Integer)."));
		}
		else {
			button.y = parseInt(buttonNode.attributes.y.value);
		}
		
		if(buttonNode.attributes.width == undefined || Number.isNaN(parseInt(buttonNode.attributes.width.value)) || parseInt(buttonNode.attributes.width.value) <= 0) {
			errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"width\" in button tag (Must be an positive Integer)."));
		} else {
			button.width = parseInt(buttonNode.attributes.width.value);
		}
		
		if(buttonNode.attributes.height == undefined || Number.isNaN(parseInt(buttonNode.attributes.height.value)) || parseInt(buttonNode.attributes.height.value) <= 0) {
			errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"height\" in button tag (Must be an positive Integer)."));
		} else {
			button.height = parseInt(buttonNode.attributes.height.value);
		}
		
		return button;
	}
}

function validatePage(pageNode, errors) {
	var page = new Object();
	page.materials = new Object();
	page.materials.images = new Object();
	page.materials.sounds = new Object();
	page.materials.fonts = new Object();
	page.materials.animations = new Object();
	page.materials.texts = new Object();
	
	if(pageNode.attributes.name == undefined || pageNode.attributes.name.value == "") {
		errors.push(new NoventXmlStructureException("Missing attribute \"name\" in page definition"));
	}
	else {
		page.name = pageNode.attributes.name.value;
	}
	
	if(pageNode.getElementsByTagName("materials").length == 0) {
		errors.push(new NoventXmlStructureException("Missing tag \"materials\" in page definition (" + page.name + ")."));
		return page;
	}
	
	if(pageNode.getElementsByTagName("events").length == 0) {
		errors.push(new NoventXmlStructureException("Missing tag \"events\" in page definition (" + page.name + ")."));
		return page;
	}
	
	var materials = pageNode.getElementsByTagName("materials")[0];
	
	for(l = 0; l < materials.getElementsByTagName("image").length; l++) {
		validateImageMaterials(materials.getElementsByTagName("image")[l], page.materials.images, errors);
	}
	
	for(l = 0; l < materials.getElementsByTagName("sound").length; l++) {
		validateSoundMaterials(materials.getElementsByTagName("sound")[l], page.materials.sounds, errors);
	}
	
	for(l = 0; l < materials.getElementsByTagName("animation").length; l++) {
		validateAnimationMaterials(materials.getElementsByTagName("animation")[l], page.materials.animations, errors);
	}
	
	for(l = 0; l < materials.getElementsByTagName("text").length; l++) {
		validateTextMaterials(materials.getElementsByTagName("text")[l], page.materials.texts, errors);
	}
	
	for(l = 0; l < materials.getElementsByTagName("font").length; l++) {
		validateFontMaterials(materials.getElementsByTagName("font")[l], page.materials.fonts, errors);
	}
	
	return page;
}

function validateEvents(pageNode, pageDescriptor, errors) {
	var events = new Array();
	var eventNodes = pageNode.getElementsByTagName("event");
	
	if(eventNodes.length == 0) {
		errors.push(new NoventXmlStructureException("No events in page " + pageNode.attributes.name.value + "."));
		return events;
	}
	
	for(k= 0; k < eventNodes.length; k++) {
		var eventFunction = validateEvent(eventNodes[k], pageDescriptor, errors);
		if(eventFunction != null)
			events.push(eventFunction);
	}
	
	return events;
}

function validateEvent(eventNode, pageDescriptor, errors) {
	var eventElements = eventNode.children;
	var eventFunctions = new Array();
	
	for(m = 0; m < eventElements.length; m++) {
		if(eventElements[m].nodeName == "animate") {
			var animate = validateAnimateEvent(eventElements[m], pageDescriptor, errors);
			var change = new Object();
			change[animate.property] = animate.value;
			var subFunction = validateEvent(eventElements[m], pageDescriptor, errors);
			
			if(subFunction != null) {
				if(animate.targetType != "sounds") {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Timeline.new(readyObj.materials[animate.targetType][animate.target]).to(change, animate.duration, Ease[animate.ease]).call(function() {
							subFunction(canvas, readyObj, callback);
						});
					});
				}
				else if(animate.property == "volume") {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Sound.fadeTo(animate.target, animate.duration, animate.value, function() {
							subFunction(canvas, readyObj, callback);
						});
					});
				}
			}
			else {
				if(animate.targetType != "sounds") {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Timeline.new(readyObj.materials[animate.targetType][animate.target]).to(change, animate.duration, Ease[animate.ease]).call();
					});
				}
				else if(animate.property == "volume") {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Sound.fadeTo(animate.target, animate.duration, animate.value);
					});
				}
			}
		}
		else if(eventElements[m].nodeName == "play") {
			var play = validatePlayEvent(eventElements[m], pageDescriptor, errors);
			
			var subFunction = validateEvent(eventElements[m], pageDescriptor, errors);
			
			if(play.targetType == "animations") {
				eventFunctions.push(function(canvas, readyObj, callback) {
					readyObj.materials[play.targetType][play.target].play(play.loop, function() {
						subFunction(canvas, readyObj, callback);
					});
				});
			}
			else if(play.targetType == "sounds") {
				if(play.loop == "loop") {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Sound.playLoop(play.target);
					});
				}
				else {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Sound.get(play.target).play();
					});
				}
			}
		}
		else if(eventElements[m].nodeName == "wait") {
			var durationAttr = eventElements[m].attributes.duration;
			if(durationAttr != undefined && !Number.isNaN(parseInt(durationAttr.value)) && parseInt(durationAttr.value) >= 0) {
				var subFunction = validateEvent(eventElements[m], pageDescriptor, errors);
				
				if(subFunction != null) {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Timeline.new(readyObj.button).wait(parseInt(durationAttr.value)).call(function() {
							subFunction(canvas, readyObj, callback);
						});
					});
				}
				else {
					eventFunctions.push(function(canvas, readyObj, callback) {
						canvas.Timeline.new(readyObj.button).wait(parseInt(durationAttr.value)).call();
					});
				}
			}
			else {
				errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"duration\" in wait tag (Must be an Integer)."));
			}
		}
		else if(eventElements[m].nodeName == "wiggle") {
			var wiggle = validateWiggleEvent(eventElements[m], pageDescriptor, errors);
			console.log(wiggle);
			
			eventFunctions.push(function(canvas, readyObj, callback) {
				var wiggleObj = new readyObj.wiggle(wiggle.name, wiggle.targetType, wiggle.target, wiggle.property, wiggle.amplitude, wiggle.frequency, wiggle.ease);
				wiggleObj.start();
			});
		}
		else if(eventElements[m].nodeName == "stop") {
			if(eventElements[m].attributes.target != undefined) {
				var target = eventElements[m].attributes.target.value;
			
				eventFunctions.push(function(canvas, readyObj, callback) {
					readyObj.materials.wiggles[target].stop();
				});
			}
			else {
				errors.push(new NoventXmlStructureException("Missing attribute \"target\" in stop tag."));
			}
		}
		else if(eventElements[m].nodeName == "end") {
			eventFunctions.push(function(canvas, readyObj, callback) {
				callback();
			});
		}
	}
	
	if(eventElements.length > 0) {
		return function(canvas, readyObj, callback) 
		{
			eventFunctions.forEach(function(e, n) {
				e(canvas, readyObj, callback);
			});
		}
	}
	else {
		return null;
	}
}

function validatePlayEvent(playNode, pageDescriptor, errors) {
	var play = new Object();
	
	if(playNode.attributes.target == undefined || playNode.attributes.target.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"target\" in play tag."));
	} else {
		var targetArgs = playNode.attributes.target.value.split(":");
		if(targetArgs.length != 2) {
			errors.push(new NoventXmlStructureException("Error in target structure for play tag, please respect \"targetType:targetName\"."));
		}
		else {
			if(targetArgs[0] == "sound" || targetArgs[0] == "animation") {
				play.targetType = targetArgs[0] + "s";
				
				if(pageDescriptor.materials[play.targetType][targetArgs[1]] == undefined) {
					errors.push(new NoventXmlStructureException("Unknown material for target in play tag: " + targetArgs[1]));
				}
				else {
					play.target = targetArgs[1];
				}
				
			}
			else {
				errors.push(new NoventXmlStructureException("Unknown target type in play tag: " + targetArgs[0]));
			}
		}
	}
	
	if(playNode.attributes.loop == undefined || playNode.attributes.target.loop == "") {
		play.loop = undefined;
	} else {
		play.loop = playNode.attributes.loop.value;
	}
	
	return play;
}

function validateAnimateEvent(animateNode, pageDescriptor, errors) {
	var animate = new Object();
	
	if(animateNode.attributes.target == undefined || animateNode.attributes.target.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"target\" in animate tag."));
	} else {
		var targetArgs = animateNode.attributes.target.value.split(":");
		if(targetArgs.length != 2) {
			errors.push(new NoventXmlStructureException("Error in target structure for animate tag, please respect \"targetType:targetName\"."));
		}
		else {
			if(targetArgs[0] == "image" || targetArgs[0] == "sound" || targetArgs[0] == "animation" || targetArgs[0] == "text") {
				animate.targetType = targetArgs[0] + "s";
				
				if(pageDescriptor.materials[animate.targetType][targetArgs[1]] == undefined) {
					errors.push(new NoventXmlStructureException("Unknown material for target in animate tag: " + targetArgs[1]));
				}
				else {
					animate.target = targetArgs[1];
				}
				
			}
			else {
				errors.push(new NoventXmlStructureException("Unknown target type in animate tag: " + targetArgs[0]));
			}
		}
	}
	
	if(animateNode.attributes.property == undefined || animateNode.attributes.property.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"property\" in animate tag."));
	} else {
		animate.property = animateNode.attributes.property.value;
	}
	
	if(animateNode.attributes.value == undefined || animateNode.attributes.value.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"value\" in animate tag."));
	} else {
		animate.value = animateNode.attributes.value.value;
	}
	
	if(animateNode.attributes.duration == undefined || Number.isNaN(parseInt(animateNode.attributes.duration.value))) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"duration\" in animate tag (Must be an Integer)."));
	} else {
		animate.duration = parseInt(animateNode.attributes.duration.value);
	}
	
	return animate;
}

function validateWiggleEvent(wiggleNode, pageDescriptor, errors) {
	var wiggle = new Object();
	
	if(wiggleNode.attributes.name == undefined || wiggleNode.attributes.name.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"name\" in wiggle tag."));
	} else {
		wiggle.name = wiggleNode.attributes.name.value;
	}
	
	if(wiggleNode.attributes.target == undefined || wiggleNode.attributes.target.value == "") {
		errors.push(new NoventXmlStructureException("Missing attribute \"target\" in wiggle tag."));
	} else {
		var targetArgs = wiggleNode.attributes.target.value.split(":");
		if(targetArgs.length != 2) {
			errors.push(new NoventXmlStructureException("Error in target structure for wiggle tag, please respect \"targetType:targetName\"."));
		}
		else {
			if(targetArgs[0] == "image" || targetArgs[0] == "sound" || targetArgs[0] == "animation" || targetArgs[0] == "text") {
				wiggle.targetType = targetArgs[0] + "s";
				
				if(pageDescriptor.materials[wiggle.targetType][targetArgs[1]] == undefined) {
					errors.push(new NoventXmlStructureException("Unknown material for target in wiggle tag: " + targetArgs[1]));
				}
				else {
					wiggle.target = targetArgs[1];
				}
				
			}
			else {
				errors.push(new NoventXmlStructureException("Unknown target type in wiggle tag: " + targetArgs[0]));
			}
		}
	}
	
	if(wiggleNode.attributes.property == undefined || wiggleNode.attributes.property.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"property\" in wiggle tag."));
	} else {
		wiggle.property = wiggleNode.attributes.property.value;
	}
	
	if(wiggleNode.attributes.amplitude == undefined || wiggleNode.attributes.amplitude.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"property\" in wiggle tag."));
	} else {
		wiggle.amplitude = wiggleNode.attributes.amplitude.value;
	}
	
	if(wiggleNode.attributes.frequency == undefined || Number.isNaN(parseInt(wiggleNode.attributes.frequency.value))) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"frequency\" in wiggle tag (Must be an Integer)."));
	} else {
		wiggle.frequency = parseInt(wiggleNode.attributes.frequency.value);
	}
	
	if(wiggleNode.attributes.ease == undefined || wiggleNode.attributes.ease.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"ease\" in wiggle tag."));
	} else {
		wiggle.ease = wiggleNode.attributes.ease.value;
	}
	
	return wiggle;
}

function validateImageMaterials(imageNode, imagesObj, errors) {
	var image = new Object();
	var name;
	
	if(imageNode.attributes.name == undefined || imageNode.attributes.name.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"name\" in image tag."));
	} else {
		name = imageNode.attributes.name.value;
	}
	
	if(imageNode.attributes.src == undefined || imageNode.attributes.src.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"src\" in image tag (" + name + ")."));
	} else {
		image.src = imageNode.attributes.src.value;
	}
	
	if(imageNode.attributes.x == undefined || Number.isNaN(parseInt(imageNode.attributes.x.value))) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"x\" in image tag (Must be an Integer)."));
	} else {
		image.x = parseInt(imageNode.attributes.x.value);
	}
	
	if(imageNode.attributes.y == undefined || Number.isNaN(parseInt(imageNode.attributes.y.value))) { 
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"y\" in image tag (Must be an Integer)."));
	}
	else {
		image.y = parseInt(imageNode.attributes.y.value);
	}
	
	if(imageNode.attributes.width == undefined || Number.isNaN(parseInt(imageNode.attributes.width.value)) || parseInt(imageNode.attributes.width.value) <= 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"width\" in image tag (Must be an positive Integer)."));
	} else {
		image.width = parseInt(imageNode.attributes.width.value);
	}
	
	if(imageNode.attributes.height == undefined || Number.isNaN(parseInt(imageNode.attributes.height.value)) || parseInt(imageNode.attributes.height.value) <= 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"height\" in image tag (Must be an positive Integer)."));
	} else {
		image.height = parseInt(imageNode.attributes.height.value);
	}
	
	if(imageNode.attributes.opacity == undefined || Number.isNaN(parseInt(imageNode.attributes.opacity.value)) || parseInt(imageNode.attributes.opacity.value) < 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"opacity\" in image tag (Must be an positive Integer)."));
	} else {
		image.opacity = parseInt(imageNode.attributes.opacity.value);
	}
	
	if(name != undefined)
		imagesObj[name] = image;
	
	return image;
}

function validateSoundMaterials(soundNode, soundsObj, errors) {
	var name;
	var sound = new Object();
	
	if(soundNode.attributes.name == undefined || soundNode.attributes.name.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"name\" in sound tag."));
	} else {
		name = soundNode.attributes.name.value;
	}
	
	if(soundNode.attributes.src == undefined || soundNode.attributes.src.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"src\" in sound tag (" + name + ")."));
	} else {
		sound.src = soundNode.attributes.src.value;
	}
	
	if(soundNode.attributes.volume == undefined || Number.isNaN(parseFloat(soundNode.attributes.volume.value)) || parseFloat(soundNode.attributes.volume.value) <= 0 || parseFloat(soundNode.attributes.volume.value) >= 1) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"volume\" in sound tag (Must be between 0 and 1)."));
	} else {
		sound.volume = parseFloat(soundNode.attributes.volume.value);
	}
	
	if(name != undefined)
		soundsObj[name] = sound;
	
	return sound;
}

function validateAnimationMaterials(animationNode, animationsObj, errors) {
	var animation = new Object();
	var name;
	
	if(animationNode.attributes.name == undefined || animationNode.attributes.name.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"name\" in animation tag."));
	} else {
		name = animationNode.attributes.name.value;
	}
	
	if(animationNode.attributes.src == undefined || animationNode.attributes.src.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"src\" in animation tag (" + name + ")."));
	} else {
		animation.src = animationNode.attributes.src.value;
	}
	
	if(animationNode.attributes.x == undefined || Number.isNaN(parseInt(animationNode.attributes.x.value))) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"x\" in animation tag (Must be an Integer)."));
	} else {
		animation.x = parseInt(animationNode.attributes.x.value);
	}
	
	if(animationNode.attributes.y == undefined || Number.isNaN(parseInt(animationNode.attributes.y.value))) { 
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"y\" in animation tag (Must be an Integer)."));
	}
	else {
		animation.y = parseInt(animationNode.attributes.y.value);
	}
	
	if(animationNode.attributes.width == undefined || Number.isNaN(parseInt(animationNode.attributes.width.value)) || parseInt(animationNode.attributes.width.value) <= 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"width\" in animation tag (Must be an positive Integer)."));
	} else {
		animation.width = parseInt(animationNode.attributes.width.value);
	}
	
	if(animationNode.attributes.height == undefined || Number.isNaN(parseInt(animationNode.attributes.height.value)) || parseInt(animationNode.attributes.height.value) <= 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"height\" in animation tag (Must be an positive Integer)."));
	} else {
		animation.height = parseInt(animationNode.attributes.height.value);
	}
	
	if(animationNode.attributes.frames == undefined || Number.isNaN(parseInt(animationNode.attributes.frames.value)) || parseInt(animationNode.attributes.frames.value) <= 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"frames\" in animation tag (Must be an positive Integer)."));
	} else {
		animation.frames = parseInt(animationNode.attributes.frames.value);
	}
	
	if(animationNode.attributes.frequency == undefined || Number.isNaN(parseInt(animationNode.attributes.frequency.value)) || parseInt(animationNode.attributes.frequency.value) <= 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"frequency\" in animation tag (Must be an positive Integer)."));
	} else {
		animation.frequency = parseInt(animationNode.attributes.frequency.value);
	}
	
	if(name != undefined)
		animationsObj[name] = animation;
	
	return animation;
}

function validateTextMaterials(textNode, textsObj, errors) {
	var text = new Object();
	var name;
	
	if(textNode.attributes.name == undefined || textNode.attributes.name.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"name\" in text tag."));
	} else {
		name = textNode.attributes.name.value;
	}
	
	if(textNode.attributes.x == undefined || Number.isNaN(parseInt(textNode.attributes.x.value))) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"x\" in text tag (Must be an Integer)."));
	} else {
		text.x = parseInt(textNode.attributes.x.value);
	}
	
	if(textNode.attributes.y == undefined || Number.isNaN(parseInt(textNode.attributes.y.value))) { 
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"y\" in text tag (Must be an Integer)."));
	}
	else {
		text.y = parseInt(textNode.attributes.y.value);
	}
	
	if(textNode.attributes.width == undefined || Number.isNaN(parseInt(textNode.attributes.width.value)) || parseInt(textNode.attributes.width.value) <= 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"width\" in text tag (Must be an positive Integer)."));
	} else {
		text.width = parseInt(textNode.attributes.width.value);
	}
	
	if(textNode.attributes.opacity == undefined || Number.isNaN(parseInt(textNode.attributes.opacity.value)) || parseInt(textNode.attributes.opacity.value) < 0) {
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"opacity\" in text tag (Must be an positive Integer)."));
	} else {
		text.opacity = parseInt(textNode.attributes.opacity.value);
	}
	
	if(textNode.attributes.lineHeight == undefined || Number.isNaN(parseInt(textNode.attributes.lineHeight.value))) { 
		errors.push(new NoventXmlStructureException("Missing or Invalid attribute \"lineHeight\" in text tag (Must be an Integer)."));
	}
	else {
		text.lineHeight = parseInt(textNode.attributes.lineHeight.value);
	}
	
	if(textNode.attributes.size != undefined)
		text.size = textNode.attributes.size.value;
	
	if(textNode.attributes.font != undefined)
		text.font = textNode.attributes.font.value;
	
	if(textNode.attributes.color != undefined)
		text.color = textNode.attributes.color.value;
	
	if(textNode.attributes.align != undefined)
		text.align = textNode.attributes.align.value;
	
	text.text = textNode.textContent;
	
	if(name != undefined)
		textsObj[name] = text;
	
	return text;
}

function validateFontMaterials(fontNode, fontsObj, errors) {
	var name;
	var src;
	
	if(fontNode.attributes.name == undefined || fontNode.attributes.name.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"name\" in font tag."));
	} else {
		name = fontNode.attributes.name.value;
	}
	
	if(fontNode.attributes.src == undefined || fontNode.attributes.src.value == "") { 
		errors.push(new NoventXmlStructureException("Missing attribute \"src\" in font tag (" + name + ")."));
	} else {
		src = fontNode.attributes.src.value;
	}
	
	if(name != undefined && src != undefined)
		fontsObj[name] = src;
}