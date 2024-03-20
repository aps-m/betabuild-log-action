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
    const size: number = Number(core.getInput('size'))
    const var_def_value = 'init_item'

    const repo_owner = github.context.payload.repository?.owner.login
    const repo_name = github.context.payload.repository?.name

    let StoreResult: any

    //let result

    if (repo_owner !== undefined && repo_name !== undefined) {
      let VariableIsExist = false
      let VariableValue = ''

      await GetVariable(var_name, repo_token, repo_owner, repo_name).then(
        result => {
          // eslint-disable-next-line no-console
          if (result != null) {
            //console.log(result.data.value)
            console.log(`Variable value is ${result.data.value}`)
            VariableIsExist = true
            VariableValue = result.data.value
          }
        },
        err => {
          console.log('Variable is no exist')
        }
      )

      if (!VariableIsExist) {
        await CreateVariable(
          var_name,
          var_def_value,
          repo_token,
          repo_owner,
          repo_name
        ).then(
          result => {
            // eslint-disable-next-line no-console
            if (result != null) {
              //console.log(result.data.value)
              console.log(
                `Variable "${var_name}" was created with value "${var_def_value}"!`
              )

              VariableValue = var_def_value
            }
          },
          err => {
            console.log(`Error of create variable "${var_name}"`)
            console.log(err)
            core.setFailed(err)
          }
        )
      }

      StoreResult = HandleStore(VariableValue, tag_name, size)

      if (StoreResult.Rev_is_changed) {
        console.log('New revision was detected, starting variable updating...')
        await UpdateVariable(
          StoreResult.Value,
          var_name,
          repo_token,
          repo_owner,
          repo_name
        ).then(
          result => {
            // eslint-disable-next-line no-console
            if (result != null) {
              //console.log(result.data.value)
              console.log(`Variable "${var_name}" was updated succesfully!`)
            }
          },
          err => {
            console.log('Error of update variable')
            console.log(err)
            core.setFailed(err)
          }
        )
      } else {
        console.log('Defined version already exist in revision array')
      }
    } else {
      core.setFailed('Cannot get repo name and owner')
    }

    console.log(
      `Set action result (revision_is_changed = ${StoreResult.Rev_is_changed})`
    )

    core.setOutput('rev_is_changed', StoreResult.Rev_is_changed)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
