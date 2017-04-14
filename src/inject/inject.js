$(document).ready(function () {

  let pjax_observer = new MutationObserver((mutations) => {
    _.debounce(init, 100)()
  });
  pjax_observer.observe($('#js-repo-pjax-container')[0], {childList: true});

  init();


  $('body').on('click', '.toggle-state-btn', (e) => {
    e.preventDefault();
    $(this).parents('.file').toggleClass('diff-helper-hidden')
  });

  $('body').on('click', '#clear-all-filters', function (e) {
    e.preventDefault();
    window.exts_arr = [];
    $("#filter-menu").find(".select-menu-item").addClass('selected');
    $.each(extensions, function (k) {
      extensions[k]["hidden"] = false;
    });
    hide_filtered_diffs();
  });

  $("body").on('click', '#filter-menu .select-menu-item', function () {
    $(this).toggleClass('selected');
    setTimeout(function () {
      exts = $("#filter-menu").find(".select-menu-item");
      $.each(exts, function () {
        curr_ext_str = $(this).find('.filetype-title').text().trim();
        if ($(this).hasClass('selected')) {
          extensions[curr_ext_str.substr(1)]["hidden"] = false
        } else {
          extensions[curr_ext_str.substr(1)]["hidden"] = true
        }

      });

      hide_filtered_diffs();
    }, 200)
  });

});

let init = () => {
  observe_files();
  collect_file_extensions();
  inject_toggler_dropdown();
  update_attributes_and_buttons_on_files();
  hide_filtered_diffs();
};

let refresh_on_load_more_files = () => {
  update_attributes_and_buttons_on_files();
  hide_filtered_diffs();
};

let observe_files = () => {
  if (!$('#files').length){
    return false
  }
  let files_observer = new MutationObserver((mutations) => {
    _.throttle(refresh_on_load_more_files, 100)()
  });
  files_observer.observe($('#files')[0], {childList: true, subtree: true});
};

let collect_file_extensions = () => {
  window.extensions = ls_get(location.pathname) || {};
  window.$toc = ($('.toc-select').length) ? $('.toc-select') : $('#toc .content');

  $toc.find('a').each(function () {
    ext_str_full = $(this).text().trim().split('.');
    if (ext_str_full.length && ext_str_full !== "") {
      ext_str = ext_str_full[ext_str_full.length - 1];
      if (typeof extensions[ext_str] === 'undefined') {
        extension = extensions[ext_str] = {};
      } else {
        extension = extensions[ext_str];
      }
      if (typeof extension["hidden"] === 'undefined') {
        extension["hidden"] = false;
      }
      //put the data-extension on the file link
      $(this).attr('data-extension', ext_str);
    }
  });

};

let update_attributes_and_buttons_on_files = () => {

  $toc.find('a').each(function () {
    //put the data-extension on the file diff itself
    //file diffs, don't have ID's, but they do have links with the same name before them
    let $file = $('[name=' + $(this).attr('href').substr(1) + ']').next();
    let ext_str = $(this).attr('data-extension');
    $file.attr('data-extension', ext_str);
  });
};

