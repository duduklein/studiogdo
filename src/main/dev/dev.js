// Generated by CoffeeScript 1.6.2
(function() {
  var expandDOM, resetCurrentEditablePath, resetSlotSelect, root, setUserPath, showLoading, showResponseLoading, xhrAddPath;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.BOHome = "/";

  $(function() {
    var currentEditablePath, slotSelect;

    currentEditablePath = document.getElementById('currentInteractivePath');
    return slotSelect = document.getElementById('slotSelect');
  });

  root.config = function(evt) {
    var boCall, bocall_host, bocall_servlet, bocall_war, passwd, user;

    if (evt != null) {
      evt.preventDefault();
    }
    sessionStorage.setItem('bocall_host', document.getElementById('bocall_host').value);
    sessionStorage.setItem('bocall_war', document.getElementById('bocall_war').value);
    sessionStorage.setItem('bocall_servlet', document.getElementById('bocall_servlet').value);
    currentEditablePath.innerHTML = '/';
    slotSelect.innerHTML = '';
    if (!sessionStorage.getItem('bocall_host')) {
      sessionStorage.setItem('bocall_host', window.location.host);
    }
    bocall_host = sessionStorage.getItem('bocall_host');
    document.getElementById('bocall_host').value = bocall_host;
    if (!sessionStorage.getItem('bocall_war')) {
      sessionStorage.setItem('bocall_war', '');
    }
    bocall_war = sessionStorage.getItem('bocall_war');
    document.getElementById('bocall_war').value = bocall_war;
    if (!sessionStorage.getItem('bocall_servlet')) {
      sessionStorage.setItem('bocall_servlet', '');
    }
    bocall_servlet = sessionStorage.getItem('bocall_servlet');
    document.getElementById('bocall_servlet').value = bocall_servlet;
    root.BOUrl = "http://" + bocall_host + "/" + bocall_war + "/" + bocall_servlet;
    $("#format_facet_dev").change(function(evt) {
      return $('#model_facet').val($("#format_facet_dev").val());
    });
    user = document.getElementById('user').value;
    passwd = document.getElementById('passwd').value;
    if (user === "") {
      return addSlotOnCurrentInterractivePath();
    } else {
      boCall = new BOCall;
      boCall.error = function(infos) {
        return alert(infos);
      };
      boCall.done = function() {
        return addSlotOnCurrentInterractivePath();
      };
      return boCall.login(user, passwd);
    }
  };

  xhrAddPath = function(model, sender) {
    var boCall;

    boCall = new BOCall;
    boCall.error = function(infos) {
      return alert(infos);
    };
    boCall.done = function() {
      var commands, next, nextnext, response, select, shownPath, singleStencil, type;

      response = document.createElement('div');
      response.innerHTML = this.responseText;
      commands = response.children[0].children[1];
      singleStencil = false;
      document.getElementById('commands').innerHTML = '';
      document.getElementById('commands').appendChild(commands);
      type = response.firstChild.getAttribute('data-type');
      if (type === 'slot') {
        shownPath = atob(sender.value.replace('\n', ''));
        sessionStorage.setItem('path', shownPath);
        document.getElementById('pathDisplay').innerHTML = shownPath;
        response.firstChild.innerHTML = '/' + response.firstChild.innerHTML;
      } else if (type === 'stencil') {
        shownPath = sender.value;
        sessionStorage.setItem('path', shownPath);
        document.getElementById('pathDisplay').innerHTML = shownPath;
        select = response.querySelector('select');
        if (select.childElementCount === 2) {
          if (select.children[1].innerHTML === '') {
            select.parentNode.hidden = true;
          }
          select.value = select.children[1].innerHTML;
          select.children[0].removeAttribute('selected', 'selected');
          singleStencil = true;
          select.setAttribute('data-singleStencil', 'singleStencil');
        }
        response.firstChild.innerHTML = '(' + response.firstChild.innerHTML + ')';
      }
      next = sender.parentNode.nextSibling;
      while (next !== null) {
        nextnext = next.nextSibling;
        next.parentNode.removeChild(next);
        next = nextnext;
      }
      while (response.childNodes.length > 0) {
        sender.parentNode.parentNode.appendChild(response.firstChild);
      }
      showLoading(false);
      if (singleStencil) {
        return addSlotOnCurrentPath();
      }
    };
    return boCall.postFacet(null, model, 'dom5');
  };

  root.addStencilOnCurrentInterractivePath = function(evt) {
    var bocall, count_path, path, select;

    if (evt != null) {
      select = evt.target;
      resetCurrentEditablePath(select);
      resetSlotSelect(select);
    }
    path = currentEditablePath.innerHTML;
    bocall = new BOCall;
    bocall.done = function() {
      var cdata, index, nb;

      cdata = $(bocall.responseText).find("data").html();
      index = cdata.lastIndexOf(']]');
      nb = cdata.substr(11, index - 11);
      if (nb === '0') {
        $(select.parentNode).after("<span>(nothing in...)</span>");
        return;
      }
      if (nb === '1') {
        addSlotOnCurrentInterractivePath();
        return;
      }
      showLoading(false);
      select = "      <select data-path=\"" + path + "\" data-type=\"stencil\" onfocusin=\"saveindex(event)\" onfocusout=\"restoreindex(event)\" onchange=\"addSlotOnCurrentInterractivePath(event)\" class=\"key\">        <option selected=\"selected\">---</option>        <option data-path=\"" + path + "\" data-value=\"$Key\"></option>      </select>      ";
      return expandDOM(select);
    };
    count_path = path.substr(0, path.lastIndexOf("/")) + ("/$Slots(" + select.options[select.selectedIndex].text + ")/Keys#");
    return bocall.postFacet(null, null, count_path);
  };

  root.addSlotOnCurrentInterractivePath = function(evt) {
    var path, select;

    if (evt != null) {
      select = evt.target;
      resetCurrentEditablePath(select);
      resetSlotSelect(select);
    }
    path = currentEditablePath.innerHTML;
    select = "    <select data-path=\"" + path + "\" data-type=\"slot\" onfocusin=\"saveindex(event)\" onfocusout=\"restoreindex(event)\" onchange=\"addStencilOnCurrentInterractivePath(event)\" class=\"slot\">      <option disabled=\"disabled\" selected=\"selected\">---</option>      <option data-path=\"" + path + "/$Slots\" data-value=\"Name\"></option>    </select>    ";
    return expandDOM(select);
  };

  resetCurrentEditablePath = function(select) {
    var key;

    currentEditablePath.innerHTML = atob(select.dataset.apath);
    if (select.dataset.type === "slot") {
      if (!currentEditablePath.innerHTML.endsWith("/")) {
        currentEditablePath.innerHTML += "/";
      }
      return currentEditablePath.innerHTML += select.options[select.selectedIndex].text;
    } else {
      key = select.options[select.selectedIndex].text;
      if (key !== "---") {
        return currentEditablePath.innerHTML += "(" + key + ")";
      }
    }
  };

  resetSlotSelect = function(select) {
    var sibling, _results;

    _results = [];
    while (sibling = select.parentNode.nextSibling) {
      _results.push(sibling.parentNode.removeChild(sibling));
    }
    return _results;
  };

  expandDOM = function(dom) {
    var bocall;

    bocall = new BOCall;
    bocall.done = function() {
      var select;

      showLoading(false);
      select = document.createElement('span');
      slotSelect.appendChild(select);
      return select.innerHTML = bocall.responseText;
    };
    showLoading(true);
    bocall.appendBOParam("acceptNoStencil", "true");
    return bocall.postFacet(null, dom, 'dom5');
  };

  showLoading = function(show) {
    var _ref;

    return document.getElementById('loading').style.visibility = (_ref = show) != null ? _ref : {
      'visible': 'hidden'
    };
  };

  showResponseLoading = function(show) {
    var _ref;

    return document.getElementById('responseloading').style.visibility = (_ref = show) != null ? _ref : {
      'visible': 'hidden'
    };
  };

  root.initResponseText = function() {
    document.getElementById('responseText').innerHTML = '';
    return showResponseLoading(true);
  };

  root.stencilAction = function(event) {
    var add, bocall, commands, path, slots, target;

    if (event != null) {
      event.preventDefault();
    }
    initResponseText();
    target = event.target;
    add = target.parentNode.querySelector('input#stencilButtonPath').value;
    path = currentEditablePath.innerHTML;
    if (add !== "") {
      path = composePath(path, add);
    }
    slots = target.parentNode.querySelector('input[name=slots]').checked ? '/$Slots' : '';
    commands = target.parentNode.querySelector('input[name=commands]').checked ? '/$Commands' : '';
    path = path + slots + commands;
    bocall = new BOCall;
    bocall.done = function() {
      showResponseLoading(false);
      return document.getElementById('responseText').innerText = this.responseText;
    };
    if ((target.parentNode.querySelector('input[name=attribut]').checked)) {
      bocall.appendBOParam("a", target.parentNode.querySelector('input[name=attributs]').value);
    }
    showLoading(true);
    return bocall.getStencils(btoa(path));
  };

  root.getAction = function(event) {
    var bocall, path;

    initResponseText();
    bocall = new BOCall;
    bocall.done = function() {
      showResponseLoading(false);
      return document.getElementById('responseText').innerText = this.responseText;
    };
    showLoading(true);
    path = btoa(currentEditablePath.innerHTML);
    return bocall.postProp(path);
  };

  root.setAction = function(event) {
    var bocall, input, path;

    initResponseText();
    bocall = new BOCall;
    bocall.done = function() {
      return showResponseLoading(false);
    };
    showLoading(true);
    path = btoa(currentEditablePath.innerHTML);
    input = event.target.parentNode.querySelector('input[name=v]');
    return bocall.setProp(path, input.value);
  };

  root.facetAction = function(event) {
    var bocall, format, model, path;

    initResponseText();
    bocall = new BOCall;
    bocall.done = function() {
      var src;

      src = document.createTextNode(this.responseText);
      document.getElementById('responseText').appendChild(src);
      document.getElementById('responseHTML').innerHTML = this.responseText;
      return showResponseLoading(false);
    };
    format = $("#format_facet").val();
    model = $("#model_facet").val();
    path = btoa(currentEditablePath.innerHTML);
    return bocall.postFacet(path, model, format);
  };

  root.applyAction = function(event) {
    var bocall, command, param, params, path, _i, _len;

    initResponseText();
    params = document.getElementById('params').querySelectorAll('input');
    command = document.getElementById('dashboard_apply').querySelector('input[name=c]').value;
    bocall = new BOCall;
    bocall.done = function() {
      document.getElementById('responseText').innerText = this.responseText;
      return showResponseLoading(false);
    };
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      bocall.appendBOParam(param.name, param.value);
    }
    showLoading(true);
    path = btoa(currentEditablePath.innerHTML);
    return bocall.applyCommand(path, command);
  };

  root.addParam = function(event) {
    var input, label, param, paramnum, params, remove;

    params = document.getElementById('params');
    param = document.createElement('div');
    label = document.createElement('label');
    input = document.createElement('input');
    remove = document.createElement('span');
    paramnum = 'param' + (params.childElementCount + 1);
    input.setAttribute('type', 'text');
    input.setAttribute('name', paramnum);
    label.innerHTML = paramnum;
    remove.setAttribute('onclick', 'removeParam(event);');
    remove.innerHTML = '&ominus;';
    param.appendChild(label);
    param.appendChild(input);
    param.appendChild(remove);
    return params.appendChild(param);
  };

  root.removeParam = function(event) {
    var newNumber, next, param;

    param = event.target.parentNode;
    next = param.nextElementSibling;
    while (next !== null) {
      newNumber = next.children[0].innerHTML.split('param')[1] - 1;
      next.children[0].innerHTML = 'param' + newNumber;
      next.children[1].setAttribute('name', 'param' + newNumber);
      next = next.nextElementSibling;
    }
    return param.parentNode.removeChild(param);
  };

  setUserPath = function(path, recursive) {
    var bocall, explosedPath, facet, i, s, search, slot, slots, stencil, tempPath, _i, _j, _len, _ref, _ref1;

    showLoading(true);
    path = path.replace(/\/{2,}/g, '/');
    if (path.charAt(0) !== '/') {
      path = sessionStorage.getItem('path') + '/' + path;
    }
    explosedPath = new Array();
    slots = path.split('/');
    for (_i = 0, _len = slots.length; _i < _len; _i++) {
      slot = slots[_i];
      search = slot.match(/(.*)\((.*)\)/);
      stencil = null;
      if (search) {
        s = search[1];
        stencil = search[2];
      } else {
        s = (_ref = slot === '') != null ? _ref : {
          '/': slot
        };
      }
      explosedPath.push([s, stencil]);
    }
    facet = '';
    tempPath = '/';
    for (i = _j = 1, _ref1 = explosedPath.length; 1 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
      if (recursive || i === (explosedPath.length - 1)) {
        facet += '<span data-path="' + tempPath + '" data-type="slot">/';
        facet += '<select data-path="';
        facet += tempPath;
        facet += '"onfocusin="saveindex(event)" onfocusout="restoreindex(event);" onchange="addStencil(this);">';
        facet += '<option disabled="disabled" selected="selected">---</option>';
        facet += '<option data-path="' + tempPath + '/$Slots" data-value="Pwd" data-label="Name"></option>';
        facet += '</select></span>';
      } else {
        facet += '<span data-path="' + tempPath + '" data-type="slot">/';
        facet += explosedPath[i][0] + '</span>';
      }
      tempPath += '/' + explosedPath[i][0];
      if (explosedPath[i][1]) {
        if (recursive || i === (explosedPath.length - 1)) {
          facet += '<span data-path="' + tempPath + '" data-type="stencil">(';
          facet += '<select data-path="';
          facet += tempPath;
          facet += '"onfocusin="saveindex(event)" onfocusout="restoreindex(event);" onchange="addSlotOnCurrentPath(this);">';
          facet += '<option disabled="disabled" selected="selected">---</option>';
          facet += '<option data-path="' + tempPath + '" data-label="@" data-value="^"></option>';
          facet += '</select>)</span>';
        } else {
          facet += '<span data-path="' + tempPath + '" data-type="stencil">(';
          facet += explosedPath[i][1] + ')</span>';
        }
        tempPath += '(' + explosedPath[i][1] + ')';
      }
    }
    console.log('explosedPath: ', explosedPath);
    console.log('facet: ' + facet);
    bocall = new BOCall;
    bocall.done = function() {
      var j, next, nextnext, option, options, pathDisplay, selects, sender, _k, _l, _len1, _len2, _m, _n, _o, _ref2, _ref3;

      sender = document.getElementById('root').parentNode;
      next = sender.nextSibling;
      while (next !== null) {
        nextnext = next.nextSibling;
        next.parentNode.removeChild(next);
        next = nextnext;
      }
      sender.parentNode.innerHTML += this.responseText;
      sender = document.getElementById('root').parentNode;
      next = sender.nextElementSibling;
      if (recursive) {
        for (i = _k = 0; 0 <= explosedPath ? _k < explosedPath : _k > explosedPath; i = 0 <= explosedPath ? ++_k : --_k) {
          options = next.children[0].options;
          if (next.getAttribute('data-type') === 'slot') {
            for (j = _l = 0; 0 <= options ? _l < options : _l > options; j = 0 <= options ? ++_l : --_l) {
              if (options[j].innerHTML === explosedPath[i][0]) {
                next.children[0].selectedIndex = j;
                break;
              }
            }
            next = next.nextElementSibling;
            if (!next) {
              break;
            }
          }
          if (explosedPath[i][1]) {
            options = next.children[0].options;
            for (j = _m = 0, _ref2 = options.length; 0 <= _ref2 ? _m <= _ref2 : _m >= _ref2; j = 0 <= _ref2 ? ++_m : --_m) {
              if (options[j].innerHTML === explosedPath[i][1]) {
                next.children[0].selectedIndex = j;
                break;
              }
            }
            next.children[0].selectedIndex = j;
            next = next.nextElementSibling;
            if (!next) {
              break;
            }
          } else {
            next = next.nextElementSibling;
            if (!next) {
              break;
            }
          }
        }
      } else {
        selects = sender.parentNode.querySelectorAll('span select');
        if (selects && selects[0]) {
          options = selects[0].options;
          for (_n = 0, _len1 = options.length; _n < _len1; _n++) {
            option = options[_n];
            if (option.parentNode.parentNode.getAttribute('data-type') === 'slot') {
              if (option.innerHTML === explosedPath[explosedPath.length - 1][0]) {
                selects[0].selectedIndex = i;
                break;
              }
            } else {
              if (option.innerHTML === explosedPath[explosedPath.length - 1][1]) {
                selects[0].selectedIndex = i;
                break;
              }
            }
          }
        }
        if (selects && selects[1]) {
          options = selects[1].options;
          _ref3 = [options];
          for (_o = 0, _len2 = _ref3.length; _o < _len2; _o++) {
            option = _ref3[_o];
            if (option.parentNode.parentNode.getAttribute('data-type') === 'slot') {
              if (option.innerHTML === explosedPath[explosedPath.length - 1][0]) {
                selects[1].selectedIndex = i;
                break;
              }
            } else {
              if (option.innerHTML === explosedPath[explosedPath.length - 1][1]) {
                selects[1].selectedIndex = i;
                break;
              }
            }
          }
        }
      }
      document.getElementById('pathEdit').style.display = 'none';
      pathDisplay = document.getElementById('pathDisplay');
      pathDisplay.innerHTML = path;
      pathDisplay.style.display = 'block';
      sessionStorage.setItem('path', path);
      return showLoading(false);
    };
    return bocall.postFacet(null, facet, 'dom5');
  };

  root.saveindex = function(event) {
    var select;

    select = event.target;
    select.setAttribute('data-tempindex', select.selectedIndex);
    return select.selectedIndex = 0;
  };

  root.restoreindex = function(event) {
    var select;

    select = event.target;
    if (select.selectedIndex === 0) {
      select.selectedIndex = select.getAttribute('data-tempindex');
      return select.removeAttribute('data-tempindex');
    }
  };

}).call(this);
