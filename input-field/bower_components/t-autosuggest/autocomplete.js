var AutoComplete = (function () {
    "use strict";
    var AutoComplete = function(params,component) {
        //Construct
        if (this) {
            var i,
                self = this,
                defaultParams = {
                    limit:     0,
                    method:    "GET",
                    noResult:  component.emptyMessage,
                    paramName: "query",
                    select: function(input, item) {
                        attr(input, {"data-autocomplete-old-value": input.value = attr(item, "data-autocomplete-value", item.innerHTML)});
                        component.selectedValue = attr(item, "data-autocomplete-value", item.innerHTML);
                        component.selectedItem = component.response[attr(item,"data-index")];
                        component.fire('autosuggest-select',component.selectedItem);
                        component.fire('tab-next');
                        closeBox(component.querySelector(".autocomplete"),true);
                    },
                    open: function(input, result) {
                        var self = this;
                        Array.prototype.forEach.call(result.getElementsByTagName("li"), function(li) {
                            li.onmousedown = function(event) {
                                self.select(input, event.target);
                            };
                        });
                    },
                    post: function(result, res, custParams) {
                        try {
                            component.$.spinner.hidden = true;
                            var response = JSON.parse(res);
                            if(response.status.isSuccessful)
                            {
                                response= response.items;
                                component.response= response;
                                if(response === null)
                                    response = [];

                                var createLi = function() {return domCreate("li");},

                                    autoReverse = function(param, limit) {
                                        return (limit < 0) ? param.reverse() : param;
                                    },

                                    addLi = function(ul, li, response, index) {
                                    
                                        li.innerHTML = response;
                                        attr(li, {"data-autocomplete-value": response});
                                        attr(li, {"data-index": index});
                                        ul.appendChild(li);
                                        return createLi();
                                    },
                                    empty,
                                    i = 0,
                                    length = response.length,
                                    li     = createLi(),
                                    ul     = domCreate("ul"),
                                    limit  = custParams.limit,
                                    propertie,
                                    properties,
                                    value;
                                    
                                    if (length) {
                                        
                                        response = autoReverse(response, limit);
                                        var item = null;
                                        for (; i < length && (i < Math.abs(limit) || !limit); i++) {
                                            if(component.tokenParam != '')
                                                item = response[i][component.tokenParam];
                                            li = addLi(ul, li, item, i);
                                        }
                                    } else {
                                        //If the response is an object or an array and that the response is empty, so this script is here, for the message no response.
                                        empty = true;
                                        attrClass(li, "locked");
                                        li = addLi(ul, li, custParams.noResult);
                                    }
            

                                if (result.hasChildNodes()) {
                                    result.removeChild(result.lastChild);
                                }
                                
                                result.appendChild(ul);
                                attrClass(result, "autocomplete open");
                                return empty;
                            }
                            else{
                                return empty;
                            }
                        } catch (e) {
                            result.innerHTML = response;
                        }
                    },
                    pre: function(input) {
                        return input.value;
                    },
                    selector: ["input[data-autocomplete]"]
                },
                selectors;

            self._custArgs = [];
            self._args     = merge(defaultParams, params || {});

            selectors = self._args.selector;
            if (!Array.isArray(selectors)) {
                selectors = [selectors];
            }

            selectors.forEach(function(selector) {
                Array.prototype.forEach.call(component.querySelectorAll(selector), function(input) {
                    if (input.nodeName.match(/^INPUT$/i) && input.type.match(/^TEXT|SEARCH$/i)) {
                        var oldValueLabel = "data-autocomplete-old-value",
                            result        = component.$.dropBox,
                            request,
                            positionLambda = function() {
                                attr(result, {
                                    "class": "autocomplete"
                                });
                            },
                            destroyLambda = function() {
                                input.onfocus = input.onblur = input.onkeyup = null;
                                input.removeEventListener("position", positionLambda);
                                input.removeEventListener("destroy", destroyLambda);
                                result.parentNode.removeChild(result);
                                self.CustParams(input, true);
                            },
                            focusLamdba = function() {
                                var dataAutocompleteOldValue = attr(input, oldValueLabel);
                                if (!component.caching && result.hasChildNodes()) {
                                    result.removeChild(result.lastChild);
                                }
                                if (!dataAutocompleteOldValue || input.value != dataAutocompleteOldValue ) {
                                    // if(input.value == '')
                                    //     request = ajax(request, self.CustParams(input), "", input, result);
                                    attrClass(result, "autocomplete open");
                                }
                            };

                        attr(input, {"autocomplete": "off"});

                        positionLambda(input, result);
                        input.addEventListener("position", positionLambda);
                        input.addEventListener("destroy", destroyLambda);

                        Polymer.dom(component.querySelector('#append')).appendChild(result);
                        
                        input.onfocus = focusLamdba;

                        input.onblur = closeBox(null, result);

                        input.onkeyup = function(e) {
                            var first                    = result.querySelector("li:first-child:not(.locked)"),
                                input                    = e.target,
                                custParams               = self.CustParams(input),
                                inputValue               = custParams.pre(input),
                                dataAutocompleteOldValue = attr(input, oldValueLabel),
                                keyCode                  = e.keyCode,
                                currentIndex,
                                position,
                                lisCount,
                                liActive;

                            if (keyCode == 13 && attrClass(result).indexOf("open") != -1) {
                                liActive = result.querySelector("li.active");
                                if (liActive !== null) {
                                    self._args.select(input, liActive);
                                    // inputValue = item.innerHTML;
                                    attrClass(result, "autocomplete");
                                    closeBox(null, result);
                                }
                            }
                            else{

                                if (keyCode == 38 || keyCode == 40) {
                                    liActive = result.querySelector("li.active");
                                    if (liActive) {
                                        currentIndex = Array.prototype.indexOf.call(liActive.parentNode.children, liActive);
                                        position = currentIndex + (keyCode - 39);
                                        lisCount = result.getElementsByTagName("li").length;

                                        attrClass(liActive, "selected");

                                        if (position < 0) {
                                            position = lisCount - 1;
                                        } else if (position >= lisCount) {
                                            position = 0;
                                        }

                                        attrClass(liActive.parentElement.childNodes.item(position), "active");
                                    } else if (first) {
                                        attrClass(first, "active");
                                    }
                                } else if (keyCode < 35 || keyCode > 40) {
                                    if (inputValue && custParams.url) {
                                        // if (!dataAutocompleteOldValue || inputValue != dataAutocompleteOldValue) {
                                        //     attrClass(result, "autocomplete open");
                                        // }
                                        if(inputValue.length >= component.minimumCharacters)
                                        {
                                            component.$.spinner.hidden = false;
                                            request = ajax(request, custParams, inputValue.trim(), input, result, component.subType, component.queryParams);
                                        }
                                    }
                                    else{
                                        if (result.hasChildNodes()) {
                                            result.removeChild(result.lastChild);
                                        }
                                    }
                                }
                            }

                        };
                    }
                });
            });
        } else {
            new AutoComplete(params,component);
        }
    };

    AutoComplete.prototype = {
        CustParams: function(input, toDelete) {
            var dataAutocompleteIdLabel = "data-autocomplete-id",
                self = this,
                prefix = "data-autocomplete",
                params = {
                    limit:     prefix + "-limit",
                    method:    prefix + "-method",
                    noResult:  prefix + "-no-result",
                    paramName: prefix + "-param-name",
                    url:       prefix
                },
                paramsAttribute = Object.getOwnPropertyNames(params),
                i;

            if (toDelete) {
                delete self._custArgs[attr(input, dataAutocompleteIdLabel)];
            } else {
                if (!input.hasAttribute(dataAutocompleteIdLabel)) {
                    input.setAttribute(dataAutocompleteIdLabel, self._custArgs.length);

                    for (i = paramsAttribute.length - 1; i >= 0; i--) {
                        params[paramsAttribute[i]] = attr(input, params[paramsAttribute[i]]);
                    }

                    for (i in params) {
                        if (params.hasOwnProperty(i) && !params[i]) {
                            delete params[i];
                        }
                    }

                    if (params.limit) {
                        if (isNaN(params.limit)) {
                            delete params.limit;
                        } else {
                            params.limit = parseInt(params.limit);
                        }
                    }

                    self._custArgs.push(merge(self._args, params));
                }

                return self._custArgs[attr(input, dataAutocompleteIdLabel)];
            }
        }
    };

    function ajax(request, custParams, value, input, result, subType, queryParams) {
        if (request) {
            request.abort();
        }
        
        var method = custParams.method,
            url    = custParams.url;
        
        url = url +value;
        if(subType!='')
            url = url + "/"+subType;

        if (queryParams!="") {
            url += "?" + queryParams;
        }

        request = new XMLHttpRequest();
        request.open(method, url, true);
        request.setRequestHeader("Content-type", "application/json");
        request.setRequestHeader("Accept", "application/json");

        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                if (!custParams.post(result, request.response, custParams)) {
                    custParams.open(input, result);
                }
            }
        };

        request.send(queryParams);

        return request;
    }

    function closeBox(result, closeNow) {

        if (closeNow) {
            attrClass(result, "autocomplete");
        } else {
            setTimeout(function() {closeBox(result, true);}, 150);
        }
    }

    //Method deported
    function merge(obj1, obj2) {
        var concat = {},
            tmp;
        
        for (tmp in obj1) {
            concat[tmp] = obj1[tmp];
        }

        for (tmp in obj2) {
            concat[tmp] = obj2[tmp];
        }

        return concat;
    }

    return AutoComplete;
}());

function attr(item, attrs, defaultValue) {
    if (item) {
        try {
            for (var key in attrs) {
                item.setAttribute(key, attrs[key]);
            }
        } catch (e) {
            return item.hasAttribute(attrs) ? item.getAttribute(attrs) : defaultValue;
        }
    }
}

function attrClass(item, value) {
    if (item) {
        return attr(item, !value ? "class" : {"class": value});
    }
}

function domCreate(item) {
    return document.createElement(item);
}