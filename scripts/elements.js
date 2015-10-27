(function () {
    var baseUrl = '/elements';

    //gets the html to be displayed in the content area
    function getElementsHtml(category, component) {
        var params = [
            'category=' + category,
            'component=' + component
        ];
        var pageUrl;

        params = params.length > 0 ? ('?' + params.join('&')) : '';
        pageUrl = baseUrl + params;

        //!!! Where is the damn _ERROR HANDLING_?? !!!!
        return $.get(pageUrl).done(function (responseText) {
            $('#subPanel').html(responseText);
        });
    }

    //update various parts of ui based on model
    //we're currently interested only in the `label`
    //property of the model
    function updateUi(label) {
        var labelElement = document.querySelector("#selectedComponent");
        var elementUrl = baseUrl;
        var tempLabel = label;

        //the urls should be in lower case and shouldn't
        //contain any special characters like ' ', '&', '?'
        tempLabel = tempLabel.toLowerCase();
        tempLabel = tempLabel.replace(" ", "-");
        elementUrl += '/' + tempLabel;

        //change the title in the header
        labelElement.textContent = label;
        //change the url
        window.history.pushState({ path: "" }, '', elementUrl);
    }

    //change the element being shown when user clicks
    //on a menu item
    function changeToNewElement() {
        var tItem = event.target.parentElement.parentElement;
        var component = tItem.getAttribute('data-component');
        var category = tItem.getAttribute('data-category');
        var label = tItem.getAttribute("label");

        getElementsHtml(category, component)
            .done(function () {
                var drawerElement = document.getElementById('mainDrawerPanel');

                updateUi(label)
                drawerElement.togglePanel();
            });
    }

    //change the element when user clicks on the browser
    //back button
    function changeToPreviousElement(event) {
        var pathnameParts, label, tItem, component, category;

        pathnameParts = window.location.pathname.split('/');

        pathnameParts = pathnameParts.filter(function (part) {
            return part && part !== '/';
        });

        label = pathnameParts[1] || '';
        label = sentencify(label);
        tItem = document.querySelector('t-item[label="' + label + '"]');

        //the url in on elements route and so
        //get the html for the element and show it
        if (label && tItem) {
            component = tItem.getAttribute('data-component');
            category = tItem.getAttribute('data-category');

            getElementsHtml(category, component)
                .done(function () {
                    setTimeout(function () {
                        updateUi(label)
                    }, 0);
                });
        }
    }

    function sentencify(str) {
        var wordBoundryRegex = /(^.)|(?:-(.))/g;

        str = str.replace(wordBoundryRegex, function (match) {
            return match.toUpperCase();
        });
        str = str.replace('-', ' ');

        return str;
    }

    $(function () {
        //change the element when user clicks on an
        //item in the menu
        $('t-item.component-link').on('click', changeToNewElement);

        //change the element when user goes back in
        //the history.
        $(window).on('popstate', changeToPreviousElement);

        //we have to load the element specified in the url
        //first check if the url is on elements route
        if (window.location.pathname.indexOf(baseUrl) > -1) {
            changeToPreviousElement();
        }
    });
})();