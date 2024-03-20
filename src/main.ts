import * as core from '@actions/core'
import * as github from '@actions/github'

import { CreateVariable, GetVariable, UpdateVariable } from './github_varapi'
import { HandleStore } from './betabuild_store'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const repo_token: string = core.getInput('repo_token')
    const var_name: string = core.getInput('var_name')
    const tag_name: string = core.getInput('tag_name')

    const repo_owner = github.context.payload.repository?.owner.login
    const repo_name = github.context.payload.repository?.name

    console.log(`Var name: ${var_name}`)

    //let result

    if (repo_owner !== undefined && repo_name !== undefined) {
      GetVariable(var_name, repo_token, repo_owner, repo_name).then(
        result => {
          // eslint-disable-next-line no-console
          if (result != null) {
            //console.log(result.data.value)
            console.log(`Variable value is ${result.data.value}`)
          }
        },
        err => {
          console.log('Variable is no exist')

          // CreateVariable(var_name, '0.0.0', repo_token, repo_owner, repo_name).then(
          //   result => {
          //     // eslint-disable-next-line no-console
          //     if (result != null) {
          //       //console.log(result.data.value)
          //       console.log(`Variable was created`)
          //     }
          //   },
          //   err => {
          //     core.setFailed(err)
          //   }
          // )
          // eslint-disable-next-line no-console
          // core.setFailed(err.message)
          // console.error(err)
        }
      )
    } else {
      core.setFailed('Cannot get repo name and owner')
    }

    // // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // core.debug(`Waiting ${ms} milliseconds ...`)
    // // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())
    // // Set outputs for other workflow steps to use
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
