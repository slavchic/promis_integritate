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

set_declarations_table_height = function () {
	$('.declarations_list .declaration').each(
		function (i, obj_cont) {

			var heights = [], max_height,
					tables = $(obj_cont).find('.cont > div > table');

			tables.each(
				function (j, table_obj) {
					heights.push($(table_obj).outerHeight())
				}
			)
			max_height = Math.max.apply(null, heights);
			tables.css('height', max_height + 1)
		}
	)
}
currency_to_number = function (node) {
	if (!node) return '0';
	if (node && node.className.match('name')) {
		return $(node).find('a:eq(1)').html()
	} else  if (node && node.className.match('problem')) {
		if (node.innerHTML) return '1'
		else return '0'
	} else {
		var $node = $(node),
				node_val= $node.text(),
				val = node_val.replace(/[,\.]/gi, '');

		return val;
	}
}


$(function () {
	$('select.select2').each(function () {
		$(this).prop("selectedIndex", 0);
	})
	$('.select2').select2({
		width: '100%',
		allowClear:true
	})

	var is_touch_device = 'ontouchstart' in document.documentElement,
			active_filter_party,
			active_filter_institute,
			visible_count = 0,
			search_term = '',
			filters_title_default_txt = 'Top 10 politicienii',
			$filters_title = $('#filters_title'),
			search_inp = $('#name_search_cont input'),
			search_ico = $('#name_search_cont i');

	if (is_touch_device) {
		$('body').addClass('touch')
	}
	$('body').on('keydown keyup', function (e) {
		if (e.keyCode == 17) {
			window.ctrlKey = (e.type == 'keydown') ? true : false
		}
	})
	$('body').on('keyup', function (e) {
		if (e.keyCode == 13 && window.ctrlKey) {
			search_inp.focus()
		}
		if (e.keyCode == 27 && search_inp.val()) {
			search_ico.click()
		}
	})
	search_inp.on('keyup change', function(){
		if (search_inp.val()) {
			search_ico.removeClass('icon-search').addClass('icon-cancel');
		} else {
			search_ico.removeClass('icon-cancel').addClass('icon-search');
		}
	})
	search_ico.on('click touch', function (e) {
		search_inp.val('').change()
		search_term = ''
		filter_table()
	})

	$('#search_inp').val('').on('keyup', function (e) {
		search_term = (this.value.length > 1) ? simple_name_format(this.value) : '';

		filter_table()
	})

	function get_filter_title() {
		if (active_filter_party || active_filter_institute){
			if (active_filter_institute) {
				var select_obj = $('#filter_institutes')[0],
						$select_obj_selected_el = $(select_obj.options[select_obj.selectedIndex]),
						$filter_institute_el_txt = $select_obj_selected_el.data('title')
			}
			if (active_filter_party) {
				var select_obj = $('#filter_parties')[0],
						$select_obj_selected_el = $(select_obj.options[select_obj.selectedIndex]),
						$filter_party_el_txt = $select_obj_selected_el.data('title')
			}

			var result_txt = 'Politicienii din ';

			if ($filter_institute_el_txt) result_txt += $filter_institute_el_txt
			if ($filter_institute_el_txt && $filter_party_el_txt) result_txt += ' + '
			if ($filter_party_el_txt) result_txt += $filter_party_el_txt
			if (visible_count) result_txt += ' <span>(' + visible_count + ')</span>'

			//active_filter_party, active_filter_institute
			$filters_title.html(result_txt)
		} else {
			$filters_title.text(filters_title_default_txt)
		}
	}
	function simple_name_format(s) {
		return s.toLowerCase().replace(/ş/g, 's').replace(/ţ/g, 't').replace(/î/g, 'i').replace(/ă/g, 'a').replace(/â/g, 'a'); // format your data for normalization
	}

	function simple_name_format_z(s) {
		return s.toLowerCase().replace(/ş/g, 'sz').replace(/ţ/g, 'tz').replace(/î/g, 'iz').replace(/ă/g, 'az').replace(/â/g, 'az'); // format your data for normalization
	}

	$.tablesorter.addParser({
		// set a unique id
		id: 'names_parse',
		is: function (s) {
			return false;// return false so this parser is not auto detected
		},
		format: simple_name_format_z,
		type: 'text' // set type, either numeric or text
	});

	$(".persons_list .table").tablesorter({
		textExtraction: currency_to_number,
		sortList: [[0, 0]],
		headers: {
			0: {
				sorter: 'names_parse'
			}
		}
	})

	function filter_table() {
		visible_count = 0
		var table_els = $('.persons_list .tablesorter tbody tr')

		if (active_filter_party || active_filter_institute || search_term) {

			table_els.each(function (i, el) {
				var el = $(el),
						el_name = simple_name_format($(el).find('td:first-child a:eq(1)').text()),
						party_filter_result = (active_filter_party && active_filter_party == el.data('party') || !active_filter_party) ? true : false,
						institute_filter_result = (active_filter_institute && active_filter_institute == el.data('institute') || !active_filter_institute) ? true : false,
						search_term_filter_result = (search_term && el_name.match(search_term) || !search_term) ? true : false;

				if (party_filter_result && institute_filter_result && search_term_filter_result) {
					el.show();
					visible_count++
				} else {
					el.hide()
				}
			})
		} else {
			//top 10
			table_els.each(function (i, el) {
				var $el = $(el);

				if ($el.data('top10')) {
					$el.show()
					visible_count++
				} else {
					$el.hide()
				}
			})

			//// top 10
		}
		get_filter_title()
	}


	$('select.select2').on('change', function (e) {

		var selected_val = $(this).select2('val')

		if (this.id == 'filter_institutes') {
			active_filter_institute = selected_val
		}
		if (this.id == 'filter_parties') {
			active_filter_party = selected_val
		}

		filter_table()

	})

	set_declarations_table_height()



	filter_table()
	$(".persons_list .table").trigger("sorton", [[[1, 1]]]);
	//$('.persons_list .tablesorter thead .income').click().click()


//  $('#person_list_filters a').first().click() //


	// plot init
	if (typeof user_data != 'undefined') {
		var min_year = 99999, max_year = 0, max_money = 0;
		for (var i = 0; i < user_data.length; i++) {
			var d = user_data[i].data,
					first = d[0][0],
					last = d[d.length - 1][0];

			min_year = (first < min_year) ? first : min_year
			max_year = (last > max_year) ? last : max_year

			for (var j = 0; j < d.length; j++) {
				max_money = (d[j][1] > max_money) ? d[j][1] : max_money
			}
		}

		var plot_config = {
			colors: ['#4fa64a', '#888888', '#805e4e', '#676596', '#6faca5', '#976985'],
			series: {
				bars: {
					show: true,
					fill: .7,
					barWidth: .14,
					align: "left",
					lineWidth: 0
				}
			},
			grid: {
				borderWidth: 1,
				borderColor: '#ccc',
				margin: {
					right: 0
				}
			},
			yaxis: {
				color: '#e5e5e5',
				ticks: 5,
				tickFormatter: function (n, s) {
					return '<span style="color:#888">' + n + '</span>'
				}
			},
			xaxis: {
				color: '#fff',
				tickDecimals: 0,
				min: min_year - .6,
				max: max_year + .5,
				//autoscaleMargin: .001,
				reserveSpace: false,
				tickFormatter: function (n, s) {
					return '<span style="color:#888">' + n + '</span>'
				}
			},
			legend: {
				labelFormatter: function (label, series) {
					return "<span style='padding:0 10px 0 3px;'> " + label + "</span>"
				},
				//sorted: "accending",
				noColumns: 15,
				show: true,
				//position: "ne",
				container: "#flot_legend",
				backgroundOpacity: .3
			}
		};

		var stats_graph_plot = $.plot("#flot_container", user_data, plot_config);
	}
})













