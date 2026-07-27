/**
 * Minimal Portable Text -> Lexical converter.
 *
 * Scoped deliberately to what the legacy dataset actually contains: `block`
 * nodes, `normal` style, bullet list items, and no marks. Anything richer
 * would need the full converter from @payloadcms/richtext-lexical, but this
 * keeps the migration dependency-free and auditable.
 */

const textNode = (text, format = 0) => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const MARK_FORMATS = { strong: 1, em: 2, underline: 8, 'strike-through': 4, code: 16 }

const childrenToNodes = (children = []) =>
  children
    .filter((c) => c?._type === 'span' && typeof c.text === 'string')
    .map((c) => {
      const format = (c.marks || []).reduce((acc, m) => acc | (MARK_FORMATS[m] ?? 0), 0)
      return textNode(c.text, format)
    })

const paragraph = (children) => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

const heading = (children, tag) => ({
  type: 'heading',
  tag,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const quote = (children) => ({
  type: 'quote',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const listItem = (children, value) => ({
  type: 'listitem',
  children,
  checked: undefined,
  direction: 'ltr',
  format: '',
  indent: 0,
  value,
  version: 1,
})

const list = (items, listType) => ({
  type: 'list',
  listType,
  start: 1,
  tag: listType === 'number' ? 'ol' : 'ul',
  children: items,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

export const emptyLexical = () => ({
  root: {
    type: 'root',
    children: [paragraph([])],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

/** Convert an array of Portable Text blocks into a Lexical editor state. */
export function portableTextToLexical(blocks = []) {
  const children = []
  let openList = null

  const closeList = () => {
    if (openList) {
      children.push(list(openList.items, openList.type))
      openList = null
    }
  }

  for (const block of blocks) {
    if (block?._type !== 'block') continue
    const nodes = childrenToNodes(block.children)
    // Skip blocks that carry no text at all.
    if (!nodes.some((n) => n.text.trim())) {
      if (!block.listItem) closeList()
      continue
    }

    if (block.listItem) {
      const type = block.listItem === 'number' ? 'number' : 'bullet'
      if (!openList || openList.type !== type) {
        closeList()
        openList = { type, items: [] }
      }
      openList.items.push(listItem(nodes, openList.items.length + 1))
      continue
    }

    closeList()

    const style = block.style || 'normal'
    if (/^h[1-6]$/.test(style)) {
      // Demote one level: the page already provides an h1.
      const level = Math.min(6, parseInt(style.slice(1), 10) + 1)
      children.push(heading(nodes, `h${level}`))
    } else if (style === 'blockquote') {
      children.push(quote(nodes))
    } else {
      children.push(paragraph(nodes))
    }
  }

  closeList()

  return {
    root: {
      type: 'root',
      children: children.length ? children : [paragraph([])],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/** Build a Lexical state from plain paragraphs of text. */
export const paragraphsToLexical = (paragraphs) =>
  portableTextToLexical(
    paragraphs.map((text) => ({
      _type: 'block',
      style: 'normal',
      children: [{ _type: 'span', text, marks: [] }],
    }))
  )
