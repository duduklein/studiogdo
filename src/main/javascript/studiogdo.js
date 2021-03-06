// Generated by CoffeeScript 1.7.1
(function() {
  var root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  if (String.prototype.trim == null) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }

  if (String.prototype.startsWith == null) {
    String.prototype.startsWith = function(str) {
      return this.slice(0, str.length) === str;
    };
  }

  if (String.prototype.endsWith == null) {
    String.prototype.endsWith = function(str) {
      return this.slice(-str.length) === str;
    };
  }

  if (String.prototype.toEuro == null) {
    String.prototype.toEuro = function(str) {
      return (parseInt(this) / 100).toFixed(2);
    };
  }

  if (String.prototype.toCent == null) {
    String.prototype.toCent = function(str) {
      return parseInt(str) * 100;
    };
  }

  
root.Command = function(rootAddress, menu, pochoir) {
    this.bocall = new BOCall(rootAddress);
    this.menu = menu || null;
    this.pochoir = pochoir || null;
    this.steps = new Array();
    this.currentStepIndex = 0;
    var self = this;

    this.done = function() {
        alert('command done');
    }

    this.setStep = function(index, step) {
        this.steps[index] = step;
    }

    this.getStep = function(index) {
        return this.steps[index];
    }

    this.setCurrentStep = function(index) {
        currentStepIndex = index;

        // sets current step skeleton in pochoir
        while (this.pochoir.firstChild) {
            this.pochoir.removeChild(this.pochoir.firstChild);
        }
        this.pochoir.appendChild(this.getStep(index));

        // sets menu
        var cmd = this;
        for (var i = 0; i < index; i++) {
            this.menu[i].className = "previous_step";
            this.menu[i].addEventListener("click", function() {
                var index = i;
                cmd.setCurrentStep(index);
            });
        }
        this.menu[index].className = "current_step";
        for (var i = index + 1; i < this.menu.length; i++) {
            this.menu[i].className = "next_step";
        }
    }

    this.start = function(path, command, fdata) {
        this.bocall.done = function() {
            self.path = self.bocall.commandPath;
            self.res = JSON.parse(self.bocall.responseText);
            self.done();
        }
        this.bocall.applyCommand(path, command, fdata);
    }

    this.callNextStep = function(fdata) {
        this.bocall.done = function() {
            self.res = JSON.parse(self.bocall.responseText);
            self.done();
        }
        this.bocall.applyCommand(this.path, "NextStep", fdata);
    }
}

root.convertCentEuro = function(val, bool) {
    val = parseFloat(val);
    if (bool)
        return val / 100;
    return parseInt(val * 100);  
}
 
/* cssSelector: elements to be editable
 * form: number format see: http://numeraljs.com/
 * func: function(val, bool) treatment for bo
 */ 
root.EditableNumber = function(cssSelector, form, func) {
    if (!form)
        form = '0,0.00 $';
    if (!func)
        // bool is used for 2ways function (exemple: if you want to converto to euro to cent)
        func = function(val, bool) {
            parseFloat(val)
        }
    // query all element according to cssSelector
    var elements = document.querySelectorAll(cssSelector);

    for (var i = 0 ; i < elements.length ; i++) {
        var element = elements[i];
        // hide elements
        element.style.display = 'none';
            
        // add needed doms
        var input = document.createElement('input');
        var span = document.createElement('span');
        var attr1 = document.createAttribute('type')
        attr1.value = 'text';
        input.setAttributeNode(attr1);
        input.style.display = 'none';
        
        var val = func(element.value, true);
        if (typeof(numeral) != 'undefined')
            span.innerText = numeralFormat(val, form);
        else
            span.innerText = val;

        // insert new doms after element
        element.parentNode.insertBefore(span, element.nextSibling);
        element.parentNode.insertBefore(input, element.nextSibling);
        
        // when double clicking on span, show input
        span.addEventListener('dblclick', function(evt) {
            span = evt.currentTarget;
            input = span.previousElementSibling;
             // set input value
            if (typeof(numeral) != 'undefined')
                input.value = numeralUnformat(span.innerText, form);
            else
                input.value = span.innerText;
            
            
            // toggle elements
            input.style.display = 'block';
            this.style.display = 'none';      
            
            //focus if jQuery is available
            if (window.jQuery)
                $(input).trigger('focus');
        });
        
        // update input change
        input.addEventListener('change', function(evt) {
            element = evt.currentTarget.previousElementSibling;
            element.value = func(this.value, false);  
        });
        
        // when focusing out of input, show span
        input.addEventListener('blur', function(evt) {
            input = evt.currentTarget;
            span = input.nextElementSibling;
            element = input.previousElementSibling;
            
            // set span value
            if (typeof(numeral) != 'undefined') {
                span.innerText = numeralFormat(input.value, form);
            } else 
                span.innerText = input.value;
            element.value = func(this.value, false);  
            
            // toggle elements
            span.style.display = 'block';
            this.style.display = 'none';
        });
    }
}

/*
 * xieme colonne form associé lui appliquer €
 *
 */


root.Datagrid = function(table) {
    var self = this;
    this.table = table;
    
    this.editableNumber = function(css, form, func) {
        new EditableNumber(css, form, func);
    };
    

    this.setToEuro = function(css, bocall) {
        var tds = self.table.querySelectorAll(css);
        for (var i = 0; i < tds.length; i++) {
            var span = tds[i].querySelector("span");
            var input = tds[i].querySelector("input");
            centToEuro(span, input);
            centToEuro(span, span);

            if (bocall) {
                self.editForm = null;
                function editer(evt) {
                    if (self.editForm != null)
                        return;

                    // gets elements
                    var span = event.target;
                    var td = span.parentNode;
                    var div = td.querySelector("div");
                    var input = td.querySelector("input");

                    // opens edition
                    self.editForm = new DatagridEditForm(span, div);
                    self.editForm.firstFocus();
                    self.editForm.cancel = function(evt) {
                        self.editForm = null;
                    }
                    self.editForm.commit = function() {
                        self.editForm = null;
                        var data = new FormData(div);
                        var bc = bocall.clone();
                        bc.done = function() {
                            toEuro(span, input);
                            toEuro(span, span);
                        }
                        bc.postEmpty(path, data);
                    }
                }


                span.addEventListener("dblclick", editer, false);
            }
        }
    }

    this.addDeleteButtons = function(msg, where) {
        msg = msg || "Voulez-vous réellement faire cette action?";
        where = where || "tbody tr > td:last-child";
        var tds = this.table.querySelectorAll(where);
        for (var i = 0; i < tds.length; i++) {
            var td = tds[i];
            var button = document.createElement('BUTTON');
            button.setAttribute('style', 'float: right;');
            button.innerHTML = '<img alt="Détruire" title="Détruire" src="/shared/css/images/btn_del.png"/>';
            td.appendChild(button);

            button.addEventListener("click", askConfirmation, true);
        }
        function askConfirmation(evt) {
            if (evt) {
                evt.stopImmediatePropagation();
                evt.preventDefault();
            }
            var res = confirm("Confirmation : " + msg);
            if (res) {
                var button = evt.currentTarget;
                var tr = getParentByTagName(button, "TR");
                self.doDelete(tr, evt);
            }
        }

    }

    this.doDelete = function(tr, evt) {
        alert('delete button clicked');
    }
}

// class for the edition cell in table (datagrid)
// form may be complex to edit complex structure
root.DatagridEditForm = function(span, div) {
    var self = this;
    this.span = span;
    this.div = div;
    this.editionMode = true;

    this.inputs = div.querySelectorAll("input");
    this.selects = div.querySelectorAll("select");

    // shows form (hides value)
    addClassName(this.span, 'hidden');
    removeClassName(this.div, 'hidden');

    this.commit = function() {
        alert('edition committing to be done');
    }

    this.cancel = function() {
    }

    this.commitChanges = function(evt) {
        if (!self.editionMode)
            return;
        if (evt)
            evt.preventDefault();

        // closes edition
        self.close();
        self.editionMode = false;

        // post only on change
        if (self.changed()) {
            self.commit();
        } else {
            self.cancel();
        }
    }
    // checks if an edited value has changed
    this.changed = function() {
        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i];
            if (input.type == "checkbox") {
                return true;
            } else {
                var new_value = input.value;
                var old_value = input.getAttribute("value");
                if (new_value != old_value) {
                    return true;
                }
            }
        }
        for (var i = 0; i < this.selects.length; i++) {
            var select = this.selects[i];
            var new_value = select.value;
            var old_value = select.getAttribute("value");
            if (new_value != old_value) {
                return true;
            }
        }
        return false;
    }
    // adds event listener for edition
    this.addEventListenerOnInputs = function() {
        for (var i = 0; i < self.inputs.length; i++) {
            var input = this.inputs[i];
            if (input.type == "checkbox") {
                input.addEventListener("click", self.commitChanges);
                input.addEventListener("blur", self.close);
            } else {
                input.addEventListener("blur", self.commitChanges);
                input.addEventListener("keydown", self.enter);
            }
        }
        for (var i = 0; i < self.selects.length; i++) {
            var select = this.selects[i];
            select.addEventListener("change", self.commitChanges);
        }
        self.div.addEventListener("submit", self.commitChanges);
    }
    // removes event listener for edition
    this.removeEventListenerOnInputs = function() {
        for (var i = 0; i < self.inputs.length; i++) {
            var input = this.inputs[i];
            if (input.type == "checkbox") {
                input.removeEventListener("click", self.commitChanges);
                input.removeEventListener("blur", self.close);
            } else {
                input.removeEventListener("blur", self.commitChanges);
                input.removeEventListener("keydown", self.enter);
            }
        }
        self.div.removeEventListener("submit", self.commitChanges);
    }

    this.enter = function(evt) {
        if (evt.keyCode == 27)
            evt.target.blur();
    }
    // selects first input (may have several inputs)
    this.firstFocus = function() {
        var input = div.querySelector("input");
        if (input && input.type != "checkbox") {
            input.focus();
            input.select();
        }
    }

    this.close = function() {
        self.removeEventListenerOnInputs();
        removeClassName(self.span, 'hidden');
        addClassName(self.div, 'hidden');
    }

    this.addEventListenerOnInputs();
}
;

  root.isPathAbsolute = function(path) {
    return path && path.charAt(0) === '/';
  };

  root.getLastNamePath = function(path) {
    var index;
    index = path.lastIndexOf('/');
    if (index >= 0) {
      return path.substring(index + 1);
    }
    return path;
  };

  root.getPathName = function(path) {
    var index;
    index = path.lastIndexOf('/');
    if (index === 0) {
      return '/';
    }
    if (index > 0) {
      return path.substring(0, index);
    }
    return '';
  };

  root.composePath = function() {
    var p, path, _i, _len;
    path = "";
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      p = arguments[_i];
      if (p) {
        if (path.length === 0) {
          path = p;
        } else if (isPathAbsolute(p)) {
          path = p;
        } else {
          if (p === '.') {
            continue;
          }
          if (p.substring(0, 2) === "./") {
            p = p.substring(2);
          } else if (path.charAt(path.length - 1) === '/') {
            path += p;
          } else {
            path += "/" + p;
          }
        }
      }
    }
    return path;
  };

  root.getParentByTagName = function(element, tag, start) {
    var obj_parent;
    obj_parent = start ? element : element.parentNode;
    while ((obj_parent != null) && obj_parent.tagName !== tag) {
      obj_parent = obj_parent.parentNode;
    }
    if (obj_parent != null) {
      return obj_parent;
    }
    return false;
  };

  
