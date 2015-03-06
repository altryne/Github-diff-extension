$(document).ready(function(){
    if($('.toc-diff-stats').length){
        window.extensions = ls_get(location.pathname) || {};
        $toc = $('#toc');
        $toc.find('.content li>a').each(function () {
            ext_str_full = $(this).text().trim().split('.');
            if (ext_str_full.length  && ext_str_full != "") {
                ext_str = ext_str_full[ext_str_full.length - 1];
                if(typeof extensions[ext_str] == 'undefined'){
                    extension = extensions[ext_str] = {};
                }else{
                    extension = extensions[ext_str];
                }
                if(typeof extension["hidden"] == 'undefined'){
                    extension["hidden"] = false;
                }
                $(this).attr('data-extension', ext_str);
                $($(this).attr('href')).attr('data-extension', ext_str);
            }
        });



        $modal = $('<div id="filter-menu" class="select-menu js-menu-container js-select-menu is-showing-clear-item left" data-multiple style="position:relative;margin-right: 10px">\n\n      <span class="minibutton select-menu-button js-menu-target">\n        <span class="octicon octicon-search"></span>\n        Visible file types: (<span class="filtered-string">0</span>)\n        <!--<span class="js-select-button">simple</span>-->\n      </span>\n\n    <div class="select-menu-modal-holder js-menu-content js-navigation-container" style="top:25px">\n        <div class="select-menu-modal">\n            <div class="select-menu-header">\n                <span class="select-menu-title">Toggle appearance of file type</span>\n                <span class="octicon octicon-x js-menu-close"></span>\n            </div>\n            \n            <div class="select-menu-filters">\n                <div class="select-menu-text-filter">\n                    <input type="text" id="text-filter-field" class="js-filterable-field js-navigation-enable"\n                           placeholder="Filter file extensions">\n                </div>\n            </div>\n\n            <div class="select-menu-list">\n                <div class="extensions-to-remove" data-filterable-for="text-filter-field" data-filterable-type="substring">\n\n                    \n                </div>\n\n                <div class="select-menu-no-results">Nothing to show</div>\n            </div>\n\n            <div class="select-menu-footer js-menu-close">\n                <span class="octicon octicon-check"></span>\n                <a id="clear-all-filters" href="#">Show all file types</a>\n            </div>\n        </div>\n        <!-- /.select-menu-modal -->\n    </div>\n    <!-- /.select-menu-modal-holder -->\n</div>')

        $tmpl = $('<div class="select-menu-item js-navigation-item file-type">\n    <span class="select-menu-item-icon octicon octicon-eye-watch"></span>\n    <span class="select-menu-item-icon octicon octicon-x"></span>\n    <div class="select-menu-item-text">\n        <h4 class="js-select-button-text"></h4>\n        <span class="description">Hide show <b></b> files</span>\n    </div>\n</div>');

        $.each(Object.keys(extensions),function(k,v){
            $new_tmpl = $tmpl.clone();
            $new_tmpl.find('.js-select-button-text, .description>b').text('.' + v);
            $modal.find('.extensions-to-remove').append($new_tmpl);
            if(!extensions[v]["hidden"]){
                $new_tmpl.addClass('selected');
            }

        });
        $toc.find('.button-group').prepend($modal);


        $("#filter-menu").find(".select-menu-item").on('click',function(){
            setTimeout(function () {
                exts = $("#filter-menu").find(".select-menu-item");
                $.each(exts, function () {
                    curr_ext_str = $(this).find('.js-select-button-text').text().trim();
                    if($(this).hasClass('selected')){
                        extensions[curr_ext_str.substr(1)]["hidden"] = false
                    }else{
                        extensions[curr_ext_str.substr(1)]["hidden"] = true
                    }

                });

                hide_filtered_diffs();
            }, 200)
        });

        $('#clear-all-filters').on('click',function(e){
            e.preventDefault();
            window.exts_arr = [];
            $("#filter-menu").find(".select-menu-item").addClass('selected');
            $.each(extensions,function(k){
                extensions[k]["hidden"] = false;
            });
            hide_filtered_diffs();
        })


    var hide_filtered_diffs = function () {
        $('.filter-notice').remove();
        $files_arr = $("#files").find('.file');
        var files_length = $files_arr.length;
        var hidden_length = 0;
        var hidden_extension_length = 0;
        $.each(extensions, function(k,ext){
            $files = $files_arr.filter('.file[data-extension="' + k + '"]');
            $links = $toc.find('a[data-extension="' + k + '"]');
            if(ext["hidden"]){
                var $hidden_by_filter = '<i class="filter-notice">(hidden by filter)</i>';
                $files
                    .css('opacity', 0.4).find('.data').addClass('hidden')
                    .end().find('.info').append($hidden_by_filter);
                $links.css('opacity', 0.4).append($hidden_by_filter);
                hidden_length += $files.length;
                hidden_extension_length += 1;
            }else{
                $files
                    .css('opacity', 1).find('.data').removeClass('hidden');
                $links.css('opacity', 1);
            }
        });

        $('.filtered-string').text(Object.keys(extensions).length - hidden_extension_length);

        if(hidden_length > 0){
            $toc.find('.explain>strong').eq(0).text((files_length - hidden_length) + ' changed files ('+ hidden_length+ ' hidden by filter)')
            ls_set(location.pathname, extensions);
        }else{
            $toc.find('.explain>strong').eq(0).text(files_length + ' changed files');
            ls_set(location.pathname, null);
        }

    };

    hide_filtered_diffs();
    }
});


ls_set = function(key, data){
    window.localStorage.setItem(key, JSON.stringify(data));
};
ls_get = function(key){
    return JSON.parse(window.localStorage.getItem(key));
};