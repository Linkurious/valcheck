@Library('linkurious-shared')_

nodeJob {
  // project name on github
  projectName = "linkurious/valcheck"
  podTemplateNames = ['jnlp-agent-node']
  // publish on our public npm when releasing
  runNpmPublish = true
  // create a git tag for each release
  createGitTag = true
  // bump version on develop after releasing
  runBookeeping = true
  githubRelease = true
}
