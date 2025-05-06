import React from 'react'
import { PortableTextComponents } from '@portabletext/react'

const renderWithLineBreaks = (children: any) => {
  if (typeof children === 'string') {
    return children.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ))
  }

  if (Array.isArray(children)) {
    return children.map((child: any, i: number) => {
      if (typeof child === 'string') {
        return child.split('\n').map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </React.Fragment>
        ))
      }
      return child
    })
  }

  return children
}

const CustomComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className='mb-2'>{children}</h1>,
    h2: ({ children }) => <h2 className='mb-2'>{children}</h2>,
    h3: ({ children }) => <h3 className='mb-2'>{children}</h3>,
    h4: ({ children }) => <h4 className='mb-2'>{children}</h4>,
    h5: ({ children }) => <h5 className='mb-2'>{children}</h5>,
    h6: ({ children }) => <h6 className='mb-2'>{children}</h6>,
    normal: ({ children }) => (
      <p className="bodyl mb-2">{renderWithLineBreaks(children)}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '4px solid black',
          paddingLeft: '1.5rem',
          fontStyle: 'italic',
          color: 'rgba(0, 0, 0, 0.8)',
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
          margin: '1.5rem 0',
        }}
      >
        “{children}”
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside pl-4 space-y-2 ml-5 mb-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal space-y-2 ml-5 mb-4">{children}</ol>
    ),
  },
  
  listItem: ({ children }) => (
    <li>{renderWithLineBreaks(children)}</li>
  ),
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || '#'
      return (
        <a
          href={href}
          className="text-brand-red italic hover:text-brand-red/5 transition-colors duration-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.url) return null;
      return (
        <div className="my-8 w-full">
          <img
            src={value.url}
            alt={value.alt || "Blog Image"}
            className="rounded-lg w-full object-cover"
            loading="lazy"
          />
        </div>
      );
    },
  }
}

export default CustomComponents