// utility function to retrieve a sibling from a tag name
root.nextSiblingByTagName = function(element, tag) {
    var obj_sibling = element.nextSibling;
    while (obj_sibling) {
        if (obj_sibling.tagName === tag) {
            return obj_sibling;
        }
        obj_sibling = obj_sibling.nextSibling;
    }
    return false;
}

// utility function to insert element just after one
root.insertFirst = function(newElement, parentElement) {
    var children = parentElement.chilNodes;
    if (children && children.length > 0) {
        parentElement.insertBefore(newElement, parentElement.children[0]);
    } else {
        parentElement.appendChild(newElement);
    }
}

// utility function to insert element just after one
root.insertAfter = function(newElement, targetElement) {
    return targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
}

root.hasClassName = function(inElement, inClassName) {
    var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)');
    return regExp.test(inElement.className);
}

root.addClassName = function(inElement, inClassName) {
    if (!hasClassName(inElement, inClassName))
        inElement.className = [inElement.className, inClassName].join(' ');
}

root.removeClassName = function(inElement, inClassName) {
    if (hasClassName(inElement, inClassName)) {
        var regExp = new RegExp('(?:^|\\s+)' + inClassName + '(?:\\s+|$)', 'g');
        var curClasses = inElement.className;
        inElement.className = curClasses.replace(regExp, ' ');
    }
}

