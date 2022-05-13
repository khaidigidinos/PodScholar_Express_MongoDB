/*!
* Start Bootstrap - Clean Blog v6.0.7 (https://startbootstrap.com/theme/clean-blog)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-clean-blog/blob/master/LICENSE)
*/
window.addEventListener('DOMContentLoaded', () => {
    let scrollPos = 0;
    const mainNav = document.getElementById('mainNav');
    const headerHeight = mainNav.clientHeight;
    window.addEventListener('scroll', function() {
        const currentTop = document.body.getBoundingClientRect().top * -1;
        if ( currentTop < scrollPos) {
            // Scrolling Up
            if (currentTop > 0 && mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-visible');
            } else {
                console.log(123);
                mainNav.classList.remove('is-visible', 'is-fixed');
            }
        } else {
            // Scrolling Down
            mainNav.classList.remove(['is-visible']);
            if (currentTop > headerHeight && !mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-fixed');
            }
        }
        scrollPos = currentTop;
    });
})


getParams = (url = window.location) => {
    let params = {}
    new URL(url).searchParams.forEach(function (val, key) {
        if (params[key] !== undefined) {
            if (!Array.isArray(params[key])) {
                params[key] = [params[key]]
            }
            params[key].push(val)
        } else {
            params[key] = val
        }
    })
    return params
}

$.ajaxSetup({
    headers: { 'authorization': localStorage.getItem('token') }
})

var href = new URL(window.location.href)

if(localStorage.getItem('token')) {
    if(href.searchParams.get('token') === localStorage.getItem('token')) {
    }
    else {
        href.searchParams.set('token', localStorage.getItem('token'))
        window.location.href = href.href
    }
} else {
    localStorage.setItem('token', 'no_token')
    href.searchParams.set('token', localStorage.getItem('token'))
    window.location.href = href.href
}
