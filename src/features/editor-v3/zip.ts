/** Minimal zip file builder — no dependencies. Produces valid uncompressed zip. */
export function createZip(files: Map<string, string>): Blob {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const [name, content] of files) {
    const nameBytes = enc.encode(name)
    const dataBytes = enc.encode(content)

    // Local file header
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true) // signature
    lv.setUint16(4, 20, true) // version
    lv.setUint16(8, 0, true) // method: stored
    lv.setUint32(18, dataBytes.length, true) // compressed
    lv.setUint32(22, dataBytes.length, true) // uncompressed
    lv.setUint16(26, nameBytes.length, true)
    local.set(nameBytes, 30)
    local.set(dataBytes, 30 + nameBytes.length)
    parts.push(local)

    // Central directory entry
    const cen = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(cen.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint32(20, dataBytes.length, true)
    cv.setUint32(24, dataBytes.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint32(42, offset, true) // local header offset
    cen.set(nameBytes, 46)
    central.push(cen)

    offset += local.length
  }

  const centralOffset = offset
  let centralSize = 0
  for (const c of central) { parts.push(c); centralSize += c.length }

  // End of central directory
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, files.size, true)
  ev.setUint16(10, files.size, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, centralOffset, true)
  parts.push(end)

  return new Blob(parts as BlobPart[], { type: "application/zip" })
}
