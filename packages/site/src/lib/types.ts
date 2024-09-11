import type {c_icons} from '~/lib/constants.ts'

export type TCIconName = keyof typeof c_icons | ''

export type TNBCode<T extends string> = TNBText<'code'> & {
  caption: TNText[]
  code: {
    language: T
  }
}

export type TNBHeading<T extends 1 | 2 | 3> = TNBText<`heading_${T}`> & {
  // biome-ignore lint/style/useNamingConvention: Notion's convention
  is_toggleable: boolean
}

export type TNBImage = {
  image: TNFile & {
    caption: TNText[]
  }
  type: 'image'
}

export type TNBlobList = {
  blobs: Array<{
    etag: string
    key: string
    // biome-ignore lint/style/useNamingConvention: Netlify's convention
    last_modified: string
    size: number
  }>
  directories: string[]
}

export type TNBlock = {
  id: string
  // biome-ignore lint/style/useNamingConvention: Notion's convention
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
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    rich_text: TNText[]
  }
} & {
  type: T
}

export type TNCache = {
  blocks: TNBlock[]
  cover: undefined | {
    height: number
    width: number
  }
  // biome-ignore lint/style/useNamingConvention: consistency with Notion's convention
  cached_at: string
  id: string
  slug: string
  title: string
}

export type TNFile = {
  file: {
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    expiry_time: string
    url: string
  }
  type: 'file'
}

export type TNPage = TNRes<
  'page',
  TNPageInfo
>['results'][number] & {
  // biome-ignore lint/style/useNamingConvention: Notion's convention
  request_id: string
}

export type TNPageInfo = {
  cover: null | TNFile
  icon: null
  object: 'page'
  parent: {
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    database_id: 'ee93ad0c-ead8-4102-868a-ae5665d8d2d1'
    type: 'database_id'
  }
  properties: {
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    Date: {
      date: {
        end: null
        start: string
        // biome-ignore lint/style/useNamingConvention: Notion's convention
        time_zone: null
      }
      id: 'lXAx'
      type: 'date'
    }
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    Description: {
      id: 'CNVd'
      // biome-ignore lint/style/useNamingConvention: Notion's convention
      rich_text: TNText[]
      type: 'rich_text'
    }
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    Featured: {
      checkbox: boolean,
      id: 'ULsm',
      type: 'checkbox'
    }
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    Status: {
      id: 'z%5C%60r'
      status: {
        color: 'default'
        id: string
        name: 'Draft' | 'Planned' | 'Published'
      }
      type: 'status'
    }
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    Tags: {
      id: 'vdc_'
      // biome-ignore lint/style/useNamingConvention: Notion's convention
      multi_select: Array<{
        color: 'default'
        id: string
        name: 'Functions'
      }>
      type: 'multi_select'
    }
    // biome-ignore lint/style/useNamingConvention: Notion's convention
    Title: {
      id: 'title'
      title: TNText[]
      type: 'title'
    }
  }
  // biome-ignore lint/style/useNamingConvention: Notion's convention
  public_url: null
  url: string
}

export type TNRes<T1 extends string, T2 extends object> = {
  [K in T1]: object
} & {
  // biome-ignore lint/style/useNamingConvention: Notion's convention
  has_more: boolean
  // biome-ignore lint/style/useNamingConvention: Notion's convention
  next_cursor: null
  object: 'list'
  // biome-ignore lint/style/useNamingConvention: Notion's convention
  request_id: string
  results: Array<
    {
      archived: boolean
      // biome-ignore lint/style/useNamingConvention: Notion's convention
      created_by: TNUser
      // biome-ignore lint/style/useNamingConvention: Notion's convention
      created_time: string
      id: string
      // biome-ignore lint/style/useNamingConvention: Notion's convention
      in_trash: boolean
      // biome-ignore lint/style/useNamingConvention: Notion's convention
      last_edited_by: TNUser
      // biome-ignore lint/style/useNamingConvention: Notion's convention
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
  // biome-ignore lint/style/useNamingConvention: Notion's convention
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
