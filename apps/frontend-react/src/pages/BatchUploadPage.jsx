import { useState, useRef, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { wardrobeApi } from '../api'
import { useGooglePhotos } from '../hooks/useGooglePhotos'

export default function BatchUploadPage() {
  const { openPicker, loading: pickerLoading, googleConfigured } = useGooglePhotos()
  const inputRef = useRef(null)

  const [source, setSource] = useState(null)
  const [files, setFiles] = useState([])
  const [googleAccessToken, setGoogleAccessToken] = useState(null)
  const [googlePhotos, setGooglePhotos] = useState([])
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [doneCount, setDoneCount] = useState(0)
  const [controller, setController] = useState(null)

  const processed = useMemo(() => items.filter(i => i.status !== 'pending').length, [items])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach(i => { if (i.preview?.startsWith('blob:')) URL.revokeObjectURL(i.preview) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function addFiles(newFiles) {
    if (uploading) return
    setSource('local')
    setGoogleAccessToken(null)
    setGooglePhotos([])
    const remaining = 20 - files.length
    const toAdd = newFiles.slice(0, remaining)
    const newFileEntries = [...files]
    const newItems = [...items]
    for (const f of toAdd) {
      newFileEntries.push(f)
      newItems.push({ file: f, preview: URL.createObjectURL(f), status: 'pending', result: null, error: null })
    }
    setFiles(newFileEntries)
    setItems(newItems)
  }

  function onFileSelect(e) {
    addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    addFiles(dropped)
  }

  function removeFile(index) {
    if (uploading) return
    const newItems = [...items]
    if (source === 'local') {
      URL.revokeObjectURL(newItems[index].preview)
      const newFiles = [...files]
      newFiles.splice(index, 1)
      setFiles(newFiles)
    } else {
      const newPhotos = [...googlePhotos]
      newPhotos.splice(index, 1)
      setGooglePhotos(newPhotos)
    }
    newItems.splice(index, 1)
    setItems(newItems)
    if (!newItems.length) {
      setSource(null)
      setGoogleAccessToken(null)
    }
  }

  async function pickGooglePhotos() {
    const result = await openPicker()
    if (!result) return
    // Clear any existing local files
    items.forEach(i => { if (i.preview?.startsWith('blob:')) URL.revokeObjectURL(i.preview) })
    setFiles([])

    setSource('google')
    setGoogleAccessToken(result.accessToken)
    setGooglePhotos(result.photos)
    setItems(result.photos.map(photo => ({
      file: null,
      preview: photo.url,
      status: 'pending',
      result: null,
      error: null,
    })))
  }

  function upload() {
    if (!items.length || uploading) return
    setUploading(true)
    const resetItems = items.map(i => ({ ...i, status: 'pending', result: null, error: null }))
    if (resetItems.length) resetItems[0].status = 'processing'
    setItems(resetItems)

    const callbacks = {
      onItem({ index, item }) {
        setItems(prev => prev.map((it, i) => {
          if (i === index) return { ...it, status: 'done', result: item }
          if (i === index + 1 && it.status === 'pending') return { ...it, status: 'processing' }
          return it
        }))
      },
      onError({ index, message }) {
        setItems(prev => prev.map((it, i) => {
          if (i === index) return { ...it, status: 'error', error: message }
          if (i === index + 1 && it.status === 'pending') return { ...it, status: 'processing' }
          return it
        }))
      },
      onDone({ count }) {
        setUploading(false)
        setDone(true)
        setDoneCount(count)
      },
    }

    let ctrl
    if (source === 'google') {
      ctrl = wardrobeApi.googlePhotosUpload(googleAccessToken, googlePhotos, callbacks)
    } else {
      ctrl = wardrobeApi.batchUpload(files, callbacks)
    }
    setController(ctrl)
  }

  function cancel() {
    controller?.abort()
    setUploading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-semibold text-espresso-800 mb-8">Batch Upload</h1>

      {/* File selection area */}
      {!uploading && !done && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors ${items.length >= 20 ? 'border-sand-200 bg-sand-50' : 'border-sand-300 hover:border-terracotta-400 cursor-pointer'}`}
          onClick={() => items.length < 20 && inputRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileSelect} />
          <p className="text-4xl mb-2 text-charcoal-300">+</p>
          <p className="text-lg text-charcoal-500">Drop images here or click to select</p>
          <p className="text-sm text-charcoal-300 mt-1">{items.length} / 20 images selected</p>
        </div>
      )}

      {/* Google Photos button */}
      {googleConfigured && !uploading && !done && !items.length && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-sand-200" />
            <span className="text-sm text-charcoal-300">or</span>
            <div className="flex-1 border-t border-sand-200" />
          </div>
          <button
            onClick={pickGooglePhotos}
            disabled={pickerLoading}
            className="w-full py-3 px-4 border-2 border-sand-200 rounded-xl hover:border-terracotta-400 hover:bg-sand-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
            </svg>
            <span>{pickerLoading ? 'Connecting...' : 'Import from Google Photos'}</span>
          </button>
        </div>
      )}

      {/* Progress bar */}
      {(uploading || done) && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1 text-charcoal-400">
            {uploading ? (
              <span>{processed} of {items.length} items processed</span>
            ) : (
              <span>Done &mdash; {doneCount} items added</span>
            )}
          </div>
          <div className="w-full bg-sand-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${done ? 'bg-green-500' : 'bg-terracotta-400'}`}
              style={{ width: (items.length ? (processed / items.length) * 100 : 0) + '%' }}
            />
          </div>
        </div>
      )}

      {/* Thumbnail grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
          {items.map((item, i) => (
            <div key={i} className="relative group">
              <img src={item.preview} className="w-full aspect-square object-cover rounded-xl" referrerPolicy="no-referrer" />

              {/* Remove button (before upload) */}
              {!uploading && !done && (
                <button
                  onClick={e => { e.stopPropagation(); removeFile(i) }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >&times;</button>
              )}

              {/* Status overlay */}
              {(item.status !== 'pending' || uploading) && (
                <div className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center ${
                  item.status === 'processing' ? 'bg-espresso-900/40' :
                  item.status === 'done' ? 'bg-green-500/30' :
                  item.status === 'error' ? 'bg-red-500/30' :
                  'bg-espresso-900/20'
                }`}>
                  {item.status === 'processing' && (
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {item.status === 'done' && (
                    <>
                      <span className="text-green-700 text-2xl font-bold">&#10003;</span>
                      <span className="text-xs bg-cream/80 rounded px-1 mt-1">{item.result?.item_type_display || 'Added'}</span>
                    </>
                  )}
                  {item.status === 'error' && (
                    <>
                      <span className="text-red-700 text-2xl font-bold">&times;</span>
                      <span className="text-xs bg-cream/80 rounded px-1 mt-1">Failed</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {!uploading && !done && (
          <>
            <button
              disabled={!items.length}
              onClick={upload}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50"
            >{source === 'google' ? 'Import' : 'Upload'} {items.length} Item{items.length !== 1 ? 's' : ''}</button>
            <Link to="/wardrobe" className="px-6 py-2.5 border border-sand-300 hover:border-espresso-600 rounded-lg text-espresso-800">Cancel</Link>
          </>
        )}
        {uploading && (
          <button onClick={cancel} className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">Cancel Upload</button>
        )}
        {done && (
          <Link to="/wardrobe" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2.5 rounded-lg">Back to Wardrobe</Link>
        )}
      </div>
    </div>
  )
}
