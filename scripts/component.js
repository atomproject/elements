(function() {
	var pages = document.querySelector('iron-pages');
	var tabs = document.querySelector('paper-tabs');
	tabs.addEventListener('iron-select', function () {
	    pages.selected = tabs.selected;
	});

	document.addEventListener('code-behind', function () {
	    var code = Polymer.dom(document.querySelector('.demo-canvas')).innerHTML;
	    document.querySelector('#codeBehind').markdown = '```' + code + '```';
	});
	// start code for device view
	$('#tablet , #phone').on('click touchmove', function () {
	    var target = document.querySelector('#deviceView');
	    var newDevice = $(this).attr('id');
	    target.device = newDevice;
	    $('.demo-canvas').hide();
	    $('#deviceView').css({ 'display': 'block' });
	    if ($(this).hasClass('actived')) {
	        if ($(this).hasClass('landScaped')) {
	            $(this).removeClass('landScaped');
	            target.landscape = false;
	        } else {
	            target.landscape = true;
	            $(this).addClass('landScaped');
	        }
	    } else {
	        $('#tablet , #phone').removeClass('landScaped');
	        target.landscape = false;
	    }

	    $('#tablet , #phone').removeClass('actived');
	    $(this).addClass('actived');
	});
	$("#laptop").on("click touchmove", function () {
	    $('#deviceView').hide();
	    $('.demo-canvas').css({ 'display': 'block' });;
	});

	//why select the same set of elements so many times?
	//remove this duplicate code
	$('#tablet, #phone, #laptop').on('click touchmove', function () {
	    var slice = Array.prototype.slice;
	    var devices = document.querySelectorAll('#tablet, #phone, #laptop');
	    
	    if (devices.length > 0) {
	        devices = slice.call(devices);
	        devices.forEach(function (device) {
	            device.active = false;
	        });
	    }
	    
	    this.active = true;
	});
})();