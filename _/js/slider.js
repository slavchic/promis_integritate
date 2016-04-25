/*

 var sb2 = new slider({
 moving_block_id:'sliding_block_2',
 step:868,
 step_switchers:['sb2_0', 'sb2_1', 'sb2_2', 'sb2_3', 'sb2_4']
 })

 */

$.fn.slider = function (config) {
	var o = this,
			$cont = o.find('.cont'),
			$slides = $cont.find('div'),
			slides_total = $slides.length;

	$cont.css('margin-left', '0%');

	o.find('.left').on('click',function () {
		var container = $cont[0],
				ml = parseInt(container.style.marginLeft);

		if (ml != 0) container.style.marginLeft = (ml + 100) + '%'
		else container.style.marginLeft = -(slides_total - 1) * 100 + '%'
	})
	o.find('.right').on('click', function () {
		var container = $cont[0],
				ml = parseInt(container.style.marginLeft);

		if (ml != -(slides_total - 1) * 100) container.style.marginLeft = (ml - 100) + '%'
		else container.style.marginLeft = '0%'

		//d.getElementById('dbg').innerHTML = container.style.marginLeft + ' / '  + el_count*100 + ' / ' + (parseInt(container.style.marginLeft) == -(el_count-1)*100)
	})


	return o
}

//slider = function (data) {
//
//	var o = this
//
//	o.data = data
//	o.current_step = 0
//	o.dom = {
//		sw: {}
//	}
//	o.moving_interval
//	o.accel = o.data.accel
//	o.step_size = o.data.step_size
//
//	o.init = function () {
//
//		o.dom.$cont = $(o.data.cont)
//		o.dom.mb = $(o.data.cont).find('.sliding_block')
//
//		o.step_size = o.dom.$cont.width()
//
//		dbg('o.step_size', o.step_size)
//		if (!o.dom.mb[0]) {
//			setTimeout(o.init, 100);
//			return
//		}
//
//		o.dom.mb.css('margin-left', 0)
//
//		var $switchers = $(o.data.cont).find('.switchers > a')
//
//		o.dom.$switchers = $switchers
//
//		$switchers.each(function(index, sw){
//			dbg(index, $(sw))
//			var $sw = $(sw)
//			$sw.data('step', index)
//			$sw.on('click touch', o.scroll_to_step)
//		})
//
//	}
//	o.scroll_to_step = function (e) {
//
//		var $sw = $(this),
//				step = parseInt($sw.data('step')),
//				direction = 0,
//				move_to = 0,
//				distance = 0;
//
//		e.preventDefault()
//
//		o.dom.$switchers.removeClass('active');
//
//		$sw.addClass('active')
//
//		//alert(step + ' / ' + o.current_step)
//		if (step > o.current_step) {
//			direction = -1;
//		} else if (step < o.current_step) {
//			direction = 1;
//		} else return
//
//		clearInterval(o.moving_interval);
//
//
//		var spd = 0,
//				move_to = -step * o.step_size
//
//		dbg('direction: ' +direction+ '  / ' + move_to + ' / ' + (-parseInt(o.dom.mb[0].style.marginLeft)+move_to))
//
//		o.current_step = step
//
//		o.moving_interval = setInterval(
//			function () {
//
//				spd += direction * o.accel;
//				if ((direction == -1 && parseInt(o.dom.mb[0].style.marginLeft) + spd < move_to) || (direction == 1 && parseInt(o.dom.mb[0].style.marginLeft) + spd > move_to)) {
//					o.dom.mb[0].style.marginLeft = move_to + 'px';
//					clearInterval(o.moving_interval);
//				} else {
//					o.dom.mb[0].style.marginLeft = (parseInt(o.dom.mb[0].style.marginLeft) + spd) + 'px';
//				}
//			}, 10);
//	}
//	o.init()
//
//
//}