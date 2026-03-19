import * as core from '@actions/core'
import * as github from '@actions/github'

import { HandleStore, type HandleStoreResult } from './betabuild_store'
import { CreateVariable, GetVariable, UpdateVariable } from './github_varapi'

function GetErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const repo_token = core.getInput('repo_token')
    const var_name = core.getInput('var_name')
    const tag_name = core.getInput('tag_name')
    const size = Number(core.getInput('size'))
    const remove_request = core.getInput('remove_request')
    const tag_filter = core.getInput('tag_filter')
    const shouldRemove = remove_request.toLowerCase() === 'true'

    const var_def_value = 'init_item'

    const repo_owner = github.context.payload.repository?.owner.login
    const repo_name = github.context.payload.repository?.name

    if (Number.isNaN(size)) {
      core.setFailed('Input "size" must be a number')
      return
    }

    if (repo_owner === undefined || repo_name === undefined) {
      core.setFailed('Cannot get repo name and owner')
      return
    }

    let VariableIsExist = false
    let VariableValue = ''

    try {
      const result = await GetVariable(
        var_name,
        repo_token,
        repo_owner,
        repo_name
      )

      console.log(`Variable value is ${result.data.value}`)
      VariableIsExist = true
      VariableValue = result.data.value
    } catch (error: unknown) {
      console.log('Variable does not exist')
      console.log(error)
    }

    if (!VariableIsExist) {
      try {
        await CreateVariable(
          var_name,
          var_def_value,
          repo_token,
          repo_owner,
          repo_name
        )

        console.log(
          `Variable "${var_name}" was created with value "${var_def_value}"!`
        )

        VariableValue = var_def_value
      } catch (error: unknown) {
        console.log(`Error of create variable "${var_name}"`)
        console.log(error)
        core.setFailed(GetErrorMessage(error))
        return
      }
    }

    const StoreResult: HandleStoreResult = HandleStore(
      VariableValue,
      tag_name,
      size,
      shouldRemove,
      tag_filter
    )

    if (StoreResult.Rev_is_changed) {
      console.log('Revision log is changed')

      if (shouldRemove) {
        console.log('Request for delete existing revision...')
      } else {
        console.log('Request for add new revision...')
      }

      console.log('Starting variable updating...')

      try {
        await UpdateVariable(
          StoreResult.Value,
          var_name,
          repo_token,
          repo_owner,
          repo_name
        )

        console.log(`Variable "${var_name}" was updated succesfully!`)
      } catch (error: unknown) {
        console.log('Error of update variable')
        console.log(error)
        core.setFailed(GetErrorMessage(error))
        return
      }
    } else {
      console.log('Defined version already exist in revision array')
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
