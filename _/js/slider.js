/*

 var sb2 = new slider({
 moving_block_id:'sliding_block_2',
 step:868,
 step_switchers:['sb2_0', 'sb2_1', 'sb2_2', 'sb2_3', 'sb2_4']
 })

 */

$.fn.slider = function (config) {
	var o = this,
			$cont = o.find('.slider_container'),
			$slides = $cont.find('.slider_slide_content'),
			$dots = o.find('.slider_dots_container'),
			$first_slide = $slides.first(),
			slides_total = $slides.length,
			current_step = 0;

	$first_slide.css('margin-left', '0%');

	for (var i = 0; i < slides_total; i++) {
		$dots.append('<a href="#" data-step="' + i + '">')
	}
	$dots.find('a').on('click', function(e){
		e.preventDefault()

		o.change_step($(this).data('step'))

	})


	o.change_step = function (step) {

		if (step == '-1') {
			current_step--
		} else if (step == '+1') {
			current_step++
		} else {
			current_step = parseInt(step);
		}
		if (current_step < 0) {
			current_step = slides_total - 1
		} else if (current_step > slides_total - 1) {
			current_step = 0
		}
		move()
	}

	function move() {
		var fs = $first_slide[0]

		dbg('move', current_step)
		$dots.find('a').removeClass('active')
		$dots.find('[data-step=' + current_step + ']').addClass('active')

		fs.style.marginLeft = -current_step*100 + '%'
	}

	move()

	if (config.autoswitch) {
		setInterval(function(){
			if (!o.is(':hover') && !is_touch_device){
				o.change_step('+1')
			}

		}, config.autoswitch)
	}


	return o
}