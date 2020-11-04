"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const git_1 = require("./git");
const util_1 = require("./util");
const action_github = __importStar(require("@actions/github"));
/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
function run(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = constants_1.Status.RUNNING;
        try {
            core_1.info(`
    GitHub Pages Deploy Action 🚀

    🚀 Getting Started Guide: https://github.com/marketplace/actions/deploy-to-github-pages
    ❓ Discussions / Q&A: https://github.com/JamesIves/github-pages-deploy-action/discussions
    🔧 Report a Bug: https://github.com/JamesIves/github-pages-deploy-action/issues

    📣 Maintained by James Ives: https://jamesiv.es
    💖 Support: https://github.com/sponsors/JamesIves`);
            core_1.info('Checking configuration and starting deployment… 🚦');
            const settings = Object.assign({}, configuration);
            // Defines the repository/folder paths and token types.
            // Also verifies that the action has all of the required parameters.
            settings.folderPath = util_1.generateFolderPath(settings);
            util_1.checkParameters(settings);
            settings.repositoryPath = util_1.generateRepositoryPath(settings);
            settings.tokenType = util_1.generateTokenType(settings);
            yield git_1.init(settings);
            status = yield git_1.deploy(settings);
        }
        catch (error) {
            status = constants_1.Status.FAILED;
            core_1.setFailed(error.message);
        }
        finally {
            core_1.info(`${status === constants_1.Status.FAILED
                ? 'Deployment failed! ❌'
                : status === constants_1.Status.SUCCESS
                    ? 'Completed deployment successfully! ✅'
                    : 'There is nothing to commit. Exiting early… 📭'}`);
            core_1.exportVariable('DEPLOYMENT_STATUS', status);
        }
        if (configuration.gitHubToken != null) {
            try {
                const octokit = action_github.getOctokit(configuration.gitHubToken);
                // octokit.repos.createPagesSite()
                // todo repo, owner
                core_1.info('start octokit');
                yield octokit.request('POST /repos/avdim/github-pages-deploy-action/pages', {
                    owner: 'avdim',
                    repo: 'github-pages-deploy-action',
                    source: {
                        branch: configuration.branch,
                        path: 'docs' //todo docs
                    },
                    mediaType: {
                        previews: ['switcheroo']
                    }
                });
                core_1.info('complete octokit');
            }
            catch (error) {
                console.log('My catch block, error: ', error);
                throw error;
            }
        }
    });
}
exports.default = run;
