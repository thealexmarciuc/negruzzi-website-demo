export const A11Y_KEY = 'negruzzi-a11y'

// Mirrors applyPrefs in AccessibilityPanel; runs before the page paints (see the root layout), so there is no flash.
export const A11Y_BOOT = `try{var p=JSON.parse(localStorage.getItem('${A11Y_KEY}')||'{}'),d=document.documentElement;if(p.text)d.dataset.text=p.text;if(p.contrast&&p.contrast!=='normal')d.dataset.contrast=p.contrast;['underline','readable','still','cursor'].forEach(function(k){if(p[k])d.dataset[k]=''})}catch(e){}`
