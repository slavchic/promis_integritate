dbg = function () {
	if (typeof console != 'undefined') console.log(arguments)
}

$.fn.switchToggleClass = function (class_1, class_2) {
	var o = this;
	if (o.hasClass(class_1)) {
		o.removeClass(class_1);
		o.addClass(class_2)
	} else {
		o.removeClass(class_2);
		o.addClass(class_1)
	}
	return o
};
Array.prototype.contains = function (id) {
	var temp_a = {}
	for (var i = 0; i < this.length; i++) {
		temp_a[this[i]] = this[i]
	}
	return (temp_a[id]) ? true : false
}
Array.prototype.remove = function (elements) {
	var temp_a = {}, inc = 0, el_list = (typeof elements == 'string') ? [elements] : elements
	for (var i = 0; i < this.length; i++) {
		temp_a[this[i]] = this[i]
	}
	for (var i = 0; i < el_list.length; i++) {
		delete temp_a[el_list[i]]
	}
	this.length = 0
	for (var id in temp_a) {
		this.push(id)
	}
	return this
}

var is_touch_device = !!document.documentElement.ontouchstart;

$(function () {
	if (is_touch_device) {
		$('body').addClass('touch')
	}

	$('.txt_more').each(function(i, el){
		var $el = $(el),
				max_height = is_touch_device ? 150 : 60;

		if ($el.outerHeight() > max_height) {
			$el.wrapInner('<div class="txt_more_wrapper">')
		}
	})
	$('.txt_more').click(function(){
		$(this).not('.active').addClass('active')
	})

})













