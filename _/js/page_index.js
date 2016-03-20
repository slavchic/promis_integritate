$(function () {
	pt = { // person table
		current_time_ms: new Date().getTime(),
		newest_interval_ms: 30 * 24 * 3600 * 1000, // 1 months in ms
		dom: {
			$filters_title: $('#filters_title'),
			$search_inp: $('#name_search_cont input'),
			$search_ico: $('#name_search_cont i'),
			$select2_filters: $('select.select2'),
			$unique_filters: $('[data-filter]'),
			$table_els: $('.persons_list .tablesorter tbody tr')
		},
		filters: {
			search_term: '',
			show_all: null,
			newest: null,
			with_problems: null,
			last_year: null,
			party: null,
			institute: null
		},
		filter_counts: {
			top: 0,
			show_all: 0,
			newest: 0,
			with_problems: 0,
			last_year: 0
		},
		filter_title_bases: {
			institutes: {
				no_i: {
					no_p: 'Top politicienii',
					any_p: 'Averea şi interesele demnitarilor, membri ai ', // + party name
					fp: 'Averea şi interesele demnitarilor neafiliaţi politic'
				},
				parlament: {
					no_p: 'Averea şi interesele deputaţilor',
					any_p: 'Averea şi interesele deputaţilor, membri ai fracțiunii ', // + party name
					fp: 'Averea şi interesele deputaţilor neafiliaţi politic'
				},
				guvern: {
					no_p: 'Averea şi interesele demnitarilor din cadrul Guvernului',
					any_p: 'Averea şi interesele demnitarilor din cadrul Guvernului ', // + party name
					fp: 'Averea şi interesele demnitarilor din cadrul Guvernului'
				},
				presedintie: {
					no_p: '',
					any_p: '', // + party name
					fp: ''
				},
				apl: {
					no_p: 'Averea şi interesele funcţionarilor publici din cadrul APL',
					any_p: 'Averea şi interesele funcţionarilor publici din cadrul APL, membri ai ', // + party name
					fp: 'Averea şi interesele funcţionarilor publici din cadrul APL neafiliaţi politic'
				},
				drept: {
					no_p: '',
					any_p: '',  // + party name
					fp: ''
				},
				diverse: {
					no_p: 'Averea și interesele ex-demnitarilor',
					any_p: 'Ex-demnitari, membri ai  ', // + party name
					fp: 'Ex-demnitari neafiliaţi politic'
				}
			},
			unique_filters: {
				show_all: 'Title show all',
				newest: 'Title newest',
				with_problems: 'Title with problems',
				last_year: 'Title last year'
			}
		},
		active_unique_filter: false,
		visible_count: 0,
		initInterface: function () {
			pt.interface.addKeyEvents()
			pt.interface.initSearch()
			pt.interface.initSelect2Filters()
			pt.interface.initUniqueFilters()
			pt.interface.updateUniqueFilterCounts()
			pt.table.init()

			pt.table.filterTable()
		},
		interface: {
			addKeyEvents: function () {
				var $body = $('body');

				$body.on('keydown keyup', function (e) {
					if (e.keyCode == 17) {
						window.ctrlKey = (e.type == 'keydown') ? true : false
					}
				})
				$body.on('keyup', function (e) {
					if (e.keyCode == 13 && window.ctrlKey) pt.dom.$search_inp.focus()

					if (e.keyCode == 27 && pt.dom.$search_inp.val())  pt.dom.$search_ico.click()
				})
			},
			initSelect2Filters: function () {
				pt.dom.$select2_filters.each(function () {
					$(this).prop("selectedIndex", 0);
					$(this).select2({
						width: '100%',
						allowClear: true
					})
				})
				pt.dom.$select2_filters.on('change', function (e) {

					var selected_val = $(this).select2('val'),
							$sel = $(this);

					if (pt.active_unique_filter) pt.methods.resetUniqueFilters()

					if (this.id == 'filter_institutes')  pt.filters.institute = selected_val
					if (this.id == 'filter_parties') pt.filters.party = selected_val

					$sel.select2('val', selected_val)

					pt.table.filterTable()

				})
			},
			initSearch: function () {
				pt.dom.$search_inp.on('keyup change', function () {
					if (pt.active_unique_filter) pt.methods.resetUniqueFilters()
					if (pt.dom.$search_inp.val()) {
						pt.dom.$search_ico.removeClass('icon-search').addClass('icon-cancel');
					} else {
						pt.dom.$search_ico.removeClass('icon-cancel').addClass('icon-search');
					}
				})
				pt.dom.$search_ico.on('click touch', function (e) {
					pt.dom.$search_inp.val('').focus().change()
					pt.filters.search_term = ''

					pt.table.filterTable()
				})

				$('#search_inp').val('').on('keyup', function (e) {
					pt.filters.search_term = (this.value.length > 1) ? pt.table.parsers.simpleNameFormat(this.value) : '';

					pt.table.filterTable()
				})
			},
			initUniqueFilters: function () {
				pt.dom.$unique_filters.click(function (e) {
					var $btn = $(this),
							b_state = $btn.hasClass('active');

					pt.dom.$unique_filters.removeClass('active');

					pt.methods.resetMainFilters()

					if (!b_state) {
						$btn.addClass('active')
						pt.filters[$btn.data('filter')] = true;
						pt.active_unique_filter = $btn.data('filter')
					} else {
						pt.active_unique_filter = null
					}

					pt.table.filterTable()
					return false
				})
			},
			updateUniqueFilterCounts: function(){
				pt.methods.countUniqueFilterItems()

				pt.dom.$unique_filters.each(function(i, el){
					var filter_name = $(el).data('filter');

					$(el).find('span').text(pt.filter_counts[filter_name]);

				})

			}
		},
		methods: {
			resetMainFilters: function () {
				pt.filters.party = null
				pt.filters.institute = null
				pt.filters.search_term = null

				pt.dom.$select2_filters.select2('val', '').trigger('change')
				pt.dom.$search_inp.val('').trigger('change')
			},
			resetUniqueFilters: function () {
				pt.filters.show_all = null
				pt.filters.newest = null
				pt.filters.last_year = null
				pt.filters.with_problems = null

				pt.active_unique_filter = false

				pt.dom.$unique_filters.removeClass('active')
			},
			countUniqueFilterItems: function(){
				pt.dom.$table_els.each(function (i, el) {
					var $el = $(el),
							$problem_td = $el.find('td.problem')[0],
							el_data_last_year = $el.data('last-year'),
							filter_last_year_val = $('[data-filter="last_year"]').data('filter-value'),
							el_data_added = $el.data('added'),
							el_added_time_ms = new Date($el.data('added')).getTime(), // in milliseconds
							el_data_top = $el.data('top'),
							el_data_problem = ($problem_td) ? pt.table.parsers.currencyToNumber($el.find('td.problem')[0]) : 0

					pt.filter_counts.show_all++

					if (el_data_last_year && el_data_last_year == filter_last_year_val) {
						pt.filter_counts.last_year++
					}
					if (el_data_top) {
						pt.filter_counts.top++
					}
					if (el_data_added && pt.current_time_ms - el_added_time_ms - pt.newest_interval_ms < 0) {
						pt.filter_counts.newest++
					}
					if (el_data_problem) {
						pt.filter_counts.with_problems++
					}
				})
			},
			getFilterTitle: function () {
				var title_institute_base = (pt.filters.institute) ? pt.filters.institute : 'no_i',
						title_party_base = (pt.filters.party == 'fp') ? 'fp' : (pt.filters.party) ? 'any_p' : 'no_p',
						base_type = (pt.active_unique_filter) ? 'unique_filters' : 'institutes',
						$filter_institute_el_txt = '',
						$filter_party_el_txt = '';

				if (pt.filters.party) {
					if (pt.filters.institute) {
						var select_obj = $('#filter_institutes')[0],
								$select_obj_selected_el = $(select_obj.options[select_obj.selectedIndex]);

						$filter_institute_el_txt = $select_obj_selected_el.data('title')
					}
					var select_obj = $('#filter_parties')[0],
							$select_obj_selected_el = $(select_obj.options[select_obj.selectedIndex]);

					$filter_party_el_txt = $select_obj_selected_el.data('title')
				}

				if (pt.active_unique_filter) {
					pt.dom.$filters_title.html(pt.filter_title_bases[base_type][pt.active_unique_filter] + ' <span>(' + pt.visible_count + ')</span>')
				} else {
					pt.dom.$filters_title.html(pt.filter_title_bases[base_type][title_institute_base][title_party_base] + $filter_party_el_txt + ' <span>(' + pt.visible_count + ')</span>')
				}
			}
		},
		table: {
			init: function () {
				$.tablesorter.addParser({
					// set a unique id
					id: 'names_parse',
					is: function (s) {
						return false;// return false so this parser is not auto detected
					},
					format: pt.table.parsers.simpleNameFormat_z,
					type: 'text' // set type, either numeric or text
				});

				$(".persons_list .table").tablesorter({
					textExtraction: pt.table.parsers.currencyToNumber,
					sortList: [[0, 0]],
					headers: {
						0: {
							sorter: 'names_parse'
						}
					}
				})
			},
			parsers: {
				currencyToNumber: function (node) {
					if (!node) return '0';
					if (node && node.className.match('name')) {
						return $(node).find('a:eq(1)').html()
					} else if (node && node.className.match('problem')) {
						if (node.innerHTML) return 1
						else return 0
					} else {
						var $node = $(node),
								node_val = $node.text(),
								val = node_val.replace(/[,\.]/gi, '');

						return val;
					}
				},
				simpleNameFormat: function (s) {
					return s.toLowerCase().replace(/ş/g, 's').replace(/ţ/g, 't').replace(/î/g, 'i').replace(/ă/g, 'a').replace(/â/g, 'a'); // format your data for normalization
				},
				simpleNameFormat_z: function (s) {
					return s.toLowerCase().replace(/ş/g, 'sz').replace(/ţ/g, 'tz').replace(/î/g, 'iz').replace(/ă/g, 'az').replace(/â/g, 'az'); // format your data for normalization
				}
			},
			filterTable: function () {
				pt.visible_count = 0
				pt.dom.$table_els.each(function (i, el) {
					var $el = $(el);

					if (pt.filters.party || pt.filters.institute || pt.filters.search_term) {
						var el_name = pt.table.parsers.simpleNameFormat($el.find('td:first-child a:eq(1)').text()),
								party_filter_result = (pt.filters.party && pt.filters.party == $el.data('party') || !pt.filters.party) ? true : false,
								institute_filter_result = (pt.filters.institute && pt.filters.institute == $el.data('institute') || !pt.filters.institute) ? true : false,
								search_term_filter_result = (pt.filters.search_term && el_name.match(pt.filters.search_term) || !pt.filters.search_term) ? true : false;

						if (party_filter_result && institute_filter_result && search_term_filter_result) {
							$el.show();
							pt.visible_count++
						} else {
							$el.hide()
						}
					} else if (pt.active_unique_filter) {
						var filter_show_all_result = !!pt.filters.show_all,
								filter_newest_result = false,
								filter_last_year_result = false,
								filter_with_problems_result = false;


						if (pt.active_unique_filter == 'last_year') {
							var el_last_year = $el.data('last-year'),
									filter_last_year_val = $('[data-filter="last_year"]').data('filter-value');

							if (el_last_year == filter_last_year_val) filter_last_year_result = true
						}
						if (pt.active_unique_filter == 'newest') {
							var el_added_time_ms = new Date($el.data('added')).getTime(); // in milliseconds

							if (pt.current_time_ms - el_added_time_ms - pt.newest_interval_ms < 0) filter_newest_result = true
						}
						if (pt.active_unique_filter == 'with_problems') {
							var $problem_td = $el.find('td.problem')[0];
							if ($problem_td) {
								filter_with_problems_result = pt.table.parsers.currencyToNumber($el.find('td.problem')[0])
							}

						}

						//dbg(filter_last_year_result, filter_show_all_result, filter_newest_result, !!filter_with_problems_result)

						if (filter_last_year_result || filter_show_all_result || filter_newest_result || filter_with_problems_result) {
							$el.show()
							pt.visible_count++
						} else {
							$el.hide()
						}
					} else {
						//top politics
						if ($el.data('top')) {
							$el.show()
							pt.visible_count++
						} else {
							$el.hide()
						}
					}
				})

				pt.methods.getFilterTitle()
			}
		}
	}
	pt.initInterface()

	//$(".persons_list .table").trigger("sorton", [[[1, 1]]]);
	//$('.persons_list .tablesorter thead .income').click().click()


})
