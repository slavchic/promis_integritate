$(function () {

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

	set_declarations_table_height() // for inner pages


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