import type { c_icons } from '~/lib/constants.ts'

export type TCIconName = keyof typeof c_icons | ''

export type TNBCode<T extends string> = TNBText<'code'> & {
  caption: TNText[]
  code: {
    language: T
  }
}

export type TNBHeading<T extends 1 | 2 | 3> = TNBText<`heading_${T}`> & {
  is_toggleable: boolean
}

export type TNBImage = {
  image: TNFile & {
    caption: TNText[]
  }
  type: 'image'
}

// biome-ignore lint/style/useNamingConvention: Negative lookahead unsupported
export type TNBlobList = {
  blobs: Array<{
    etag: string
    key: string
    last_modified: string
    size: number
  }>
  directories: string[]
}

// biome-ignore lint/style/useNamingConvention: Negative lookahead unsupported
export type TNBlock = {
  id: string
  notion_id: string
} & (
  | {
      language: 'typescript'
      text: string
      type: 'code'
    }
  | {
      level: 1 | 2 | 3
      text: string
      type: 'heading'
    }
  | {
      alt: string
      height: number
      type: 'image'
      width: number
    }
  | {
      text: string
      type: 'paragraph'
    }
)

export type TNBParagraph = TNBText<'paragraph'>

type TNBText<T extends string> = {
  [K in T]: {
    color: 'default'
    rich_text: TNText[]
  }
} & {
  type: T
}

export type TNCache = {
  blocks: TNBlock[]
  cover:
    | undefined
    | {
        height: number
        width: number
      }
  cached_at: string
  id: string
  slug: string
  title: string
}

export type TNFile = {
  file: {
    expiry_time: string
    url: string
  }
  type: 'file'
}

export type TNPage = TNRes<'page', TNPageInfo>['results'][number] & {
  request_id: string
}

export type TNPageInfo = {
  cover: null | TNFile
  icon: null
  object: 'page'
  parent: {
    database_id: 'ee93ad0c-ead8-4102-868a-ae5665d8d2d1'
    type: 'database_id'
  }
  properties: {
    Date: {
      date: {
        end: null
        start: string
        time_zone: null
      }
      id: 'lXAx'
      type: 'date'
    }
    Description: {
      id: 'CNVd'
      rich_text: TNText[]
      type: 'rich_text'
    }
    Featured: {
      checkbox: boolean
      id: 'ULsm'
      type: 'checkbox'
    }
    Status: {
      id: 'z%5C%60r'
      status: {
        color: 'default'
        id: string
        name: 'Draft' | 'Planned' | 'Published'
      }
      type: 'status'
    }
    Tags: {
      id: 'vdc_'
      multi_select: Array<{
        color: 'default'
        id: string
        name: 'Functions'
      }>
      type: 'multi_select'
    }
    Title: {
      id: 'title'
      title: TNText[]
      type: 'title'
    }
  }
  public_url: null
  url: string
}

export type TNRes<T1 extends string, T2 extends object> = {
  [K in T1]: object
} & {
  has_more: boolean
  next_cursor: null
  object: 'list'
  request_id: string
  results: Array<
    {
      archived: boolean
      created_by: TNUser
      created_time: string
      id: string
      in_trash: boolean
      last_edited_by: TNUser
      last_edited_time: string
    } & T2
  >
  type: T1
}

type TNText = {
  annotations: {
    bold: boolean
    code: boolean
    color: 'default'
    italic: boolean
    strikethrough: boolean
    underline: boolean
  }
  href: null
  plain_text: string
  text: {
    context: string
    link: null
  }
  type: 'text'
}

type TNUser = {
  id: '9b2a0440-52dd-4240-9bc4-2b9d239a1747'
  object: 'user'
}
