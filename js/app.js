(function() {
  var BENFORD_VALUES, adjustFooter, getDataset, placeBenfordMarkers, populateDatasetOptions;
  BENFORD_VALUES = {
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
  $(document).ready(function() {
    adjustFooter();
    populateDatasetOptions();
    getDataset('twitter');
    placeBenfordMarkers();
    return $('#dataset-options').change(function() {
      return getDataset($(this).val());
    });
  });
  $(window).resize(function() {
    return adjustFooter();
  });
  placeBenfordMarkers = function() {
    return $('ol#chart li').each(function(index) {
      $('<span class="digit">' + (index + 1) + '</span>').prependTo($(this));
      return $('<b>▲</b>').css('left', BENFORD_VALUES[index + 1] * 2 + '%').appendTo($(this));
    });
  };
  adjustFooter = function() {
    if ($('section').css('float') === "none" && $('body').hasClass('single-column') === false) {
      $('footer').appendTo('body').show();
      return $('body').addClass('single-column');
    } else if ($('section').css('float') !== "none" && $('body').hasClass('single-column')) {
      $('footer').appendTo('aside');
      return $('body').removeClass('single-column');
    }
  };
  populateDatasetOptions = function() {
    return $.getJSON('/js/datasets/index.json', function(data) {
      var items;
      items = [];
      $.each(data, function(key, val) {
        return items.push('<option value="' + key + '">' + val + '</option>');
      });
      return $('#dataset-options').html(items.join(''));
    });
  };
  getDataset = function(name) {
    return $.getJSON('/js/datasets/' + name + '.json', function(data) {
      return $.each(data, function(key, val) {
        var element;
        element = $('ol#chart li::nth-child(' + key + ') .fill');
        element.width(val * 2 + '%');
        return element.next('.percentage').html(val + '%');
      });
    });
  };
}).call(this);