(function($) {
    $.fn.styleddropdown = function(component) {
        var selectedItem = null;
        return this.each(function() {
            var obj = $(this);
            obj.find('.prop').click(function(event) { //onclick event, 'list' fadein
                selectedItem = this.childNodes[1].textContent;
                obj.find('.list').css({
                    position: "fixed",
                    top: event.clientY + 'px',
                    left: event.clientX + 'px'
                });

                obj.find('.list').fadeIn(400);

                $(document).keyup(function(event) { //keypress event, fadeout on 'escape'
                    if (event.keyCode == 27) {
                        obj.find('.list').fadeOut(400);
                    }
                });


                obj.find('.list').hover(function() {},
                    function() {
                        $(this).fadeOut(400);
                    });
                obj.find('.hover').hover(function() {},
                    function() {
                        $(this).fadeOut(400);
                    });
                event.stopImmediatePropagation();
                return false;
            });

            obj.find('.list .item').click(function(event) { //onclick event, change field value with selected 'list' item and fadeout 'list'
                
                var property = $(this).html();
                component[property] = "{{response." +selectedItem + "}}";
                obj.find('.prop')
                    .css({
                        'background': '#fff',
                        'color': '#333'
                    });
                obj.find('.list').fadeOut(400);
            });

            obj.on('click', function() {
                obj.find('.list').fadeOut(200);
            });
        });
    };
})(jQuery);
