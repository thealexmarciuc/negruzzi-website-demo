'use client'

import React, { useState } from 'react'

// Google Maps sets its own cookies, so the map only loads once the visitor asks for it.
export function ClickToLoadMap({ src, title, address }: { src: string; title: string; address: string }) {
  const [shown, setShown] = useState(false)
  if (shown) return <iframe className="contact-map" title={title} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
  return (
    <div className="contact-map contact-map--placeholder">
      <p style={{ margin: 0, fontWeight: 600 }}>{address}</p>
      <p className="small muted" style={{ margin: 0, maxWidth: 360 }}>
        Harta este afișată de Google Maps, care poate folosi cookie-uri proprii.
      </p>
      <button className="button" type="button" onClick={() => setShown(true)}>
        Arată harta
      </button>
    </div>
  )
}
