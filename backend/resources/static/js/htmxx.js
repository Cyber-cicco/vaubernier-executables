/**
 * @typedef {Object} HtmxxOption
 * @property {string} swap - inner ou outerHTML
 * @property {string} target - Sélecteur CSS permettant de définir l'élément à remplacer
 * @property {boolean} pushUrl - Permet de définir si l'on doit changer l'URL
 */

/**
 * @typedef {Object} Htmxx
 * @property {( url : string, body:any, options:HtmxxOption) => void} post - Permet de lancer une requête htmx en utilisant
 */

/** @type {Htmxx} */
var htmxx = {
    post: (url, body, options) => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "HX-Request": "true",
            },
            body: JSON.stringify(body),
        }).then((res) => {
            const headers = res.headers
            let target = options.target
            let swap = options.swap
            if (headers.has("HX-Retarget")) {
                target = headers.get("HX-Retarget")
                options.pushUrl = false
            }
            if (headers.has("HX-Reswap")) {
                swap = headers.get("HX-Reswap")
            }
            if (headers.has("HX-Trigger")) {
                console.log(headers.get("HX-Trigger"))
                window.dispatchEvent(new CustomEvent(headers.get("HX-Trigger")))
            }
            if (headers.has("HX-Redirect")) {
                href = headers.get("HX-Redirect")
                window.location.href = href
            }

            return res.text().then((content) => ({
                content: content,
                target: target,
                swap: swap,
            }))
        }).then((res) => {
            const content = document.querySelector(res.target)
            if (res.swap = "innerHTML") {
                content.innerHTML = res.content
            } else {
                content.parentNode.innerHTML = res.content
            }
            htmx.process(content)
        })
    }
}


