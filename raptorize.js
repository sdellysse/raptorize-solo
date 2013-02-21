(function (window, undefined) {
    "use strict";
    var Raptorize, original;

    Raptorize = function () {
        this.initialized = false;
    };

    Raptorize.bindKonamiCode = function (options) {
        var instance;

        if (this.konamiCodeInstance) {
            return;
        }

        instance = new this(options);
        instance.bindKonamiCode();
    };

    Raptorize.isRunning = false;

    Raptorize.konamiCodeInstance = null;

    Raptorize.noConflict = function () {
        window.Raptorize = original;
        return this;
    };

    Raptorize.unbindKonamiCode = function () {
        if (!this.konamiCodeInstance) {
            return;
        }

        this.konamiCodeInstance.unbindKonamiCode();
        this.konamiCodeInstance.cleanUp();
        this.konamiCodeInstance = null;
    };

    Raptorize.prototype.audioUrls = {
        mp3: "raptor-sound.mp3",
        ogg: "raptor-sound.ogg"
    };

    Raptorize.prototype.bindFunction = (window._ && window._.bind) || function (callback, context) {
        return function () {
            callback.apply(context, arguments);
        };
    };
    Raptorize.prototype.audioTmpl = '<audio preload="auto"><source src="<%= data.audioUrls[data.audioSupported()] %>" /></audio>';
    Raptorize.prototype.audioSupported = function () {
        var typeMap, audio, type, Object;

        typeMap = {
            mp3: 'audio/mpeg',
            ogg: 'audio/ogg; codecs="vorbis"'
        };
        audio = document.createElement('audio');
        if (!!audio.canPlayType) {
            Object = window.Object;
            for (type in typeMap) {
                if (Object.prototype.hasOwnProperty.call(typeMap, type)) {
                    if(!!(audio.canPlayType && audio.canPlayType(typeMap[type]).replace(/no/, ''))) {
                        return type;
                    }
                }
            }
        }

        return false;
    };

    Raptorize.prototype.bindKonamiCode = function () {
        var $, bind, konamiKeys, keysPressed;

        if (Raptorize.konamiCodeInstance) {
            return;
        }
        this.initialize();

        $ = this.domEngine;
        bind = this.bindFunction;

        konamiKeys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].join(",");
        keysPressed = [];

        alert("binding");
        $(window.document).bind("keydown.RaptorizeKonamiCode", bind(function (event) {
            keysPressed.push(event.keyCode);
            if (keysPressed.join(",").indexOf(konamiKeys) !== -1) {
                keysPressed = [];
                this.run();
            }
        }, this));

        Raptorize.konamiCodeInstance = this;
    };

    Raptorize.prototype.cleanUp = function () {
        var $;

        if (!this.initialized) {
            return;
        }

        $ = this.domEngine;

        $(this.imageNode).remove();
        $(this.audioNode).remove();
        this.initialized = false;
    };

    Raptorize.prototype.domEngine = window.jQuery || window.Zepto || null;

    Raptorize.prototype.imageTmpl = "<img style='display: none;' src='<%= data.imageUrl %>' />";

    Raptorize.prototype.imageUrl = "raptor.png";

    Raptorize.prototype.initialize = function (options) {
        var $, template, Object, i;

        if (this.initialized) {
            return;
        }

        Object = window.Object;
        if (options) {
            for (i in options) {
                if (Object.prototype.hasOwnProperty.call(options, i)) {
                    this[i] = options[i];
                }
            }
        }


        if (!this.domEngine) {
            throw new Error("Raptorize requires a domEngine such as jQuery or Zepto");
        }

        if (!this.templateFunction) {
            throw new Error("Raptorize requires an EJS templating engine such as Underscore or Lo-Dash");
        }

        $ = this.domEngine;
        template = this.templateFunction;

        if (this.rootNode === undefined) {
            this.rootNode = $("body");
        }

        if (this.audioSupported === undefined) {
            this.audioSupported = ($.browser.mozilla && $.browser.version.substr(0, 5) >= "1.9.2") || $.browser.webkit;
        }

        this.imageNode = $(template(this.imageTmpl, { data: this })).get(0);
        $(this.rootNode).append(this.imageNode);

        if (this.audioSupported) {
            this.audioNode = $(template(this.audioTmpl, { data: this })).get(0);
            $(this.rootNode).append(this.audioNode);
        }

        this.initialized = true;
    };

    Raptorize.prototype.run = function (callback, context) {
        var $, bind, offset;

        if (callback) {
            context = context || this;
        }

        if (Raptorize.isRunning) {
            if (callback) {
                callback.call(context, "Raptorize can only run one instance at a time.");
            }
            return;
        }
        Raptorize.isRunning = true;

        this.initialize();

        $ = this.domEngine;
        bind = this.bindFunction;

        $(this.imageNode).css({
            "position": "fixed",
            "bottom": "-700px",
            "right" : "0",
            "display" : "block"
        });

        if (this.audioSupported) {
            this.audioNode.play();
        }

        $(this.imageNode).animate({ "bottom" : "0" }, bind(function () {
            $(this.imageNode).animate({ "bottom" : "-130px" }, 100, bind(function () {
                offset = $(this.imageNode).position().left + 400;

                $(this.imageNode).delay(300).animate({ "right" : offset }, 2200, bind(function () {
                    $(this.imageNode).css({
                        "bottom": "-700px",
                        "right" : "0"
                    });
                    Raptorize.isRunning = false;

                    if (callback) {
                        callback.call(context);
                    }
                }, this));
            }, this));
        }, this));
    };

    Raptorize.prototype.rootNode = undefined;

    Raptorize.prototype.templateFunction = (window._ && window._.template) || undefined;

    Raptorize.prototype.unbindKonamiCode = function () {
        var $;

        this.initialize();

        $ = this.domEngine();

        $(window).unbind("keydown.RaptorizeKonamiCode");
    };

    Raptorize.run = function (options) {
        (new this(options)).run(function () {
            this.cleanUp();
        });
    };

    window.Raptorize = Raptorize;
})(window);
