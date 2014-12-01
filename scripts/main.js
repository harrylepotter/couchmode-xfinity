var CHANNEL_HEIGHT = 115;
var offset = 0;
var originalOffset = 0;
window.osdHider = null;
window.listings = [];

var chUp = function () {
    var maxOffset = 0 - (window.listings.length * CHANNEL_HEIGHT);
    showOSD();
    var proposedOffset = offset - CHANNEL_HEIGHT;
    if(proposedOffset > maxOffset){
        offset = proposedOffset;
        $('.channels').css('margin-top', offset + 'px');
    };
};

var chDown = function () {
    showOSD();
    var proposedOffset = offset + CHANNEL_HEIGHT;

    if(proposedOffset <= 0){
       offset = proposedOffset;
       $('.channels').css('margin-top', offset + 'px'); 
    }
    
};

var playCurrent = function () {
    showOSD();
    var channelUrl = getChannelUrl();
    window.location.href = channelUrl;
};

var resizeVideo = function () {
    //resize the window. This needs redoing.
    var flashy = $('object');
    var flashOffset = flashy.offset();
    var negT = 0 - flashOffset.top;
    var negL = 0 - flashOffset.left;
    flashy.css('margin-top', negT + 'px');
    flashy.css('margin-left', negL + 'px');

    window.setInterval(function() {
        flashy.css('width', '100vw');
        flashy.css('height', '100vh');
    }, 1000);
};

var showOSD = function() {
    if(window.osdHider != null)
        clearTimeout(window.osdHider);
    $('.xfinity_wrapper').css('opacity', 1);
    hideOSD();
};

var hideOSD = function () {
    window.osdHider = setTimeout(function () {
        $('.xfinity_wrapper').css('opacity', 0);
        resetOffset();
    }, 10000);
}

var resetOffset = function () {
    offset = originalOffset;
    $('.channels').css('margin-top', offset + 'px');
};

var getChannelUrl = function () {
    var index = Math.abs(offset) / CHANNEL_HEIGHT;
    var el = $('.xfinity_wrapper .channels')[0].children[index];
    var url = $(el).attr('data-tv-url');
    return url;
};

var initOSD = function () {
    var wrapper = document.createElement('div');
    $(wrapper).addClass('xfinity_wrapper');
    $(document.body).append(wrapper);
    
    var timeEl = document.createElement('div');
    $(timeEl).text('12:00:00 pm');
    $(timeEl).addClass('current_time');
    $(wrapper).append(timeEl);

    var channelWrap = document.createElement('div');
    $(channelWrap).addClass('channel_wrap');
    $(wrapper).append(channelWrap);

    var channels = document.createElement('div');
    $(channels).addClass('channels');
    $(channelWrap).append(channels);
};

var updateTime = function(){
    var opacity = $('.xfinity_wrapper').css('opacity');
    if(opacity != "1") 
        return;
    
    var tf = "h:mm:ss a";
    var timeEl = $('.current_time');
    var now = moment();
    timeEl.text(now.format(tf));
}

chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            initOSD();
            StreamingLive.render();
            resizeVideo();

            setInterval(updateTime, 1000);

            setInterval(function(){
                var opacity = $('.xfinity_wrapper').css('opacity');
                if(opacity == "0"){
                    StreamingLive.render();
                }
            }, 300000);

            //keyboard responders for channel up/down
            KeyboardJS.on('p', chUp);
            KeyboardJS.on('o', chDown);
            KeyboardJS.on('w', playCurrent);
            hideOSD();

        }
    }, 10);
});



var StreamingLive = {
    render: function() {
        $.when(StreamingLive.getStreams(), StreamingLive.getListings()).then(StreamingLive.validateData).done(StreamingLive.renderListings);
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
        console.log('listings: ', z);
        var parent = $('.channels');
        parent.empty();
        window.listings = z;

    	$.each(z, function(index, item) {
            var channelUrl = item._links.website.href;
    		var channelTitle = item.title;
    		var listings = item.listings;
            var id = item.id;
            
            var channelEl = document.createElement('div');
            $(channelEl).addClass('channel');
            $(channelEl).attr('data-tv-url', channelUrl);

            var left = document.createElement('div');
            $(left).addClass('left');
            $(channelEl).append(left);

            var right = document.createElement('div');
            $(right).addClass('right');
            $(channelEl).append(right);

            var channelTitleEl = document.createElement('div');
            $(channelTitleEl).addClass('channel_title');
            $(channelTitleEl).text(channelTitle);
            $(right).append(channelTitleEl);

            var channelImageUrl = "http://xfinitytv.comcast.net/xtvapi/tve/image/logo/" + id + "?height=60&width=100&bg=BLACK";
            var channelImgEl = document.createElement('img');
            channelImgEl.src = channelImageUrl;
            var channelImg  = document.createElement('div');
            $(channelImg).addClass('channel_image');
            $(channelImg).append(channelImgEl);
            $(left).append(channelImg);


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

               
                $(right).append(nowEl);
                $(right).append(nextEl);
    		});

            $(parent).append(channelEl);

            //set the offset to match the current channel
            if(channelUrl == window.location.href){
                offset = 0 - (index * CHANNEL_HEIGHT);
                originalOffset = offset;
                resetOffset();
            }
    	});
        
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
};