root.htmlCheckboxSubmitOnlyOnPatch = function(event) {
    if (!event.target.checked) {
        nextSiblingByTagName(event.target, "INPUT").setAttribute("checked", "checked");
    }
}


// --------------------------------------------------------------------------
//
//  NUMBER formating functions
//
// --------------------------------------------------------------------------

// DEPRECATED!!!!
root.centToEuro = function(src, dest) {
        var val;

        val = src.tagName.toLowerCase() === "input" ? src.value : src.innerHTML;
        val = (parseInt(val) / 100).toFixed(2);
        val = val.replace('.', ',') + ' €';
        if (dest.tagName.toLowerCase() === "input") {
            return dest.value = val;
        } else {
            return dest.innerHTML = val;
        }
    };

// DEPRECATED!!!!
root.euroToCent = function(src, dest) {
        var val;

        val = src.tagName.toLowerCase() === "input" ? src.value : src.innerHTML;
        val = stripNonNumeric(val.replace(',', '.')) * 100;
        val = val.toFixed(0);
        if (dest == null) {
            return val;
        }
        if (dest.tagName.toLowerCase() === "input") {
            return dest.value = val;
        } else {
            return dest.innerHTML = val;
        }
    };

// DEPRECATED!!!!
root.toEuro = function(src, dest) {
    var val = (src.tagName.toLowerCase() == "input") ? src.value : src.innerHTML;
    val = parseInt(val).toFixed(2);
    val = val.replace('.', ',') + ' €';
    if (dest.tagName.toLowerCase() == "input") {
        dest.value = val;
    } else {
        dest.innerHTML = val;
    }
}

