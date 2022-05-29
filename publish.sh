set -e

yarn audit

yarn build

# smoke test
node dist/index.umd.js

# TODO
# yarn test

npm publish
