const shell = require('shelljs');

const head = shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim();
const version = process.env.TRAVIS_TAG || process.env.TRAVIS_BRANCH || `development_in_${head}`;

shell.exec('npm run dist:clean');
shell.mkdir('dist');
shell.exec(`cd build && tar cvzf ../dist/unicef-challenge-${version}.tar.gz *`);