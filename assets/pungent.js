// json2.js from https://github.com/douglascrockford/JSON-js
var JSON;if(!JSON){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());


(function($) {
    // adapted from http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area/841121#841121
  $.fn.setCaretPos = function(pos) {
    return this.each(function() {
      var ta = $(this).getNodeTA().get(0);
      if(ta.setSelectionRange) {
        ta.focus();
        ta.setSelectionRange(pos, pos);
      } else if(ta.createTextRange) {
        var range = ta.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    });
  }

  // adapted from http://stackoverflow.com/questions/235411/is-there-an-internet-explorer-approved-substitute-for-selectionstart-and-selectio/4207763#4207763 
  $.fn.getInputSelection = function() {
    var ta = $(this).getNodeTA().get(0);
    var start = 0, end = 0, normalizedValue, range,
      textInputRange, len, endRange;

    if (typeof ta.selectionStart == "number" && typeof ta.selectionEnd == "number") {
      start = ta.selectionStart;
      end = ta.selectionEnd;
    } else {
      range = document.selection.createRange();

      if (range && range.parentElement() == ta) {
        len = ta.value.length;
        normalizedValue = ta.value.replace(/\r\n/g, "\n");

        // Create a working TextRange that lives only in the input
        textInputRange = ta.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());

        // Check if the start and end of the selection are at the very end
        // of the input, since moveStart/moveEnd doesn't return what we want
        // in those cases
        endRange = ta.createTextRange();
        endRange.collapse(false);

        if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
          start = end = len;
        } else {
          start = -textInputRange.moveStart("character", -len);
          start += normalizedValue.slice(0, start).split("\n").length - 1;

          if(textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
	    end = len;
          } else {
	    end = -textInputRange.moveEnd("character", -len);
            end += normalizedValue.slice(0, end).split("\n").length - 1;
          }
        }
      }
    }

    return {
      start: start,
      end: end
    };
  }

  $.fn.getCaretPos = function() {
    return this.getInputSelection().start;
  };

})(jQuery);




/**
 * TextAreaExpander plugin for jQuery
 * v1.0
 * Expands or contracts a textarea height depending on the
 * quatity of content entered by the user in the box.
 *
 * By Craig Buckler, Optimalworks.net
 *
 * As featured on SitePoint.com:
 * http://www.sitepoint.com/blogs/2009/07/29/build-auto-expanding-textarea-1/
 *
 * Please use as you wish at your own risk.
 */

/**
 * Usage:
 *
 * From JavaScript, use:
 *     $(<node>).TextAreaExpander(<minHeight>, <maxHeight>);
 *     where:
 *       <node> is the DOM node selector, e.g. "textarea"
 *       <minHeight> is the minimum textarea height in pixels (optional)
 *       <maxHeight> is the maximum textarea height in pixels (optional)
 *
 * Alternatively, in you HTML:
 *     Assign a class of "expand" to any <textarea> tag.
 *     e.g. <textarea name="textarea1" rows="3" cols="40" class="expand"></textarea>
 *
 *     Or assign a class of "expandMIN-MAX" to set the <textarea> minimum and maximum height.
 *     e.g. <textarea name="textarea1" rows="3" cols="40" class="expand50-200"></textarea>
 *     The textarea will use an appropriate height between 50 and 200 pixels.
 */

(function($) {

  // jQuery plugin definition
  $.fn.TextAreaExpander = function(minHeight, maxHeight) {

    var hCheck = !($.browser.msie || $.browser.opera);

    // resize a textarea
    function ResizeTextarea(e) {

      // event or initialize element?
      e = e.target || e;

      // find content length and box width
      var vlen = e.value.length, ewidth = e.offsetWidth;
      if (vlen != e.valLength || ewidth != e.boxWidth) {

        if (hCheck && (vlen < e.valLength || ewidth != e.boxWidth))
          e.style.height = "0px";
        var h = Math.max(e.expandMin, Math.min(e.scrollHeight, e.expandMax));

        e.style.overflow = (e.scrollHeight > h ? "auto" : "hidden");
        e.style.height = h + "px";

        e.valLength = vlen;
        e.boxWidth = ewidth;
      }

      return true;
    };

    // initialize
    this.each(function() {

    // is a textarea?
    if (this.nodeName.toLowerCase() != "textarea") return;

    // set height restrictions
    var p = this.className.match(/expand(\d+)\-*(\d+)*/i);
    this.expandMin = minHeight || (p ? parseInt('0'+p[1], 10) : 0);
    this.expandMax = maxHeight || (p ? parseInt('0'+p[2], 10) : 99999);

    this.ResizeTextarea = function() { ResizeTextarea(this); };

    // zero vertical padding and add events
    if (!this.Initialized) {
      this.Initialized = true;
      $(this).css("padding-top", 3).css("padding-bottom", 3);
    }
  });

  return this;
};

})(jQuery);



