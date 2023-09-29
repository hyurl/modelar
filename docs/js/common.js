/// <reference types="jquery"/>
/// <reference types="jquery.typein"/>
/// <reference types="whatstpl"/>

"use strict";

String.byteLength = function byteLength(str) {
    var b = 0,
        l = str.length;

    if (l) {
        for (var i = 0; i < l; i++) {
            if (str.charCodeAt(i) > 255) {
                b += 2;
            } else {
                b++;
            }
        }
        return b;
    }

    return 0;
}

var Pathname = location.pathname,
    Hash = location.hash,
    QueryLangMatches = location.search.match(/[?|&]lang=(.*)[&]*/),
    Lang = QueryLangMatches ? QueryLangMatches[1] : navigator.language,
    Pin = `<svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`;

location.hash = "";

function onRendered() {
    var navbar = $(".navbar>ul"),
        sidebar = $(".sidebar"),
        content = $("article.content"),
        renderer = new marked.Renderer(),
        parseMarkdown = (text) => {
            return marked(text, { renderer: renderer });
        };

    //Render markdown headings.
    renderer.heading = function (text, level) {
        var isLatin = String.byteLength(text) == text.length,
            _text = text.replace(/\s/g, '-'),
            re = /[~`!@#\$%\^&\*\(\)\+=\{\}\[\]\|:"'<>,\.\?\/]/g,
            id;

        if (isLatin) {
            var matches = _text.match(/[\-0-9a-zA-Z]+/g);
            id = matches ? matches.join("_") : _text.replace(re, "_");
        } else {
            id = _text.replace(re, "_");
        }

        id = StringTrimmer.trim(id, "_");

        return `<h${level} id="${id}"><a class="heading-anchor" href="#${id}">${Pin}</a>${text}</h${level}>\n`;
    };

    //Render markdown codes to be highlighted.
    renderer.code = function (code, lang, escaped) {
        var value = "";
        try {
            value = hljs.highlight(lang, code, true).value;
        } catch (e) {
            value = hljs.highlightAuto(code).value;
        }
        return `<pre><code class="lang-${lang} hljs">${value}</code></pre>`;
    };

    // toggle navbar
    $(".navbar-toggle").click(() => {
        navbar.parent().slideToggle();
    });

    //Highlight navbar tab.
    navbar.children().each(function () {
        var $this = $(this),
            link = $this.children("a").attr("href"),
            i = Pathname.lastIndexOf("/") + 1,
            cat = i ? Pathname.substr(0, i) : Pathname;

        link == cat ? $this.addClass("active") : $this.removeClass("active");
    });

    //Highlight sidebar tab
    sidebar.find("a").each(function () {
        var href = $(this).attr("href");
        if (href == Pathname) {
            $(this).addClass("active");
        }
    });

    //Handle anchor clicking.
    $(document).on("click", "a", function (event) {
        var link = $(this).attr("href");

        if (link.indexOf("#") === 0) {
            event.preventDefault();

            var target = $(link)[0],
                navbarHeight = $("header")[0].offsetHeight + 20;

            //Scroll the body.
            $("html,body").animate({
                scrollTop: target.offsetTop - navbarHeight
            });
        }
    });

    //Scroll the document.
    if (Hash) {
        $('a[href="' + Hash + '"]').click();
    }

    /** Type installing command. */
    var command = $(".command>pre"),
        type = function () {
            command.typeIn("slow", function () {
                setTimeout(type, 1500);
            });
        };
    if (command.length)
        setTimeout(type, 1500);

    // Add ?lang=[lang] in the URL
    var replaceLink = function (target) {
        if (QueryLangMatches) {
            target = target || $("body");
            target.find("a").each(function () {
                var href = $(this).attr("href");
                if (href.indexOf("javascript:") !== 0 &&
                    href.indexOf("http") !== 0 &&
                    href.indexOf("#") !== 0 &&
                    href != "?lang=zh-CN" &&
                    href != "?lang=en-US") {
                    $(this).attr("href", href.split("?")[0] + "?lang=" + Lang);
                }
            });
        }
    };
    replaceLink();

    // display documentations.
    if (content.length) {
        SoftLoader.bind(content[0]);

        var getMarkdownPath = (url) => {
            var start = url.lastIndexOf("/"),
                end = url.lastIndexOf("."),
                dirname = url.substring(0, start),
                basename = url.substring(start + 1, end != -1 ? end : url.length);

            return dirname + "/" + Lang + "/" + basename;
        };
        var getContent = (url, title = document.title) => {
            $.get(url + ".md", (data) => {
                content.removeClass("fadeOut").addClass("fadeIn");

                url = url.replace(/docs\/.+?\//, "docs/");
                if (QueryLangMatches)
                    url += "?lang=" + Lang;

                SoftLoader.replaceWith(parseMarkdown(data), title, url);
                replaceLink(content);
            });
        };

        getContent(getMarkdownPath(Pathname), document.title);

        sidebar.find("a").filter(function () {
            return /^javascript\:/.test($(this).attr("href")) == false;
        }).click(function (event) {
            event.preventDefault();

            var $this = $(this),
                href = $this.attr("href").split("?")[0],
                text = $this[0].innerText || $this[0].textContent,
                title = $this.attr("data-title");//document.title.replace(/:.+\|/, `: ${text} |`);

            getContent(getMarkdownPath(href), title);

            sidebar.find("a").removeClass("active");
            $this.addClass("active");
            content.removeClass("fadeIn").addClass("fadeOut");
        });
    }
};

whatstpl.Template.register("/layout.html", `
<header class="header vivify popInTop" id="header">
    <div class="logo">
        <a href="/">@{ moduleName }</a>
    </div>
    <div class="change-lang">
        <a href="@{ lang }">@{ langLabel }</a>
    </div>
    <div class="navbar">
        <ul>
            <for statement="var url in navbarMenu">
                <li><a href="@{ url }">@{ navbarMenu[url] }</a></li>
            </for>
        </ul>
    </div>
    <div class="navbar-toggle">
        <button>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
    </div>
</header>
@{ __contents }
<footer>
    <p class="text-center">
        <span id="copyright">©@{ year } hyurl
            <a href="http://nodejs.org/">Node.js</a> 6.0+.
        </span>
        <span id="license">Licensed under the
            <a target="_blank" href="http://spdx.org/licenses/MIT.html">MIT License</a>.
        </span>
        <span id="icp">
            <if condition="icp">
                <a href="http://www.miitbeian.gov.cn" target="_blank" style="color:#777">@{ icp }</a>
            </if>
        </span>
    </p>
</footer>
`);

whatstpl.Template.register(`/components.html`, `
<block name="fork-github" export>
    <div class="github-brand vivify fadeIn">
        <a href="https://github.com/hyurl/@{module}" target="_blank" class="btn btn-default">
            <img src="/svg/github.svg" alt=""> Fork Me on GitHub
        </a>
    </div>
</block>

<block name="jumbotron" export params="desc">
    <div>
        <div class="jumbotron">
            <h1 class="vivify popInRight"> @{ moduleName } </h1>
            <p class="desc vivify fadeIn">
                @{ desc }
            </p>
        </div>
        <div class="command vivify flipInX">
            <pre>npm install @{ module } --save</pre>
        </div>
        <div class="pre-requisit">
            <div class="vivify rollInRight">
                <a href="http://nodejs.org/">
                    <img src="/svg/node6.svg" alt="Node.js 6.0+">
                </a>
                <a href="http://spdx.org/licenses/MIT.html">
                    <img src="/svg/mit.svg" alt="MIT License">
                </a>
                <a href="https://babeljs.io/learn-es2015/">
                    <img src="/svg/es2015.svg" alt="ES2015+">
                </a>
            </div>
        </div>
    </div>
</block>

<block name="docs-container" export>
    <div class="container vivify fadeIn">
        <aside class="sidebar vivify fadeIn">
            <ul>
                <for statement="var filename in sidebarMenu">
                    <li><a href="/docs/@{filename}" data-title="@{ sidebarMenu[filename].title } | @{moduleName}">@{ sidebarMenu[filename].label }</a></li>
                </for>
            </ul>
        </aside>
        <article class="content vivify fadeIn">Loading...</article>
    </div>
</block>
`);

$(function () {
    var app = $("#app"),
        tpl = app.html();

    new whatstpl.Template("app.html").render(tpl, window.locals).then(html => {
        app.html(html);

        onRendered();
    });
});