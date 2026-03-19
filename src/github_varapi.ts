// import * as github from '@actions/github'

import { Octokit } from '@octokit/core'

export interface GitHubVariableResponse {
  data: {
    value: string
  }
}

export async function CreateVariable(
  var_name: string,
  data: string,
  token: string,
  owner: string,
  repository: string
): Promise<unknown> {
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

export async function UpdateVariable(
  data: string,
  var_name: string,
  token: string,
  owner: string,
  repository: string
): Promise<unknown> {
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

export async function GetVariable(
  var_name: string,
  token: string,
  owner_str: string,
  repository: string
): Promise<GitHubVariableResponse> {
  const octokit = new Octokit({ auth: token })

  return octokit.request(
    `GET /repos/${owner_str}/${repository}/actions/variables/${var_name}`,
    {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  ) as Promise<GitHubVariableResponse>
}