root.doubleToLocale = function(src, dest) {
    var val = (src.tagName.toLowerCase() == "input") ? src.value : src.innerHTML;
    val = val.replace('.', ',');
    if (dest.tagName.toLowerCase() == "input") {
        dest.value = val;
    } else {
        dest.innerHTML = val;
    }
}

root.localeToDouble = function(src, dest) {
    var val = (src.tagName.toLowerCase() == "input") ? src.value : src.innerHTML;
    val = stripNonNumeric(val.replace(',', '.'));
    if (dest.tagName.toLowerCase() == "input") {
        dest.value = val;
    } else {
        dest.innerHTML = val;
    }
}

// This function formats numbers by adding spaces
root.numberFormat = function(nStr) {
    nStr += '';
    nStr = stripNonNumeric(nStr);
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1))
    x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    return x1 + x2;
}

// This function removes non-numeric characters
root.stripNonNumeric = function(str, comma) {
    str += '';
    var rgx = /^\d|\.|-$/;
    if (comma == ',') {
        rgx = /^\d|,|-$/;
    }
    var out = '';
    for (var i = 0; i < str.length; i++) {
        if (rgx.test(str.charAt(i))) {
            if (!((str.charAt(i) == '.' && out.indexOf('.') != -1) || (str.charAt(i) == '-' && out.length != 0))) {
                out += str.charAt(i);
            }
        }
    }
    return out;
}

root.setInputUnit = function(input, unit) {
    // input must be type="text"
    if (input.getAttribute('type').toLowerCase() != 'text') {
        return;
    }

    input.addEventListener('focus', removeUnit);
    input.addEventListener('blur', addUnit);

    // removesUnit on submit
    addClassName(input, 'setInputUnit');
    var form = getParentByTagName(input, 'FORM');
    if (form && !hasClassName(form, 'setInputUnit')) {
        // adds class "setInputUnit" in order to avoid duplicating listener
        addClassName(form, 'setInputUnit');

        form.addEventListener('submit', function(event) {
            console.log('test2');
            var inputs = event.currentTarget.querySelectorAll('.setInputUnit');
            for (var i = 0; i < inputs.length; i++) {
                removeUnit(inputs[i]);
            }
        });
    }

    function addUnit() {
        input.value = numberFormat(input.value) + unit;
    }

    function removeUnit() {
        input.value = stripNonNumeric(input.value);
    }

    // initialize input
    addUnit();
}

