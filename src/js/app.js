window.$ = window.jQuery = require('jquery')
require('select2')

const i18n = require('roddeh-i18n')
const axios = require('axios')

window.langCurrent = 'en'
window.lang = i18n.create()
axios.get(`/lang/langs.json`)
    .then(function(response) {
        window.langs = response.data
        items = []
        Object.keys(window.langs).map(function(key, i) {
            window.$.fn.select2.amd.define(`select2/i18n/${key}`, [], require(`select2/src/js/select2/i18n/${key}`))
            items.push('<option value="' + key + '">' + window.langs[key] + '</option>')
        })
        $('#lang-options').html(items.join(''))
        window.initLang()
    }).catch(function(error) {
        console.log(error)
    })

const BENFORD_VALUES = {
    1: 30.1,
    2: 17.6,
    3: 12.5,
    4: 9.7,
    5: 7.9,
    6: 6.7,
    7: 5.8,
    8: 5.1,
    9: 4.6
};
const MAX_CHART_WIDTH_PERCENTAGE = 81;
var popped = false;
var lastPath = window.location.pathname;

$(document).ready(function() {
    window.initChart()
    window.adjustFooter()
    window.populateDatasetOptions()
    return window.initSelects()
})

$(window).resize(function() {
    return window.adjustFooter()
})

window.initLang = function() {
    if (window.location.hash != '') {
        let lang = window.location.hash.substring(window.location.hash.lastIndexOf("#") + 1)
        if (typeof window.langs[lang] != 'undefined') {
            window.changelang(lang, false)
            $('#lang-options').val(lang)
        }
    }
    $('#lang-options').change(function() {
        window.changelang($(this).val())
    })
}

window.changelang = function(lang, hash = true) {
    axios.get(`/lang/${lang}.json`)
        .then(function(response) {
            if (hash) {
                window.location.hash = `#${lang}`
            }
            window.langCurrent = lang
            window.lang.translator.add(response.data)
            window.translateDatasetOptions()
            $('title').text(window.lang('title'));
            $('meta[name="description"]').text(window.lang('description'));
            $('meta[name="author"]').text(window.lang('author'));
            $('.i18n').each(function () {
                $(this).html(window.lang($(this).data('str')))
            })
            window.initSelects()
        }).catch(function(error) {
            console.log(error)
        })
}

window.initChart = function() {
    return $('ol#chart li').each(function(index) {
        $('<span></span>').appendTo($(this))
        $('<span class="digit">' + (index + 1) + '</span>').prependTo($(this))
        return $('<b>▲</b>').hide().appendTo($(this))
    })
}

window.initSelects = function() {
    $('.select2-js').select2({
        language: window.langCurrent,
        width: '100%',
        theme: 'flat'
    })
}

window.placeBenfordMarkers = function(multiplier) {
    return $('ol#chart li b').each(function(index) {
        return $(this).css('left', BENFORD_VALUES[index + 1] * multiplier + '%').fadeIn('fast')
    })
}

window.adjustFooter = function() {
    if ($('section').css('float') === "none" && $('body').hasClass('single-column') === false) {
        $('footer').appendTo('body').show()
        return $('body').addClass('single-column')
    } else if ($('section').css('float') !== "none" && $('body').hasClass('single-column')) {
        $('footer').appendTo('aside')
        return $('body').removeClass('single-column')
    }
}

window.translateDatasetOptions = function(init = true) {
    axios.get(`datasets/index-${window.langCurrent}.json`)
        .then(function(response) {
            $('#dataset-options option').each(function() {
                $(this).text(response.data[$(this).prop('value')])
            })
            window.initSelects()
            let currentDataset = window.getLocation()
            $('#dataset-description').text(response.data[currentDataset])
        }).catch(function(error) {
            console.log(error)
        })
}

window.populateDatasetOptions = function() {
    axios.get(`datasets/index-${window.langCurrent}.json`)
        .then(function(response) {
            var currentDataset, items;
            items = [];
            $.each(response.data, function(key, val) {
                return items.push('<option value="' + key + '">' + val + '</option>')
            })
            $('#dataset-options').html(items.join(''))
            currentDataset = window.getLocation()
            window.observeDatasetOptions()
            window.watchForPopState()
            $('#dataset-options').val(currentDataset)
            return window.zeroChart(currentDataset)
        }).catch(function(error) {
            console.log(error)
        })
}

window.observeDatasetOptions = function() {
    return $('#dataset-options').change(function() {
        let nextDataset = $(this).val()
        window.zeroChart(nextDataset)
        if (window.history && window.history.pushState) {
            return window.history.pushState({}, document.title, `${nextDataset}${window.location.hash}`)
        }
    })
}

window.watchForPopState = function() {
    if (window.history && window.history.pushState) {
        return $(window).bind('popstate', function(event) {
            var dataset, initialPop;
            initialPop = !popped && window.location.pathname === lastPath;
            popped = true;
            if (initialPop) {
                return;
            }
            dataset = window.getLocation()
            $('#dataset-options').val(dataset)
            return window.zeroChart(dataset)
        })
    }
}

window.getLocation = function(href) {
    var path;
    path = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1)
    if (path.length === 0) {
        path = window.getDefaultLocation()
    }
    return path;
}

window.getDefaultLocation = function() {
    return $('#dataset-options option:first').val()
}

window.zeroChart = function(nextDataset) {
    $('table#stats td:nth-child(2)').fadeOut('fast')
    $('#data-source').fadeOut('fast')
    return $('ol#chart li').each(function(index) {
        $(this).find('.fill').next('span').fadeOut('fast')
        $(this).find('b').fadeOut('fast')
        return $(this).find('.fill').animate({
            width: 0
        }, {
            duration: 400,
            complete: function() {
                if (index === 8) {
                    return window.getDataset(nextDataset)
                }
            }
        })
    })
}

window.drawChart = function(data, multiplier) {
    return $('ol#chart li').each(function(index) {
        var value;
        value = data.values[index + 1];
        return $(this).find('.fill').animate({
            width: value * multiplier + '%'
        }, {
            duration: 400,
            complete: function() {
                $(this).next('span').html(value + '%')
                if (index === 8) {
                    $('ol#chart li .fill').next('span').fadeIn('fast')
                    $('table#stats td:nth-child(2)').fadeIn('fast')
                    $('#data-source').fadeIn('fast')
                    return window.placeBenfordMarkers(multiplier)
                }
            }
        })
    })
}

window.getDataset = function(name) {
    return $.getJSON('datasets/' + name + '.json', function(data) {
        var description, multiplier;
        description = $('#dataset-options option:selected').text()
        if (description.length === 0) {
            description = $('#dataset-options option:first').text()
        }
        $('#dataset-description').text(description)
        multiplier = window.getMultiplierForDataset(data)
        $('#num-records').text(data.num_records)
        $('#min-value').text(data.min_value)
        $('#max-value').text(data.max_value)
        $('#orders-of-magnitude').text(window.getOrdersOfMagnitudeBetween(data.min_value, data.max_value))
        $('#data-source').text(data.source).attr('href', data.source)
        return window.drawChart(data, multiplier)
    })
}

window.getMultiplierForDataset = function(dataset) {
    var max;
    max = 0;
    $.each(dataset.values, function(key, val) {
        if (val > max) {
            return max = val;
        }
    })
    return MAX_CHART_WIDTH_PERCENTAGE / max;
}

window.getOrdersOfMagnitudeBetween = function(min, max) {
    min = parseInt(min.replace(/,/g, ""))
    max = parseInt(max.replace(/,/g, ""))
    return Math.floor(Math.LOG10E * Math.log(max - min))
}
