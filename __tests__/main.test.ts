import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'
import {
  CreateVariable,
  GetVariable,
  UpdateVariable
} from '../src/github_varapi'

jest.mock('../src/github_varapi', () => ({
  CreateVariable: jest.fn(),
  GetVariable: jest.fn(),
  UpdateVariable: jest.fn()
}))

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
const createVariableMock = jest.mocked(CreateVariable)
const getVariableMock = jest.mocked(GetVariable)
const updateVariableMock = jest.mocked(UpdateVariable)

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'repo_token':
          return 'token'
        case 'var_name':
          return 'REV'
        case 'tag_name':
          return '1.1.0'
        case 'size':
          return '5'
        case 'remove_request':
          return 'false'
        case 'tag_filter':
          return ''
        default:
          return ''
      }
    })
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

    github.context.payload.repository = {
      owner: {
        login: 'octocat'
      },
      name: 'hello-world'
    }
  })

  it('updates the repository variable when a new revision is added', async () => {
    getVariableMock.mockResolvedValue({
      data: {
        value: '1.0.0'
      }
    })
    updateVariableMock.mockResolvedValue({})

    await main.run()
    expect(runMock).toHaveReturned()

    expect(getVariableMock).toHaveBeenCalledWith(
      'REV',
      'token',
      'octocat',
      'hello-world'
    )
    expect(createVariableMock).not.toHaveBeenCalled()
    expect(updateVariableMock).toHaveBeenCalledWith(
      '1.0.0;1.1.0',
      'REV',
      'token',
      'octocat',
      'hello-world'
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'rev_is_changed', true)
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('fails when repository context is unavailable', async () => {
    github.context.payload.repository = undefined

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Cannot get repo name and owner'
    )
    expect(getVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()
  })
})