let inject_toggler_dropdown = () => {

  // remove the older template and replace with a newer one
  if ($('#filter-menu').length) {
    $('#filter-menu').remove()
  }
  let $modal = $('<div id="filter-menu" class="diffbar-item select-menu js-menu-container">\n\n    <div class="js-select-button">\n        <button type="button" class="btn-link muted-link select-menu-button js-menu-target" data-hotkey="f"\n                aria-expanded="false">\n            <strong>\n                Visible file types: (<span class="filtered-string">0</span>)\n            </strong>\n        </button>\n    </div>\n\n    <div class="select-menu-modal-holder">\n        <div class="select-menu-modal js-menu-content" >\n            <div class="select-menu-header">\n                    <svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path></svg>\n                    <span class="select-menu-title">\n                        Filter file types\n                    </span>\n                  </div>\n\n            <div class="select-menu-filters">\n                <div class="select-menu-text-filter">\n                    <input type="text" id="file-extensions-filter-field" class="form-control js-filterable-field js-navigation-enable"\n                           placeholder="Filter file extensions">\n                </div>\n            </div>\n\n            <div class="select-menu-list select-menu-list js-navigation-container js-active-navigation-container">\n                <div class="extensions-to-remove" data-filterable-for="file-extensions-filter-field"\n                     data-filterable-type="substring">\n                </div>\n\n                <div class="select-menu-no-results">Nothing to show</div>\n            </div>\n\n            <div class="select-menu-footer js-menu-close">\n                <span class="octicon octicon-check">\n                    <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" role="img"\n                         version="1.1" viewBox="0 0 12 16" width="12"><path\n                            d="M12 5L4 13 0 9l1.5-1.5 2.5 2.5 6.5-6.5 1.5 1.5z"></path></svg>\n                </span>\n                <a id="clear-all-filters" href="#">Show all file types</a>\n            </div>\n        </div>\n        <!-- /.select-menu-modal -->\n    </div>\n    <!-- /.select-menu-modal-holder -->\n</div>')

  let $tmpl = $('<a href="#" class="select-menu-item js-navigation-item file-type">\n    <svg aria-hidden="true" class="select-menu-item-icon octicon octicon-eye octicon" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path></svg>\n    <div class="select-menu-item-text">\n        <div class="filetype-title text-emphasized css-truncate css-truncate-target">\n        </div>\n        <span class="description">Hide show <span class="extension-count"></span> <b class="extension-label"></b> files</span>\n    </div>\n\n</a>\n');

  $.each(Object.keys(extensions), function (k, v) {
    let $new_tmpl = $tmpl.clone();
    // inject extension name to dropdown item
    $new_tmpl.find('.filetype-title, .extension-label').text('.' + v);
    // inject count to dropdown
    let count = $toc.find('[data-extension="' + v + '"]').length;
    $new_tmpl.find('.extension-count').text(count);
    $modal.find('.extensions-to-remove').append($new_tmpl);
    if (!extensions[v]["hidden"]) {
      $new_tmpl.addClass('selected');
    }
  });

  if ($('.toc-select').length) {
    $('.toc-select').after($modal)
  } else {
    $('#toc .btn-group').prepend($modal)
  }

};


let hide_filtered_diffs = function () {
  $('.filter-notice').remove();
  $files_arr = $("#files").find('.file');
  let files_length = $files_arr.length;
  let hidden_length = 0;
  let hidden_extension_length = 0;

  $.each(extensions, function (k, ext) {
    let $file = $files_arr.filter('.file[data-extension="' + k + '"]');
    let $link = $toc.find('a[data-extension="' + k + '"]');
    if (ext["hidden"]) {
      let $hidden_by_filter = '<i class="filter-notice">(hidden by filter)</i>';
      $file.addClass('diff-helper-hidden')

      $link.css('opacity', 0.4).append($hidden_by_filter);
      hidden_length += $file.length;
      hidden_extension_length += 1;
    } else {
      $file.removeClass('diff-helper-hidden');
      $link.css('opacity', 1);
    }
  });

  $('.filtered-string').text(Object.keys(extensions).length - hidden_extension_length);

  if (hidden_length > 0) {
    $add_info = $('<strong class="added_info">(' + hidden_length + ' hidden by filter)</strong>');
    $toc.find('.added_info').remove();
    $toc.find('.toc-diff-stats').append($add_info)
    ls_set(location.pathname, extensions);
  } else {
    $toc.find('.added_info').remove();
    ls_set(location.pathname, null);
  }

};

ls_set = function (key, data) {
  window.localStorage.setItem(key, JSON.stringify(data));
};
ls_get = function (key) {
  return JSON.parse(window.localStorage.getItem(key));
};
