import {exportVariable, info, setFailed} from '@actions/core'
import {ActionInterface, Status, NodeActionInterface} from './constants'
import {deploy, init} from './git'
import {
  generateFolderPath,
  checkParameters,
  generateRepositoryPath,
  generateTokenType
} from './util'
import * as action_github from '@actions/github'

/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
export default async function run(
  configuration: ActionInterface | NodeActionInterface
): Promise<void> {
  let status: Status = Status.RUNNING

  try {
    info(`
    GitHub Pages Deploy Action 🚀

    🚀 Getting Started Guide: https://github.com/marketplace/actions/deploy-to-github-pages
    ❓ Discussions / Q&A: https://github.com/JamesIves/github-pages-deploy-action/discussions
    🔧 Report a Bug: https://github.com/JamesIves/github-pages-deploy-action/issues

    📣 Maintained by James Ives: https://jamesiv.es
    💖 Support: https://github.com/sponsors/JamesIves`)

    info('Checking configuration and starting deployment… 🚦')

    const settings: ActionInterface = {
      ...configuration
    }

    // Defines the repository/folder paths and token types.
    // Also verifies that the action has all of the required parameters.
    settings.folderPath = generateFolderPath(settings)

    checkParameters(settings)

    settings.repositoryPath = generateRepositoryPath(settings)
    settings.tokenType = generateTokenType(settings)

    await init(settings)
    status = await deploy(settings)
  } catch (error) {
    status = Status.FAILED
    setFailed(error.message)
  } finally {
    info(
      `${
        status === Status.FAILED
          ? 'Deployment failed! ❌'
          : status === Status.SUCCESS
          ? 'Completed deployment successfully! ✅'
          : 'There is nothing to commit. Exiting early… 📭'
      }`
    )

    exportVariable('DEPLOYMENT_STATUS', status)
  }

  if (configuration.gitHubToken != null) {
    try {
      const octokit = action_github.getOctokit(configuration.gitHubToken)
      // octokit.repos.createPagesSite()
      // todo repo, owner
      info('start octokit')
      await octokit.request(
        'POST /repos/avdim/github-pages-deploy-action/pages',
        {
          owner: 'avdim',
          repo: 'github-pages-deploy-action',
          source: {
            branch: configuration.branch,
            path: 'docs' //todo docs
          },
          mediaType: {
            previews: ['switcheroo']
          }
        }
      )
      info('complete octokit')
    } catch (error) {
      console.log('My catch block, error: ', error)
      throw error
    }
  }
}
