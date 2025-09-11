import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import highlightJS from '@highlightjs/vue-plugin'
import 'highlight.js/styles/github-dark.css'

export default defineNuxtPlugin((nuxtApp) => {

    
    hljs.registerLanguage('xml', xml)
    hljs.registerLanguage('json', json)

    // hljs.registerLanguage("xmljson", function(hljs) {
    //     return {
    //         subLanguage: 'xml',
    //         contains: [
    //         {
    //             begin: /{/, end: /}/,
    //             subLanguage: 'json'
    //         }
    //         ]
    //     };
    // });
    nuxtApp.vueApp.use(highlightJS)
})
