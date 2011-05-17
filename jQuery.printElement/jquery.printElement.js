/// <reference path="http://code.jquery.com/jquery-1.4.1-vsdoc.js" />
/*
* Print Element Plugin 1.3
*
* Copyright (c) 2010 Erik Zaadi & Gregory Waxman
*
* Inspired by PrintArea (http://plugins.jquery.com/project/PrintArea) and
* http://stackoverflow.com/questions/472951/how-do-i-print-an-iframe-from-javascript-in-safari-chrome
*
*  Home Page : http://projects.erikzaadi/jQueryPlugins/jQuery.printElement 
*  Issues (bug reporting) : http://github.com/erikzaadi/jQueryPlugins/issues/labels/printElement
*  jQuery plugin page : http://plugins.jquery.com/project/printElement 
*  
*  Thanks to David B (http://github.com/ungenio) and icgJohn (http://www.blogger.com/profile/11881116857076484100)
*  For their great contributions!
* 
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*   
*   Note, Iframe Printing is not supported in Opera and Chrome 3.0, a popup window will be shown instead
*/
; (function (window, $, undefined) {
    var document = window.document,
		defaults = {
			printMode: 'iframe', //Usage : iframe / popup
			pageTitle: '', //Print Page Title
			/* Can be one of the following 3 options:
			* 1 : boolean (pass true for stripping all css linked)
			* 2 : array of $.fn.printElement.cssElement (s)
			* 3 : array of strings with paths to alternate css files (optimized for print)
			*/
			importStylesheets: true,
			printBodyOptions: {
				styleToAdd: 'padding:10px;margin:10px;', //style attributes to add to the body of print document
				classNameToAdd: '' //css class to add to the body of print document
			},
			stylesheets: null,
			stylesheetsToExclude: null,
			leaveOpen: false, // in case of popup, leave the print page open or not
			iframeElementOptions: {
				styleToAdd: 'border:none;position:absolute;width:0px;height:0px;bottom:0px;left:0px;', //style attributes to add to the iframe element
				classNameToAdd: '' //css class to add to the iframe element
			}
		};
	
    $.fn.printElement = function (options) {
        var mainOptions = $.extend({}, defaults, options);

        //Remove previously printed iframe if exists
        $("iframe[id^='printElement_']").remove();

        return this.each(function () {
            //Support Metadata Plug-in if available
            _printElement($(this), mainOptions);
        });
    };
    
    function _printElement($element, opts) {
        //Create markup to be printed
        var html = _getMarkup($element, opts),
			popupOrIframe = null,
			documentToWriteTo = null;
			
        if (opts.printMode.toLowerCase() == 'popup') {
            popupOrIframe = window.open('about:blank', 'printElementWindow', 'width=650,height=440,scrollbars=yes');
            documentToWriteTo = popupOrIframe.document;
        }
        else {
            //The random ID is to overcome a safari bug http://www.cjboco.com.sharedcopy.com/post.cfm/442dc92cd1c0ca10a5c35210b8166882.html
            var printElementID = "printElement_" + (Math.round(Math.random() * 99999)).toString(),
				iframe = $('<iframe id="' + printElementID + '" '
                                + 'src="about:blank" '
                                + 'scrolling="no" '
                                + 'frameBorder="0" '
                                + 'class="' + opts["iframeElementOptions"]["classNameToAdd"] + '" '
                                + 'style="' + opts["iframeElementOptions"]["styleToAdd"] + '" />').appendTo(document.body)[0];
			
            documentToWriteTo = iframe.contentWindow || iframe.contentDocument;
            documentToWriteTo.document && (documentToWriteTo = documentToWriteTo.document);
            popupOrIframe = iframe.contentWindow || iframe;
        }

        popupOrIframe.focus();
        documentToWriteTo.open();
        documentToWriteTo.write(html);
        documentToWriteTo.close();
    }
	
    function _getBaseHref() {
        var port = (window.location.port) ? ':' + window.location.port : '';
        return window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;
    }

    function _getMarkup($element, opts) {
        var elementHtml = $element.html(),
			html = [];
			
        html.push('<!DOCTYPE html><html><head><title>' + opts.pageTitle + '</title>');
		
        if (opts.importStylesheets) {
            $("link", document).filter(function () {
				var include = false;
				var isStylesheet = this.rel.toLowerCase() === 'stylesheet';
				if (isStylesheet && opts.stylesheetsToExclude) {
					var href = this.href;
					$.each(opts.stylesheetsToExclude, function (key, val) {
						if (href.indexOf(val) > -1) {
							include = false;
							return false;
						}
						else {
							include = true;
						}
					});
				}
				else if (isStylesheet) {
					include = true;
				}
				
				return include;
            }).each(function () {
				var media = this.media ? 'media="'+ this.media +'"' : '';
                html.push('<link type="text/css" rel="stylesheet" href="' + this.href + '" ' + media + ' >');
            });
        }
		
        if (opts.stylesheets) {
		    $.each(opts.stylesheets, function(key, val) {
			    html.push('<link type="text/css" rel="stylesheet" href="' + val + '" media="print" >');
		    });
        }

        //Ensure that relative links work
        html.push('<base href="' + _getBaseHref() + '" />');
        html.push('</head><body onload="printPage()" style="' + opts.printBodyOptions.styleToAdd + '" class="' + opts.printBodyOptions.classNameToAdd + '">');
        html.push('<div class="' + $element.attr('class') + '">' + elementHtml + '</div>');
        html.push('<script type="text/javascript">function printPage(){focus();try {document.execCommand("print", false, null);}catch(e){print();}' + ((!opts["leaveOpen"] && opts["printMode"].toLowerCase() == 'popup') ? 'close();' : '') + '}</script>');
        html.push('</body></html>');

        return html.join('');
    };
}(window, jQuery));