root.extractUrlParams = function() {
    var t = location.search.substring(1).split('&');
    var f = new Array();
    for (var i = 0; i < t.length; i++) {
        var x = t[i].split('=');
        f[x[0]] = x[1];
    }
    return f;
}
;

  root.BOCall = (function() {
    var getProp, getStencils;

    BOCall.rootAddress = "";

    BOCall.loginAddress = "login.html";

    BOCall.options = {};

    BOCall.options['async'] = true;

    BOCall.options['acceptNoStencil'] = false;

    BOCall.options['backToLoginOnError'] = false;

    BOCall.options['waitVisible'] = true;

    BOCall.counter = 0;

    function BOCall(options) {
      this.setProp = __bind(this.setProp, this);
      this.afterSent = __bind(this.afterSent, this);
      this.beforeSend = __bind(this.beforeSend, this);
      this.checkStatus = __bind(this.checkStatus, this);
      this.defaultReadyStateChangeHandler = __bind(this.defaultReadyStateChangeHandler, this);
      this.appendBOParam = __bind(this.appendBOParam, this);
      this.send = __bind(this.send, this);
      this.applyCommand = __bind(this.applyCommand, this);
      this._postFacet = __bind(this._postFacet, this);
      this.postFacets = __bind(this.postFacets, this);
      this.postFacet = __bind(this.postFacet, this);
      this.postProp = __bind(this.postProp, this);
      this.postEmpty = __bind(this.postEmpty, this);
      this.disconnect = __bind(this.disconnect, this);
      this.login = __bind(this.login, this);
      this.simpleGet = __bind(this.simpleGet, this);
      this.addScripts = __bind(this.addScripts, this);
      this.disconnected = __bind(this.disconnected, this);
      this.error = __bind(this.error, this);
      this.done = __bind(this.done, this);
      this.clone = __bind(this.clone, this);
      var option, _ref, _ref1;
      this.options = {};
      for (option in BOCall.options) {
        this.options[option] = BOCall.options[option];
      }
      for (option in options) {
        this.options[option] = options[option];
      }
      this.xhr = new XMLHttpRequest();
      this.xhr.onreadystatechange = this.defaultReadyStateChangeHandler;
      this.rootAddress = (_ref = this.options['rootAddress']) != null ? _ref : BOCall.rootAddress;
      if (this.rootAddress.slice(-1) === '/') {
        this.rootAddress = this.rootAddress.slice(0, -1);
      }
      this.loginAddress = (_ref1 = this.options['loginAddress']) != null ? _ref1 : BOCall.loginAddress;
    }

    BOCall.prototype.clone = function() {
      return new BOCall(this.rootAddress);
    };

    BOCall.prototype.done = function() {
      return alert("bocall done");
    };

    BOCall.prototype.error = function(infos) {
      if (infos != null) {
        return alert("Erreur:\n" + infos);
      }
    };

    BOCall.prototype.disconnected = function() {
      alert("Vous avez été déconnecté.");
      return document.location.href = this.loginAddress;
    };

    BOCall.prototype.addScripts = function(scripts) {
      var content, head, s, script, src, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = scripts.length; _i < _len; _i++) {
        script = scripts[_i];
        src = script.src;
        if (src.length > 0) {
          head = document.getElementsByTagName('HEAD').item(0);
          s = document.createElement("script");
          s.language = "javascript";
          s.type = "text/javascript";
          s.defer = true;
          s.src = src;
          head.appendChild(s);
        }
        content = script.text;
        if (content.length > 0) {
          head = document.getElementsByTagName('HEAD').item(0);
          s = document.createElement("script");
          s.language = "javascript";
          s.type = "text/javascript";
          s.defer = true;
          s.text = decodeURI(content);
          _results.push(head.appendChild(s));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BOCall.prototype.simpleGet = function(url) {
      return this.send("GET", url);
    };

    BOCall.prototype.login = function(user, passwd) {
      var step1;
      step1 = (function(_this) {
        return function() {
          var url, xhr2;
          if (_this.xhr.readyState === 4) {
            _this.afterSent();
            if (_this.xhr.status === 200) {
              return _this.done(_this.xhr.responseText);
            } else if (_this.xhr.status === 201 || _this.xhr.status === 403) {
              url = _this.rootAddress + ("/j_security_check?j_username=" + user + "&j_password=" + passwd);
              xhr2 = new XMLHttpRequest();
              xhr2.onreadystatechange = function() {
                if (xhr2.readyState === 4) {
                  if (xhr2.status === 200) {
                    return _this.done(xhr2.responseText);
                  } else if (xhr2.status === 503) {
                    return _this.error("Service temporairement indisponible ou en maintenance.");
                  } else {
                    return _this.error("connexion invalide");
                  }
                }
              };
              xhr2.open('POST', url, true);
              return xhr2.send();
            } else if (_this.xhr.status === 503) {
              return _this.error("Service temporairement indisponible ou en maintenance.");
            } else {
              return _this.error("connexion invalide");
            }
          }
        };
      })(this);
      this.xhr.onreadystatechange = step1;
      return this.send("POST", this.rootAddress + ("/login.gdo?j_username=" + user + "&j_password=" + passwd));
    };

    BOCall.prototype.disconnect = function() {
      this.xhr.onreadystatechange = (function(_this) {
        return function(x) {
          return _this.defaultReadyStateChangeHandler(x, _this.disconnected);
        };
      })(this);
      return this.send("POST", this.rootAddress + "/disconnect.gdo");
    };

    BOCall.prototype.postEmpty = function(path, formData) {
      this.formData = formData != null ? formData : formData;
      if (path != null) {
        this.appendBOParam("ap", path);
      }
      return this.send("POST", this.rootAddress + "/empty.gdo");
    };

    BOCall.prototype.postProp = function(path, formData) {
      this.formData = formData != null ? formData : formData;
      if (path != null) {
        this.appendBOParam("ap", path);
      }
      return this.send("POST", this.rootAddress + "/prop.gdo");
    };

    BOCall.prototype.postFacet = function(path, skeleton, facet, formData) {
      return this._postFacet(path, skeleton, facet, formData, false);
    };

    BOCall.prototype.postFacets = function(path, skeleton, facet, formData) {
      return this._postFacet(path, skeleton, facet, formData, true);
    };

    BOCall.prototype._postFacet = function(path, skeleton, facet, formData, multi) {
      var call;
      if (multi == null) {
        multi = false;
      }
      if ((skeleton == null) || (facet == null)) {
        alert('paramètres incorrects pour postFacet');
        return;
      }
      call = !multi ? "/facet.gdo" : "/facets.gdo";
      this.formData = formData != null ? formData : formData;
      if (path != null) {
        this.appendBOParam("ap", path);
      }
      this.appendBOParam("m", skeleton);
      this.appendBOParam("f", facet);
      return this.send("POST", this.rootAddress + call);
    };

    BOCall.prototype.applyCommand = function(path, command, formData) {
      if (command == null) {
        alert('paramètres incorrects pour applyCommand');
        return;
      }
      this.xhr.onreadystatechange = (function(_this) {
        return function(x) {
          var error, result;
          if (_this.xhr.readyState === 4) {
            _this.afterSent();
            if (_this.checkStatus()) {
              _this.responseText = _this.xhr.responseText;
              try {
                result = JSON.parse(_this.responseText);
                if (result.result < 2) {
                  _this.commandPath = result.infos[1];
                  _this.done(result);
                }
                if (result.result === 2) {
                  return _this.error(result.infos);
                }
              } catch (_error) {
                error = _error;
                return _this.error(_this.responseText);
              }
            }
          }
        };
      })(this);
      this.formData = formData != null ? formData : formData;
      if (path != null) {
        this.appendBOParam("ap", path);
      }
      this.appendBOParam("c", command);
      return this.send("POST", this.rootAddress + "/apply.gdo");
    };

    BOCall.prototype.send = function(method, url) {
      var formData, param, _ref;
      this.beforeSend();
      BOCall.counter++;
      this.appendBOParam("acceptNoStencil", this.options['acceptNoStencil']);
      if (this.options['saveProject'] != null) {
        this.appendBOParam("s", this.options['saveProject']);
      }
      if (method === "GET" || window.ActiveXObject) {
        for (param in this.data) {
          if (url.indexOf('?') === -1) {
            url += "?" + encodeURIComponent(param) + '=' + encodeURIComponent(this.data[param]);
          } else {
            url += '&' + encodeURIComponent(param) + '=' + encodeURIComponent(this.data[param]);
          }
        }
      } else if (method === "POST") {
        formData = (_ref = this.formData) != null ? _ref : new FormData();
        for (param in this.data) {
          formData.append(param, this.data[param]);
        }
      }
      this.xhr.open(method, url, this.options['async']);
      return this.xhr.send(formData || null);
    };

    BOCall.prototype.appendBOParam = function(param, value) {
      if (this.data == null) {
        this.data = {};
      }
      return this.data[param] = value;
    };

    BOCall.prototype.defaultReadyStateChangeHandler = function(x, done) {
      if (this.xhr.readyState === 4) {
        this.afterSent();
        if (this.checkStatus()) {
          this.responseText = this.xhr.responseText;
          if (done != null) {
            return done();
          } else {
            return this.done();
          }
        } else {
          return this.error(this.xhr.responseText);
        }
      }
    };

    BOCall.prototype.checkStatus = function() {
      if (this.xhr.status > 200) {
        if (this.xhr.status === 201) {
          this.disconnected();
        } else if (this.xhr.status === 204) {
          return true;
        } else if (this.xhr.status === 401) {
          this.error("Vous n'êtes pas autorisé à accéder à ce service.");
        } else if (this.xhr.status === 412) {
          return false;
        } else if (this.xhr.status === 418) {
          this.error("Erreur 418 : " + this.xhr.responseText);
        } else if (this.xhr.status === 500) {
          this.error("Erreur interne du serveur.");
        } else if (this.xhr.status === 501) {
          this.error("Fonctionnalité réclamée non supportée par le serveur.");
        } else if (this.xhr.status === 502) {
          this.error("Mauvaise réponse envoyée à un serveur intermédiaire par un autre serveur.");
        } else if (this.xhr.status === 503) {
          this.error("Service temporairement indisponible ou en maintenance.");
        } else if (this.xhr.status === 504) {
          this.error("Temps d’attente d’une réponse d’un serveur à un serveur intermédiaire écoulé.");
        } else {
          this.error("Erreur internet: " + this.xhr.status + "\n" + this.xhr.responseText);
        }
        if (this.options['backToLoginOnError']) {
          this.disconnected();
        }
        return false;
      }
      return true;
    };

    BOCall.prototype.beforeSend = function() {
      var div, size;
      if (!this.options['waitVisible']) {
        return;
      }
      if (BOCall.div == null) {
        div = document.createElement('div');
        div.id = "wait";
        size = 31;
        div.style.height = "" + size + "px";
        div.style.width = "" + size + "px";
        div.style.backgroundImage = "url('http://www.coworks.pro/images/ajax-loader.gif')";
        div.style.position = 'absolute';
        div.style.top = '25%';
        div.style.left = "" + ((window.screen.availWidth - size) / 2) + "px";
        document.getElementsByTagName('body')[0].appendChild(div);
        BOCall.div = div;
      }
      return BOCall.div.style.display = "block";
    };

    BOCall.prototype.afterSent = function() {
      var _ref;
      BOCall.counter--;
      if (BOCall.counter < 0) {
        BOCall.counter = 0;
      }
      if (BOCall.counter === 0) {
        return (_ref = BOCall.div) != null ? _ref.style.display = "none" : void 0;
      }
    };

    getStencils = function(path) {
      BOCall.xhr.onreadystatechange = BOCall.defaultReadyStateChangeHandler;
      if (path != null) {
        BOCall.appendBOParam("ap", path);
      }
      return BOCall.send("GET", BOCall.rootAddress + "/stencils.gdo");
    };

    getProp = function(path) {
      BOCall.xhr.onreadystatechange = BOCall.defaultReadyStateChangeHandler;
      if (path != null) {
        BOCall.appendBOParam("ap", path);
      }
      return BOCall.send("GET", BOCall.rootAddress + "/prop.gdo");
    };

    BOCall.prototype.setProp = function(path, value) {
      this.xhr.onreadystatechange = this.defaultReadyStateChangeHandler;
      if (path != null) {
        this.appendBOParam("ap", path);
      }
      this.appendBOParam("v", value);
      return this.send("POST", this.rootAddress + "/set.gdo");
    };

    return BOCall;

  })();

}).call(this);

//# sourceMappingURL=studiogdo.map