(function($) {
    var pungent,
        changed = false;

  $.fn.pungentInit = function() {
    pungent = this;
    var check = pungent.checkAuth();
    if(document.cookie === '' || check === false) {
      pungent.initDemo();
    } else {
      $('#ident').text(check);
      this.getNotes();
    }
  };


  $.fn.checkAuth = function() {
    var ret;
    var resp = function(data) {
      if(data === "invalid") {
        ret = false;
      } else {
        ret = data;
      }
    };

    // this request cant be asynchronous; we cant proceed until auth is verified
    $.ajax({
      url: 'auth/?a=check',
      type: 'GET',
      async: false,
      success: resp
    });

    return ret;
  };


  $.fn.getNotes = function() {
      var resp = function(data) {
        if(data.indexOf("error") === 0) {
          alert(data);
          pungent.initDemo();
        } else if(data === "invalid") {
          pungent.initDemo();
        } else {
          pungent.initFull(data);
        }
      };

    $.ajax({
      url: 'notes/?m=get',
      type: 'GET',
      success: resp
    });

  };


  $.fn.initDemo = function() {
    pungent = pungent || this;
    pungent.appendNode("This document is in demo mode; changes will not be saved.\nLog in to save changes.");
    $('#login').show();
  };


  $.fn.initFull = function(data) {
    if(data !== '') {
      pungent.addToDoc(JSON.parse(data));
    } else {
      pungent.appendNode("");
    }

    // If we addClass('collapsed') in addToDoc, display of the children of collapsed nodes
    // is corrupted when we uncollapse (presumably because of the CSS rule that child nodes
    // of a collapsed node have "display: none", so resizeText has no effect).
    $('.collapse').addClass('collapsed').removeClass('collapse');

    // Focus first top-level node
    pungent.children(':first').setFocus();

    $('#loggedin').show();
    setInterval(function() { pungent.saveChanges(); }, 9001);
  }


  $.fn.addToDoc = function(narr) {
    var node = this;
    var newnode;
    for(var i = 0; i < narr.length; i += 1) {
      newnode = node.appendNode(narr[i]['t'], narr[i]['i']);
      if(narr[i]['co']) newnode.addClass('collapse');
      newnode.addToDoc(narr[i]['ch']);
    }
  }


  $.fn.saveChanges = function() {
    if(changed) {
      var snap = this.snapshot();
      $.ajax({
        url: 'notes/?m=set',
        data: {'notes': JSON.stringify(snap)},
        type: 'POST',
        success: function(data) { 
	  if(data.indexOf("error") === 0) {
            alert(data);
          } else {
            changed = false;
            $('#logo').css('background-position', '0px 0px');
          }
        }
      });
    }
  };


  $.fn.snapshot = function() {
    var childs = this.children();
    var node, obj;
    var snap = [];

    for(var i = 0; i < childs.length; i += 1) {
      node = $(childs[i]);
      obj = {
        i: node.attr('id'), 
        t: node.getNodeTA().val(),
        co: node.hasClass('collapsed'),
        ch: node.children('.children').snapshot()
      };
      snap[i] = obj;
    }

    return snap;
  };


  $.fn.prependNode = function(ta_val, node_id) {
    var par_el = this.children('.children');

    var newnode = this.createNode(ta_val, node_id);
    newnode.prependTo(par_el).setFocus();
    return newnode.resizeText();
  };

 
  $.fn.appendNode = function(ta_val, node_id) {
    var par_el = (this === pungent) ? pungent : this.children('.children');

    var newnode = this.createNode(ta_val, node_id);
    newnode.appendTo(par_el);
    return newnode.resizeText();
  };

  // Caret position-aware creation of a new node. All text after the caret is moved to
  // a new node inserted after the current node. All text before remains in current node.
  $.fn.spawnNode = function() {
    var pos = this.getCaretPos(0);
    var txt = this.children('textarea').val();
    var txt1 = txt.substr(0, pos);
    var txt2 = txt.substr(pos);
    var newnode;

    if(this.hasClass('zoom_header') ||
       this.childNodes() !== false && !this.hasClass('collapsed')) {
      newnode = this.prependNode();
    } else {
      newnode = this.insertNode(txt2);
    }


    if(!this.hasClass('zoom_header') && pos !== txt.length) {
      this.children('textarea').val(txt1);
      this.appendChildrenTo(newnode);
    }

    pungent.flagChange();
    return false;
  };


  $.fn.insertNode = function(ta_val, node_id) {
    var newnode = this.createNode(ta_val, node_id);
    newnode.insertAfter(this).setFocus();
    return newnode.resizeText();
  };


  $.fn.createNode = function(ta_val, node_id) {
    ta_val = ta_val || '';
    var newnode = $(document.createElement('div')).addId(node_id).addClass('node');
    var newta = $(document.createElement('textarea')).appendTo(newnode).val(ta_val);
    var newcdiv = $(document.createElement('div')).addClass('children').appendTo(newnode);
    newta.TextAreaExpander().bindEvents();
    return newnode.data('text', ta_val);
  };

  $.fn.setFocus = function() {
    this.children('textarea').focus();
  };

  $.fn.addId = function(node_id) {
    if(typeof node_id === 'undefined') {
      do {
        node_id = Math.round(Math.random()*Math.pow(36, 10)).toString(36);
      } while($("#"+node_id).length !== 0);
    }

    return this.attr("id", node_id);
  }

  $.fn.indentText = function(direction) {
    var node = this;
    var prev, parent;

    if(direction === 1) {
      if((prev = node.prevSibling()) !== false) {
        node.appendTo(prev.children('.children')).setFocus();
        pungent.flagChange();
      }
    } else {
      if((parent = node.parentNode()) !== false) {
        node.insertAfter(parent);
        node.setFocus();
        pungent.flagChange();
      }
    }
    return false;
  };

  $.fn.prevSibling = function() {
    var prev = this.prev();
    return (prev.length !== 0) ? prev : false;
  };

  $.fn.nextSibling = function() {
    var next = this.next();
    return (next.length !== 0) ? next : false;
  };


  $.fn.parentNode = function() {
    var parent = this.parent();
    return (parent.attr('id') !== 'content') ? parent.parent() : false;
  };


  $.fn.childNodes = function() {
    if(this !== pungent) {
      var children = this.children('.children').children();
      return (children.length !== 0) ? children : false;
    } else {
      return this.children('.node');
    }
  }


  $.fn.firstChild = function() {
    var children = this.childNodes();
    return (children !== false) ? $(children[0]) : false;
  };


  $.fn.ancestors = function() {
    var children = this.childNodes();
    var anc = $([]);
    var this_anc, this_child;

    for(var i = 0; i < children.length; i++) {
      this_child = $(children.get(i));
      this_anc = this_child.ancestors();

      anc = anc.add(this_child);
      if(this_anc.length !== 0) {
        anc = anc.add(this_anc);
      }
    }
    return anc;
  };


  $.fn.getNodeTA = function() {
    return this.children('textarea');
  };


  $.fn.appendChildrenTo = function(node) {
    var childs = this.childNodes();
    if(childs !== false)
      childs.appendTo(node.children('.children'));
  };


  // sometimes i lose nodes if i hold *down*. weird science?
  $.fn.moveNode = function(direction) {
    var nextnode = (direction === 1) ? this.getAboveEl() : this.getBelowEl();

    if(direction === 1) {
      var above = this.getAboveEl();

      var prev = this.prevSibling();
      var parent = this.parentNode();

      if(above !== false) {
        if(prev !== false && above.get(0) == prev.get(0)) {
          this.insertBefore(prev);
        } else if(parent !== false && above.get(0) == parent.get(0)) {
          this.insertBefore(parent);
        } else {
          this.insertAfter(above);
	}
        this.flagChange();
        this.setFocus();
      }

    } else {
      var below = this.getBelowEl();
      var next = this.nextSibling();

      if(below !== false) {
        if(next !== false) {
	    if(next.childNodes() !== false && !next.hasClass('collapsed')) {
            this.prependTo(next.children('.children'));
          } else {
            this.insertAfter(next);
          }
        } else {
          this.insertBefore(below);
	}
        this.flagChange();
        this.setFocus();
      }
    }
  };


  // Despite the name, this also uncollapses
  $.fn.collapseNode = function() {
    if(!this.hasClass('collapsed')) {
      this.addClass('collapsed');
    } else {
      this.removeClass('collapsed');
    }
    pungent.flagChange();
  };


  $.fn.deleteNode = function() {
    var tlnodes = pungent.children();

    // if this isnt the only top-level node
    if(tlnodes.length !== 1 || tlnodes[0] != this[0]) {

      var newfoc;
      if((newfoc = this.prevSibling()) !== false) {
        newfoc.setFocus();
      } else if((newfoc = this.parentNode()) !== false) {
        newfoc.setFocus();
      } else if((newfoc = this.nextSibling()) !== false) {
        newfoc.setFocus();
      }

      this.remove();
      pungent.flagChange();
    } else {
      // If the user wants to delete the sole top-level node, do some sorcery
      this.children().remove();
      this.getNodeTA().val('');
      pungent.flagChange();
    }
  
  };


  $.fn.moveFocus = function(direction) {
    var nextnode = (direction === 1) ? this.getAboveEl() : this.getBelowEl();

    if(nextnode !== false)
      nextnode.setFocus();
    
    return nextnode;
  };


  // This logic is incorrect. consider:
  // - one
  //     - a
  //     - b
  //         - 1
  // - two
  //
  // Where the 'b' node is collapsed. If we're focused on 'two', then this will move to 'one', when really
  // it should move to 'b'
  $.fn.getAboveEl = function() {
    var above, ld;

    if((above = this.prevSibling()) !== false) {
      return above.getLowestDescendant();
    } else if((above = this.parentNode()) !== false) {
      return above;
    } else {
      return false;
    }
  };


  $.fn.getBelowEl = function() {
    var below;

    if((below = this.firstChild()) !== false && !this.hasClass('collapsed'))
      return below;
    else if((below = this.nextSibling()) !== false)
      return below;
    else if((below = this.getFirstAncestorNextSibling()) !== false)
      return below;
    else
      return false;
  };



  /* if your doc is like this:
   *
   * a
   *     bee
   *         sea   <---
   *     dDd
   * EEEEE
   *
   * Where the cursor is on the "sea" node, then this function will return the
   * "dDd" node because it is the first node that is the next sibling of an
   * ancestor of "sea".
   *
   * Similarly, for a document looking like:
   *
   * woof
   *     meow
   *         caw   <---
   * squeak
   *
   * this function returns the "squeak" node.
   */
  $.fn.getFirstAncestorNextSibling = function() {
    var parent = this.parentNode();

    if(parent !== false) {
      var ns = parent.nextSibling();

      if(ns !== false)
        return ns;
      else
        return parent.getFirstAncestorNextSibling();
    } else {
        return false;
    }
  };

  $.fn.getLowestDescendant = function() {
    var children = this.childNodes();

    if(children === false || this.hasClass('collapsed'))
      return this;
    else
      return children.last().getLowestDescendant();
  };

  
  $.fn.resizeText = function() {
    return this.each(function() {
      var node = $(this);

      var ta = node.getNodeTA();
      ta.get(0).ResizeTextarea();

      var new_val = ta.val();
      if(new_val !== node.data("text")) {
        node.data("text", new_val);
        pungent.flagChange();
      }

    });
  };

  $.fn.flagChange = function() {
    if(changed === false) {
      changed = true;
      $('#logo').css('background-position', '0px -24px');
    }
  };

  $.fn.doBackspace = function() {
    // BACKSPACING:
    // if no children and empty
    //     if not the only node
    //         delete, move up to previous node
    //
    // else
    //     if the node has a previous sibling without children:
    //         append text of chunk to the end of previous sibling
    //         move chunk's children to the previous sibling
    //         set caret position to right before text of appended chunk
    var ta = this.getNodeTA();

    if(this.childNodes() === false && ta.val() === '') {
      var tlnodes = pungent.children();

      if(tlnodes.length !== 1 || tlnodes[0] != this[0]) {
        // If we're deleting the top-most node, move down
        if(tlnodes[0] == this[0]) {
          this.moveFocus(-1);
        } else {
          var up = this.moveFocus(1);
          up.setCaretPos(up.getNodeTA().val().length);
        }

        this.remove();
        pungent.flagChange();
        return false;
      }

    } else {
      var prev = this.prevSibling();

      if(prev !== false && prev.childNodes() === false) {
	var txt = ta.val();
        var prev_txt = prev.getNodeTA().val();
        prev.getNodeTA().val(prev_txt+txt);
        this.appendChildrenTo(prev);

        this.remove();
        prev.setFocus();
        prev.setCaretPos(prev_txt.length);
        pungent.flagChange();
        return false;
      }
    }
  };

  // hack to get around the way ResizeTextarea() works because I'm too lazy
  // to redesign it
  $.fn.resizeAfterFontSizeChange = function() {
    var ta = this.getNodeTA();
    var val = ta.val();
    ta.val(val+' ');
    ta.get(0).ResizeTextarea();
    ta.val(val);
  };



  $.fn.zoom = function(direction) {
    if(direction === 1) { // zoom in
      var node = this;

      var zh = $('.zoom_header');
      if(zh.length !== 0) { zh.removeClass('zoom_header'); }
      
      this.addClass('zoom_header');
      this.resizeAfterFontSizeChange();
      this.siblings().addClass('zoomed_away');

      while((node = node.parentNode()) !== false) {
        node.addClass('zoomed_past');
        node.siblings().addClass('zoomed_away');
      }

      if(this.childNodes() !== false) {
        this.ancestors().resizeText();
        this.firstChild().setFocus();
      }

    } else { // zoom out
      var zh = $('.zoom_header');
      var zh_parent = zh.parentNode();

      zh.removeClass('zoom_header').setFocus();
      zh.resizeAfterFontSizeChange();
      zh.siblings().removeClass('zoomed_away');

      if(zh_parent !== false) {
        zh_parent.removeClass('zoomed_past');
        zh_parent.addClass('zoom_header');
        zh_parent.resizeAfterFontSizeChange();
        zh_parent.ancestors().resizeText();
      } else {
        pungent.ancestors().resizeText();
      }
    }
  };

  // I don't know why this is needed but experience on chrome 10 and 11 suggests 
  // it is so.
  $.fn.webkitEnter = function() {
    var ta = this.getNodeTA();
    var val = ta.val();
    var pos = this.getCaretPos();

    ta.val(val.substr(0, pos)+'\n'+val.substr(pos, val.length));
    this.setCaretPos(pos+1);
  };


  $.fn.bindEvents = function() {
    var ta = this;
    var node = ta.parent();

    ta.bind("keydown", function(e) {
      if(e.keyCode === 13 && e.ctrlKey) {
        return node.spawnNode();
      } else if(e.keyCode === 13 && $.browser.webkit) {
        node.webkitEnter();
        return false;
      } else if(e.keyCode === 9) {
	  return e.shiftKey ? node.indentText(-1) : node.indentText(1);
      } else if(e.keyCode === 38 || e.keyCode === 40) {
        if(e.ctrlKey) {
          node.moveFocus(39 - e.keyCode);
          return false;
        } else if(e.altKey) {
          node.moveNode(39 - e.keyCode);
          return false;
	}
      } else if(e.keyCode === 37 || e.keyCode === 39) {
        if(e.shiftKey && e.ctrlKey) {
          node.zoom(e.keyCode - 38);
	  return false;
         }
      } else if(e.keyCode === 8) {
        if(e.ctrlKey && e.shiftKey && e.altKey) {
	  node.deleteNode();
          return false;
        } else if(node.getCaretPos() === 0) {
          return node.doBackspace();
        }
      } else if(e.keyCode === 32 && e.ctrlKey) {
        node.collapseNode();
        return false;
      }
    });

    ta.bind("keydown keyup blur focus", function(e) {
      $(this).parent().resizeText();
    });


    return ta;
  };
})(jQuery);


// initialize stuff
$(function() {

  var open_help = function() {
    $('#help').show();
    $('#help').animate({height: 100}, 500, 

      function() {
        $('#open_help').hide();
      });
  };

  var close_help = function() {
    $('#help').animate({height: 0}, 500, 

      function() { 
        $('#help').hide(); 
        $('#open_help').show();
      });
  };

  $('#help').css('height', 0);
  $('#help').hide();

  $('#close_help').click(close_help);
  $('#open_help').click(open_help);
  
  $('#content').pungentInit();

});