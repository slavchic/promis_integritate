dbg = function () {
  if (typeof console != 'undefined') console.log(arguments)
}

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
  for (id in temp_a) {
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
  //dbg(node)
  if (node.className.match('name')) {
	return $(node).find('a:eq(1)').html()
  } else return node.innerHTML.replace(/[,\.]/gi, '');
}


$(function () {

  var is_touch_device = 'ontouchstart' in document.documentElement,
	  active_filter_party,
	  active_filter_institute,
	  search_term = '';

  if (is_touch_device) {
	$('body').addClass('touch')
  }
  $('body').on('keydown keyup', function (e) {
	if (e.keyCode == 17) {
	  window.ctrlKey = (e.type == 'keydown') ? true : false
	}
  })
  $('body').on('keydown', function (e) {
	if (e.keyCode == 13 && window.ctrlKey) {
	  $('#name_search_cont i').click()
	}
	if (e.keyCode == 27 && $('#name_search_cont').hasClass('active')) {
	  $('#name_search_cont i').click()
	}
  })

  $('#name_search_cont').on('click touch', function (e) {
	e.stopPropagation()
  })
  $('#name_search_cont input').on('click touch', function (e) {
	$(this).focus()
  })
  $('#name_search_cont i').on('click touch', function (e) {
	e.stopPropagation();
	var i = $(this),
		cont = $('#name_search_cont'),
		inp = cont.find('input');

	cont.toggleClass('active')
	i.toggleClass('icon-cancel')

	if (!cont.hasClass('active')) {
	  inp.val('').keyup().blur()
	} else {
	  setTimeout(function () {
		inp.focus()
	  }, 400)
	}
  })

  $('#search_inp').val('').on('keyup', function (e) {
	search_term = (this.value.length > 1) ? simple_name_format(this.value) : '';

	filter_table()
  })

  function simple_name_format(s) {
	return s.toLowerCase().replace(/ş/g, 'sz').replace(/ţ/g, 'tz').replace(/î/g, 'iz').replace(/ă/g, 'az').replace(/ă/g, 'az'); // format your data for normalization
  }

  $.tablesorter.addParser({
	// set a unique id
	id: 'names_parse',
	is: function (s) {
	  return false;// return false so this parser is not auto detected
	},
	format: simple_name_format,
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
		} else {
		  el.hide()
		}
	  })
	} else {
	  table_els.show()
	}
  }


  $('#person_list_filters a').on('click', function (e) {
	e.preventDefault()

	var btn = $(this),
		btn_filter_party = btn.data('filter-party'),
		btn_filter_institute = btn.data('filter-institute')

	if (btn_filter_party) {
	  $('#person_list_filters a[data-filter-party]').removeClass('active')
	  if (active_filter_party == btn_filter_party) {
		active_filter_party = null
	  } else {
		btn.addClass('active')
		active_filter_party = btn_filter_party
	  }

	} else {
	  $('#person_list_filters a[data-filter-institute]').removeClass('active')
	  if (active_filter_institute == btn_filter_institute) {
		active_filter_institute = null
	  } else {
		btn.addClass('active')
		active_filter_institute = btn_filter_institute
	  }
	}
	filter_table()

  })

  set_declarations_table_height()
//  $('#person_list_filters a').first().click() //


  // plot init
  if (user_data) {
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
		  return "<div style='padding-left:6px;'> " + label + "</div>"
		},
		//sorted: "accending",
		show: false,
		position: "nw",
		backgroundOpacity: .3
	  }
	};

	var stats_graph_plot = $.plot("#flot_container", user_data, plot_config);
  }
})













