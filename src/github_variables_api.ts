import * as core from '@actions/core'

// import * as github from '@actions/github'

import { Octokit } from '@octokit/core'

export function CreateVariable(
  var_name: string,
  data: string,
  token: string,
  owner: string,
  repository: string
) {
  const octokit = new Octokit({ auth: token })

  return octokit.request(
    `POST /repos/${owner}/${repository}/actions/variables`,
    {
      name: var_name,
      value: data,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export function UpdateVariable(
  data: string,
  var_name: string,
  token: string,
  owner: string,
  repository: string
) {
  const octokit = new Octokit({ auth: token })

  return octokit.request(
    `PATCH /repos/${owner}/${repository}/actions/variables/${var_name}`,
    {
      value: data,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export function GetVariable(
  var_name: string,
  token: string,
  owner_str: string,
  repository: string
) {
  //let octokit = github.getOctokit(token)

  const octokit = new Octokit({ auth: token })

  return octokit.request(
    `GET /repos/${owner_str}/${repository}/actions/variables/${var_name}`,
    {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}
