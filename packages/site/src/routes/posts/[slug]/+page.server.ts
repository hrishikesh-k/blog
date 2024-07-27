import {cwd} from 'node:process'
import type {EntryGenerator, PageServerLoad} from './$types'
import {join} from 'node:path'
import {NOTION_API_KEY} from '$env/static/private'
import {readFileSync, writeFileSync} from 'node:fs'
import wretch from 'wretch'

type type_notion_res<T1 extends string, T2 extends object> = {
  [K in T1] : {}
} & {
  has_more : boolean
  next_cursor : null
  object : 'list',
  request_id : string
  results : Array<{
    archived : boolean
    created_by : type_notion_user
    created_time : string
    id : string
    in_trash : boolean
    last_edited_by : type_notion_user
    last_edited_time : string
  } & T2>
  type : T1
}

type type_notion_text = {
  annotations: {
    bold : boolean
    code : boolean
    color : 'default'
    italic : boolean
    strikethrough : boolean
    underline : boolean
  }
  href : null
  plain_text : string
  text : {
    context : string
    link : null
  }
  type : 'text'
}

type type_notion_user = {
  id : '9b2a0440-52dd-4240-9bc4-2b9d239a1747'
  object : 'user'
}

type type_notion_block_text<T extends string> = {
  [K in T] : {
    color : 'default'
    rich_text : Array<type_notion_text>
  }
} & {
  type: T
}

type type_notion_block_code<T extends string> = type_notion_block_text<'code'> & {
  caption : Array<type_notion_text>
  language : T
}

type type_notion_block_heading<T extends 1 | 2 | 3> = type_notion_block_text<`heading_${T}`> & {
  is_toggleable : boolean
}

type type_notion_block_paragraph = type_notion_block_text<'paragraph'>

const entries_path = join(cwd(), '.svelte-kit/entries.json')
export const load : PageServerLoad = async event => {
  const posts : Array<{
    id : string
    title : string
  }> = JSON.parse(readFileSync(entries_path, 'utf-8'))
  const required_post = posts.find(p => p.title === event.params.slug)
  return {
    post: await notion.get(`/blocks/${required_post!.id}/children`).json<type_notion_res<'block', {
      has_children : boolean
      object : 'block'
      parent : {
        page_id : string
        type : 'page_id'
      }
    } & type_notion_block_code<'typescript'> | type_notion_block_heading<1> | type_notion_block_heading<2> | type_notion_block_heading<3> | type_notion_block_paragraph>>()
  }
}
const notion = wretch('https://api.notion.com/v1').auth(`Bearer ${NOTION_API_KEY}`).headers({
  'notion-version': '2022-06-28'
})

export async function entries() : Promise<ReturnType<EntryGenerator>> {
  const all_posts = await notion.post(null, '/databases/ee93ad0cead84102868aae5665d8d2d1/query').json<type_notion_res<'page_or_database', {
    cover : null
    icon : null
    object : 'page'
    parent : {
      database_id : 'ee93ad0c-ead8-4102-868a-ae5665d8d2d1'
      type : 'database_id'
    }
    properties : {
      Date : {
        date : {
          end : null
          start : string
          time_zone : null
        }
        id : 'lXAx'
        type : 'date'
      }
      Status : {
        id : 'z%5C%60r'
        status : {
          color : 'default'
          id : string
          name : 'Draft' | 'Planned' | 'Published'
        }
        type : 'status'
      }
      Tags : {
        id : 'vdc_'
        multi_select : Array<{
          color : 'default'
          id : string
          name : string
        }>
        type : 'multi_select'
      }
      Title : {
        id : 'title'
        title : Array<type_notion_text>
        type : 'title'
      }
    }
    public_url : null
    url : string
  }>>()
  const posts_to_publish = all_posts.results.filter(p => !p.archived && !p.in_trash && p.properties.Status.status.name === 'Published')
  const slugs : Array<{
    slug : string
  }> = []
  writeFileSync(entries_path, JSON.stringify(posts_to_publish.map(p => {
    /*
      convert to lowercase
      remove leading and trailing whitespace
      replace spaces and non-word characters with hyphens
      remove leading and trailing hyphens
   */
    const slug = p.properties.Title.title[0].plain_text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '')
    slugs.push({
      slug
    })
    return {
      id: p.id,
      title: slug
    }
  })))
  return slugs
}