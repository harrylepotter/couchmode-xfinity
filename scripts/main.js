var offset = 0;
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Shit. This message was sent from scripts/main.js");
	
		StreamingLive.init();
		
		var flashy = $('object');
		var flashOffset = flashy.offset();
		var negT = 0-flashOffset.top;
		var negL = 0-flashOffset.left;
		flashy.css('margin-top', negT + 'px');
		flashy.css('margin-left', negL + 'px');
		

		window.setInterval(function() {
			flashy.css('width', '100vw');
			flashy.css('height', '100vh');
		}, 1000);

	    KeyboardJS.on('p', function(){
	        offset = offset - 115;
	        $('.channels').css('margin-top', offset + 'px');
	    });

	    KeyboardJS.on('o', function(){
	        offset = offset + 115;
	        $('.channels').css('margin-top', offset + 'px');
	    });

	
	}
	}, 10);
});

var StreamingLive = {
    init: function() {
        $.when(StreamingLive.getStreams(), StreamingLive.getListings()).then(StreamingLive.validateData).done(StreamingLive.renderListings).fail(StreamingLive.displayErrorMessage);
    },
    getStreams: function() {
        return $.ajax({
            url: "http://xfinitytv.comcast.net/xtvapi/tve/web/streams",
            dataType: "json",
            timeout: 7000
        })
    },
    getListings: function() {
        return $.ajax({
            url: "http://xfinitytv.comcast.net/xtvapi/tve/web/listings",
            dataType: "json",
            timeout: 7000
        })
    },
    getPromoted: function() {
        $.ajax({
            url: "http://xfinitytv.comcast.net/xtvapi/tve/web/promoted/livetv",
            dataType: "json",
            timeout: 4000,
            success: function(b) {
                if (b.state == "active" && b._embedded.resources && b._embedded.resources.length > 0) {
                    StreamingLive.createPromoted(b)
                } else {
                    StreamingLive.hidePromoted
                }
            },
            error: StreamingLive.hidePromoted
        })
    },
    validateData: function(d, c) {
        var e = (c[0] || {}).listings || [],
            f = (d[0] || {}).streams || [],
            b = $.Deferred();
        if (!f.length || !e.length) {
            b.reject({
                error: "empty array"
            })
        } else {
            f.forEach(function(h) {
                var g = h.id;
                h.listings = e.filter(function(i) {
                    return i._links.stream.href.split("/").pop() === g
                })
            });
            b.resolve(f)
        }
        return b.promise()
    },
    renderListings: function(z) {
		var wrapper = document.createElement('div');
		$(wrapper).addClass('xfinity_wrapper');
		$(document.body).append(wrapper);


        var parent = document.createElement('div');
        $(parent).addClass('channels');
        var height = 115;

        $(wrapper).append(parent);

    	$.each(z, function(index, item) {
    		var channelTitle = item.title;
    		var listings = item.listings;
            
            var channelEl = document.createElement('div');
            $(channelEl).addClass('channel');

            var channelTitleEl = document.createElement('div');
            $(channelTitleEl).addClass('channel_title');
            $(channelTitleEl).text(channelTitle);
            $(channelEl).append(channelTitleEl);


    		//console.log('listings:', listings);
    		$.each(listings, function(i, listing){
                var tf = "h:mm:ss a";
                
                var nowEl = document.createElement('div');
                $(nowEl).addClass('playing_now');
                var nowTitleEl = document.createElement('div');
                $(nowTitleEl).addClass('title');
                var nowTimeEl = document.createElement('div');
                $(nowTimeEl).addClass('time');
                
                var nextEl = document.createElement('div');
                $(nextEl).addClass('playing_next');
                var nextTitleEl = document.createElement('div');
                var nextTimeEl = document.createElement('div');
                $(nextTitleEl).addClass('title');
                $(nextTimeEl).addClass('time');



    			var nowTitle = listing._embedded.program.title;
    			var nowListingTime = listing.listing.split('/');
    			var nowStart = moment(nowListingTime[0]);
    			var nowFinish = moment(nowListingTime[1]);

    			var nextListingTime = listing._embedded.next.listing.split('/');;
    			var nextTitle = listing._embedded.next._embedded.program.title;
    			var nextStart = moment(nextListingTime[0]);
    			var nextFinish = moment(nextListingTime[1]);

                $(nowTimeEl).text(nowStart.format(tf) + ' - ' + nowFinish.format(tf));
                $(nowTitleEl).text(nowTitle);
                $(nowEl).append(nowTitleEl);
                $(nowEl).append(nowTimeEl);


                $(nextTimeEl).text(nextStart.format(tf) + ' - ' + nextFinish.format(tf));
                $(nextTitleEl).text(nextTitle);
                $(nextEl).append(nextTitleEl);
                $(nextEl).append(nextTimeEl);



               
                $(channelEl).append(nowEl);
                $(channelEl).append(nextEl);
    		});

            $(parent).append(channelEl);
    	});


        // var B, l, d, h, n, x, v = "?cmpid=chrome_ext_1",
        //     w = "?height=60&width=100&bg=BLACK",
        //     c = "http://xfinitytv.comcast.net/watch-live-tv/",
        //     r = [],
        //     k = document.createElement("ol"),
        //     o, C, u, m, e, i, y, g, A, q, s, j, t, f;
        // $("nav").append(k);
        // $.each(z, function(O, N) {
        // 	console.log('listing:', z);
        //     var J = document.createElement("img"),
        //         L = document.createElement("b"),
        //         P = document.createElement("li"),
        //         H = document.createElement("time"),
        //         E = N.closeCaption || "",
        //         F = N.id || "",
        //         G = N.title || "network logo",
        //         Q = N.networkId || "",
        //         I = N.rating || "",
        //         p = N.secondaryAudioProgram || "",
        //         M = N.udbServiceId || "",
        //         D = N._links.website.href + v || "http://xfinitytv.comcast.net/watch-live-tv";
        //     if (((N || {}).listings || []).length > 0) {
        //         y = N.listings[0].listing || "";
        //         A = N.listings[0]._embedded.program.title || G + " Programming";
        //         q = N.listings[0]._embedded.program.longDescription || "No description available.";
        //         s = N.listings[0].airingType || "";
        //         var K = /\w+\s+at\s+\w+\./.test(q);
        //         if (A.indexOf("College Football") != -1 && K === true) {
        //             A = $.trim($(A).text());
        //             A = "CFB: " + q.split(".")[0]
        //         }
        //     } else {
        //         y = "";
        //         A = G + " Programming";
        //         q = "No description available.";
        //         s = ""
        //     } if (N._links.networkLogo.href) {
        //         i = N._links.networkLogo.href.substring(0, N._links.networkLogo.href.indexOf("{")) + w || "../img/blanknetworklogo.png"
        //     } else {
        //         i = "../img/blanknetworklogo.png"
        //     }
        //     a = StreamingLive.createLink(F, O, Q, M);
        //     J = StreamingLive.createNetworkLogo(G, i);
        //     a.appendChild(J);
        //     h = StreamingLive.createTitle(A, q, "h3");
        //     a.appendChild(h);
        //     L = StreamingLive.createMoreInfoButton(O);
        //     section = StreamingLive.createSection(q, O, G, s, I, E, p, y, D);
        //     P.appendChild(a);
        //     P.setAttribute("id", "li" + O);
        //     a.appendChild(L);
        //     P.appendChild(section);
        //     a.onclick = function() {
        //         chrome.tabs.update(null, {
        //             url: D
        //         });
        //         return (false)
        //     }.bind(this, D);
        //     $(P).find("b").on("click", function(b) {
        //         StreamingLive.showInfo(b.target.id);
        //         return false
        //     });
        //     r[O++] = P
        // });
        // $("nav ol").append(r);
        // StreamingLive.setFocus()
    },
    createMoreInfoButton: function(c) {
        var b = document.createElement("b");
        b.setAttribute("id", "b" + c);
        b.setAttribute("title", "More info");
        b.setAttribute("role", "button");
        return b
    },
    createTitle: function(e, b, c) {
        e || (e = "");
        b || (b = "");
        c || (c = "h3");
        c = document.createElement(c);
        var d;
        if (e === "") {
            d = document.createTextNode("")
        } else {
            d = document.createTextNode(e);
            if (b === "" || b == "No description available.") {
                c.setAttribute("title", e)
            } else {
                c.setAttribute("title", e + " \u00B7 " + b)
            }
        }
        c.appendChild(d);
        return c
    },
    createLink: function(f, d, e, c) {
        f || (f = "");
        d || (d = 0);
        e || (e = "");
        c || (c = "");
        var b = document.createElement("a");
        b.setAttribute("id", "a" + d);
        b.setAttribute("role", "link");
        if (e !== "") {
            b.setAttribute("data-networkid", e)
        }
        if (f !== "") {
            b.setAttribute("data-id", f)
        }
        if (c !== "") {
            b.setAttribute("data-udbserviceid", c)
        }
        b.href = "#";
        return b
    },
    createNetworkLogo: function(c, d) {
        var b = document.createElement("img");
        c || (c = "");
        d || (d = "");
        if (d === "") {
            b.setAttribute("role", "img");
            b.alt = "no image";
            b.src = "../img/blanknetworklogo.png"
        } else {
            b.setAttribute("title", c);
            b.setAttribute("role", "img");
            b.alt = c;
            b.src = d
        }
        return b
    },
    createPromoted: function(g) {
        var f = document.createElement("div");
        f.setAttribute("class", "promoted");
        $("nav").prepend(f);
        var d = document.createElement("a"),
            b = document.createElement("div"),
            e = StreamingLive.createTitle(g._embedded.resources[0].title || "", "", "h3"),
            h = StreamingLive.createTitle(g._embedded.resources[0].description || "", "", "h4"),
            c = g._embedded.resources[0]._links.website.href || "";
        artwork = g._embedded.resources[0]._links.artwork.href.substring(0, g._embedded.resources[0]._links.artwork.href.indexOf("{")) + "?width=320&height=160";
        d.setAttribute("style", "background:transparent url(" + artwork + ") 0 -10px");
        if (c && c !== "") {
            c = c + "?cmpid=chrome_ext_1"
        } else {
            c = "http://xfinitytv.comcast.net/watch-live-tv/"
        }
        d.setAttribute("href", c);
        d.setAttribute("title", "Watch " + g._embedded.resources[0].title);
        d.appendChild(b);
        b.appendChild(e);
        b.appendChild(h);
        d.onclick = function(i) {
            chrome.tabs.update(null, {
                url: i
            });
            return (false)
        }.bind(this, c);
        $("nav .promoted").append(d)
    },
    createSection: function(m, n, h, j, i, e, c, k, d) {
        var l = document.createElement("section");
        l.setAttribute("id", "s" + n);
        var f = StreamingLive.createSectionDescription(m, j);
        var b = StreamingLive.createSectionDetails(h);
        var o = StreamingLive.createSectionMeta(i, e, c);
        var g = StreamingLive.createWatchButton(d);
        l.appendChild(StreamingLive.displayProgramTime(k));
        l.appendChild(f);
        l.appendChild(b);
        l.appendChild(o);
        l.appendChild(g);
        return l
    },
    createSectionDetails: function(e) {
        var f = document.createElement("div");
        var g = document.createElement("h6");
        var c = document.createTextNode("Details");
        var b = document.createElement("p");
        var d;
        if (e.indexOf("network") == -1) {
            d = document.createTextNode(e)
        } else {
            d = document.createTextNode("N/A")
        }
        g.appendChild(c);
        b.appendChild(d);
        f.appendChild(g);
        f.appendChild(b);
        return f
    },
    createSectionDescription: function(d, c) {
        var b = document.createElement("p");
        d || (d = "");
        c || (c = "");
        c = c.toLowerCase();
        if (d === "") {
            d = document.createTextNode("No description available.")
        } else {
            d = document.createTextNode(d)
        }
        b.appendChild(d);
        if (c == "new") {
            $(b).addClass("new")
        }
        if (c == "live") {
            $(b).addClass("live")
        }
        if (c == "repeat") {
            $(b).addClass("repeat")
        }
        return b
    },
    createSectionMeta: function(f, d, c) {
        var g = document.createElement("ul");
        f || (f = "");
        f = f.toLowerCase();
        d || (d = false);
        c || (c = false);
        if (f !== "") {
            var e = document.createElement("li");
            e.setAttribute("class", f);
            e.setAttribute("title", f);
            g.appendChild(e)
        }
        if (d === true) {
            var h = document.createElement("li");
            h.setAttribute("class", "cc");
            h.setAttribute("title", "cc");
            g.appendChild(h)
        }
        if (c === true) {
            var b = document.createElement("li");
            b.setAttribute("class", "sap");
            b.setAttribute("title", "sap");
            g.appendChild(b)
        }
        return g
    },
    createWatchButton: function(b) {
    	console.log('createWatchButton:', b);
        var e = document.createElement("div");
        e.className += "action-contain";
        var d = document.createElement("a");
        var c = document.createTextNode("Watch");
        d.className += "action-watch";
        d.setAttribute("title", c.nodeValue);
        d.setAttribute("role", "button");
        d.setAttribute("href", "#");
        d.appendChild(c);
        e.appendChild(d);
        d.onclick = function() {
            chrome.tabs.update(null, {
                url: b
            });
            return (false)
        }.bind(this, b);
        return e
    },
    displayErrorMessage: function(d, b, c) {
        $("nav").append('<aside role="status"><h5>' + chrome.i18n.getMessage("errorText") + '</h5><a title="Refresh" href="popup.html">Please click to refresh</a><br/><span class="error">or visit<br/><a target="_blank" title="http://xfinitytv.comcast.net/watch-live-tv/" href="http://xfinitytv.comcast.net/watch-live-tv/">XFINITY&reg; TV Go Live streams</a></span><br/><br/><strong>' + b + ": " + d.statusText + " [" + d.status + "]<br/>Version: " + StreamingLive.getVersion() + "</strong></aside>")
    },
    displayFooter: function() {
        $("footer").append('<a title="My Account" href="https://customer.comcast.com/?CMPID=xtvg_footer" target="_blank">My Account</a><a title="' + chrome.i18n.getMessage("shopText") + '" href="http://www.comcast.com/upgrade?CMP=ILCXFICOMMM9DEY" target="_blank">' + chrome.i18n.getMessage("shopText") + '</a><a title="' + chrome.i18n.getMessage("ppText") + '" href="http://xfinity.comcast.net/privacy/" target="_blank">' + chrome.i18n.getMessage("ppText") + '</a> <a title="' + chrome.i18n.getMessage("tosText") + '" href="http://xfinity.comcast.net/terms/" target="_blank">' + chrome.i18n.getMessage("tosText") + "</a>")
    },
    displayMeta: function() {
        var b = chrome.app.getDetails();
        $("head").append('<meta name="application-name" content="' + b.name + '" data-version="' + b.version + '" data-revision="aba33591c33f64b4198daa4151eb063e39e0e2c6" />');
        $("head").append('<meta name="description" content="' + b.description + '" />');
        $("head").append('<meta name="dcterms.rightsHolder" content="' + b.author + '" />');
        $("head").append("<title>" + b.name + "</title>")
    },
    displayProgramTime: function(h) {
        var b = h.split("/")[0],
            f = h.split("/")[1],
            j = {
                hour: "numeric",
                minute: "numeric",
                hour12: true
            },
            d = new Date(b).toLocaleString("en-US", j).replace(" PM", "p").replace(" AM", "a"),
            g = new Date(f).toLocaleString("en-US", j).replace(" PM", "p").replace(" AM", "a"),
            i = d + " \u2013 " + g,
            e = document.createElement("time"),
            c;
        if (i.indexOf("Invalid") != -1) {
            i = ""
        } else {
            i
        }
        c = document.createTextNode(i);
        if (b === "") {
            e.setAttribute("datetime", "Z")
        } else {
            e.setAttribute("datetime", b)
        }
        e.appendChild(c);
        return e
    },
    displayTextHeading: function() {
        $("h2").text(chrome.i18n.getMessage("h2Text"))
    },
    displayTime: function() {
        var c = new Date(),
            e = c.getHours(),
            g = c.getHours() % 12 || 12,
            f = c.getMinutes(),
            b = "p",
            d;
        if (e < 12) {
            b = "a"
        }
        if (f < 10) {
            f = "0" + f
        }
        d = g + ":" + f + b;
        $("header span").text(d)
    },
    getVersion: function() {
        return chrome.app.getDetails().version
    },
    hidePromoted: function() {
        $("nav div.promoted").css("display:none;")
    },
    setFocus: function() {
        if ($(".promoted").length > 0) {
            $("nav div.promoted a").focus()
        } else {
            $("#a0").focus()
        }
    },
    showInfo: function(b) {
        b = b.substring(b.indexOf("b") + 1, b.length);
        $("#li" + b).toggleClass("expanded", 300);
        $("#s" + b).toggleClass("expanded", 300);
        $("#li" + b).siblings().removeClass("expanded");
        $("#li" + b).siblings().children().removeClass("expanded")
    }
};
