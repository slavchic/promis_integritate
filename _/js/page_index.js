$(function () {
	pt = { // person table
		current_time_ms: new Date().getTime(),
		newest_interval_ms: 30 * 24 * 3600 * 1000, // 1 months in ms
		ignoreHashChange: false,
		dom: {
			$filters_title: $('#filters_title'),
			$search_inp: $('#name_search_cont input'),
			$search_ico: $('#name_search_cont i'),
			$select2_filters: $('select.select2'),
			$unique_filters: $('[data-filter]'),
			$table: $('.main_list.persons_list .tablesorter'),
			$table_els: $('.main_list.persons_list .tablesorter tbody tr')
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
			simple_search: 'Rezultatele cautarii',
			institutes: { // no_i = no institute, no_p = no party, any_p = any party, fp = fara partid (without party)
				no_i: {
					no_p: 'Topul celor mai mediatizaţi demnitari',
					any_p: 'Demnitari, membri ai ', // + party name
					fp: 'Demnitari neafiliaţi politic'
				},
				parlament: {
					no_p: 'Deputaţi în Parlamentul Republicii Moldova',
					any_p: 'Deputaţii, membri ai fracţiunii ', // + party name
					fp: 'Deputaţii neafiliaţi politic'
				},
				guvern: {
					no_p: 'Demnitari din componenţa Guvernului',
					any_p: 'Demnitari din componenţa Guvernului, membri ai ', // + party name
					fp: 'Demnitari din componenţa Guvernului neafiliaţi politic'
				},
				presedintie: {
					no_p: 'Preşedintele Republicii Moldova',
					any_p: 'Preşedintele Republicii Moldova, membru al ',
					fp: 'Preşedintele Republicii Moldova neafiliat politic'
				},
				apl: {
					no_p: 'Funcţionarii publici din cadrul APL',
					any_p: 'Funcţionarii publici din cadrul APL, membri ai ', // + party name
					fp: 'Funcţionarii publici din cadrul APL neafiliaţi politic'
				},
				ccrm: {
					no_p: 'Judecătorii Curţii Constituţionale',
					any_p: 'Judecătorii Curţii Constituţionale, membri ai ',  // + party name
					fp: 'Judecătorii Curţii Constituţionale neafiliaţi politic'
				},
				judecatori: {
					no_p: 'Judecătorii instanţelor judecătoreşti',
					any_p: 'Judecătorii instanţelor judecătoreşti, membri ai ',  // + party name
					fp: 'Judecătorii instanţelor judecătoreşti neafiliaţi politic'
				},
				agentii: {
					no_p: 'Demnitarii şi funcţionarii publici din cadrul agenţiilor',
					any_p: 'Demnitarii şi funcţionarii publici din cadrul agenţiilor, membri ai ',  // + party name
					fp: 'Demnitarii şi funcţionarii publici din cadrul agenţiilor neafiliaţi politic'
				},
				autonome: {
					no_p: 'Demnitarii din cadrul instituţiilor publice autonome',
					any_p: 'Demnitarii din cadrul instituţiilor publice autonome, membri ai ',  // + party name
					fp: 'Demnitarii din cadrul instituţiilor publice autonome neafiliaţi politic'
				},
				alte: {
					no_p: 'Demnitarii din cadrul autorităţilor subordonate Guvernului',
					any_p: 'Demnitarii din cadrul autorităţilor subordonate Guvernului, membri ai ',  // + party name
					fp: 'Demnitarii din cadrul autorităţilor subordonate Guvernului neafiliaţi politic'
				},
				diverse: {
					no_p: 'Ex-demnitari',
					any_p: 'Ex-demnitari, membri ai ', // + party name
					fp: 'Ex-demnitari neafiliaţi politic'
				}
			},
			unique_filters: {
				show_all: 'Demnitarii monitorizaţi în cadrul proiectului',
				newest: 'Persoane noi introduse în lista de monitorizare',
				with_problems: 'Demnitarii care au admis nereguli la declararea averilor',
				last_year: 'Demnitari a căror declaraţii pentru 2015 au fost publicate'
			}
		},
		active_unique_filter: false,
		visible_count: 0,
		initInterface: function () {
			pt.interface.prepareEvents()
			pt.interface.initSearch()
			pt.interface.initSelect2Filters()
			pt.interface.initUniqueFilters()
			pt.interface.updateUniqueFilterCounts()
			pt.table.init()

			pt.methods.urlParser()
			//else pt.table.filterTable()
		},
		interface: {
			prepareEvents: function () {
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
				$(window).on('popstate', function (e) {
					if (!pt.ignoreHashChange) pt.methods.urlParser()
					e.preventDefault()
				})
			},
			initSelect2Filters: function () {
				pt.dom.$select2_filters.each(function () {
					$(this).prop("selectedIndex", 0);
					$(this).select2({
						width: '100%',
						allowClear: true,
						minimumResultsForSearch: -1
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
				pt.dom.$search_inp.on('focus blur', function(e){
					var $cont = pt.dom.$search_inp.parents('.search')
					if (e.type == 'focus') {
						$cont.addClass('focused')
					} else $cont.removeClass('focused')

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
					$btn.blur();
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
			resetAllFiltersOnly: function(){
				pt.filters.party = null
				pt.filters.institute = null
				pt.filters.search_term = null
				pt.filters.show_all = null
				pt.filters.newest = null
				pt.filters.last_year = null
				pt.filters.with_problems = null
			},
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
			urlParser: function () {
				var hash = window.location.hash,
						filters = hash.replace('#', '').split('&');

				pt.methods.resetAllFiltersOnly();

				for (var i = 0; i < filters.length; i++) {
					var filter = filters[i].split('='),
							filterType = filter[0],
							filterVal = filter[1];

					pt.filters[filterType] = filterVal
				}

				pt.methods.switchFilters()
			},
			getFilterUrlHash: function () {
				var hash = '',
						count = 0;

				for (var f in pt.filters) {
					var val = pt.filters[f];
					if (val && count) hash += '&';
					if (val) hash += f + '=' + val;
					if (val) count++
				}
				return hash;
			},
			updateUrlHash: function(){
				var currentHash = window.location.hash,
						newHash = pt.methods.getFilterUrlHash();
				if (currentHash != newHash) {
					if (newHash) {
						window.location.hash = newHash
					} else {
						history.pushState("", document.title, window.location.pathname) // hash cleanup
					}

				}
			},
			switchFilters: function(){
				for (var filterType in pt.filters) {
					var val = pt.filters[filterType];

					if (val) {
						if (filterType == 'institute') $('#filter_institutes').select2('val', val)
						if (filterType == 'party') $('#filter_parties').select2('val', val)
						if (filterType == 'search_term') pt.dom.$search_inp.val(val).change()

						if (filterType.match(/show_all|newest|last_year|with_problems/)) {
							pt.active_unique_filter = filterType
							$('[data-filter=' + filterType + ']').addClass('active')
						}
					} else {
						if (filterType == 'institute') $('#filter_institutes').select2('val', '')
						if (filterType == 'party') $('#filter_parties').select2('val', '')
						if (filterType == 'search_term') pt.dom.$search_inp.val('').change()
					}
				}
				pt.table.filterTable()
			},
			getFilterTitle: function () {
				var title_institute_base = (pt.filters.institute) ? pt.filters.institute : 'no_i',
						title_party_base = (pt.filters.party == 'fp') ? 'fp' : (pt.filters.party) ? 'any_p' : 'no_p',
						base_type = '',
						$filter_institute_el_txt = '',
						$filter_party_el_txt = '';

				if (pt.active_unique_filter) {
					base_type	= 'unique_filters'
				} else if (!pt.filters.party && !pt.filters.institute && pt.filters.search_term){
					base_type = 'simple_search'
				} else {
					base_type = 'institutes'
				}

				if (pt.filters.party) {
					if (pt.filters.institute) {
						var select_obj = $('#filter_institutes')[0],
								$select_obj_selected_el = $(select_obj.options[select_obj.selectedIndex]);

						$filter_institute_el_txt = $select_obj_selected_el.data('title')
					}
					var select_obj = $('#filter_parties')[0],
							$select_obj_selected_el = $(select_obj.options[select_obj.selectedIndex]);

					$filter_party_el_txt = (!title_party_base.match(/fp|no_p/)) ? $select_obj_selected_el.data('title') : ''
				}

				if (pt.active_unique_filter) {
					pt.dom.$filters_title.html(pt.filter_title_bases[base_type][pt.active_unique_filter] + ' <span class="count">(' + pt.visible_count + ')</span>')
				} else if (!pt.filters.party && !pt.filters.institute && pt.filters.search_term) {
					pt.dom.$filters_title.html(pt.filter_title_bases[base_type] + ' <span class="count">(' + pt.visible_count + ')</span>')
				} else {
					pt.dom.$filters_title.html(pt.filter_title_bases[base_type][title_institute_base][title_party_base] + $filter_party_el_txt + ' <span class="count">(' + pt.visible_count + ')</span>')
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

				$(".main_list.persons_list .table").tablesorter({
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
								val = parseFloat(node_val.replace(/[,]/gi, ''));

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

				pt.ignoreHashChange = true
				pt.methods.updateUrlHash()
				setTimeout(function(){pt.ignoreHashChange = false},100);

				pt.dom.$table.toggleClass('filtered', !!pt.methods.getFilterUrlHash()) // toggle "filtered" class if table is filtered

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


	//$(".top_list.persons_list .table").tablesorter({
	//	textExtraction: pt.table.parsers.currencyToNumber,
	//	sortList: [[0, 0]],
	//	headers: {
	//		0: {
	//			sorter: 'names_parse'
	//		}
	//	}
	//})
	sslider = $('.slider').slider({autoswitch: 10000})

	//$(".persons_list .table").trigger("sorton", [[[1, 1]]]);
	//$('.persons_list .tablesorter thead .income').click().click()


})
