"use strict";

var path = location.pathname,
    hash = location.hash;

location.hash = "";

$(function() {
    var navbar = $(".navbar>ul"),
        loginBtn = $("#login-btn"),
        loginPanel = $(".login-panel"),
        loginPanelCloser = loginPanel.find(".close"),
        loginForm = loginPanel.find("form"),
        username = $("#user-name"),
        userBtn = $("#user-btn"),
        userMenu = $(".user-dropdown"),
        logoutBtn = $("#logout-btn"),
        content = $("article.content"),
        markdownContent = $(".markdown-content"),
        markdownText = markdownContent.text(),
        renderer = new marked.Renderer(),
        anchor = $("#anchor-pin").html();

    //Render markdown headings.
    renderer.heading = function(text, level) {
        var id = text.toLowerCase().replace(/\s/g, '-')
            .match(/[\-0-9a-zA-Z]+/g).join("");
        return '<h' + level + ' id="' + id + '"><a class="anchor" href="#' +
            id + '">' + anchor + '</a>' + text + '</h' + level + '>';
    };

    //Render markdown codes to be highlighted.
    renderer.code = function(code, lang, escaped) {
        return '<pre><code class="lang-' + lang + ' hljs">' +
            hljs.highlightAuto(code).value + '</code></pre>';
    }

    /** Parse markdown to HTML. */
    var markdownHTML = function(text) {
        return marked(text, { renderer: renderer });
    };

    //Highlight navbar tab.
    navbar.children().each(function() {
        var $this = $(this),
            link = $this.children("a").attr("href"),
            i = path.lastIndexOf("/"),
            cat = i ? path.substr(0, i) : path;
        link == cat ? $this.addClass("active") : $this.removeClass("active");
    });

    //Display login panel when click login button.
    loginBtn.on("click", function(event) {
        event.preventDefault();
        loginPanel.fadeIn(function() {
            username.focus();
        });
    });

    //Hide login panel when click close button.
    loginPanelCloser.on('click', function() {
        loginPanel.fadeOut();
    });

    //Display user dropdown menu.
    userBtn.on("click", function(event) {
        event.preventDefault();
        userMenu.fadeIn("fast");
    });

    //Hide user dropdown menu when click areas outer the menu.
    $(document).on('click', function(event) {
        var target = $(event.target);
        if (target.closest(".user-dropdown").length === 0 &&
            !target.is("#user-btn")) {
            userMenu.fadeOut("fast");
        }
    });

    //When submit the login form, replace the native action with Ajax.
    loginForm.on("submit", function(event) {
        event.preventDefault();
        var user = username.val(),
            password = $("#user-password").val(),
            // remember = loginForm.find("input[name=remember]")[0].checked,
            args = {
                user: user,
                password: password,
                // remember: remember,
            };
        $.ajax({
            url: "/login",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(args),
            dataType: "json",
            timeout: 2000,
            success: function(result) {
                if (result.success) {
                    alert("User logged in.");
                    window.location.reload();
                } else {
                    alert(result.msg);
                }
            },
            error: function() {
                alert("Connection failed.");
            }
        });
    });

    //When click the logout button, logout the user.
    logoutBtn.click(function(event) {
        event.preventDefault();
        $.ajax({
            url: "/logout",
            dataType: "json",
            timeout: 2000,
            success: function(result) {
                if (result.success) {
                    alert("User logged out.");
                    window.location.reload();
                } else {
                    alert(result.msg);
                }
            },
            error: function() {
                alert("Connection failed.");
            }
        })
    });

    //Automatically parse markdown to HTML.
    if (content.length && markdownContent.length) {
        content.html(markdownHTML(markdownText)).addClass("vivify fadeIn");
    }

    //Handle anchor clicking.
    $("a").filter(function() {
        return $(this).attr("href").indexOf("#") === 0;
    }).on("click", function(event) {
        event.preventDefault();
        var link = $(this).attr("href"),
            target = $(link)[0],
            navbarHeight = $("header")[0].offsetHeight + 20;
        //Scroll the body.
        $("html,body").animate({
            scrollTop: target.offsetTop - navbarHeight
        });
    });

    //Show ICP in china area.
    if (navigator.language == 'zh-CN') {
        $("#icp").show();
    }

    //Scroll the document.
    if (hash) {
        $('a[href="' + hash + '"]').click();
    }

    $.fn.typeIn = function(speed, placeholder, callback) {
        speed = speed || 100;
        switch (speed) {
            case "slow":
                speed = 150;
                break;
            case "normal":
                speed = 100;
                break;
            case "fast":
                speed = 50;
                break;
        }
        placeholder = placeholder || '_';
        if (typeof placeholder == 'function') {
            callback = placeholder;
            placeholder = '_';
        }
        var $this = $(this),
            html = $this.html().trim(),
            i = 0;
        $(this).html('');
        $(this).each(function() {
            var int = setInterval(function() {
                if (html.substr(i, 1) == '<') {
                    i = html.indexOf('>', i) + 1;
                } else {
                    i++;
                }
                $this.html(html.substring(0, i) + (i & 1 ? placeholder : ''));
                if (i >= html.length) {
                    clearInterval(int);
                    if (typeof callback == 'function') {
                        callback.call($this, $this);
                    }
                }
            }, speed);
        });
        return this;
    };


    var command = $(".command>pre"),
        type = function() {
            command.typeIn("slow", function() {
                setTimeout(type, 1500);
            });
        };
    if (command.length)
        setTimeout(type, 1500);

    // var socket = io('http://127.0.0.1:3000');
    // socket.on('get-user', function(data) {
    //     console.log(data);
    // });
    // socket.on("news", function(data) {
    //     console.log(data);
    //     socket.emit("get-user", { UID: 1 });
    // });
});