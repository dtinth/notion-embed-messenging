// ==UserScript==
// @name         Notion-embed integration
// @namespace    https://dt.in.th/
// @version      0.1
// @description  Send code from Notion to next iframe
// @author       You
// @match        https://www.notion.so/*
// @grant        none
// ==/UserScript==

const enabledMap = new WeakMap()

window.addEventListener('message', e => {
  if (e.data.type === 'code-input-ready') {
    e.source.postMessage({ type: 'code-input-ready-ok' }, '*')
    const state = {}
    enabledMap.set(e.source, {
      handleCode(code) {
        if (state.lastSeenCode !== code) {
          state.lastSeenCode = code
        } else if (state.lastUsedCode !== code) {
          state.lastUsedCode = code
          e.source.postMessage({ type: 'code-input', code }, '*')
        }
      },
    })
  }
})

setInterval(function checkCodeBlocks() {
  const elements = document.querySelectorAll(
    '.notion-code-block, [embed-ghost] iframe'
  )
  let code = null
  for (const element of elements) {
    if (element.nodeName === 'IFRAME') {
      if (code !== null) {
        sendIn(code, element)
        code = null
      }
    } else {
      code = element.textContent
    }
  }
  function sendIn(code, iframe) {
    const wrapper = enabledMap.get(iframe.contentWindow)
    if (wrapper) {
      wrapper.handleCode(code)
    }
  }
}, 200)
